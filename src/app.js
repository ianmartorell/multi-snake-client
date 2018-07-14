const senseJoystick = require('sense-joystick');
const senseLeds = require('sense-hat-led');
import io from 'socket.io-client';

// connect to the server
const socket = io('http://7315cdfb.ngrok.io', {
	query: { id: ID },
});
socket.on('connect', () => {
	console.log('connected!');
});

// CONSTANTS
const ID = process.env.RESIN_DEVICE_UUID || 'dani';
const WHITE = [255, 255, 255]; // white color
const BLACK = [0, 0, 0]; // black color
const RED = [255, 0, 0];
const GREEN = [0, 255, 0];

// store the direction of movement
var direction = '';
// show a waiting message
senseLeds.showMessage('Waiting...');

// Send direction change
senseJoystick.getJoystick().then((joystick) => {
	joystick.on('press', (dir) => {
		if (dir != direction) {
			socker.emit('directionChange', {
				id: ID,
				direction: dir,
			});
			direction = dir;
		}
	});
});

// receive new tick from the server
socket.on('tick', ({ players, positions }) => {
	const me = players.find((player) => player.id === ID);
	const head = me.head;
	senseLeds.setPixels(positions);
	senseLeds.setPixel([...head, ...WHITE]);
});

// game ends
socket.on('end', (winner) => {
	if (winner === ID) {
		senseLeds.showMessage('WINNER!', 0.1, GREEN, BLACK);
	} else {
		senseLeds.showMessage('LOOSER!', 0.1, RED, BLACK);
	}
});

// if disconnect
socket.on('disconnect', () => {
	senseLeds.showMessage('Waiting...');
});
