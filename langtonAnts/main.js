const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');

const gridSize = 128;
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

let grid = createEmptyGrid();
let ants = [];

let intervalId;
let simulationSpeed = 100;

function createEmptyGrid() {
    return Array.from({ length: gridSize }, () => Array(gridSize).fill(0));
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

function update() {
    ants.forEach(ant => {
        const currentCell = grid[ant.y][ant.x];
        const rule = rules[ant.color][currentCell][ant.state];

        // Turn based on the rule
        ant.dir = (ant.dir + rule.turn + 4) % 4;

        // Change the grid color
        grid[ant.y][ant.x] = rule.newGridColor;

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

    drawGrid();
}

function updateSimulationSpeed(change) {
    simulationSpeed *= change;
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = setInterval(update, simulationSpeed);
    }
}

document.getElementById('startButton').addEventListener('click', () => {
    if (!intervalId) {
        intervalId = setInterval(update, simulationSpeed);
    }
});

document.getElementById('stopButton').addEventListener('click', () => {
    clearInterval(intervalId);
    intervalId = null;
});

document.getElementById('resetButton').addEventListener('click', () => {
    clearInterval(intervalId);
    intervalId = null;
    grid = createEmptyGrid();
    initializeAnts();
    drawGrid();
});

document.getElementById('speedUpButton').addEventListener('click', () => {
    updateSimulationSpeed(1.5);
});

document.getElementById('slowDownButton').addEventListener('click', () => {
    updateSimulationSpeed(0.7);
});

initializeAnts();
drawGrid(); 