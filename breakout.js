// ===== BREAKOUT GAME =====
// Survival Mode: Page scrolls UP (content falls DOWN), player must break elements before they pass the paddle.

const BreakoutGame = (function () {
    let ball, paddle, bricks;
    let score, lives;
    let gameRunning = false;
    let animationId;
    let scrollSpeed = 0.5;

    // Game elements
    let ballEl, paddleEl, uiEl;

    // Settings
    const BALL_SIZE = 20;
    const BALL_SPEED = 6;
    const PADDLE_HEIGHT = 12;
    const PADDLE_WIDTH = 120;

    function init() {
        // Add buffer to push content up so it doesn't crush player
        document.body.style.marginBottom = '80vh';

        // Start at the bottom (now including the buffer)
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' });

        // Hide sticky CTA bar
        const stickyBar = document.querySelector('.sticky-cta');
        if (stickyBar) stickyBar.style.display = 'none';

        // Hide the basement section
        const basement = document.getElementById('secretBasement');
        if (basement) basement.style.display = 'none';

        // Wait for setup
        setTimeout(() => {
            createGameElements();
            collectBricks();

            if (bricks.length === 0) {
                alert('No elements found to break! Try scrolling up first.');
                destroy();
                return;
            }

            resetBall();

            score = 0;
            lives = 3;
            scrollSpeed = 0.3; // Start slow
            gameRunning = true;

            // Add event listeners
            document.addEventListener('mousemove', movePaddle);
            document.addEventListener('touchmove', movePaddleTouch, { passive: false });
            document.addEventListener('keydown', handleKey);

            document.body.classList.add('breakout-active');
            updateUI();

            // Start game loop
            gameLoop();
        }, 100);
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
            bottom: 20px;
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
            background: rgba(0,0,0,0.9);
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
        // Find EVERYTHING visible on the page
        const selectors = [
            // Structural
            'section',
            'header',
            'nav',
            'footer',
            'article',
            'aside',
            // Content containers
            '.container > *',
            '.hero',
            '.hero-content',
            '.hero-visual',
            // Text elements
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'p',
            'li',
            'blockquote',
            // Cards and items
            '.card',
            '.project-card',
            '.service-card',
            '.benefit-item',
            '.faq-item',
            '.testimonial-card',
            '.pricing-card',
            '.stat-item',
            '.feature-card',
            // Media
            'img',
            'video',
            'svg:not(.breakout-ui svg)',
            // Interactive
            '.btn:not(.breakout-ui *)',
            'button:not(.breakout-ui *)',
            'a:not(.breakout-ui *)',
            'input',
            'form',
            // Generic elements
            '[class*="card"]',
            '[class*="item"]',
            '[class*="box"]',
            '[class*="wrapper"]',
            '[class*="content"]'
        ];

        // Exclude game UI elements
        const excludeSelectors = '.breakout-ui, .breakout-ball, .breakout-paddle, .breakout-gameover, .sticky-cta, .secret-basement, #secretBasement, script, style, link, meta';

        const allElements = document.querySelectorAll(selectors.join(', '));
        bricks = [];

        allElements.forEach(el => {
            // Skip excluded elements
            if (el.closest(excludeSelectors)) return;
            if (el.classList && el.classList.contains('breakout-ui')) return;

            const rect = el.getBoundingClientRect();
            // Store absolute page position because we will be scrolling
            const absTop = rect.top + window.scrollY;

            // Include ALL elements in the document, not just viewport
            if (rect.width > 20 && rect.height > 10 && rect.width < window.innerWidth * 0.98) {
                // Skip if parent is already a brick
                const isChildOfBrick = bricks.some(b => b.element.contains(el) && b.element !== el);
                if (isChildOfBrick) return;

                bricks.push({
                    element: el,
                    rect: rect, // Valid at collection time
                    absTop: absTop, // Valid forever (until reset)
                    alive: true
                });
                el.style.transition = 'transform 0.2s, opacity 0.2s';
                el.dataset.breakoutBrick = 'true';
            }
        });

        console.log('Breakout: Found', bricks.length, 'breakable elements');
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

        // Survival Mode: Auto-scroll UP (content falls DOWN)
        if (window.scrollY > 0) {
            window.scrollBy(0, -scrollSpeed);
        } else {
            // Reached TOP of page! Win!
            gameOver(true);
            return;
        }

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

        // Brick collisions & Survival Checks
        const currentScrollY = window.scrollY;

        bricks.forEach(brick => {
            if (!brick.alive) return;

            // Calculate current visual position relative to viewport
            // Brick visual Y = Absolute Y - Current Scroll Y
            const visualTop = brick.absTop - currentScrollY;
            const visualBottom = visualTop + brick.rect.height;
            const visualLeft = brick.rect.left;
            const visualRight = brick.rect.right;

            // Survival Check: If brick falls completely below viewport
            if (visualTop > window.innerHeight) {
                // Ignore small items or elements that were already below?
                // For now, if anything significant passes, you lose.
                if (brick.rect.height > 20) {
                    lives = 0;
                    gameOver(false);
                    return;
                }
            }

            // Only check collision if brick is actually on screen
            if (visualBottom < 0 || visualTop > window.innerHeight) return;

            // Collision AABB
            if (ball.x + BALL_SIZE / 2 > visualLeft &&
                ball.x - BALL_SIZE / 2 < visualRight &&
                ball.y + BALL_SIZE / 2 > visualTop &&
                ball.y - BALL_SIZE / 2 < visualBottom) {

                // Hit!
                brick.alive = false;
                score += 100;

                // Increase scroll speed slightly on every hit
                scrollSpeed += 0.05;
                if (scrollSpeed > 3) scrollSpeed = 3; // Cap speed

                updateUI();
                shatterElement(brick.element);

                // Bounce
                const fromLeft = ball.x < visualLeft;
                const fromRight = ball.x > visualRight;
                const fromTop = ball.y < visualTop;
                const fromBottom = ball.y > visualBottom;

                if (fromLeft || fromRight) ball.vx *= -1;
                if (fromTop || fromBottom) ball.vy *= -1;
            }
        });

        if (!gameRunning) return; // Check again in case game over triggered

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
            <span style="opacity: 0.6; font-size: 12px; margin-left: 10px;">⚡ Speed: ${scrollSpeed.toFixed(1)}x</span>
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
            <h2 style="font-size: 3rem; margin: 0;">${won ? '🎉 CLEAN SWEEP!' : '💥 GAME OVER'}</h2>
            <p style="font-size: 1.5rem; margin: 1rem 0;">Score: ${score}</p>
            <p>${won ? 'You cleared the page!' : 'The website crushed you.'}</p>
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

        // Restore bricks (and remove buffer)
        document.body.style.marginBottom = ''; // REMOVE BUFFER

        bricks?.forEach(brick => {
            brick.element.style.transform = '';
            brick.element.style.opacity = '';
            brick.element.classList.remove('shattered');
            delete brick.element.dataset.breakoutBrick;
        });

        // Restore hidden elements
        const stickyBar = document.querySelector('.sticky-cta');
        if (stickyBar) stickyBar.style.display = '';

        const basement = document.getElementById('secretBasement');
        if (basement) basement.style.display = '';

        document.body.classList.remove('breakout-active');
        document.removeEventListener('mousemove', movePaddle);
        document.removeEventListener('touchmove', movePaddleTouch);
        document.removeEventListener('keydown', handleKey);
    }

    return { init, destroy };
})();
