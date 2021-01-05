const info = document.querySelector('.info');
const intro = document.querySelector('.intro');
const introText = document.querySelectorAll('.intro-text');
const howToPlay = document.querySelector('.htp');
const chevronDown = document.querySelectorAll('.fa-chevron-circle-down');
const chevronUp = document.querySelector('.fa-chevron-circle-up');
const loadingButton = document.querySelector('.loading-wrapper');
const readyButton = document.querySelector('#ready');
const board = document.querySelector('.board');
const playerOne = document.querySelector('.player-one');
const playerOneDove = document.querySelector('.player-one-dove');
const playerOneAttack = document.querySelector('#player-one-attack');
const playerOneHealth = document.querySelector('#player-one-health');
const playerOneCount = document.querySelector('#player-one-count');
const playerTwo = document.querySelector('.player-two');
const playerTwoDove = document.querySelector('.player-two-dove');
const playerTwoAttack = document.querySelector('#player-two-attack');
const playerTwoHealth = document.querySelector('#player-two-health');
const playerTwoCount = document.querySelector('#player-two-count');
const overlayWrapper = document.querySelector('.overlay');
const totalText = document.querySelector('#total');

let socketIO = io();
let attacking = false;
let dead = false;
let deadFriend = false;
let gameStart = false;
let mobs = [];
let medicines = [];
let id = '';

socketIO.emit('join');

socketIO.on('socket-id', (socket) => {
	id = socket;
});

socketIO.on('two-connected', () => {
	introText[0].innerHTML = '(2/2 connected)';
	introText[0].classList.add('ready');
	introText[1].innerHTML = 'Waiting for both players to be ready...';
	loadingButton.classList.add('hide');
	readyButton.classList.remove('hide');
});

readyButton.addEventListener('click', () => {
	if (!readyButton.classList.contains('ready')) {
		readyButton.classList.add('ready');
		socketIO.emit('ready', id);
	}
});

socketIO.on('two-ready', () => {
	introText[2].classList.remove('hide');
	let count = 3;
	let time = setInterval(() => {
		count--;
		introText[2].innerHTML = `Game starting in ${count}...`
		if (count === 0) {
			clearInterval(time);
		}
	}, 1000);
});

socketIO.on('initialize', (gameBoard) => {
	intro.classList.add('hide');
	board.classList.remove('hide');
	info.classList.remove('hide');

	gameStart = true;

	for (let i = 0; i < gameBoard.length; i++) {
		for (let j = 0; j < gameBoard[i].length; j++) {
			if (gameBoard[i][j] === 1) {
				let node = document.createElement('div');
				node.setAttribute('class', 'block');
				node.style.top = (i * 20) + 'px';
				node.style.left = (j * 20) + 'px';
				board.append(node);
			}
		}
	}
});

socketIO.on('up', (pos) => {
	updatePlayerOne(pos);
});

socketIO.on('right', (pos) => {
	updatePlayerOne(pos);
});

socketIO.on('down', (pos) => {
	updatePlayerOne(pos);
});

socketIO.on('left', (pos) => {
	updatePlayerOne(pos);
});

socketIO.on('move', (pos) => {
	updatePlayerTwo(pos);
});

socketIO.on('attack', () => {
	playerTwoAttackAnimation();
});

socketIO.on('user-left', (gameOver) => {
	if (gameOver) {
		location.reload();
	} else {
		location.assign('./quit.html');
	}
});

socketIO.on('user-full', () => {
	location.assign('./error.html');
});

window.addEventListener('keyup', (e) => {
	if (!attacking && !dead && gameStart) {
		if (e.key === 'ArrowUp') {
			socketIO.emit('up', getPosition());
		} else if (e.key === 'ArrowRight') {
			socketIO.emit('right', getPosition());
		} else if (e.key === 'ArrowDown') {
			socketIO.emit('down', getPosition());
		} else if (e.key === 'ArrowLeft') {
			socketIO.emit('left', getPosition());
		} else if (e.key === ' ') {
			playerOneAttackAnimation();
		}
	}
});

