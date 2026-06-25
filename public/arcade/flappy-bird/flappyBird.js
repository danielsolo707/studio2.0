var cvs = document.getElementById("canvas");
var ctx = cvs.getContext("2d");

// load images
var bird = new Image();
var bg = new Image();
var fg = new Image();
var pipeNorth = new Image();
var pipeSouth = new Image();

bird.src = "images/bird.png";
bg.src = "images/bg.png";
fg.src = "images/fg.png";
pipeNorth.src = "images/pipeNorth.png";
pipeSouth.src = "images/pipeSouth.png";

// some variables
var gap = 85;
var constant;

var bX = 10;
var bY = 150;

var gravity = 1.5;

var score = 0;

// audio files
var fly = new Audio();
var scor = new Audio();

fly.src = "sounds/fly.mp3";
scor.src = "sounds/score.mp3";

// game state: "idle" | "running" | "stopped" | "over"
var state = "idle";
var rafId = null;

// pipe coordinates
var pipe = [];

function resetGame() {
  bX = 10;
  bY = 150;
  score = 0;
  pipe = [];
  pipe[0] = { x: cvs.width, y: 0 };
  state = "idle";
}

function moveUp() {
  if (state === "idle") {
    state = "running";
    startBtn.textContent = "RESTART";
  }
  if (state !== "running") return;
  bY -= 25;
  fly.play();
}

// keyboard
document.addEventListener("keydown", function (e) {
  if (e.code === "Space" || e.key === " ") {
    e.preventDefault();
    moveUp();
  }
});

// mouse click on canvas
cvs.addEventListener("mousedown", function (e) {
  e.preventDefault();
  moveUp();
});

// touch on canvas
cvs.addEventListener("touchstart", function (e) {
  e.preventDefault();
  moveUp();
}, { passive: false });

// draw images
function draw() {
  if (state !== "running") return;

  ctx.drawImage(bg, 0, 0);

  for (var i = 0; i < pipe.length; i++) {
    constant = pipeNorth.height + gap;
    ctx.drawImage(pipeNorth, pipe[i].x, pipe[i].y);
    ctx.drawImage(pipeSouth, pipe[i].x, pipe[i].y + constant);

    pipe[i].x--;

    if (pipe[i].x == 125) {
      pipe.push({
        x: cvs.width,
        y: Math.floor(Math.random() * pipeNorth.height) - pipeNorth.height,
      });
    }

    // detect collision
    if (
      (bX + bird.width >= pipe[i].x &&
        bX <= pipe[i].x + pipeNorth.width &&
        (bY <= pipe[i].y + pipeNorth.height ||
          bY + bird.height >= pipe[i].y + constant)) ||
      bY + bird.height >= cvs.height - fg.height
    ) {
      state = "over";
      drawGameOver();
      return;
    }

    if (pipe[i].x == 5) {
      score++;
      scor.play();
    }
  }

  ctx.drawImage(fg, 0, cvs.height - fg.height);
  ctx.drawImage(bird, bX, bY);

  bY += gravity;

  ctx.fillStyle = "#000";
  ctx.font = "20px Verdana";
  ctx.fillText("Score : " + score, 10, cvs.height - 20);

  rafId = requestAnimationFrame(draw);
}

// idle / over / stopped screen
function drawIdle() {
  ctx.drawImage(bg, 0, 0);
  ctx.drawImage(fg, 0, cvs.height - fg.height);
  ctx.drawImage(bird, bX, bY);

  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillRect(0, 0, cvs.width, cvs.height);

  ctx.fillStyle = "#DFFF00";
  ctx.font = "bold 22px Verdana";
  ctx.textAlign = "center";
  if (state === "over") {
    ctx.fillText("GAME OVER", cvs.width / 2, cvs.height / 2 - 20);
    ctx.fillStyle = "#fff";
    ctx.font = "16px Verdana";
    ctx.fillText("Score: " + score, cvs.width / 2, cvs.height / 2 + 10);
    ctx.font = "12px Verdana";
    ctx.fillText("Click START to play again", cvs.width / 2, cvs.height / 2 + 40);
  } else if (state === "stopped") {
    ctx.fillText("PAUSED", cvs.width / 2, cvs.height / 2 - 10);
    ctx.fillStyle = "#fff";
    ctx.font = "12px Verdana";
    ctx.fillText("Click START to resume", cvs.width / 2, cvs.height / 2 + 20);
  } else {
    ctx.fillText("FLAPPY BIRD", cvs.width / 2, cvs.height / 2 - 20);
    ctx.fillStyle = "#fff";
    ctx.font = "12px Verdana";
    ctx.fillText("Click or press Space to flap", cvs.width / 2, cvs.height / 2 + 10);
    ctx.fillText("Click START to begin", cvs.width / 2, cvs.height / 2 + 35);
  }
  ctx.textAlign = "left";
}

function drawGameOver() {
  drawIdle();
}

// buttons
var startBtn = document.getElementById("startBtn");
var stopBtn = document.getElementById("stopBtn");

startBtn.addEventListener("click", function () {
  if (state === "over" || state === "idle") {
    resetGame();
    state = "running";
    startBtn.textContent = "RESTART";
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(draw);
  } else if (state === "stopped") {
    // resume
    state = "running";
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(draw);
  } else if (state === "running") {
    // restart
    resetGame();
    state = "running";
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(draw);
  }
});

stopBtn.addEventListener("click", function () {
  if (state === "running") {
    state = "stopped";
    if (rafId) cancelAnimationFrame(rafId);
    drawIdle();
  }
});

// initial idle screen (wait for images to load)
var loaded = 0;
[bird, bg, fg, pipeNorth, pipeSouth].forEach(function (img) {
  img.onload = function () {
    loaded++;
    if (loaded === 5) drawIdle();
  };
});

// safety: draw idle after 1s even if images are cached
setTimeout(function () {
  if (state === "idle") drawIdle();
}, 1000);
