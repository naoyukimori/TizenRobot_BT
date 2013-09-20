/*global $, tizen, app, Config, Helpers, Model, Ui, Server, Client */
var App = null;

(function () { // strict mode wrapper
	'use strict';

	/**
	 * Creates a new application object
	 *
	 * @class Application
	 */
	App = function App() {};

	App.prototype = {
		/**
		 * @type Array
		 */
		requires: ['js/app.config.js',
		           'js/app.helpers.js',
		           'js/app.model.js',
		           'js/app.ui.js',
		           'js/app.ui.templateManager.js',
		           'js/app.ui.events.js',
		           'js/app.client.js',
		           'js/app.client.model.js',
		           'js/app.server.js',
		           'js/app.server.model.js',
		           'js/app.robot.kondo.js',
		           'js/app.robot.kondo.model.js',
		           ],

		/**
		 * @type Model
		 */
		model: null,

		/**
		 * @type Ui
		 */
		ui: null,

		/**
		 * @type Config
		 */
		config: null,

		/**
		 * @type Helpers
		 */
		helpers: null,

		/**
		 * @type Client
		 */
		client: null,

		/**
		 * @type Server
		 */
		server: null,

		/**
		 * @type String
		 */
		currentName: 'TizenRobotCtl',

		/**
		 * @type Boolean
		 */
		doNotSendBye: false,

		/**
		 * @type Boolean
		 */
		connection: false,

		/**
		 * Initialisation function
		 */
		init: function App_init() {
			this.config = new Config();
			this.helpers = new Helpers();
			this.model = new Model();
			this.ui = new Ui(this.initModel.bind(this));
		},

		initModel: function App_initModel() {
			this.model.init(this.checkPowerState.bind(this));
		},

		/**
		 * exit application action
		 */
		exit: function App_exit() {
			tizen.application.getCurrentApplication().exit();
		},

		isConnection: function App_isConnection() {
			return this.connection;
		},

		setConnection: function App_setConnection(bool) {
			this.connection = bool;
		},

		getDoNotSendBye: function App_getDoNotSendBye() {
			return this.doNotSendBye;
		},

		setDoNotSendBye: function App_setDoNotSendBye(bool) {
			this.doNotSendBye = bool;
		},

		getCurrentName: function App_getCurrentName() {
			return this.currentName;
		},

		getApplicationMode: function App_getApplicationMode() {
			var mode = 'start';
			if (this.client !== null) {
				mode = 'client';
			} else if (this.server !== null) {
				mode = 'server';
			}
			return mode;
		},

		resetApplicationMode: function App_resetApplicationMode() {
			this.client = null;
			this.server = null;
		},

		checkPowerState: function App_checkPowerState() {
			this.ui.setContentStartAttributes(
				this.model.checkPowerState.bind(
					this.model,
					this.ui.showPowerOnButton,
					this.ui.showStartButtons
				)
			);
		},

		powerOn: function App_powerOn() {
			this.model.powerOn(this.ui.showStartButtons);
		},

		powerOff: function App_powerOff() {
			this.model.powerOff(this.exit);
		},

		restartBluetooth: function App_restartBluetooth() {
			this.model.restartBluetooth(this.powerOn.bind(this));
		},

		startServer: function App_startServer() {
			this.server = new Server(this.model.adapter, this.model.serviceUUID);
			this.showKeyboardPage();
		},

		startClient: function App_startClient() {
			//this.client = new Client(this.model.adapter, this.model.serviceUUID);
			this.client = new RobotKondoClient(this.model.adapter, this.model.serviceUUID);
			this.showKeyboardPage();
		},

		showKeyboardPage: function App_showKeyboardPage() {
			this.ui.showKeyboardPage();
		},

		setUserName: function App_setUserName(value) {
			this.currentName = value;
		},

		setAdapterName: function App_setAdapterName() {
			var changeName = false, mode = this.getApplicationMode();
			if (this.model.adapter.name !== this.currentName) {
				changeName = true;
			}
			if (mode === 'server') {
				this.model.setAdapterName(changeName, this.server.registerServer.bind(this.server));
			} else if (mode === 'client') {
				this.model.setAdapterName(changeName, this.client.searchServer.bind(this.client));
			}
		},

		clearListOfServers: function App_clearListOfServers() {
			this.ui.clearListOfServers();
		},

		displaySentMessage: function App_displaySentMessage(message) {
			this.ui.displaySentMessage(message);
		},

		sendMessage: function App_sendMessage(message) {
			var mode = this.getApplicationMode();
			if (mode === 'server') {
				this.server.sendMessage(message, this.displaySentMessage.bind(this));
			} else if (mode === 'client') {
				this.client.sendMessage(message, this.displaySentMessage.bind(this));
			}
		},

		sendBye: function App_sendBye() {
			var mode = this.getApplicationMode();
			if (mode === 'server') {
				this.server.sendBye();
			} else if (mode === 'client') {
				this.client.sendBye();
			}
		}
	};
}());
