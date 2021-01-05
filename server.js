const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const gameBoard = require('./modules/board');
const medicine = require('./modules/medicine');
const mob = require('./modules/mob');
const move = require('./modules/move');

let clients = [];
let gameOver = false;

let spawnTime;
let medicineTime;
let moveTime;

io.on('connection', (socket) => {

	socket.on('join', () => {
		
		clients.push({id: socket.id, ready: false, x: 20, y: 20, hp: 300, dead: false, killCount: 0});

		socket.emit('socket-id', socket.id);
		
		socket.on('disconnect', () => {
			if (clients.length === 2) {
			clients = [];
			medicine.reset();
			mob.reset();
			clearInterval(spawnTime);
			clearInterval(medicineTime);
			clearInterval(moveTime);
			io.emit('user-left', gameOver);
			} else {
				clients.pop();
			}
		});
		
		if (clients.length === 2) {
			io.emit('two-connected');
		}

		if (clients.length > 2) {
			socket.emit('user-full');
		}

	});

	socket.on('ready', (id) => {
		const index = clients.findIndex(x => x.id === id);
		clients[index].ready = true;
		if (clients[0].ready && clients[1].ready) {
			io.emit('two-ready');
			setTimeout(() => {
				startGame();
			}, 3000);
		}
	});

	socket.on('up', (pos) => {
		const newPos = move.up(pos);
		if (newPos.success) {
			updatePosition(socket.id, newPos);
			socket.emit('up', newPos);
			socket.broadcast.emit('move', newPos);
		}
	});

	socket.on('right', (pos) => {
		const newPos = move.right(pos);
		if (newPos.success) {
			updatePosition(socket.id, newPos);
			socket.emit('right', newPos);
			socket.broadcast.emit('move', newPos);
		}
	});

	socket.on('down', (pos) => {
		const newPos = move.down(pos);
		if (newPos.success) {
			updatePosition(socket.id, newPos);
			socket.emit('down', newPos);
			socket.broadcast.emit('move', newPos);
		}
	});

	socket.on('left', (pos) => {
		const newPos = move.left(pos);
		if (newPos.success) {
			updatePosition(socket.id, newPos);
			socket.emit('left', newPos);
			socket.broadcast.emit('move', newPos);
		}
	});

	socket.on('attack', (pos) => {
		const attack = mob.attack(pos);
		if (attack.length > 0) {
			io.emit('hits', attack, socket.id);
		}
		socket.broadcast.emit('attack');
	});

	socket.on('counter-attack', (pos) => {
		const attack = mob.counterAttack(pos);
		if (attack.length > 0) {
			io.emit('counter-attack', attack, socket.id);
		}
	});

	socket.on('strike', (socket) => {
		const index = clients.findIndex(x => x.id === socket);
		clients[index].hp -= 10;
		if (clients[index].hp <= 0) {
			clients[index].dead = true;
		}
		if (clients[0].dead === true && clients[1].dead === true) {
			endGame();
		}
		io.emit('health', clients);
	});

	socket.on('med-pickup', (socket) => {
		const index = clients.findIndex(x => x.id === socket);
		clients[index].hp += 100;
		if (clients[index].hp > 300) {
			clients[index].hp = 300;
		}
		io.emit('health', clients);
	});

	socket.on('kill-count', (socket) => {
		const index = clients.findIndex(x => x.id === socket);
		clients[index].killCount++;
		io.emit('kill-count', clients);
	});

});

function startGame() {
	io.emit('initialize', gameBoard);
	gameOver = false;
	spawnTime = setInterval(function() {
		const newMob = mob.spawn();
		if (newMob !== undefined) { // Check if mob failed to spawn
			io.emit('mob-spawn', newMob);
		}
	}, 1000);
	medicineTime = setInterval(function() {
		const newMed = medicine.spawn();
		if (newMed !== undefined) { // Check if medicine failed to spawn
			io.emit('med-spawn', newMed);
		}
	}, 9000);
	moveTime = setInterval(function() {
		const move = mob.move(clients);
		io.emit('mob-move', move);
	}, 500);
}

function updatePosition(id, pos) {
	const index = clients.findIndex(x => x.id === id);
	clients[index].x = pos.x;
	clients[index].y = pos.y;
	const medCheck = medicine.check(pos);
	if (medCheck.length > 0) {
		io.emit('med-pickup', medCheck, id);
	}
}

function endGame() {
	gameOver = true;
	clearInterval(spawnTime);
	clearInterval(medicineTime);
	clearInterval(moveTime);
	const total = clients[0].killCount + clients[1].killCount;
	io.emit('game-over', total);
}

app.use(express.static('public'));

http.listen(8000);