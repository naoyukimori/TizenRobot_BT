/*jslint plusplus: true, sloppy: true, todo: true, vars: true, browser: true, devel: true, maxerr: 999 */
/*global $, tizen, app */
/**
 * @class Model
 */
function ClientModel(parent) {
	'use strict';
	this.client = parent;
	this.init();
}

(function () { // strict mode wrapper
	'use strict';
	ClientModel.prototype = {

		/**
		 * API module initialisation
		 */
		init: function ClientModel_init() {},

		searchServer: function ClientModel_searchServer() {
			var discoverDevicesSuccessCallback = {
				onstarted: function () {
					this.client.setDiscovering(true);
				}.bind(this),
				ondevicefound: function (device) {
					this.client.addDeviceToList(device);
				}.bind(this),
				ondevicedisappeared: function (address) {},
				onfinished: function (devices) {
					this.client.setDiscovering(false);
				}.bind(this)
			};

			this.client.adapter.discoverDevices(discoverDevicesSuccessCallback, function (e) { this.client.setDiscovering(false); });
		},

		stopServerSearching: function ClientModel_stopServerSearching(callback) {
			if (this.client.getDiscovering()) {
				this.client.adapter.stopDiscovery(function () {
					this.client.setDiscovering(false);
					if (typeof callback === 'function') {
						callback();
					}
				}.bind(this), function (e) {
					console.error("Error while stopDiscovery:" + e.message);
				});
			} else if (typeof callback === 'function') {
				callback();
			}
		},

		startBonding: function ClientModel_startBonding(address, callback) {
			this.client.adapter.createBonding(address, function (device) { callback(device); }, function (error) { console.error('bondError: ' + error.message); });
		},

		connectToService: function ClientModel_connectToService(device, serviceUUID, successCallback, errorCallback) {
			this.client.chatServerDevice = device;
			try {
				device.connectToServiceByUUID(serviceUUID, successCallback, errorCallback, 'RFCOMM');
			} catch (error) {
				console.error('connectToServiceByUUID ERROR: ' + error.message);
			}
		},

		sendPing: function ClientModel_sendPing(name, socket) {
			var sendTextMsg, messageObj, messageObjToString, i, len;
			sendTextMsg = [];
			messageObj = {name: encodeURIComponent(name), text: '', ping: true, bye: false};
			messageObjToString = JSON.stringify(messageObj);
			len = messageObjToString.length;

			for (i = 0; i < len; i += 1) {
				sendTextMsg[i] = messageObjToString.charCodeAt(i);
			}
			try {
				if (socket !== null && socket.state === "OPEN") {
					socket.writeData(sendTextMsg);
				}
			} catch (error) {
				console.error('sendPing: ' + error.message);
			}
		},

		sendMessage: function ClientModel_sendMessage(name, socket, message, callback) {
			var sendTextMsg = [], messageObj, messageObjToString, i, len;
			name = encodeURIComponent(name);
			message = encodeURIComponent(message);
			messageObj = {name: name, text: message, ping: false, bye: false};
			messageObjToString = JSON.stringify(messageObj);
			len = messageObjToString.length;
			for (i = 0; i < len; i += 1) {
				sendTextMsg[i] = messageObjToString.charCodeAt(i);
			}
			try {
				if (socket !== null && socket.state === "OPEN") {
					socket.writeData(sendTextMsg);
					callback(message);
				}
			} catch (error) {
				console.error('sendMessage: ' + error.message);
			}
		},

		sendBye: function ClientModel_sendBye(name, socket) {
			var sendTextMsg = [], messageObj, messageObjToString, i, len;
			name = encodeURIComponent(name);
			messageObj = {name: name, text: '', ping: false, bye: true};
			messageObjToString = JSON.stringify(messageObj);
			len = messageObjToString.length;
			for (i = 0; i < len; i += 1) {
				sendTextMsg[i] = messageObjToString.charCodeAt(i);
			}
			try {
				if (socket !== null && socket.state === "OPEN") {
					socket.writeData(sendTextMsg);
				}
			} catch (error) {
				console.error('sendBye: ' + error.message);
			}
		},

		destroyBonding: function ClientModel_destroyBonding(device, restartCallback, showStartButtonsCallback) {
			if (device !== null) {
				if (device.isBonded) {
					this.client.adapter.destroyBonding(device.address, function () {
						device = null;
						restartCallback();
					}, function (error) { console.error('ClientModel_destroyBonding: ' + error); });
				} else {
					device = null;
					restartCallback();
				}
			} else {
				this.stopServerSearching();
				showStartButtonsCallback();
			}
		}

	};
}());
