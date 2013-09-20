/*global $, tizen, app, ServerModel */
/**
 * @class Server
 */

function Server(adapter, serviceUUID) {
	'use strict';
	this.adapter = adapter;
	this.serviceUUID = serviceUUID;
	this.numberOfClients = 0;
	this.globalRecordHandler = null;
	this.globalSocket = null;
	this.init();
}

(function () { // strict mode wrapper
	'use strict';

	Server.prototype = {
		/**
		 * @type clientModel
		 */
		model: null,

		/**
		 * Initialisation function
		 */
		init: function Server_init() {
			this.model = new ServerModel(this);
			return this;
		},

		getNumberOfClients: function Server_getNumberOfClients() {
			return this.numberOfClients;
		},

		registerServer: function Server_registerServer() {
			this.model.registerServer(this.adapter, this.serviceUUID, this.registerServerSuccess.bind(this));
		},

		registerServerSuccess: function Server_registerServerSuccess(recordHandler) {
			this.globalRecordHandler = recordHandler;
			recordHandler.onconnect = function (socket) {
				this.numberOfClients += 1;
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
					console.error('Server onerror');
					socket.close();
				};
				socket.onclose = function () {
					this.globalSocket = null;
					app.setConnection(false);
				};
				app.setConnection(true);
			}.bind(this);
			app.ui.showChatPage();
		},

		unregisterChatServer: function Server_unregisterChatServer() {
			this.model.unregisterChatServer(this.globalRecordHandler, this.unregisterChatServerSuccess.bind(this), this.unregisterChatServerError.bind(this), app.ui.showStartButtons);
		},

		unregisterChatServerSuccess: function Server_unregisterChatServerSuccess() {
			this.globalRecordHandler = null;
			this.numberOfClients = 0;
			app.restartBluetooth();
		},

		unregisterChatServerError: function Server_unregisterChatServerError() {
			console.error('Server_unregisterChatServerError');
			this.numberOfClients = 0;
			app.restartBluetooth();
		},

		sendMessage: function Server_sendMessage(message, callback) {
			this.model.sendMessage(this.adapter.name, this.globalSocket, message, callback);
		},

		sendBye: function Server_sendBye() {
			this.model.sendBye(this.adapter.name, this.globalSocket);
		}
	};
}());
