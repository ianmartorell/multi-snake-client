'use strict';

var _socket = require('socket.io-client');

var _socket2 = _interopRequireDefault(_socket);

function _interopRequireDefault(obj) {
	return obj && obj.__esModule ? obj : { default: obj };
}

function _toConsumableArray(arr) {
	if (Array.isArray(arr)) {
		for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
			arr2[i] = arr[i];
		}
		return arr2;
	} else {
		return Array.from(arr);
	}
}

var senseJoystick = require('sense-joystick');
var senseLeds = require('sense-hat-led');

// CONSTANTS
var ID = process.env.RESIN_DEVICE_UUID || 'dani';
var WHITE = [255, 255, 255]; // white color
var BLACK = [0, 0, 0]; // black color
var RED = [255, 0, 0];
var GREEN = [0, 255, 0];
var WIDTH = 8;
var HEIGHT = 8;

// connect to the server
var socket = (0, _socket2.default)('https://multi-snake-server.herokuapp.com', {
	query: { id: ID },
});
socket.on('connect', function() {
	console.log('connected!');
});

// store the direction of movement
var direction = '';
// show a waiting message
// senseLeds.showMessage('Waiting...');

// Send direction change
senseJoystick.getJoystick().then(function(joystick) {
	joystick.on('press', function(dir) {
		if (dir !== direction && dir !== 'click') {
			socket.emit('directionChange', {
				id: ID,
				direction: dir,
			});
			direction = dir;
		}
	});
});

// receive new tick from the server
socket.on('tick', function(_ref) {
	var players = _ref.players,
		positions = _ref.positions;

	var me = players.find(function(player) {
		return player.id === ID;
	});
	var head = me.position;
	senseLeds.clear();
	senseLeds.setPixels(positions);
	try {
		senseLeds.setPixel(positionToIdx(head), WHITE);
	} catch (e) {
		console.log('dead');
	}
});

// game ends
socket.on('gameEnd', function(winner) {
	if (winner === ID) {
		senseLeds.showMessage('WIN', 0.1, GREEN, BLACK);
	} else {
		senseLeds.showMessage('LOOSE', 0.1, RED, BLACK);
	}
});

// if disconnect
socket.on('disconnect', function() {
	senseLeds.showMessage('D');
});

// HELPERS
const positionToIdx = ([x, y]) => {
	if (x < 0 || x >= WIDTH) {
		throw new Error(`x is out of bounds: ${x}`);
	}
	if (y < 0 || y >= HEIGHT) {
		throw new Error(`y is out of bounds: ${y}`);
	}
	return x + WIDTH * y;
};
