const gridSize = 128;

const cellColors = {
    0: 'white',
    1: 'lightcoral',
    2: 'lightblue'
};
const antColors = {
    1: 'darkred',
    2: 'darkblue'
};

const rules = {
    // Rules for ant color 1 (red)
    1: [
        // Rules for cell color 0 (white)
        [{ turn: 1, newGridColor: 1, newState: 0 }],
        // Rules for cell color 1 (lightcoral)
        [{ turn: -1, newGridColor: 0, newState: 0 }],
        // Rules for cell color 2 (lightblue)
        [{ turn: -1, newGridColor: 0, newState: 0 }],
    ],
    // Rules for ant color 2 (blue)
    2: [
        // Rules for cell color 0 (white)
        [{ turn: 1, newGridColor: 2, newState: 0 }],
        // Rules for cell color 1 (lightcoral)
        [{ turn: -1, newGridColor: 0, newState: 0 }],
        // Rules for cell color 2 (lightblue)
        [{ turn: -1, newGridColor: 0, newState: 0 }],
    ]
};
let iterationCount = 0;
let tileCounts = { 0: 0, 1: 0, 2: 0 };
let ants = [];

let grid = createEmptyGrid();


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
                state: 0
            });
        }
    });
}

function updateCounters() {
    document.getElementById('iterationCounter').textContent = iterationCount;
    document.getElementById('whiteTileCounter').textContent = tileCounts[0];
    document.getElementById('redTileCounter').textContent = tileCounts[1];
    document.getElementById('blueTileCounter').textContent = tileCounts[2];
}

function drawGrid(canvas, ctx) {
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
        const rule = rules[ant.color][currentCell][ant.state];

        // Turn based on the rule
        ant.dir = (ant.dir + rule.turn + 4) % 4;

        // Change the grid color
        const newGridColor = rule.newGridColor;
        if (grid[ant.y][ant.x] !== newGridColor) {
            tileCounts[grid[ant.y][ant.x]]--;
            tileCounts[newGridColor]++;
        }
        grid[ant.y][ant.x] = newGridColor;

        // Update ant's state
        ant.state = rule.newState;


        switch (ant.dir) {
            case 0: ant.y--; break; // Up
            case 1: ant.x++; break; // Right
            case 2: ant.y++; break; // Down
            case 3: ant.x--; break; // Left
        }

        ant.x = (ant.x + gridSize) % gridSize;
        ant.y = (ant.y + gridSize) % gridSize;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gridCanvas');
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }
    const ctx = canvas.getContext('2d');
    const cellSize = canvas.width / gridSize;

    let animationFrameId = null;
    let simulationRunning = false;
    let updatesPerFrame = 1;

    function gameLoop() {
        if (!simulationRunning) {
            return;
        }

        for (let i = 0; i < updatesPerFrame; i++) {
            updateLogic();
            iterationCount++;
        }

        drawGrid(canvas, ctx);
        updateCounters();
        animationFrameId = requestAnimationFrame(gameLoop);
    }


    document.getElementById('startButton').addEventListener('click', () => {
        if (!simulationRunning) {
            simulationRunning = true;
            gameLoop();
        }
    });

    document.getElementById('stopButton').addEventListener('click', () => {
        simulationRunning = false;
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    });

    document.getElementById('resetButton').addEventListener('click', () => {
        simulationRunning = false;
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        grid = createEmptyGrid();
        initializeAnts();
        iterationCount = 0;
        updateCounters();
        drawGrid(canvas, ctx);
    });

    document.getElementById('speedUpButton').addEventListener('click', () => {
        updatesPerFrame = Math.min(100, updatesPerFrame * 1.5);
    });

    document.getElementById('slowDownButton').addEventListener('click', () => {
        updatesPerFrame = Math.max(1, updatesPerFrame / 1.5);
    });

    initializeAnts();
    updateCounters();
    drawGrid(canvas, ctx);
}); 