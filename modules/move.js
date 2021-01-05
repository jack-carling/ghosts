const gameBoard = require('./board');

module.exports.up = (pos) => {
	const x = (pos.x / 20);
	const y = (pos.y / 20) - 1;
	if (gameBoard[y][x] === 0) {
		const newPos = pos.y - 20;
		return { success: true, x: pos.x, y: newPos }
	} else {
		return { success: false };
	}
}

module.exports.right = (pos) => {
	const x = (pos.x / 20) + 1;
	const y = (pos.y / 20);
	if (gameBoard[y][x] === 0) {
		const newPos = pos.x + 20;
		return { success: true, x: newPos, y: pos.y, rot: 0 }
	} else {
		return { success: false };
	}
}

module.exports.down = (pos) => {
	const x = (pos.x / 20);
	const y = (pos.y / 20) + 1;
	if (gameBoard[y][x] === 0) {
		const newPos = pos.y + 20;
		return { success: true, x: pos.x, y: newPos }
	} else {
		return { success: false };
	}
}

module.exports.left = (pos) => {
	const x = (pos.x / 20) - 1;
	const y = (pos.y / 20);
	if (gameBoard[y][x] === 0) {
		const newPos = pos.x - 20;
		return { success: true, x: newPos, y: pos.y, rot: 180 }
	} else {
		return { success: false };
	}
}