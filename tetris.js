// ===== TETRIS GAME =====
// Self-contained Tetris game that runs in a modal

const TetrisGame = (function () {
    // Game constants
    const COLS = 10;
    const ROWS = 20;
    const BLOCK_SIZE = 24;

    // Theme Definitions
    const THEMES = {
        default: [
            null,
            '#00f0f0', // I - Cyan
            '#f0f000', // O - Yellow
            '#a000f0', // T - Purple
            '#00f000', // S - Green
            '#f00000', // Z - Red
            '#0000f0', // J - Blue
            '#f0a000'  // L - Orange
        ],
        retro: [ // Gameboy style
            null,
            '#0f380f',
            '#306230',
            '#8bac0f',
            '#9bbc0f',
            '#0f380f',
            '#306230',
            '#8bac0f'
        ],
        neon: [ // Cyberpunk
            null,
            '#00ff00',
            '#ff00ff',
            '#00ffff',
            '#ffff00',
            '#ff0000',
            '#0000ff',
            '#ffffff'
        ],
        pastel: [
            null,
            '#ffb3ba',
            '#ffdfba',
            '#ffffba',
            '#baffc9',
            '#bae1ff',
            '#eecbff',
            '#ffcbfe'
        ]
    };

    let currentTheme = 'default';
    let COLORS = THEMES[currentTheme];

    // Tetromino shapes
    const SHAPES = [
        null,
        [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]], // I
        [[2, 2], [2, 2]], // O
        [[0, 3, 0], [3, 3, 3], [0, 0, 0]], // T
        [[0, 4, 4], [4, 4, 0], [0, 0, 0]], // S
        [[5, 5, 0], [0, 5, 5], [0, 0, 0]], // Z
        [[6, 0, 0], [6, 6, 6], [0, 0, 0]], // J
        [[0, 0, 7], [7, 7, 7], [0, 0, 0]]  // L
    ];

    let canvas, ctx, nextCanvas, nextCtx;
    let board, currentPiece, nextPiece;
    let score, lines, level;
    let gameOver, paused, gameLoop;
    let dropCounter, dropInterval, lastTime;

    function init(canvasId, nextCanvasId) {
        canvas = document.getElementById(canvasId);
        ctx = canvas.getContext('2d');
        nextCanvas = document.getElementById(nextCanvasId);
        nextCtx = nextCanvas.getContext('2d');

        canvas.width = COLS * BLOCK_SIZE;
        canvas.height = ROWS * BLOCK_SIZE;
        nextCanvas.width = 4 * BLOCK_SIZE;
        nextCanvas.height = 4 * BLOCK_SIZE;

        document.addEventListener('keydown', handleKeyPress);

        // Mobile touch controls
        initTouchControls();

        reset();
    }

    function setTheme(themeName) {
        if (THEMES[themeName]) {
            currentTheme = themeName;
            COLORS = THEMES[themeName];
            draw();
            drawNext();
        }
    }

    function initTouchControls() {
        let touchStartX = 0;
        let touchStartY = 0;
        let touchStartTime = 0;
        let lastMoveX = 0;
        let lastMoveY = 0;
        let isTouching = false;
        const MOVE_THRESHOLD_X = 25;
        const MOVE_THRESHOLD_Y = 20;
        const TAP_THRESHOLD = 150;

        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
            lastMoveX = touch.clientX;
            lastMoveY = touch.clientY;
            touchStartTime = Date.now();
            isTouching = true;
        }, { passive: false });

        canvas.addEventListener('touchmove', (e) => {
            if (!isTouching || gameOver || paused) return;
            e.preventDefault();

            const touch = e.touches[0];
            const deltaX = touch.clientX - lastMoveX;
            const deltaY = touch.clientY - lastMoveY;

            // Continuous horizontal movement while dragging
            if (Math.abs(deltaX) > MOVE_THRESHOLD_X) {
                if (deltaX > 0) {
                    moveRight();
                } else {
                    moveLeft();
                }
                lastMoveX = touch.clientX;
            }

            // Continuous downward movement - piece follows finger
            if (deltaY > MOVE_THRESHOLD_Y) {
                if (moveDown()) {
                    score += 1;
                }
                dropCounter = 0;
                lastMoveY = touch.clientY;
            }
        }, { passive: false });

        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            isTouching = false;

            const touch = e.changedTouches[0];
            const deltaX = touch.clientX - touchStartX;
            const deltaY = touch.clientY - touchStartY;
            const elapsed = Date.now() - touchStartTime;

            if (gameOver) {
                reset();
                return;
            }

            if (paused) return;

            // Tap = rotate (quick tap with minimal movement)
            if (Math.abs(deltaX) < MOVE_THRESHOLD_X && Math.abs(deltaY) < MOVE_THRESHOLD_Y && elapsed < TAP_THRESHOLD) {
                rotate();
            }
            // Fast swipe down = hard drop
            else if (deltaY > 100 && elapsed < 200) {
                hardDrop();
            }
        }, { passive: false });
    }

    function reset() {
        board = createBoard();
        score = 0;
        lines = 0;
        level = 1;
        dropCounter = 0;
        dropInterval = 1000;
        lastTime = 0;
        gameOver = false;
        paused = false;

        nextPiece = createPiece();
        spawnPiece();
        updateScore();

        if (gameLoop) cancelAnimationFrame(gameLoop);
        gameLoop = requestAnimationFrame(update);
    }

    function createBoard() {
        return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    }

    function createPiece() {
        const type = Math.floor(Math.random() * 7) + 1;
        return {
            shape: SHAPES[type].map(row => [...row]),
            color: type,
            x: Math.floor(COLS / 2) - Math.ceil(SHAPES[type][0].length / 2),
            y: 0
        };
    }

    function spawnPiece() {
        currentPiece = nextPiece;
        currentPiece.x = Math.floor(COLS / 2) - Math.ceil(currentPiece.shape[0].length / 2);
        currentPiece.y = 0;
        nextPiece = createPiece();

        if (collide()) {
            gameOver = true;
        }

        drawNext();
    }

    function collide(offsetX = 0, offsetY = 0, shape = currentPiece.shape) {
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    const newX = currentPiece.x + x + offsetX;
                    const newY = currentPiece.y + y + offsetY;

                    if (newX < 0 || newX >= COLS || newY >= ROWS) return true;
                    if (newY >= 0 && board[newY][newX]) return true;
                }
            }
        }
        return false;
    }

    function merge() {
        currentPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    const boardY = currentPiece.y + y;
                    const boardX = currentPiece.x + x;
                    if (boardY >= 0) board[boardY][boardX] = value;
                }
            });
        });
    }

    function clearLines() {
        let linesCleared = 0;

        for (let y = ROWS - 1; y >= 0; y--) {
            if (board[y].every(cell => cell !== 0)) {
                board.splice(y, 1);
                board.unshift(Array(COLS).fill(0));
                linesCleared++;
                y++; // Check same row again
            }
        }

        if (linesCleared > 0) {
            const points = [0, 100, 300, 500, 800];
            score += points[linesCleared] * level;
            lines += linesCleared;
            level = Math.floor(lines / 10) + 1;
            dropInterval = Math.max(100, 1000 - (level - 1) * 100);
            updateScore();
        }
    }

    function rotate() {
        const shape = currentPiece.shape;
        const N = shape.length;
        const rotated = shape.map((row, i) =>
            row.map((_, j) => shape[N - 1 - j][i])
        );

        if (!collide(0, 0, rotated)) {
            currentPiece.shape = rotated;
        } else if (!collide(-1, 0, rotated)) {
            currentPiece.x--;
            currentPiece.shape = rotated;
        } else if (!collide(1, 0, rotated)) {
            currentPiece.x++;
            currentPiece.shape = rotated;
        }
    }

    function moveLeft() {
        if (!collide(-1, 0)) currentPiece.x--;
    }

    function moveRight() {
        if (!collide(1, 0)) currentPiece.x++;
    }

    function moveDown() {
        if (!collide(0, 1)) {
            currentPiece.y++;
            return true;
        }
        return false;
    }

    function hardDrop() {
        while (moveDown()) {
            score += 2;
        }
        land();
    }

    function land() {
        merge();
        clearLines();
        spawnPiece();
    }

    function handleKeyPress(e) {
        if (gameOver) {
            if (e.key === 'Enter' || e.key === ' ') reset();
            return;
        }

        if (paused && e.key !== 'p' && e.key !== 'P') return;

        switch (e.key) {
            case 'ArrowLeft':
            case 'a':
            case 'A':
                moveLeft();
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                moveRight();
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                if (moveDown()) score += 1;
                dropCounter = 0;
                break;
            case 'ArrowUp':
            case 'w':
            case 'W':
            case ' ':
                rotate();
                break;
            case 'Enter':
                hardDrop();
                break;
            case 'p':
            case 'P':
                paused = !paused;
                if (!paused) gameLoop = requestAnimationFrame(update);
                break;
        }

        if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', ' '].includes(e.key)) {
            e.preventDefault();
        }
    }

    function update(time = 0) {
        if (gameOver) {
            drawGameOver();
            return;
        }

        if (paused) {
            drawPaused();
            return;
        }

        const deltaTime = time - lastTime;
        lastTime = time;
        dropCounter += deltaTime;

        if (dropCounter > dropInterval) {
            if (!moveDown()) {
                land();
            }
            dropCounter = 0;
        }

        draw();
        gameLoop = requestAnimationFrame(update);
    }

    function draw() {
        // Clear canvas
        ctx.fillStyle = '#0a0a0f';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw grid
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        for (let x = 0; x <= COLS; x++) {
            ctx.beginPath();
            ctx.moveTo(x * BLOCK_SIZE, 0);
            ctx.lineTo(x * BLOCK_SIZE, canvas.height);
            ctx.stroke();
        }
        for (let y = 0; y <= ROWS; y++) {
            ctx.beginPath();
            ctx.moveTo(0, y * BLOCK_SIZE);
            ctx.lineTo(canvas.width, y * BLOCK_SIZE);
            ctx.stroke();
        }

        // Draw board
        board.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) drawBlock(ctx, x, y, COLORS[value]);
            });
        });

        // Draw ghost piece
        let ghostY = currentPiece.y;
        while (!collide(0, ghostY - currentPiece.y + 1)) {
            ghostY++;
        }
        currentPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    drawBlock(ctx, currentPiece.x + x, ghostY + y, COLORS[value], true);
                }
            });
        });

        // Draw current piece
        currentPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    drawBlock(ctx, currentPiece.x + x, currentPiece.y + y, COLORS[value]);
                }
            });
        });
    }

    function drawBlock(context, x, y, color, ghost = false) {
        const padding = 1;
        context.fillStyle = ghost ? 'rgba(255,255,255,0.1)' : color;
        context.fillRect(
            x * BLOCK_SIZE + padding,
            y * BLOCK_SIZE + padding,
            BLOCK_SIZE - padding * 2,
            BLOCK_SIZE - padding * 2
        );

        if (!ghost) {
            // Highlight
            context.fillStyle = 'rgba(255,255,255,0.3)';
            context.fillRect(
                x * BLOCK_SIZE + padding,
                y * BLOCK_SIZE + padding,
                BLOCK_SIZE - padding * 2,
                3
            );
        }
    }

    function drawNext() {
        nextCtx.fillStyle = '#0a0a0f';
        nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);

        const offsetX = (4 - nextPiece.shape[0].length) / 2;
        const offsetY = (4 - nextPiece.shape.length) / 2;

        nextPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    drawBlock(nextCtx, offsetX + x, offsetY + y, COLORS[value]);
                }
            });
        });
    }

    function drawGameOver() {
        draw();
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 20px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 10);

        ctx.font = '14px Inter, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.fillText('Tap or press ENTER to restart', canvas.width / 2, canvas.height / 2 + 20);
    }

    function drawPaused() {
        draw();
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 20px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
    }

    function updateScore() {
        const scoreEl = document.getElementById('tetris-score');
        const linesEl = document.getElementById('tetris-lines');
        const levelEl = document.getElementById('tetris-level');

        if (scoreEl) scoreEl.textContent = score;
        if (linesEl) linesEl.textContent = lines;
        if (levelEl) levelEl.textContent = level;
    }

    function destroy() {
        document.removeEventListener('keydown', handleKeyPress);
        if (gameLoop) cancelAnimationFrame(gameLoop);
    }

    return {
        init,
        reset,
        destroy,
        setTheme
    };
})();
