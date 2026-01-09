// ===== BREAKOUT GAME =====
// Ball bounces off page elements and shatters them

const BreakoutGame = (function () {
    let ball, paddle, bricks;
    let score, lives;
    let gameRunning = false;
    let animationId;

    // Game elements
    let ballEl, paddleEl, uiEl;

    // Settings
    const BALL_SIZE = 20;
    const BALL_SPEED = 6;
    const PADDLE_HEIGHT = 12;
    const PADDLE_WIDTH = 120;

    function init() {
        createGameElements();
        collectBricks();
        resetBall();

        score = 0;
        lives = 3;
        gameRunning = true;

        // Add event listeners
        document.addEventListener('mousemove', movePaddle);
        document.addEventListener('touchmove', movePaddleTouch, { passive: false });
        document.addEventListener('keydown', handleKey);

        document.body.classList.add('breakout-active');
        updateUI();

        // Start game loop
        gameLoop();
    }

    function createGameElements() {
        // Ball
        ballEl = document.createElement('div');
        ballEl.className = 'breakout-ball';
        ballEl.style.cssText = `
            position: fixed;
            width: ${BALL_SIZE}px;
            height: ${BALL_SIZE}px;
            background: var(--accent, #d4ff00);
            border-radius: 50%;
            z-index: 10001;
            pointer-events: none;
            box-shadow: 0 0 20px var(--accent, #d4ff00), 0 0 40px var(--accent, #d4ff00);
        `;
        document.body.appendChild(ballEl);

        // Paddle
        paddleEl = document.createElement('div');
        paddleEl.className = 'breakout-paddle';
        paddleEl.style.cssText = `
            position: fixed;
            bottom: 30px;
            width: ${PADDLE_WIDTH}px;
            height: ${PADDLE_HEIGHT}px;
            background: linear-gradient(to bottom, #fff, #ccc);
            border-radius: 6px;
            z-index: 10001;
            pointer-events: none;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        `;
        document.body.appendChild(paddleEl);

        // UI
        uiEl = document.createElement('div');
        uiEl.className = 'breakout-ui';
        uiEl.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.8);
            padding: 10px 25px;
            border-radius: 25px;
            z-index: 10002;
            font-family: Inter, sans-serif;
            font-size: 14px;
            color: #fff;
            display: flex;
            gap: 30px;
        `;
        document.body.appendChild(uiEl);

        // Initialize paddle position
        paddle = {
            x: window.innerWidth / 2 - PADDLE_WIDTH / 2,
            width: PADDLE_WIDTH,
            height: PADDLE_HEIGHT
        };
        paddleEl.style.left = paddle.x + 'px';
    }

    function collectBricks() {
        // Find elements to use as bricks
        const selectors = [
            '.project-card',
            '.service-card',
            '.benefit-item',
            '.faq-item',
            '.testimonial-card',
            '.pricing-card',
            '.stat-item',
            'section h2',
            '.hero h1',
            '.btn--primary:not(.breakout-ui *)'
        ];

        const elements = document.querySelectorAll(selectors.join(', '));
        bricks = [];

        elements.forEach(el => {
            const rect = el.getBoundingClientRect();
            // Only include visible elements in viewport
            if (rect.top < window.innerHeight && rect.bottom > 0 &&
                rect.left < window.innerWidth && rect.right > 0 &&
                rect.width > 30 && rect.height > 20) {
                bricks.push({
                    element: el,
                    rect: rect,
                    alive: true
                });
                el.style.transition = 'transform 0.3s, opacity 0.3s';
            }
        });
    }

    function resetBall() {
        ball = {
            x: window.innerWidth / 2,
            y: window.innerHeight - 100,
            vx: (Math.random() > 0.5 ? 1 : -1) * BALL_SPEED * 0.7,
            vy: -BALL_SPEED
        };
        updateBallPosition();
    }

    function updateBallPosition() {
        ballEl.style.left = (ball.x - BALL_SIZE / 2) + 'px';
        ballEl.style.top = (ball.y - BALL_SIZE / 2) + 'px';
    }

    function movePaddle(e) {
        if (!gameRunning) return;
        paddle.x = Math.max(0, Math.min(window.innerWidth - PADDLE_WIDTH, e.clientX - PADDLE_WIDTH / 2));
        paddleEl.style.left = paddle.x + 'px';
    }

    function movePaddleTouch(e) {
        if (!gameRunning) return;
        e.preventDefault();
        const touch = e.touches[0];
        paddle.x = Math.max(0, Math.min(window.innerWidth - PADDLE_WIDTH, touch.clientX - PADDLE_WIDTH / 2));
        paddleEl.style.left = paddle.x + 'px';
    }

    function handleKey(e) {
        if (e.key === 'Escape') {
            destroy();
        }
    }

    function gameLoop() {
        if (!gameRunning) return;

        // Move ball
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Wall collisions
        if (ball.x <= BALL_SIZE / 2 || ball.x >= window.innerWidth - BALL_SIZE / 2) {
            ball.vx *= -1;
            ball.x = Math.max(BALL_SIZE / 2, Math.min(window.innerWidth - BALL_SIZE / 2, ball.x));
        }
        if (ball.y <= BALL_SIZE / 2) {
            ball.vy *= -1;
            ball.y = BALL_SIZE / 2;
        }

        // Paddle collision
        const paddleTop = window.innerHeight - 30 - PADDLE_HEIGHT;
        if (ball.y >= paddleTop - BALL_SIZE / 2 &&
            ball.y <= paddleTop + PADDLE_HEIGHT &&
            ball.x >= paddle.x &&
            ball.x <= paddle.x + PADDLE_WIDTH) {

            ball.vy = -Math.abs(ball.vy);
            // Add angle based on where ball hits paddle
            const hitPos = (ball.x - paddle.x) / PADDLE_WIDTH;
            ball.vx = BALL_SPEED * (hitPos - 0.5) * 2;
            ball.y = paddleTop - BALL_SIZE / 2;
        }

        // Ball falls off bottom
        if (ball.y > window.innerHeight + BALL_SIZE) {
            lives--;
            updateUI();

            if (lives <= 0) {
                gameOver(false);
                return;
            }
            resetBall();
        }

        // Brick collisions
        let allDestroyed = true;
        bricks.forEach(brick => {
            if (!brick.alive) return;
            allDestroyed = false;

            const rect = brick.rect;
            if (ball.x + BALL_SIZE / 2 > rect.left &&
                ball.x - BALL_SIZE / 2 < rect.right &&
                ball.y + BALL_SIZE / 2 > rect.top &&
                ball.y - BALL_SIZE / 2 < rect.bottom) {

                // Hit!
                brick.alive = false;
                score += 100;
                updateUI();
                shatterElement(brick.element);

                // Bounce
                const fromLeft = ball.x < rect.left;
                const fromRight = ball.x > rect.right;
                const fromTop = ball.y < rect.top;
                const fromBottom = ball.y > rect.bottom;

                if (fromLeft || fromRight) ball.vx *= -1;
                if (fromTop || fromBottom) ball.vy *= -1;
            }
        });

        // Win check
        if (allDestroyed && bricks.length > 0) {
            gameOver(true);
            return;
        }

        updateBallPosition();
        animationId = requestAnimationFrame(gameLoop);
    }

    function shatterElement(el) {
        el.style.transform = 'scale(0.8) rotate(' + (Math.random() * 10 - 5) + 'deg)';
        el.style.opacity = '0';
        el.classList.add('shattered');

        // Create particle burst
        createParticles(el.getBoundingClientRect());
    }

    function createParticles(rect) {
        const count = 8;
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: fixed;
                left: ${rect.left + rect.width / 2}px;
                top: ${rect.top + rect.height / 2}px;
                width: 8px;
                height: 8px;
                background: var(--accent, #d4ff00);
                border-radius: 50%;
                z-index: 10000;
                pointer-events: none;
            `;
            document.body.appendChild(particle);

            const angle = (i / count) * Math.PI * 2;
            const speed = 100 + Math.random() * 100;
            const tx = Math.cos(angle) * speed;
            const ty = Math.sin(angle) * speed;

            particle.animate([
                { transform: 'translate(0, 0) scale(1)', opacity: 1 },
                { transform: `translate(${tx}px, ${ty}px) scale(0)`, opacity: 0 }
            ], {
                duration: 500,
                easing: 'ease-out'
            }).onfinish = () => particle.remove();
        }
    }

    function updateUI() {
        uiEl.innerHTML = `
            <span>⭐ Score: <strong>${score}</strong></span>
            <span>❤️ Lives: <strong>${lives}</strong></span>
            <span style="opacity: 0.6; font-size: 12px;">ESC to exit</span>
        `;
    }

    function gameOver(won) {
        gameRunning = false;

        const overlay = document.createElement('div');
        overlay.className = 'breakout-gameover';
        overlay.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.85);
            z-index: 10003;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-family: Inter, sans-serif;
            color: #fff;
        `;
        overlay.innerHTML = `
            <h2 style="font-size: 3rem; margin: 0;">${won ? '🎉 YOU WIN!' : '💥 GAME OVER'}</h2>
            <p style="font-size: 1.5rem; margin: 1rem 0;">Score: ${score}</p>
            <button onclick="location.reload()" style="
                background: var(--accent, #d4ff00);
                color: #000;
                border: none;
                padding: 1rem 2rem;
                font-size: 1rem;
                font-weight: 600;
                border-radius: 8px;
                cursor: pointer;
                margin-top: 1rem;
            ">Play Again</button>
        `;
        document.body.appendChild(overlay);
    }

    function destroy() {
        gameRunning = false;
        cancelAnimationFrame(animationId);

        // Remove game elements
        ballEl?.remove();
        paddleEl?.remove();
        uiEl?.remove();
        document.querySelector('.breakout-gameover')?.remove();

        // Restore bricks
        bricks?.forEach(brick => {
            brick.element.style.transform = '';
            brick.element.style.opacity = '';
            brick.element.classList.remove('shattered');
        });

        document.body.classList.remove('breakout-active');
        document.removeEventListener('mousemove', movePaddle);
        document.removeEventListener('touchmove', movePaddleTouch);
        document.removeEventListener('keydown', handleKey);
    }

    return { init, destroy };
})();
