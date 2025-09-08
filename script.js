
/* Stickman Runner - simple endless runner
   Controls: SPACE to jump, click/tap to jump
   Features: 3-2-1 countdown before game start, instructions shown
*/

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const ui = document.getElementById('ui');

const W = canvas.width;
const H = canvas.height;

let player, obstacles, frame, score, gameRunning, countdown;

function resetGame() {
  player = { x: 80, y: H - 60, vy:0, w:18, h:36, onGround:true };
  obstacles = [];
  frame = 0;
  score = 0;
  gameRunning = false;
  countdown = null;
}

function drawGround() {
  ctx.fillStyle = '#2c3e50';
  ctx.fillRect(0, H - 20, W, 20);
  // little dashed ground for motion feel
  ctx.fillStyle = '#ffffff20';
  for (let i=0;i<W;i+=40) {
    ctx.fillRect((i + (frame*2 % 40)), H - 10, 20, 2);
  }
}

function drawStickman(x,y) {
  // head
  ctx.strokeStyle = '#111827';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y-22, 8, 0, Math.PI*2);
  ctx.stroke();
  // body
  ctx.beginPath();
  ctx.moveTo(x, y-14);
  ctx.lineTo(x, y+6);
  // arms
  ctx.moveTo(x-12, y-4);
  ctx.lineTo(x+8, y-10);
  // legs
  ctx.moveTo(x, y+6);
  ctx.lineTo(x-10, y+18);
  ctx.moveTo(x, y+6);
  ctx.lineTo(x+10, y+18);
  ctx.stroke();
}

function spawnObstacle() {
  const height = 20 + Math.random()*40;
  const w = 18 + Math.random()*20;
  obstacles.push({ x: W + 10, y: H - 20 - height, w: w, h: height, passed:false });
}

function updateObstacles() {
  if (frame % 90 === 0) spawnObstacle();
  const speed = 4 + Math.floor(score/10); // increase speed slowly
  for (let i = obstacles.length-1; i>=0; i--) {
    obstacles[i].x -= speed;
    if (obstacles[i].x + obstacles[i].w < 0) obstacles.splice(i,1);
    // scoring when passed
    if (!obstacles[i].passed && obstacles[i].x + obstacles[i].w < player.x) {
      obstacles[i].passed = true;
      score++;
    }
  }
}

function checkCollision() {
  for (const o of obstacles) {
    const px = player.x - player.w/2;
    const py = player.y - player.h;
    if (px < o.x + o.w && px + player.w > o.x && py < o.y + o.h && py + player.h > o.y) {
      return true;
    }
  }
  return false;
}

function updatePlayer() {
  const gravity = 0.8;
  player.vy += gravity;
  player.y += player.vy;
  // ground collision
  const groundY = H - 20;
  if (player.y > groundY - 6) {
    player.y = groundY - 6;
    player.vy = 0;
    player.onGround = true;
  } else {
    player.onGround = false;
  }
}

function drawObstacles() {
  ctx.fillStyle = '#b03a2e';
  for (const o of obstacles) {
    ctx.fillRect(o.x, o.y, o.w, o.h);
    // spike decoration
    ctx.fillStyle = '#7a2016';
    ctx.beginPath();
    ctx.moveTo(o.x + o.w*0.15, o.y);
    ctx.lineTo(o.x + o.w*0.5, o.y - 10);
    ctx.lineTo(o.x + o.w*0.85, o.y);
    ctx.fill();
    ctx.fillStyle = '#b03a2e';
  }
}

function drawUI() {
  ctx.fillStyle = '#222';
  ctx.font = '18px Inter, Arial';
  ctx.fillText('Score: ' + score, 12, 28);
}

function gameLoop() {
  if (!gameRunning) return;
  frame++;
  // clear
  ctx.clearRect(0,0,W,H);
  // update
  updatePlayer();
  updateObstacles();
  const hit = checkCollision();
  // draw
  drawGround();
  drawObstacles();
  drawStickman(player.x, player.y);
  drawUI();

  if (hit) {
    gameRunning = false;
    setTimeout(()=> {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(0,0,W,H);
      ctx.fillStyle = '#fff';
      ctx.font = '36px Inter, Arial';
      ctx.fillText('Game Over', W/2 - 90, H/2 - 10);
      ctx.font = '18px Inter, Arial';
      ctx.fillText('Refresh to play again', W/2 - 95, H/2 + 20);
    }, 50);
    return;
  }

  requestAnimationFrame(gameLoop);
}

// start sequence with countdown then start
function startWithCountdown() {
  // hide start UI while countdown runs
  startBtn.disabled = true;
  ui.style.opacity = 0.6;
  let count = 3;
  const overlay = document.createElement('div');
  overlay.className = 'countdownOverlay';
  overlay.style.pointerEvents = 'none';
  overlay.innerText = count;
  document.querySelector('.container').appendChild(overlay);

  const tick = setInterval(() => {
    count--;
    if (count > 0) {
      overlay.innerText = count;
    } else {
      overlay.innerText = 'GO!';
      clearInterval(tick);
      setTimeout(() => {
        overlay.remove();
        startBtn.disabled = false;
        ui.style.opacity = 1;
        gameRunning = true;
        requestAnimationFrame(gameLoop);
      }, 600);
    }
  }, 700);
}

function jump() {
  if (!gameRunning) return;
  if (player.onGround) {
    player.vy = -12;
    player.onGround = false;
  }
}

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    // if not running and no countdown => start countdown
    if (!gameRunning && startBtn.disabled === false && obstacles.length === 0 && score === 0) {
      startWithCountdown();
      return;
    }
    jump();
  }
});

canvas.addEventListener('click', () => {
  if (!gameRunning && startBtn.disabled === false && obstacles.length === 0 && score === 0) {
    startWithCountdown();
    return;
  }
  jump();
});

startBtn.addEventListener('click', () => {
  if (!gameRunning && startBtn.disabled === false && obstacles.length === 0 && score === 0) {
    startWithCountdown();
  }
});

// initialize
resetGame();
ctx.clearRect(0,0,W,H);
// a quick welcome screen draw
ctx.fillStyle = '#111827';
ctx.font = '22px Inter, Arial';
ctx.fillText('Press SPACE to Jump', W/2 - 110, H/2 - 8);
ctx.font = '14px Inter, Arial';
ctx.fillText('Click Start or press Space to begin', W/2 - 120, H/2 + 16);
