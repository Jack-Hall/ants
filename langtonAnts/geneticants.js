function createRandomRules() {
    const rulesForAnt = [];
    const numCellColors = 3; // Corresponds to cell colors 0, 1, 2
    for (let cellColor = 0; cellColor < numCellColors; cellColor++) {
        rulesForAnt[cellColor] = [{ // Array for states, we only have state 0
            turn: Math.random() < 0.5 ? -1 : 1,
            newGridColor: Math.floor(Math.random() * numCellColors),
            newState: 0
        }];
    }
    return rulesForAnt;
}

function createSimulation(canvas, simIndex) {
    const ctx = canvas.getContext('2d');

    const gridSize = 64;
    const cellSize = canvas.width / gridSize;

    const cellColors = {
        0: 'white',
        1: 'lightcoral',
        2: 'lightblue'
    };
    const antColors = {
        1: 'darkred',
        2: 'darkblue'
    };

    let grid;
    let ants = [];
    let iterationCount = 0;
    let tileCounts = { 0: 0, 1: 0, 2: 0 };

    function createEmptyGrid() {
        const newGrid = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));
        tileCounts = { 0: gridSize * gridSize, 1: 0, 2: 0 };
        return newGrid;
    }

    function initializeAnts() {
        ants = [];
        const colors = [1, 2];
        colors.forEach(color => {
            for (let i = 0; i < 3; i++) {
                ants.push({
                    x: Math.floor(Math.random() * gridSize),
                    y: Math.floor(Math.random() * gridSize),
                    dir: Math.floor(Math.random() * 4),
                    color: color,
                    state: 0,
                    rules: createRandomRules()
                });
            }
        });
    }

    function updateCounters() {
        document.getElementById(`iterationCounter${simIndex}`).textContent = iterationCount;
        document.getElementById(`whiteTileCounter${simIndex}`).textContent = tileCounts[0];
        document.getElementById(`redTileCounter${simIndex}`).textContent = tileCounts[1];
        document.getElementById(`blueTileCounter${simIndex}`).textContent = tileCounts[2];
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
            ctx.fillStyle = antColors[ant.color];
            ctx.fillRect(ant.x * cellSize, ant.y * cellSize, cellSize, cellSize);
        });
    }

    function updateLogic() {
        ants.forEach(ant => {
            const currentCell = grid[ant.y][ant.x];
            const rule = ant.rules[currentCell][ant.state];

            ant.dir = (ant.dir + rule.turn + 4) % 4;

            const newGridColor = rule.newGridColor;
            if (grid[ant.y][ant.x] !== newGridColor) {
                tileCounts[grid[ant.y][ant.x]]--;
                tileCounts[newGridColor]++;
            }
            grid[ant.y][ant.x] = newGridColor;
            ant.state = rule.newState;

            switch (ant.dir) {
                case 0: ant.y--; break;
                case 1: ant.x++; break;
                case 2: ant.y++; break;
                case 3: ant.x--; break;
            }
            ant.x = (ant.x + gridSize) % gridSize;
            ant.y = (ant.y + gridSize) % gridSize;
        });
        iterationCount++;
    }

    function reset() {
        grid = createEmptyGrid();
        initializeAnts();
        iterationCount = 0;
        updateCounters();
        drawGrid();
    }

    grid = createEmptyGrid();
    initializeAnts();
    updateCounters();
    drawGrid();

    return {
        updateLogic,
        drawGrid,
        updateCounters,
        reset
    };
}

