var context = canvas.getContext("2d");
var shape = new Object();
var board;
var score;
var pac_color;
var startTime = 0;
var timeElapsed;
var interval;
var intervalRotate;
var gameOver = false;
var perviousGhosts = [];

const boardFeatures = {
	boardLength: 10,
	pacmans: 1,
	empty: 0,
	pacman: 2,
	food: 1,
	obstacle: 4,
	ghost: 3
};

var foodStart;
var timeLimit;
var ghostCount;

const pacmanRotation = {
	right: 0,
	left: Math.PI,
	down: Math.PI / 2,
	up: -Math.PI / 2
};

const moveDirection = {
	up: 1,
	down: 2,
	left: 3,
	right: 4
};

const obstacles = [[3, 3], [3, 4], [3, 5], [6, 1], [6, 2]];

const corners = [[0, 0], [0, boardFeatures.boardLength - 1], [boardFeatures.boardLength - 1, 0], [boardFeatures.boardLength - 1, boardFeatures.boardLength - 1]]


Start();

function userInput() {
	foodStart = prompt("Enter amount of food wanted: ");
	timeLimit = prompt("Enter time limit for the game: ");
	ghostCount = prompt("Enter the amount of ghosts to add to the game: Maximum 4: ");
}

function Start() {
	userInput();
	board = new Array();
	score = 0;
	pac_color = "rgb(255,255,0)";
	for (let i = 0; i < boardFeatures.boardLength; i++) {
		board[i] = new Array();
		for (let j = 0; j < boardFeatures.boardLength; j++) {
			board[i][j] = boardFeatures.empty;
			for (let k = 0; k < obstacles.length; k++) {
				if (obstacles[k][0] == i && obstacles[k][1] == j) {
					board[i][j] = boardFeatures.obstacle;
				}
			}
			for (let k = 0; k < corners.length; k++) {
				if (corners[k][0] == i && corners[k][1] == j && ghostCount > 0) {
					board[i][j] = boardFeatures.ghost;
					perviousGhosts.push([[i, j], 0])
					ghostCount--;
				}
			}
		}
	}
	for (let i = 0; i < boardFeatures.pacmans; i++) {
		let emptyCell = findRandomEmptyCell(board);
		shape.i = emptyCell[0];
		shape.j = emptyCell[1];
		board[shape.i][shape.j] = boardFeatures.pacman;
	}
	for (let i = 0; i < foodStart; i++) {
		let emptyCell = findRandomEmptyCell(board);
		board[emptyCell[0]][emptyCell[1]] = boardFeatures.food;
	}
	keysDown = {};
	addEventListener("keydown", function (e) {
		for (let key in keysDown) {
			keysDown[key] = false;
		}
		keysDown[e.code] = true;
	}, false);
	if (!gameOver) {
		intervalRotate = setInterval(rotatePacman, 10)
		interval = setInterval(UpdatePosition, 250);
	}
}



function findRandomEmptyCell(board) {
	let i = Math.floor((Math.random() * (boardFeatures.boardLength - 1)) + 1);
	let j = Math.floor((Math.random() * (boardFeatures.boardLength - 1)) + 1);
	while (board[i][j] != boardFeatures.empty) {
		i = Math.floor((Math.random() * (boardFeatures.boardLength - 1)) + 1);
		j = Math.floor((Math.random() * (boardFeatures.boardLength - 1)) + 1);
	}
	return [i, j];
}


function GetKeyPressed() {
	if (keysDown['ArrowUp']) {
		if (startTime == 0) {
			startTime = new Date();
		}
		return moveDirection.up;
	}
	if (keysDown['ArrowDown']) {
		if (startTime == 0) {
			startTime = new Date();
		}
		return moveDirection.down;
	}
	if (keysDown['ArrowLeft']) {
		if (startTime == 0) {
			startTime = new Date();
		}
		return moveDirection.left;
	}
	if (keysDown['ArrowRight']) {
		if (startTime == 0) {
			startTime = new Date();
		}
		return moveDirection.right;
	}
}

