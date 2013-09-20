/*jslint plusplus: true, sloppy: true, todo: true, vars: true, browser: true, devel: true, maxerr: 999 */
/*global $, tizen, app */
/**
 * @class Model
 */
function Model() {
	'use strict';
	this.adapter = null;
	//this.serviceUUID = '5BCE9431-6C75-32AB-AFE0-2EC108A30860';	// Tizen SDK BluetoothChat sample
	this.serviceUUID = '00001101-0000-1000-8000-00805F9B34FB';		// SPP standard GUID
}

(function () { // strict mode wrapper
	'use strict';
	Model.prototype = {

		/**
		 * API module initialisation
		 */
		init: function Model_init(callback) {
			try {
				console.log('getDefaultAdapter');
				var time = new Date().getTime();
				this.adapter = tizen.bluetooth.getDefaultAdapter();
				console.log('getDefaultAdapter OK: ' + (new Date().getTime() - time) + ' milliseconds.');
				callback();
			} catch (error) {
				alert('Problem with bluetooth device. Application can\'t work properly: ' + error.message);
				tizen.application.getCurrentApplication().exit();
			}
		},

		checkPowerState: function Model_checkPowerState(showPowerOnButtonCallback, showStartButtonsCallback) {
			if (!this.adapter.powered) {
				showPowerOnButtonCallback();
			} else {
				showStartButtonsCallback();
			}
		},

		powerOn: function Model_powerOn(callback) {
			if (!this.adapter.powered) {
				try {
					this.adapter.setPowered(true,
						function () {
							setTimeout(function () { callback(); }, 500);
						}
					);
				} catch (error) {
					alert(error.message);
					app.ui.showPowerOnButton();
				}
			} else {
				callback();
			}
		},

		powerOff: function Model_powerOff(callback) {
			var app = tizen.application.getCurrentApplication();
			if (this.adapter.powered) {
				this.adapter.setPowered(false, function () { callback(); }, function () { callback(); });
			} else {
				callback();
			}
		},

		restartBluetooth: function Model_restartBluetooth(callback) {
			if (this.adapter.powered) {
				this.adapter.setPowered(false, function () { setTimeout(function () { callback(); }, 500); }, function () {});
			} else {
				callback();
			}
		},

		setAdapterName: function Model_setAdapterName(changeName, callback) {
			if (changeName) {
				this.adapter.setName(app.currentName, function () {
					callback();
				}, function () {
				});
			} else {
				callback();
			}
		}
	};
}());
