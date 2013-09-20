/*global $, tizen, app */
/**
 * @class Model
 */
function ServerModel(parent) {
	'use strict';
	this.server = parent;
	this.init();
}

(function () { // strict mode wrapper
	'use strict';
	ServerModel.prototype = {

		/**
		 * API module initialisation
		 */
		init: function ServerModel_init() {},

		registerServer: function ServerModel_registerServer(adapter, serviceUUID, callback) {
			if (this.server.getNumberOfClients() === 0) {
				try {
					adapter.registerRFCOMMServiceByUUID(serviceUUID, 'Chat service', callback, function (error) { console.error(error.message); });
				} catch (error) {
					console.error(error.message);
				}
			}
		},

		unregisterChatServer: function ServerModel_unregisterChatServer(globalRecordHandler, successCallback, errorCallback, showButtonsCallback) {
			try {
				if (globalRecordHandler !== null) {
					globalRecordHandler.unregister(successCallback, errorCallback);
				} else {
					showButtonsCallback();
				}
			} catch (error) {
				errorCallback();
			}
		},

		sendMessage: function ServerModel_sendMessage(name, socket, message, callback) {
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

		sendBye: function ServerModel_sendBye(name, socket) {
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
		}

	};
}());
