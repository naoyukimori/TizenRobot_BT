/*jslint plusplus: true, sloppy: true, todo: true, vars: true, browser: true, devel: true, maxerr: 999 */
/*global $, tizen, app, ClientModel */
/**
 * @class Client
 */

function Client(adapter, serviceUUID) {
	'use strict';
	this.adapter = adapter;
	this.serviceUUID = serviceUUID;
	this.globalSocket = null;
	this.init();
	this.discovering = false;
	this.chatServerDevice = null;
}

(function () { // strict mode wrapper
	'use strict';

	Client.prototype = {
		/**
		 * @type clientModel
		 */
		model: null,

		/**
		 * Initialisation function
		 */
		init: function Client_init() {
			this.model = new ClientModel(this);
			return this;
		},

		setDiscovering: function Client_setDiscovering(boolean) {
			this.discovering = boolean;
			app.ui.setDiscoveringProgress(boolean);
		},

		getDiscovering: function Client_getDiscovering() {
			return this.discovering;
		},

		searchServer: function Client_searchServer() {
			this.model.searchServer();
		},

		addDeviceToList: function Client_addDeviceToList(device) {
			app.ui.addDeviceToList(device);
		},

		stopServerSearching: function Client_stopServerSearching(address) {
			if (address !== undefined) {
				this.model.stopServerSearching(this.startBonding.bind(this, address, this.connectToService.bind(this)));
			} else {
				this.model.stopServerSearching();
			}
		},

		startBonding: function Client_startBonding(address, callback) {
			this.model.startBonding(address, callback);
		},

		connectToService: function Client_connectToService(device) {
			this.model.connectToService(device, this.serviceUUID, this.connectToServiceSuccess.bind(this, device), this.connectToServiceError.bind(this));
		},

		connectToServiceSuccess: function Client_connectToServiceSuccess(device, socket) {
			this.globalSocket = socket;
			socket.onmessage = function () {
				var data, recvmsg = '', i, len, messageObj;
				data = socket.readData();
				len = data.length;
				for (i = 0; i < len; i += 1) {
					recvmsg += String.fromCharCode(data[i]);
				}
				messageObj = JSON.parse(recvmsg);
				app.ui.displayReceivedMessage(messageObj.name, messageObj.text, messageObj.ping, messageObj.bye);
			};
			socket.onerror = function (e) {
				console.error('Client onerror');
				socket.close();
			};
			socket.onclose = function () {
				this.globalSocket = null;
				app.setConnection(false);
			};
			app.setConnection(true);
			app.ui.showChatPage(device.name);
			this.sendPing();
		},

		connectToServiceError: function Client_connectToServiceError(error) {
			console.error('Client_connectToServiceError: ' + error.message);
		},

		sendPing: function Client_sendPing() {
			this.model.sendPing(this.adapter.name, this.globalSocket);
		},

		sendMessage: function Client_sendMessage(message, callback) {
			this.model.sendMessage(this.adapter.name, this.globalSocket, message, callback);
		},

		sendBye: function Client_sendBye() {
			this.model.sendBye(this.adapter.name, this.globalSocket);
		},

		destroyBonding: function Client_destroyBonding() {
			this.model.destroyBonding(this.chatServerDevice, app.restartBluetooth.bind(app), app.ui.showStartButtons);
		}
	};
}());
