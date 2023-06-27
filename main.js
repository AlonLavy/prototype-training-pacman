import { Pacman } from "./pacman.js";
import { Food } from "./food.js";
import { Ghost } from "./ghost.js";
import { Obstacle } from "./obstacle.js";
import { Board } from "./board.js";
import * as CONSTANTS from "./CONSTANTS.js";

const context = canvas.getContext("2d");
var gameStarted = false;
var gameInterval;
const keysDown = {};
keysDown["ArrowUp"] = false;
keysDown["ArrowDown"] = false;
keysDown["ArrowLeft"] = false;
keysDown["ArrowRight"] = false;
var startTime = 0;
var gameOver;
var board = new Board([], [], [], []);
const labelTime = document.getElementById("lblTime");
const labelGhosts = document.getElementById("labelGhosts");
const labelFoods = document.getElementById("labelFoods");
const changes = document.getElementById("changeGame");
const labelScore = document.getElementById("lblScore");
const labelLives = document.getElementById("labelLives");
var numOfFoods = labelFoods.value;
var numOfGhosts = labelGhosts.value;
var lives = CONSTANTS.startLives;
var score = 0;
const ghostNotMove = [];


function findRandomEmptyCell(board) {
    let i = Math.floor((Math.random() * (CONSTANTS.boardItems.boardLength - 1)) + 1);
    let j = Math.floor((Math.random() * (CONSTANTS.boardItems.boardLength - 1)) + 1);
    while (!(board.getObjectInLocation([i, j]) == CONSTANTS.boardItems.empty)) {
        i = Math.floor((Math.random() * (CONSTANTS.boardItems.boardLength - 1)) + 1);
        j = Math.floor((Math.random() * (CONSTANTS.boardItems.boardLength - 1)) + 1);
    }
    return [i, j];
}

function initializeBoard(numOfGhosts, numOfFoods) {
    for (let i = 0; i < numOfGhosts; i++) {
        ghostNotMove.push(false);
    }
    board = new Board([], [], [], []);
    const allObstacles = [];
    for (let coordinate of CONSTANTS.obstacles) {
        allObstacles.push(new Obstacle(coordinate, CONSTANTS.colorPalette.obstacleColor));
    }

    const allGhosts = [];
    for (let i = 0; i < numOfGhosts && i < 4; i++) {
        allGhosts.push(new Ghost(CONSTANTS.corners[i], CONSTANTS.colorPalette.ghostColor));
    }

    board.ghosts = allGhosts
    board.obstacles = allObstacles;
    board.placeItems();
    board.pacmans = [new Pacman(findRandomEmptyCell(board), score, keysDown)];
    board.placeItems();

    const allFoods = [];
    for (let i = 0; i < numOfFoods; i++) {
        let currentFood = new Food(findRandomEmptyCell(board), CONSTANTS.colorPalette.foodColor)
        allFoods.push(currentFood);
        board.foods = allFoods;
        board.board[currentFood.location[0]][currentFood.location[1]] = currentFood;
    }
    board.foods = allFoods;
    board.placeItems();
}

function timer() {
    if (!gameStarted) {
        return 0;
    }
    const currentTime = new Date();
    return (currentTime - startTime) / 1000;
}

function initializeGame() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    labelLives.value = lives;
    changes.onchange = () => {
        context.clearRect(0, 0, canvas.width, canvas.height);
        numOfFoods = labelFoods.value;
        numOfGhosts = labelGhosts.value;
        if (!(numOfFoods >= 0 && numOfFoods <= 70)) {
            alert("This number has to be an int between 0 and 70");
            numOfFoods = 30;
            labelFoods.value = 30;
        }
        else if (!(numOfGhosts > 0 && numOfGhosts <= 4)) {
            alert("This number has to be an int between 1 and 4");
            numOfGhosts = 3;
            labelGhosts.value = 3;
        }
        else {
            initializeBoard(numOfGhosts, numOfFoods);
        }
    }

    const restartButton = document.getElementById("restart");
    restartButton.onclick = () => {
        gameStarted = false;
        startTime = 0;
        score = 0;
        labelScore.value = score;
        lives = CONSTANTS.startLives;
        gameOver = false;
        window.clearInterval(gameInterval);
        keysDown["ArrowUp"] = false;
        keysDown["ArrowDown"] = false;
        keysDown["ArrowLeft"] = false;
        keysDown["ArrowRight"] = false;
        initializeGame();
    }

    initializeBoard(numOfGhosts, numOfFoods);
    addEventListener("keydown", function (e) {
        for (let key in keysDown) {
            keysDown[key] = false;
        }
        if (gameStarted && startTime == 0) {
            startTime = new Date();
        }
        keysDown[e.code] = true;
    });
    board.draw();
    gameInterval = setInterval(() => playGame(board), 250);
}

function playGame(board) {
    const currentTime = timer();
    labelTime.value = currentTime;
    for (let i = 0; i < board.pacmans.length; i++) {
        gameStarted = board.pacmans[i].makeNextMove(board, gameStarted);
        if (gameStarted && startTime == 0){
            startTime = new Date();
        }
    }
    for (let i = 0; i < board.ghosts.length && gameStarted; i++) {
        if (currentTime % 10 > CONSTANTS.slowMotionTime){
            board.ghosts[i].makeNextMove(board, board.pacmans[0]);
        }
        else if (!ghostNotMove[i]) {
            board.ghosts[i].makeNextMove(board, board.pacmans[0]);
        }
        ghostNotMove[i] = !ghostNotMove[i];
    }
    board.draw();
    const killed = board.isKilled();
    if (killed) {
        gameStarted = false;
        startTime = 0;  
        lives = lives - 1;
        score = board.pacmans[0].score - 10;
        labelScore.value = score;
        labelLives.value = lives;
        if (lives == 0) {
            gameOver = true;
        }
        context.clearRect(0, 0, canvas.width, canvas.height);
        window.clearInterval(gameInterval);
        for (let key in keysDown) {
            keysDown[key] = false;
        }
        initializeGame();
    }

    if (!gameOver) {
        board.draw();
    }
    else {
        context.beginPath();
        context.rect(0, 0, canvas.width, canvas.height)
        context.fillStyle = CONSTANTS.colorPalette.backgroundGameOver;
        context.fill();
        context.font = "55px Comic Sans MS";
        context.fillStyle = CONSTANTS.colorPalette.textGameOver;
        context.textAlign = "center";
        context.fillText("Game Over! You Lost!", canvas.width / 2, canvas.height / 2);
        window.clearInterval(gameInterval);
    }

    if (board.pacmans[0].score == numOfFoods) {
        context.beginPath();
        context.rect(0, 0, canvas.width, canvas.height)
        context.fillStyle = CONSTANTS.colorPalette.backgroundGameWon;
        context.fill();
        context.font = "55px Comic Sans MS";
        context.fillStyle = CONSTANTS.colorPalette.textGameWon;
        context.textAlign = "center";
        context.fillText("Congrats! You won!", canvas.width / 2, canvas.height / 2);
        window.clearInterval(gameInterval);
    }
}


initializeGame();