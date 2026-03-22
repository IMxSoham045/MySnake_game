const board = document.querySelector(".board");
const modal = document.querySelector(".modal");

const startButton = document.querySelector(".btn-start");
const restartButton = document.querySelector(".btn-restart");
const resetHighScoreBtn = document.querySelector(".btn-reset-highscore");

const startGameModal = document.querySelector(".start-game");
const gameOverModal = document.querySelector(".game-over");

const highScoreElement = document.querySelector("#high-score");
const scoreElement = document.querySelector("#score");
const timeElement = document.querySelector("#time");

const blockHeight = 50;
const blockWidth = 50;

let highScore = localStorage.getItem("highScore") || 0;
let score = 0;
let time = `00-00`;

highScoreElement.innerText = highScore;

let intervalId = null;
let timerIntervalId = null;

const blocks = [];
let snake = [
  {
    x: 1,
    y: 3,
  },
];

let direction = "down";

const cols = Math.floor(board.clientWidth / blockWidth);
const rows = Math.floor(board.clientHeight / blockHeight);

let food = {
  x: Math.floor(Math.random() * rows),
  y: Math.floor(Math.random() * cols),
};

for (let row = 0; row < rows; row++) {
  for (let col = 0; col < cols; col++) {
    const block = document.createElement("div");
    block.classList.add("block");
    board.appendChild(block);

    blocks[`${row}-${col}`] = block;
  }
}

function render() {
  let head = null;

  blocks[`${food.x}-${food.y}`].classList.add("food");

  if (direction === "left") {
    head = { x: snake[0].x, y: snake[0].y - 1 };
  } else if (direction === "right") {
    head = { x: snake[0].x, y: snake[0].y + 1 };
  } else if (direction === "down") {
    head = { x: snake[0].x + 1, y: snake[0].y };
  } else if (direction === "up") {
    head = { x: snake[0].x - 1, y: snake[0].y };
  }

  // wall colision
  if (head.x < 0 || head.y < 0 || head.x >= rows || head.y >= cols) {
    clearInterval(intervalId);
    modal.style.display = "flex";
    startGameModal.style.display = "none";
    gameOverModal.style.display = "flex";
    return;
  }

  // food Consumption
  if (head.x === food.x && head.y === food.y) {
    blocks[`${food.x}-${food.y}`].classList.remove("food");
    food = {
      x: Math.floor(Math.random() * rows),
      y: Math.floor(Math.random() * cols),
    };
    blocks[`${food.x}-${food.y}`].classList.add("food");

    score += 10;
    scoreElement.innerText = score;

    if (score > highScore) {
      highScore = score;
      localStorage.setItem("highScore", highScore.toString());
    }
    snake.unshift(head);
    return;
  }

  // self colision
  if (snake.some((segment) => segment.x === head.x && segment.y === head.y)) {
    clearInterval(intervalId);
    clearInterval(timerIntervalId);

    modal.style.display = "flex";
    startGameModal.style.display = "none";
    gameOverModal.style.display = "flex";
    return;
  }

  snake.forEach((segment) => {
    blocks[`${segment.x}-${segment.y}`].classList.remove("fill");
  });

  snake.unshift(head);
  snake.pop();

  snake.forEach((segment) => {
    blocks[`${segment.x}-${segment.y}`].classList.add("fill");
  });
}

// intervalId = setInterval(() => {
//   render();
// }, 300);

startButton.addEventListener("click", () => {
  modal.style.display = "none";
  intervalId = setInterval(() => {
    render();
  }, 250);

  timerIntervalId = setInterval(() => {
    let [min, sec] = time.split("-").map(Number);

    if (sec == 59) {
      min += 1;
      sec = 0;
    } else {
      sec += 1;
    }

    time = `${String(min).padStart(2, "0")}-${String(sec).padStart(2, "0")}`;

    timeElement.innerText = time;
  }, 1000);
});

restartButton.addEventListener("click", restartGame);

function restartGame() {
  clearInterval(intervalId);
  clearInterval(timerIntervalId);

  blocks[`${food.x}-${food.y}`].classList.remove("food");

  snake.forEach((segment) => {
    blocks[`${segment.x}-${segment.y}`].classList.remove("fill");
  });

  score = 0;
  time = `00-00`;

  scoreElement.innerText = score;
  highScoreElement.innerText = highScore;
  timeElement.innerText = time;

  modal.style.display = "none";
  direction = "down";
  snake = [{ x: 1, y: 3 }];

  food = {
    x: Math.floor(Math.random() * rows),
    y: Math.floor(Math.random() * cols),
  };

  intervalId = setInterval(() => {
    render();
  }, 300);

  // ✅ FIX: restart timer
  timerIntervalId = setInterval(() => {
    let [min, sec] = time.split("-").map(Number);

    if (sec == 59) {
      min += 1;
      sec = 0;
    } else {
      sec += 1;
    }

    time = `${String(min).padStart(2, "0")}-${String(sec).padStart(2, "0")}`;
    timeElement.innerText = time;
  }, 1000);
}

resetHighScoreBtn.addEventListener("click", () => {
  const confirmReset = confirm("Are you sure you want to reset high score?");

  if (confirmReset) {
    highScore = 0;
    localStorage.setItem("highScore", "0");
    highScoreElement.innerText = highScore;
  }
});

addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

  if ((event.key === "ArrowUp" || key === "w") && direction !== "down") {
    direction = "up";
  } else if ((event.key === "ArrowDown" || key === "s") && direction !== "up") {
    direction = "down";
  } else if (
    (event.key === "ArrowRight" || key === "d") &&
    direction !== "left"
  ) {
    direction = "right";
  } else if (
    (event.key === "ArrowLeft" || key === "a") &&
    direction !== "right"
  ) {
    direction = "left";
  }
});

// Mobile(Touch Screen Friendly)

let touchStartX = 0;
let touchStartY = 0;

addEventListener("touchstart", (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
});

addEventListener("touchend", (e) => {
  let touchEndX = e.changedTouches[0].clientX;
  let touchEndY = e.changedTouches[0].clientY;

  let dx = touchEndX - touchStartX;
  let dy = touchEndY - touchStartY;

  // detect swipe direction
  if (Math.abs(dx) > Math.abs(dy)) {
    // horizontal swipe
    if (dx > 0 && direction !== "left") {
      direction = "right";
    } else if (dx < 0 && direction !== "right") {
      direction = "left";
    }
  } else {
    // vertical swipe
    if (dy > 0 && direction !== "up") {
      direction = "down";
    } else if (dy < 0 && direction !== "down") {
      direction = "up";
    }
  }
});
