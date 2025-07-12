document.addEventListener('DOMContentLoaded', () => {
    const numSimulations = 8;
    const antsPerSimulation = 24;
    const stepsPerGeneration = 50000;
    const mutationRate = 0.01;
    const updatesPerFrame = 100;

    let populations = Array.from({ length: numSimulations }, createPopulation);
    let simulations = [];
    let generation = 0;
    let evolutionRunning = false;
    let animationFrameId;

    function createAnt() {
        const rules = [];
        const numCellColors = 3;
        for (let cellColor = 0; cellColor < numCellColors; cellColor++) {
            rules[cellColor] = [{
                turn: Math.random() < 0.5 ? -1 : 1,
                newGridColor: Math.floor(Math.random() * numCellColors),
                newState: 0
            }];
        }
        return { rules };
    }

    function createPopulation() {
        return Array.from({ length: antsPerSimulation }, createAnt);
    }

    function createSimulation(canvas) {
        const ctx = canvas.getContext('2d');
        const gridSize = 64;
        const cellSize = canvas.width / gridSize;
        const cellColors = { 0: 'white', 1: 'lightcoral', 2: 'lightblue' };
        const antColors = { 1: 'darkred', 2: 'darkblue' };
        
        let grid;
        let ants = [];

        function initialize(population) {
            grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));
            ants = [];
            const midPoint = Math.floor(gridSize / 2);
            const teamSize = Math.floor(antsPerSimulation / 2);

            for (let i = 0; i < teamSize; i++) {
                ants.push({ ...population[i], x: Math.floor(Math.random() * midPoint), y: Math.floor(Math.random() * gridSize), dir: Math.floor(Math.random() * 4), color: 1, state: 0 });
            }
            for (let i = teamSize; i < antsPerSimulation; i++) {
                ants.push({ ...population[i], x: Math.floor(Math.random() * midPoint) + midPoint, y: Math.floor(Math.random() * gridSize), dir: Math.floor(Math.random() * 4), color: 2, state: 0 });
            }
        }

        function updateLogic() {
            ants.forEach(ant => {
                if (ant.y < 0 || ant.y >= gridSize || ant.x < 0 || ant.x >= gridSize) {
                    ant.x = (ant.x + gridSize) % gridSize;
                    ant.y = (ant.y + gridSize) % gridSize;
                    return;
                }
                const currentCell = grid[ant.y][ant.x];
                const rule = ant.rules[currentCell][ant.state];
                ant.dir = (ant.dir + rule.turn + 4) % 4;
                grid[ant.y][ant.x] = rule.newGridColor;
                ant.state = rule.newState;

                switch (ant.dir) {
                    case 0: ant.y--; break;
                    case 1: ant.x++; break;
                    case 2: ant.y++; break;
                    case 3: ant.x--; break;
                }
            });
        }

        function drawGrid() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let y = 0; y < gridSize; y++) {
                for (let x = 0; x < gridSize; x++) {
                    ctx.fillStyle = cellColors[grid[y][x]] || 'white';
                    ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
                }
            }
            ants.forEach(ant => {
                if (ant.y >= 0 && ant.y < gridSize && ant.x >= 0 && ant.x < gridSize) {
                    ctx.fillStyle = antColors[ant.color];
                    ctx.fillRect(ant.x * cellSize, ant.y * cellSize, cellSize, cellSize);
                }
            });
        }

        function getFitness() {
            let redTiles = 0;
            let blueTiles = 0;
            for (let y = 0; y < gridSize; y++) {
                for (let x = 0; x < gridSize; x++) {
                    if (grid[y][x] === 1) redTiles++;
                    if (grid[y][x] === 2) blueTiles++;
                }
            }
            const totalTiles = redTiles + blueTiles;
            if (totalTiles === 0) {
                return { redFitness: 0, blueFitness: 0 };
            }
            return { redFitness: redTiles / totalTiles, blueFitness: blueTiles / totalTiles };
        }

        return { initialize, updateLogic, drawGrid, getFitness };
    }

    function crossover(parent1, parent2) {
        const childRules = [];
        for (let i = 0; i < parent1.rules.length; i++) {
            childRules.push(Math.random() < 0.5 ? parent1.rules[i] : parent2.rules[i]);
        }
        return { rules: childRules };
    }

    function mutation(ant) {
        const newRules = JSON.parse(JSON.stringify(ant.rules));
        for (let i = 0; i < newRules.length; i++) {
             if (Math.random() < mutationRate) {
                newRules[i][0].turn = Math.random() < 0.5 ? -1 : 1;
            }
            if (Math.random() < mutationRate) {
                newRules[i][0].newGridColor = Math.floor(Math.random() * 3);
            }
        }
        return { rules: newRules };
    }
    
    function evolve(currentPopulations, allFitness) {
        let winnerIndex = 0;
        let loserIndex = 0;
        let maxDominance = -1;
        let minDominance = Infinity;

        const dominanceScores = allFitness.map(f => Math.abs(f.redFitness - f.blueFitness));

        dominanceScores.forEach((score, index) => {
            if (score > maxDominance) {
                maxDominance = score;
                winnerIndex = index;
            }
            if (score < minDominance) {
                minDominance = score;
                loserIndex = index;
            }
        });
        
        const newPopulations = [...currentPopulations];

        // If a population is stagnant (and not the designated loser), replace it with random genes.
        dominanceScores.forEach((score, index) => {
            if (score < 0.01 && index !== loserIndex) {
                newPopulations[index] = createPopulation();
            }
        });

        // Breed a new population from the winner to replace the loser.
        const winningPopulation = currentPopulations[winnerIndex];
        const newChildPopulation = [];
        for (let i = 0; i < antsPerSimulation; i++) {
            const parent1 = winningPopulation[Math.floor(Math.random() * winningPopulation.length)];
            const parent2 = winningPopulation[Math.floor(Math.random() * winningPopulation.length)];
            let child = crossover(parent1, parent2);
            child = mutation(child);
            newChildPopulation.push(child);
        }
        
        newPopulations[loserIndex] = newChildPopulation;
        return newPopulations;
    }
    
    function updateUI(allFitness) {
        document.getElementById('generationCounter').textContent = generation;
        for (let i = 0; i < numSimulations; i++) {
            document.getElementById(`redFitnessScore${i}`).textContent = allFitness[i].redFitness.toFixed(2);
            document.getElementById(`blueFitnessScore${i}`).textContent = allFitness[i].blueFitness.toFixed(2);
            simulations[i].drawGrid();
        }
    }

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function runGeneration() {
        if (!evolutionRunning) return;
        
        shuffle(populations);
        for (let i = 0; i < numSimulations; i++) {
            simulations[i].initialize(populations[i]);
        }

        let step = 0;
        function runStep() {
            if (step >= stepsPerGeneration || !evolutionRunning) {
                const allFitness = simulations.map(sim => sim.getFitness());
                updateUI(allFitness);
                
                populations = evolve(populations, allFitness);
                
                generation++;
                if (evolutionRunning) {
                    requestAnimationFrame(runGeneration);
                }
                return;
            }
            
            const stepsThisFrame = Math.min(updatesPerFrame, stepsPerGeneration - step);
            for (let i = 0; i < stepsThisFrame; i++) {
                simulations.forEach(sim => sim.updateLogic());
            }
            step += stepsThisFrame;
            
            simulations.forEach(sim => sim.drawGrid());
            animationFrameId = requestAnimationFrame(runStep);
        }
        runStep();
    }
    
    function resetGA() {
        evolutionRunning = false;
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        generation = 0;
        populations = Array.from({ length: numSimulations }, createPopulation);
        for (let i = 0; i < numSimulations; i++) {
            simulations[i].initialize(populations[i]);
        }
        updateUI(Array(numSimulations).fill({ redFitness: 0, blueFitness: 0 }));
    }
    
    for (let i = 0; i < numSimulations; i++) {
        const canvas = document.getElementById(`gridCanvas${i}`);
        if(canvas){
            simulations.push(createSimulation(canvas));
        } else {
            console.error(`Canvas with id gridCanvas${i} not found`);
        }
    }

    document.getElementById('startGaButton').addEventListener('click', () => {
        if (!evolutionRunning) {
            evolutionRunning = true;
            runGeneration();
        }
    });

    document.getElementById('stopGaButton').addEventListener('click', () => {
        evolutionRunning = false;
    });
    
    document.getElementById('resetGaButton').addEventListener('click', resetGA);
    
    resetGA();
}); 