const gameBoard = require('./board');

let medicines = [];

module.exports.spawn = () => {
  const randomX = Math.floor(Math.random() * 38) + 1; // Random number 1-38
  const randomY = Math.floor(Math.random() * 23) + 1; // Random number 1-23
  if (gameBoard[randomY][randomX] === 0) {
    const x = randomX * 20;
    const y = randomY * 20;
    let id;
    if (medicines.length === 0) {
    	id = 0;
    } else {
		const last = medicines[medicines.length-1].id;
		id = last + 1;
    }
    if (medicines.length < 10) {
		medicines.push({x: x, y: y, id: id});
    	return {x: x, y: y, id: id};
    }
  }
}

module.exports.check = (pos) => {
	let pickups = [];
	for (medicine of medicines) {
	  if (medicine.x === pos.x && medicine.y === pos.y) {
			const index = medicines.findIndex(x => x.id === medicine.id);
			medicines.splice(index, 1);
			pickups.push({status: 'pickup', id: medicine.id, x: medicine.x, y: medicine.y});
	  }
	}
	return pickups;
  }

module.exports.reset = () => {
	medicines = [];
}