function getPosition() {
	const boardElem = board.getBoundingClientRect();
	const playerElem = playerOne.getBoundingClientRect();
	const offsetX = Math.round(playerElem.left - boardElem.left);
	const offsetY = Math.round(playerElem.top - boardElem.top);
	return { x: offsetX, y: offsetY };
}

function updatePlayerOne(pos) {
	playerOne.style.left = pos.x + 'px';
	playerOne.style.top = pos.y + 'px';
	playerOneDove.style.left = pos.x + 'px';
	playerOneDove.style.top = pos.y + 'px';
	playerOneAttack.style.left = (pos.x - 10) + 'px';
	playerOneAttack.style.top = (pos.y - 10) + 'px';
	playerOneDove.style.transform = `rotateY(${pos.rot}deg)`;
}

function updatePlayerTwo(pos) {
	playerTwo.style.left = pos.x + 'px';
	playerTwo.style.top = pos.y + 'px';
	playerTwoDove.style.left = pos.x + 'px';
	playerTwoDove.style.top = pos.y + 'px';
	playerTwoAttack.style.left = (pos.x - 10) + 'px';
	playerTwoAttack.style.top = (pos.y - 10) + 'px';
	playerTwoDove.style.transform = `rotateY(${pos.rot}deg)`;
}

function playerOneAttackAnimation() {
	socketIO.emit('attack', getPosition());
	playerOneAttack.style.display = 'block';
	attacking = true;
	const time = setTimeout(function () {
		playerOneAttack.style.display = 'none';
		attacking = false;
	}, 400);
}

function playerTwoAttackAnimation() {
	playerTwoAttack.style.display = 'block';
	const time = setTimeout(function () {
		playerTwoAttack.style.display = 'none';
	}, 400);
}

socketIO.on('mob-spawn', (mob) => {
	let node = document.createElement('div');
	node.setAttribute('class', 'ghost');
	node.setAttribute('data-id', mob.id);
	node.style.left = mob.x + 'px';
	node.style.top = mob.y + 'px';
	let ghostNode = document.createElement('div');
	ghostNode.setAttribute('class', 'ghost-icon');
	ghostNode.setAttribute('data-id', mob.id);
	ghostNode.innerHTML = '<i class="fas fa-ghost"></i>';
	ghostNode.style.left = mob.x + 'px';
	ghostNode.style.top = mob.y + 'px';
	let spawnNode = document.createElement('div');
	spawnNode.setAttribute('class', 'ghost-spawn');
	spawnNode.style.left = (mob.x - 10) + 'px';
	spawnNode.style.top = (mob.y - 10) + 'px';
	board.append(node, ghostNode, spawnNode);
	const time = setTimeout(function () {
		board.removeChild(spawnNode);
	}, 400);
});

socketIO.on('mob-move', (mobs) => {
	for (mob of mobs) {
		const mobElem = document.querySelectorAll(`[data-id="${mob.id}"]`);
		mobElem[0].style.left = mobElem[1].style.left = mob.x + 'px';
		mobElem[0].style.top = mobElem[1].style.top = mob.y + 'px';
	}
	socketIO.emit('counter-attack', getPosition());
});

socketIO.on('hits', (hits, socket) => {
	for (hit of hits) {
		if (hit.status === 'hit') {
			const mobElem = document.querySelectorAll(`[data-id="${hit.id}"]`);
			mobElem[1].classList.remove('hit');
			void mobElem[1].offsetHeight;
			mobElem[1].classList.add('hit');
		} else if (hit.status === 'dead') {
			if (socket === id) {
				socketIO.emit('kill-count', socket);
			}
			const mobElem = document.querySelectorAll(`[data-id="${hit.id}"]`);
			board.removeChild(mobElem[0]);
			board.removeChild(mobElem[1]);
			let deadNode = document.createElement('div');
			deadNode.setAttribute('class', 'ghost-dead');
			deadNode.style.left = (hit.x - 10) + 'px';
			deadNode.style.top = (hit.y - 10) + 'px';
			board.append(deadNode);
			const time = setTimeout(function () {
				board.removeChild(deadNode);
			}, 400);
		}
	}
});