function drawPacman(context, center, rotation) {
	context.beginPath();
	context.arc(center.x, center.y, 30, (0.15 * Math.PI) + rotation, (1.85 * Math.PI) + rotation); // half circle
	context.lineTo(center.x, center.y);
	context.fillStyle = pac_color; //color
	context.fill();
	context.beginPath();
	switch (rotation) {
		case pacmanRotation.right:
			context.arc(center.x + 5, center.y - 15, 5, 0, 2 * Math.PI);
			break;
		case pacmanRotation.left:
			context.arc(center.x - 5, center.y - 15, 5, 0, 2 * Math.PI);
			break;
		case pacmanRotation.up:
			context.arc(center.x + 15, center.y - 5, 5, 0, 2 * Math.PI);
			break;
		case pacmanRotation.down:
			context.arc(center.x + 15, center.y + 5, 5, 0, 2 * Math.PI);
			break;
	}
	context.fillStyle = "rgb(0,0,0)"; //color
	context.fill();
}

function Draw(rotation) {
	context.clearRect(0, 0, canvas.width, canvas.height); //clean board
	lblScore.value = score;
	lblTime.value = timeElapsed;
	for (let i = 0; i < boardFeatures.boardLength; i++) {
		for (let j = 0; j < boardFeatures.boardLength; j++) {
			var center = new Object();
			center.x = i * 60 + 30;
			center.y = j * 60 + 30;
			if (board[i][j] === boardFeatures.pacman) {
				drawPacman(context, center, rotation);
			}
			else if (board[i][j] == boardFeatures.ghost) {
				context.beginPath();
				context.arc(center.x, center.y, 15, 0, 2 * Math.PI); // circle
				context.fillStyle = "rgb(0,0,255)"; //color
				context.fill();
			}
			else if (board[i][j] === boardFeatures.food) {
				context.beginPath();
				context.arc(center.x, center.y, 15, 0, 2 * Math.PI); // circle
				context.fillStyle = "rgb(0,0,0)"; //color
				context.fill();
			} else if (board[i][j] === boardFeatures.obstacle) {
				context.beginPath();
				context.rect(center.x - 30, center.y - 30, 60, 60);
				context.fillStyle = "rgb(128,128,128)"; //color
				context.fill();
			}
		}
	}
}

function UpdatePosition() {
	board[shape.i][shape.j] = 0;
	let pressedKey = GetKeyPressed();
	switch (pressedKey) {
		case moveDirection.up:
			if (shape.j > 0 && board[shape.i][shape.j - 1] !== boardFeatures.obstacle) {
				shape.j--;
			}
			break;
		case moveDirection.down:
			if (shape.j < boardFeatures.boardLength - 1 && board[shape.i][shape.j + 1] !== boardFeatures.obstacle) {
				shape.j++;
			}
			break;
		case moveDirection.left:
			if (shape.i > 0 && board[shape.i - 1][shape.j] !== boardFeatures.obstacle) {
				shape.i--;
			}
			break;
		case moveDirection.right:
			if (shape.i < boardFeatures.boardLength - 1 && board[shape.i + 1][shape.j] !== boardFeatures.obstacle) {
				shape.i++;
			}
			break;
	}
	if (board[shape.i][shape.j] === boardFeatures.food) {
		score++;
	}
	board[shape.i][shape.j] = boardFeatures.pacman;
	perviousGhosts = moveGhosts(board, perviousGhosts);
	timer();
	if (score >= foodStart / 2 && timeElapsed <= 5) {
		pac_color = "rgb(0,255,0)";
	}
	if (score == foodStart) {
		gameOver = true;
		window.clearInterval(interval);
		window.alert("Game completed");
	} else {
		rotatePacman();
	}
}

