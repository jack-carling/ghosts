const gameBoard = require('./board');

let mobs = [];

module.exports.spawn = () => {
	const randomX = Math.floor(Math.random() * 38) + 1; // Random number 1-38
	const randomY = Math.floor(Math.random() * 23) + 1; // Random number 1-23
	if (gameBoard[randomY][randomX] === 0) {
		const x = randomX * 20;
		const y = randomY * 20;
		let id;
		if (mobs.length === 0) {
			id = 0;
		} else {
			const last = mobs[mobs.length - 1].id;
			id = last + 1;
		}
		if (mobs.length < 50) {
			const random = Math.floor(Math.random() * 2); // Random number 0-1
			mobs.push({ x: x, y: y, id: id, hp: 3, follow: random });
			return { x: x, y: y, id: id };
		}
	}
}

module.exports.move = (clients) => {
	for (mob of mobs) {
		let follow;
		if (clients[0].dead === true) {
			follow = 1;
		} else if (clients[1].dead === true) {
			follow = 0;
		} else {
			follow = mob.follow;
		}
		let direction = []; // up / right / down / left
		const minX = clients[follow].x - 20;
		const maxX = clients[follow].x + 20;
		const minY = clients[follow].y - 20;
		const maxY = clients[follow].y + 20;
		if (maxY < mob.y) {
			direction.push('up');
		} else if (maxY === mob.y) {
			if (minX > mob.x || maxX < mob.x) {
				direction.push('up');
			}
		}
		if (minX > mob.x) {
			direction.push('right');
		} else if (minX === mob.x) {
			if (minY > mob.y || maxY < mob.y) {
				direction.push('right');
			}
		}
		if (minY > mob.y) {
			direction.push('down');
		} else if (minY === mob.y) {
			if (minX > mob.x || maxX < mob.x) {
				direction.push('down');
			}
		}
		if (maxX < mob.x) {
			direction.push('left');
		} else if (maxX === mob.x) {
			if (minY > mob.y || maxY < mob.y) {
				direction.push('left');
			}
		}
		const randomDirection = direction[Math.floor(Math.random() * direction.length)];
		if (randomDirection === 'up') {
			const x = (mob.x / 20);
			const y = (mob.y / 20) - 1;
			if (gameBoard[y][x] === 0) {
				mob.y = mob.y - 20;
			}
		} else if (randomDirection === 'right') {
			const x = (mob.x / 20) + 1;
			const y = (mob.y / 20);
			if (gameBoard[y][x] === 0) {
				mob.x = mob.x + 20;
			}
		} else if (randomDirection === 'down') {
			const x = (mob.x / 20);
			const y = (mob.y / 20) + 1;
			if (gameBoard[y][x] === 0) {
				mob.y = mob.y + 20;
			}
		} else if (randomDirection === 'left') {
			const x = (mob.x / 20) - 1;
			const y = (mob.y / 20);
			if (gameBoard[y][x] === 0) {
				mob.x = mob.x - 20;
			}
		}
	}
	return mobs;
}

module.exports.attack = (pos) => {
	const minX = pos.x - 20;
	const maxX = pos.x + 20;
	const minY = pos.y - 20;
	const maxY = pos.y + 20;
	let hits = [];
	for (mob of mobs) {
		if (mob.x >= minX && mob.x <= maxX) {
			if (mob.y >= minY && mob.y <= maxY) {
				mob.hp -= 1;
				if (mob.hp === 0) {
					const index = mobs.findIndex(x => x.id === mob.id);
					mobs.splice(index, 1);
					hits.push({ status: 'dead', id: mob.id, x: mob.x, y: mob.y });
				} else {
					hits.push({ status: 'hit', id: mob.id });
				}
			}
		}
	}
	return hits;
}

module.exports.counterAttack = (pos) => {
	const minX = pos.x - 20;
	const maxX = pos.x + 20;
	const minY = pos.y - 20;
	const maxY = pos.y + 20;
	let hits = [];
	for (mob of mobs) {
		const random = Math.floor(Math.random() * 3); // Random number 0-2 | 0 = miss, 1 = miss, 2 = hit
		if (mob.x >= minX && mob.x <= maxX) {
			if (mob.y >= minY && mob.y <= maxY) {
				if (random === 2) {
					hits.push({ status: 'hit', x: mob.x, y: mob.y });
				} else {
					hits.push({ status: 'miss', x: mob.x, y: mob.y });
				}
			}
		}
	}
	return hits;
}

module.exports.reset = () => {
	mobs = [];
}