'use strict';

var _socket = require('socket.io-client');

var _socket2 = _interopRequireDefault(_socket);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var senseJoystick = require('sense-joystick');
var senseLeds = require('sense-hat-led');


// connect to the server
var socket = (0, _socket2.default)('http://7315cdfb.ngrok.io', {
	query: { id: ID }
});
socket.on('connect', function () {
	console.log('connected!');
});

// CONSTANTS
var ID = process.env.RESIN_DEVICE_UUID || 'dani';
var WHITE = [255, 255, 255]; // white color
var BLACK = [0, 0, 0]; // black color
var RED = [255, 0, 0];
var GREEN = [0, 255, 0];

// store the direction of movement
var direction = '';
// show a waiting message
senseLeds.showMessage('Waiting...');

// Send direction change
senseJoystick.getJoystick().then(function (joystick) {
	joystick.on('press', function (dir) {
		if (dir != direction) {
			socker.emit('directionChange', {
				id: ID,
				direction: dir
			});
			direction = dir;
		}
	});
});

// receive new tick from the server
socket.on('tick', function (_ref) {
	var players = _ref.players,
	    positions = _ref.positions;

	var me = players.find(function (player) {
		return player.id === ID;
	});
	var head = me.head;
	senseLeds.setPixels(positions);
	senseLeds.setPixel([].concat(_toConsumableArray(head), WHITE));
});

// game ends
socket.on('end', function (winner) {
	if (winner === ID) {
		senseLeds.showMessage('WINNER!', 0.1, GREEN, BLACK);
	} else {
		senseLeds.showMessage('LOOSER!', 0.1, RED, BLACK);
	}
});

// if disconnect
socket.on('disconnect', function () {
	senseLeds.showMessage('Waiting...');
});