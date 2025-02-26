// **Game Variables**
const grid = document.getElementById('grid');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const timerElement = document.getElementById('timer');
const pauseMenu = document.getElementById('pause-menu');
const continueButton = document.getElementById('continue');
const restartButton = document.getElementById('restart');

let score = 0;
let lives = 3;
let timer = 0;
let isPaused = false;
let gameInterval;

// **Tetris Pieces**
const tetrominoes = [
    { shape: [[1, 1, 1, 1]], color: 'cyan' },    // I
    { shape: [[1, 1], [1, 1]], color: 'yellow' }, // O
    { shape: [[0, 1, 0], [1, 1, 1]], color: 'purple' }, // T
    { shape: [[1, 1, 0], [0, 1, 1]], color: 'red' }, // Z
    { shape: [[0, 1, 1], [1, 1, 0]], color: 'green' }, // S
    { shape: [[1, 0, 0], [1, 1, 1]], color: 'blue' }, // J
    { shape: [[0, 0, 1], [1, 1, 1]], color: 'orange' } // L
];

// **Game State**
let currentPiece;
let currentPosition = { x: 4, y: 0 };
let gridState = Array.from({ length: 20 }, () => Array(10).fill(0));

// **Initialize Game**
function initGame() {
    createGrid();
    spawnPiece();
    gameInterval = setInterval(updateGame, 1000);
    document.addEventListener('keydown', handleKeyPress);
    continueButton.addEventListener('click', continueGame);
    restartButton.addEventListener('click', restartGame);
}

// **Create Grid**
function createGrid() {
    for (let row = 0; row < 20; row++) {
        for (let col = 0; col < 10; col++) {
            const cell = document.createElement('div');
            grid.appendChild(cell);
        }
    }
}

// **Spawn Piece**
function spawnPiece() {
    const randomIndex = Math.floor(Math.random() * tetrominoes.length);
    currentPiece = tetrominoes[randomIndex];
    currentPosition = { x: 4, y: 0 };
    if (checkCollision()) {
        gameOver();
    }
    drawPiece();
}

// **Draw Piece**
function drawPiece() {
    currentPiece.shape.forEach((row, dy) => {
        row.forEach((value, dx) => {
            if (value) {
                const x = currentPosition.x + dx;
                const y = currentPosition.y + dy;
                const cellIndex = y * 10 + x;
                grid.children[cellIndex].style.backgroundColor = currentPiece.color;
            }
        });
    });
}

// **Clear Piece**
function clearPiece() {
    currentPiece.shape.forEach((row, dy) => {
        row.forEach((value, dx) => {
            if (value) {
                const x = currentPosition.x + dx;
                const y = currentPosition.y + dy;
                const cellIndex = y * 10 + x;
                grid.children[cellIndex].style.backgroundColor = '#444';
            }
        });
    });
}

// **Move Piece**
function movePiece(dx, dy) {
    clearPiece();
    currentPosition.x += dx;
    currentPosition.y += dy;
    if (checkCollision()) {
        currentPosition.x -= dx;
        currentPosition.y -= dy;
        if (dy === 1) {
            lockPiece();
            clearLines();
            spawnPiece();
        }
    }
    drawPiece();
}

// **Rotate Piece**
function rotatePiece() {
    clearPiece();
    const rotated = currentPiece.shape[0].map((_, i) =>
        currentPiece.shape.map(row => row[i]).reverse()
    );
    const originalShape = currentPiece.shape;
    currentPiece.shape = rotated;
    if (checkCollision()) {
        currentPiece.shape = originalShape;
    }
    drawPiece();
}

// **Check Collision**
function checkCollision() {
    return currentPiece.shape.some((row, dy) =>
        row.some((value, dx) => {
            const x = currentPosition.x + dx;
            const y = currentPosition.y + dy
            return (
                value !== 0 &&
                (x < 0 || x >= 10 || y >= 20 || gridState[y]?.[x] !== 0)
            );
        })
    );
}

// **Lock Piece**
function lockPiece() {
    currentPiece.shape.forEach((row, dy) => {
        row.forEach((value, dx) => {
            if (value) {
                const x = currentPosition.x + dx;
                const y = currentPosition.y + dy;
                gridState[y][x] = currentPiece.color;
            }
        });
    });
}

// **Clear Lines**
function clearLines() {
    let linesCleared = 0;
    for (let row = 19; row >= 0; row--) {
        if (gridState[row].every(cell => cell !== 0)) {
            gridState.splice(row, 1);
            gridState.unshift(Array(10).fill(0));
            linesCleared++;
        }
    }
    if (linesCleared > 0) {
        score += linesCleared * 100;
        updateScore();
    }
    updateGrid();
}

// **Update Grid**
function updateGrid() {
    gridState.forEach((row, y) => {
        row.forEach((cell, x) => {
            const cellIndex = y * 10 + x;
            grid.children[cellIndex].style.backgroundColor = cell || '#444';
        });
    });
}

// **Update Game**
function updateGame() {
    if (!isPaused) {
        movePiece(0, 1);
        timer++;
        timerElement.textContent = timer;
    }
}

// **Handle Key Press**
function handleKeyPress(event) {
    if (isPaused) return;
    switch (event.key) {
        case 'ArrowLeft':
            movePiece(-1, 0);
            break;
        case 'ArrowRight':
            movePiece(1, 0);
            break;
        case 'ArrowDown':
            movePiece(0, 1);
            break;
        case 'ArrowUp':
            rotatePiece();
            break;
        case ' ':
            pauseGame();
            break;
        case 'Enter': // Hard drop key
            hardDrop();
        break;
    }
}

// **Pause Game**
function pauseGame() {
    isPaused = !isPaused;
    pauseMenu.classList.toggle('hidden');
}

// **Hard Drop**
function hardDrop() {
    while (!checkCollision()) {
        currentPosition.y += 1; // Move down until collision
    }
    currentPosition.y -= 1; // Adjust position to the last valid position
    lockPiece(); // Lock the piece in place
    clearLines(); // Clear any completed lines
    spawnPiece(); // Spawn a new piece
    drawPiece(); // Draw the new piece
}

// **Continue Game**
function continueGame() {
    pauseGame();
}

// **Restart Game**
function restartGame() {
    clearInterval(gameInterval);
    gridState = Array.from({ length: 20 }, () => Array(10).fill(0));
    score = 0;
    lives = 3;
    timer = 0;
    updateScore();
    updateLives();
    timerElement.textContent = timer;
    updateGrid();
    initGame();
}

// **Update Score**
function updateScore() {
    scoreElement.textContent = score;
}

// **Update Lives**
function updateLives() {
    livesElement.textContent = lives;
}

// **Game Over**
function gameOver() {
    clearInterval(gameInterval);
    resetGridStyles(); // Reset grid styles before showing the alert
    alert('Game Over!');
    restartGame();
}

// **Reset Grid Styles**
function resetGridStyles() {
    while (grid.firstChild) {
        grid.removeChild(grid.firstChild);
    }
    createGrid(); // Recreate the grid to ensure it has the correct dimensions
}

// **Start Game**
initGame();