document.addEventListener('DOMContentLoaded', () => {
    const numSimulations = 4;
    const stepsPerGeneration = 100000;
    const mutationRate = 0.01;
    const updatesPerFrame = 100; // Controls simulation speed within a generation

    let redTeamRules = Array.from({ length: numSimulations }, createTeamRules);
    let blueTeamRules = Array.from({ length: numSimulations }, createTeamRules);
    let simulations = [];
    let generation = 0;
    let evolutionRunning = false;
    let animationFrameId;

    function createTeamRules() {
        return Array.from({ length: 3 }, createAntRules);
    }

    function createAntRules() {
        const rulesForAnt = [];
        const numCellColors = 3;
        for (let cellColor = 0; cellColor < numCellColors; cellColor++) {
            rulesForAnt[cellColor] = [{
                turn: Math.random() < 0.5 ? -1 : 1,
                newGridColor: Math.floor(Math.random() * numCellColors),
                newState: 0
            }];
        }
        return rulesForAnt;
    }

    function createSimulation(canvas, simIndex, initialRedRules, initialBlueRules) {
        const ctx = canvas.getContext('2d');
        const gridSize = 64;
        const cellSize = canvas.width / gridSize;
        const cellColors = { 0: 'white', 1: 'lightcoral', 2: 'lightblue' };
        const antColors = { 1: 'darkred', 2: 'darkblue' };
        
        let grid;
        let ants = [];

        function initialize(redRules, blueRules) {
            grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));
            ants = [];
            
            // Red team
            redRules.forEach(rules => {
                ants.push({
                    x: Math.floor(Math.random() * gridSize),
                    y: Math.floor(Math.random() * gridSize),
                    dir: Math.floor(Math.random() * 4),
                    color: 1,
                    state: 0,
                    rules: rules
                });
            });

            // Blue team
            blueRules.forEach(rules => {
                ants.push({
                    x: Math.floor(Math.random() * gridSize),
                    y: Math.floor(Math.random() * gridSize),
                    dir: Math.floor(Math.random() * 4),
                    color: 2,
                    state: 0,
                    rules: rules
                });
            });
        }

        function updateLogic() {
            ants.forEach(ant => {
                const currentCell = grid[ant.y][ant.x];
                if (currentCell === undefined || ant.rules[currentCell] === undefined) {
                    ant.x = (ant.x + gridSize) % gridSize;
                    ant.y = (ant.y + gridSize) % gridSize;
                    return;
                }

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
                ant.x = (ant.x + gridSize) % gridSize;
                ant.y = (ant.y + gridSize) % gridSize;
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
                ctx.fillStyle = antColors[ant.color];
                ctx.fillRect(ant.x * cellSize, ant.y * cellSize, cellSize, cellSize);
            });
        }

        function getFitness() {
            let redScore = 0;
            let blueScore = 0;
            for (let y = 0; y < gridSize; y++) {
                for (let x = 0; x < gridSize; x++) {
                    if (grid[y][x] === 1) redScore++;
                    if (grid[y][x] === 2) blueScore++;
                }
            }
            return { redScore, blueScore };
        }

        initialize(initialRedRules, initialBlueRules);
        drawGrid();

        return { initialize, updateLogic, drawGrid, getFitness };
    }

    function selection(population, fitnessScores) {
        const tournamentSize = 2;
        const winner = [];
        for (let i = 0; i < population.length; i++) {
            let best = null;
            let bestFitness = -1;
            for (let j = 0; j < tournamentSize; j++) {
                const contenderIndex = Math.floor(Math.random() * population.length);
                if (fitnessScores[contenderIndex] > bestFitness) {
                    bestFitness = fitnessScores[contenderIndex];
                    best = population[contenderIndex];
                }
            }
            winner.push(best);
        }
        return winner;
    }

    function crossover(parent1, parent2) {
        const child = [];
        for (let i = 0; i < parent1.length; i++) {
            // Crossover ant rules
            const antRules1 = parent1[i];
            const antRules2 = parent2[i];
            const childAntRules = [];
            for (let j = 0; j < antRules1.length; j++) {
                childAntRules.push(Math.random() < 0.5 ? antRules1[j] : antRules2[j]);
            }
            child.push(childAntRules);
        }
        return child;
    }

    function mutation(teamRules) {
        for (let i = 0; i < teamRules.length; i++) {
            for (let j = 0; j < teamRules[i].length; j++) { // For each rule in an ant's ruleset
                 if (Math.random() < mutationRate) {
                    teamRules[i][j][0].turn = Math.random() < 0.5 ? -1 : 1;
                }
                if (Math.random() < mutationRate) {
                    teamRules[i][j][0].newGridColor = Math.floor(Math.random() * 3);
                }
            }
        }
        return teamRules;
    }
    
    function evolvePopulation(population, fitnessScores) {
        const selected = selection(population, fitnessScores);
        const newPopulation = [];
        for (let i = 0; i < population.length; i++) {
            const parent1 = selected[Math.floor(Math.random() * selected.length)];
            const parent2 = selected[Math.floor(Math.random() * selected.length)];
            let child = crossover(parent1, parent2);
            child = mutation(child);
            newPopulation.push(child);
        }
        return newPopulation;
    }
    
    function updateUI(fitness) {
        document.getElementById('generationCounter').textContent = generation;
        for (let i = 0; i < numSimulations; i++) {
            document.getElementById(`redScore${i}`).textContent = fitness[i].redScore;
            document.getElementById(`blueScore${i}`).textContent = fitness[i].blueScore;
            simulations[i].drawGrid();
        }
    }

    function runGeneration() {
        if (!evolutionRunning) return;

        let step = 0;
        function runStep() {
            if (step >= stepsPerGeneration || !evolutionRunning) {
                const fitness = simulations.map(sim => sim.getFitness());
                updateUI(fitness);
                
                const redFitness = fitness.map(f => f.redScore);
                const blueFitness = fitness.map(f => f.blueScore);

                redTeamRules = evolvePopulation(redTeamRules, redFitness);
                blueTeamRules = evolvePopulation(blueTeamRules, blueFitness);

                for (let i = 0; i < numSimulations; i++) {
                    simulations[i].initialize(redTeamRules[i], blueTeamRules[i]);
                }
                
                generation++;
                if (evolutionRunning) {
                    requestAnimationFrame(runGeneration);
                }
                return;
            }

            // Perform multiple logic updates for each frame to speed up the simulation
            const stepsThisFrame = Math.min(updatesPerFrame, stepsPerGeneration - step);
            for (let i = 0; i < stepsThisFrame; i++) {
                simulations.forEach(sim => sim.updateLogic());
            }
            step += stepsThisFrame;
            
            // Draw on every frame for smooth animation
            simulations.forEach(sim => sim.drawGrid());

            animationFrameId = requestAnimationFrame(runStep);
        }
        runStep();
    }
    
    function resetGA() {
        evolutionRunning = false;
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        generation = 0;
        redTeamRules = Array.from({ length: numSimulations }, createTeamRules);
        blueTeamRules = Array.from({ length: numSimulations }, createTeamRules);
        for (let i = 0; i < numSimulations; i++) {
            simulations[i].initialize(redTeamRules[i], blueTeamRules[i]);
        }
        updateUI(Array(numSimulations).fill({ redScore: 0, blueScore: 0 }));
    }

    for (let i = 0; i < numSimulations; i++) {
        const canvas = document.getElementById(`gridCanvas${i}`);
        if(canvas){
            simulations.push(createSimulation(canvas, i, redTeamRules[i], blueTeamRules[i]));
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