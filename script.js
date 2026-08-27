const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;

const sprites = new Image();
sprites.src = 'assets/spritesheet-breakout.png';

// Coordenadas medidas manualmente sobre assets/spritesheet-breakout.png
const SPRITE = {
  ball: { sx: 32, sy: 32, sw: 16, sh: 16 },
  paddle: { sx: 32, sy: 66, sw: 48, sh: 12 },
  brickRows: [
    { sx: 32, sy: 176, sw: 32, sh: 16 },
    { sx: 32, sy: 192, sw: 32, sh: 16 },
    { sx: 32, sy: 208, sw: 32, sh: 16 },
    { sx: 32, sy: 224, sw: 32, sh: 16 },
    { sx: 32, sy: 240, sw: 32, sh: 16 },
    { sx: 32, sy: 256, sw: 32, sh: 16 },
  ],
};

const BRICK_ROWS = 6;
const BRICK_COLS = 10;
const BRICK_COLORS = ['red', 'teal', 'blue', 'purple', 'yellow', 'orange'];
const BRICK_OFFSET_TOP = 60;
const BRICK_OFFSET_LEFT = 10;
const BRICK_PADDING = 4;
const BRICK_HEIGHT = 20;
const BRICK_WIDTH = (CANVAS_WIDTH - BRICK_OFFSET_LEFT * 2 - BRICK_PADDING * (BRICK_COLS - 1)) / BRICK_COLS;

const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 16;
const PADDLE_SPEED = 6;

const BALL_RADIUS = 8;
const SCORE_PER_BRICK = 10;

const state = {
  screen: 'start',
  score: 0,
  lives: 3,
  paddle: null,
  ball: null,
  bricks: [],
};

function createPaddle() {
  return {
    x: (CANVAS_WIDTH - PADDLE_WIDTH) / 2,
    y: CANVAS_HEIGHT - 30,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    speed: PADDLE_SPEED,
  };
}

function createBall(paddle) {
  return {
    x: CANVAS_WIDTH / 2,
    y: paddle.y - BALL_RADIUS,
    dx: 3,
    dy: -3,
    radius: BALL_RADIUS,
  };
}

function createBricks() {
  const bricks = [];
  for (let row = 0; row < BRICK_ROWS; row++) {
    for (let col = 0; col < BRICK_COLS; col++) {
      bricks.push({
        x: BRICK_OFFSET_LEFT + col * (BRICK_WIDTH + BRICK_PADDING),
        y: BRICK_OFFSET_TOP + row * (BRICK_HEIGHT + BRICK_PADDING),
        width: BRICK_WIDTH,
        height: BRICK_HEIGHT,
        color: BRICK_COLORS[row],
        alive: true,
      });
    }
  }
  return bricks;
}

function startGame() {
  state.paddle = createPaddle();
  state.ball = createBall(state.paddle);
  state.bricks = createBricks();
  state.screen = 'playing';
}

function drawStartScreen() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.fillStyle = '#fff';
  ctx.font = '24px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('presioná una tecla para empezar', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
}

function drawPaddle() {
  const { paddle } = state;
  const s = SPRITE.paddle;
  ctx.drawImage(sprites, s.sx, s.sy, s.sw, s.sh, paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBall() {
  const { ball } = state;
  const s = SPRITE.ball;
  ctx.drawImage(
    sprites, s.sx, s.sy, s.sw, s.sh,
    ball.x - ball.radius, ball.y - ball.radius, ball.radius * 2, ball.radius * 2
  );
}

function drawBricks() {
  state.bricks.forEach((brick) => {
    if (!brick.alive) return;
    const rowIndex = BRICK_COLORS.indexOf(brick.color);
    const s = SPRITE.brickRows[rowIndex];
    ctx.drawImage(sprites, s.sx, s.sy, s.sw, s.sh, brick.x, brick.y, brick.width, brick.height);
  });
}

function drawHud() {
  ctx.fillStyle = '#fff';
  ctx.font = '16px sans-serif';
  ctx.textBaseline = 'top';

  ctx.textAlign = 'left';
  ctx.fillText(`Puntaje: ${state.score}`, 10, 10);

  ctx.textAlign = 'right';
  ctx.fillText(`Vidas: ${state.lives}`, CANVAS_WIDTH - 10, 10);
}

function drawPlayingScreen() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  drawBricks();
  drawPaddle();
  drawBall();
  drawHud();
}

function movePaddle() {
  const { paddle } = state;
  if (keys.ArrowLeft) {
    paddle.x -= paddle.speed;
  }
  if (keys.ArrowRight) {
    paddle.x += paddle.speed;
  }
  paddle.x = Math.max(0, Math.min(CANVAS_WIDTH - paddle.width, paddle.x));
}

function moveBall() {
  const { ball, paddle } = state;
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Paredes laterales
  if (ball.x - ball.radius <= 0) {
    ball.x = ball.radius;
    ball.dx = -ball.dx;
  } else if (ball.x + ball.radius >= CANVAS_WIDTH) {
    ball.x = CANVAS_WIDTH - ball.radius;
    ball.dx = -ball.dx;
  }

  // Pared superior
  if (ball.y - ball.radius <= 0) {
    ball.y = ball.radius;
    ball.dy = -ball.dy;
  }

  // Paleta (solo si la pelota viene bajando)
  if (
    ball.dy > 0 &&
    ball.y + ball.radius >= paddle.y &&
    ball.y + ball.radius <= paddle.y + paddle.height &&
    ball.x >= paddle.x &&
    ball.x <= paddle.x + paddle.width
  ) {
    ball.y = paddle.y - ball.radius;
    ball.dy = -ball.dy;
  }
}

function checkBrickCollisions() {
  const { ball, bricks } = state;
  for (const brick of bricks) {
    if (!brick.alive) continue;

    const closestX = Math.max(brick.x, Math.min(ball.x, brick.x + brick.width));
    const closestY = Math.max(brick.y, Math.min(ball.y, brick.y + brick.height));
    const dx = ball.x - closestX;
    const dy = ball.y - closestY;

    if (dx * dx + dy * dy <= ball.radius * ball.radius) {
      brick.alive = false;
      state.score += SCORE_PER_BRICK;

      if (Math.abs(dx) > Math.abs(dy)) {
        ball.dx = -ball.dx;
      } else {
        ball.dy = -ball.dy;
      }

      break; // un solo ladrillo por frame alcanza a velocidad constante
    }
  }
}

function resetToStartScreen() {
  state.screen = 'start';
  state.score = 0;
  state.lives = 3;
  state.bricks = [];
  state.paddle = null;
  state.ball = null;
}

function serveNewBall() {
  state.paddle = createPaddle();
  state.ball = createBall(state.paddle);
}

function checkBallLost() {
  const { ball } = state;
  if (ball.y - ball.radius > CANVAS_HEIGHT) {
    state.lives -= 1;
    if (state.lives <= 0) {
      resetToStartScreen();
    } else {
      serveNewBall();
    }
  }
}

function checkVictory() {
  if (state.bricks.every((brick) => !brick.alive)) {
    resetToStartScreen();
  }
}

function update() {
  if (state.screen === 'playing') {
    movePaddle();
    moveBall();
    checkBrickCollisions();
    checkBallLost();
    checkVictory();
  }
}

function draw() {
  if (state.screen === 'start') {
    drawStartScreen();
  } else if (state.screen === 'playing') {
    drawPlayingScreen();
  }
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

const keys = {};

window.addEventListener('keydown', (e) => {
  if (state.screen === 'start') {
    startGame();
  }
  keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
  keys[e.key] = false;
});

sprites.onload = () => {
  gameLoop();
};