function rotatePacman(pressedKey) {
	timer();
	pressedKey = pressedKey || GetKeyPressed();
	switch (pressedKey) {
		case moveDirection.up:
			Draw(pacmanRotation.up);
			break;
		case moveDirection.down:
			Draw(pacmanRotation.down);
			break;
		case moveDirection.left:
			Draw(pacmanRotation.left);
			break;
		case moveDirection.right:
			Draw(pacmanRotation.right);
			break;
		default:
			Draw(pacmanRotation.right);
	}
}

function timer() {
	if (!gameOver) {
		var currentTime = new Date();
	}
	if (startTime != 0) {
		timeElapsed = (currentTime - startTime) / 1000;
	}
	else {
		timeElapsed = 0;
	}
	if (timeElapsed > timeLimit) {
		gameOver = true;
		window.clearInterval(interval);
		window.alert("Game over due to time limit.");
	}
}

function findAllGhosts(board) {
	let ghostsArray = [];
	for (let i = 0; i < boardFeatures.boardLength; i++) {
		for (let j = 0; j < boardFeatures.boardLength; j++) {
			if (board[i][j] == boardFeatures.ghost) {
				ghostsArray.push([i, j]);
			}
		}
	}
	return ghostsArray;
}

function findPacman(board) {
	for (let i = 0; i < boardFeatures.boardLength; i++) {
		for (let j = 0; j < boardFeatures.boardLength; j++) {
			if (board[i][j] == boardFeatures.pacman) {
				return [i, j];
			}
		}
	}
}

const euclideanDistance = (a, b) => Math.hypot(...Object.keys(a).map(k => b[k] - a[k]));

function directionToPacman(ghost, pacman, board) {
    let validDirections = [];

    if (ghost[0] > 0 && board[ghost[0] - 1][ghost[1]] !== boardFeatures.obstacle) {
        validDirections.push([-1, 0]); // Left
    }
    if (ghost[0] < boardFeatures.boardLength - 1 && board[ghost[0] + 1][ghost[1]] !== boardFeatures.obstacle) {
        validDirections.push([1, 0]); // Right
    }
    if (ghost[1] > 0 && board[ghost[0]][ghost[1] - 1] !== boardFeatures.obstacle) {
        validDirections.push([0, -1]); // Up
    }
    if (ghost[1] < boardFeatures.boardLength - 1 && board[ghost[0]][ghost[1] + 1] !== boardFeatures.obstacle) {
        validDirections.push([0, 1]); // Down
    }

    if (validDirections.length === 0) {
        // Ghost is surrounded by obstacles, cannot move
        return [0, 0];
    }

    // Calculate distances for valid directions
    let distances = validDirections.map(direction => euclideanDistance([ghost[0] + direction[0], ghost[1] + direction[1]], pacman));

    // Find the shortest distance and corresponding direction
    let shortestDistance = Math.min(...distances);
    let shortestDirection = validDirections[distances.indexOf(shortestDistance)];

    return shortestDirection;
}


function moveGhosts(board, prevGhosts) {
    if (startTime === 0) {
        return prevGhosts;
    }

    const nextGhostsReplace = [];
    const currentGhosts = findAllGhosts(board);
    const nextGhosts = [];
    const pacman = findPacman(board);

    for (let ghost of currentGhosts) {
        direction = directionToPacman(ghost, pacman, board);
        nextGhostsReplace.push([[ghost[0] + direction[0], ghost[1] + direction[1]], board[ghost[0] + direction[0]][ghost[1] + direction[1]]]);
        nextGhosts.push([ghost[0] + direction[0], ghost[1] + direction[1]]);
        board[ghost[0] + direction[0]][ghost[1] + direction[1]] = boardFeatures.ghost;
    }

    for (let prevGhost of prevGhosts) {
        board[prevGhost[0][0]][prevGhost[0][1]] = prevGhost[1];
    }

    return nextGhostsReplace;
}