socketIO.on('counter-attack', (attacks, socket) => {
	let player;
	if (socket === id) {
		player = playerOneDove;
		if (dead === true) {
			return;
		}
	} else {
		player = playerTwoDove;
		if (deadFriend === true) {
			return;
		}
	}
	for (attack of attacks) {
		let attackNode = document.createElement('div');
		if (attack.status === 'hit') {
			attackNode.setAttribute('class', 'ghost-attack');
			player.classList.remove('hit');
			player.classList.remove('block-hit');
			void player.offsetHeight;
			player.classList.add('hit');
			if (socket === id) {
				socketIO.emit('strike', socket);
			}
		} else {
			attackNode.setAttribute('class', 'ghost-miss');
			player.classList.remove('hit');
			player.classList.remove('block-hit');
			void player.offsetHeight;
			player.classList.add('block-hit');
		}
		attackNode.style.left = (attack.x - 10) + 'px';
		attackNode.style.top = (attack.y - 10) + 'px';
		board.append(attackNode);
		const time = setTimeout(function () {
			board.removeChild(attackNode);
		}, 400);
	}
});

socketIO.on('health', (clients) => {
	for (client of clients) {
		if (client.id === id) {
			if (client.dead === false) {
				const health = client.hp / 300;
				const percent = health * 100;
				playerOneHealth.style.width = `${percent}%`
			} else if (client.dead === true) {
				dead = true;
				playerOneHealth.style.width = '0%';
				playerOneDove.innerHTML = '<i class="fas fa-skull-crossbones"></i>';
				playerOneDove.classList.add('dead');
				playerOneDove.classList.remove('hit');
				playerOneDove.classList.remove('block-hit');
			}
		} else {
			if (client.dead === false) {
				const health = client.hp / 300;
				const percent = health * 100;
				playerTwoHealth.style.width = `${percent}%`
			} else if (client.dead === true) {
				deadFriend = true;
				playerTwoHealth.style.width = '0%';
				playerTwoDove.innerHTML = '<i class="fas fa-skull-crossbones"></i>';
				playerTwoDove.classList.add('dead');
				playerTwoDove.classList.remove('hit');
				playerTwoDove.classList.remove('block-hit');
			}
		}
	}
});

socketIO.on('kill-count', (clients) => {
	for (client of clients) {
		if (client.id === id) {
			playerOneCount.innerHTML = client.killCount;
		} else {
			playerTwoCount.innerHTML = client.killCount;
		}
	}
});

socketIO.on('med-spawn', (med) => {
	let node = document.createElement('div');
	node.setAttribute('class', 'medicine');
	node.setAttribute('data-medicine-id', med.id);
	node.innerHTML = '<i class="fas fa-first-aid"></i>';
	node.style.left = med.x + 'px';
	node.style.top = med.y + 'px';
	let spawnNode = document.createElement('div');
	spawnNode.setAttribute('class', 'medicine-spawn');
	spawnNode.style.left = (med.x - 10) + 'px';
	spawnNode.style.top = (med.y - 10) + 'px';
	board.append(node, spawnNode);
	const time = setTimeout(function () {
		board.removeChild(spawnNode);
	}, 400);
});

socketIO.on('med-pickup', (medicines, socket) => {
	for (medicine of medicines) {
		if (socket === id) {
			socketIO.emit('med-pickup', socket);
		}
		const medElem = document.querySelector(`[data-medicine-id="${medicine.id}"]`);
		board.removeChild(medElem);
	}
});

socketIO.on('game-over', (total) => {
	totalText.innerHTML = `Total score: ${total}`;
	overlayWrapper.classList.remove('hide');
});

chevronDown.forEach(e => e.addEventListener('click', () => {
	howToPlay.scrollTop += 230;
}));

chevronUp.addEventListener('click', () => {
	howToPlay.scrollTop = 0;
});