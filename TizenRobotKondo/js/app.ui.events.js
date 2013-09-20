/*global $, tizen, app */
/**
 * @class UiEvents
 */
function UiEvents(parent) {
	'use strict';
	this.ui = parent;
}

(function () { // strict mode wrapper
	'use strict';
	UiEvents.prototype = {

		/**
		 * Initialization
		 */
		init: function UiEvents_init() {
			this.addPageEvents();
		},

		/**
		 * Bind events to pages
		 */
		addPageEvents: function UiEvents_addPageEvents() {
			var self = this;

			$('#start-header .ui-btn-back').on('tap', function (event) {
				event.preventDefault();
				event.stopPropagation();
				app.powerOff();
			});

			$('#choose-footer').on('tap', '.ui-btn-back', function (event) {
				event.preventDefault();
				event.stopPropagation();
				app.setDoNotSendBye(true);
				$.mobile.changePage('#start');
			});

			$('#chat-header').on('tap', '.ui-btn-back', function (event) {
				event.preventDefault();
				event.stopPropagation();
				if (!app.isConnection()) {
					app.setDoNotSendBye(true);
				}
				$.mobile.changePage('#start');
			});

			$('#chat-header').on('tap', '.ui-btn-back', function (event) {
				event.preventDefault();
			});

			$('#start').on('pagebeforeshow', function () {
				self.ui.hideStartButtons();
				self.ui.clearChatDialog();
				if (!app.getDoNotSendBye()) {
					app.sendBye();
				} else {
					app.setDoNotSendBye(false);
				}
				if (app.getApplicationMode() === 'server') {
					app.server.unregisterChatServer();
				} else if (app.getApplicationMode() === 'client') {
					app.client.destroyBonding();
				}
			});

			$('#turnOnButton').on('tap', function (event) {
				self.ui.hideStartButtons();
				app.powerOn();
			});

			$('#serverButton').on('tap', function (event) {
				app.resetApplicationMode();
				app.startServer();
			});

			$('#clientButton').on('tap', function (event) {
				app.resetApplicationMode();
				app.startClient();
			});

			$('#keyboard').on('pagebeforeshow', function () {
				$('#keyboard-text').val('').attr('placeholder', 'Type ' + app.getApplicationMode() + ' name');
				$('#keyboard-header > h1').html('Type ' + app.getApplicationMode() + ' name');
			});

			$('#keyboard').on('pageshow', function () {
				setTimeout(function () { $('#keyboard-text').focus(); }, 500);
			});

			$('#keyboard-ok-button').on('tap', function (event) {
				event.preventDefault();
				var value = $('#keyboard-text').val(), mode;
				if (value.length !== 0) {
					app.setUserName(value);
					mode = app.getApplicationMode();
					if (mode === 'server') {
						app.setAdapterName();
					} else if (mode === 'client') {
						$.mobile.changePage('#choose');
					}
				}
			});

			$('#choose').on('pagebeforeshow', function () {
				app.setAdapterName();
			});

			$('#choose').on('pagehide', function () {
				app.clearListOfServers();
				app.client.stopServerSearching();
			});

			$('#choose-content').on('tap', 'ul.ui-listview li', function () {
				app.client.stopServerSearching($(this).attr('address'));
			});

			$('#chat').on('pagebeforeshow', function () {
				$('#chat-header-type').html(app.getApplicationMode());
				$('#chat-header-name').html(app.getCurrentName());
				if ($(this).data('serverName') !== undefined) {
					$('#chat-header-type').append(' - connected to ' + $(this).data('serverName'));
					$(this).removeData('serverName');
				}
				self.ui.checkSendButtonState();
			});

			$('#chat').on('pageshow', function () {
				if (app.getApplicationMode() === 'server') {
					setTimeout(function () { app.ui.showVisibilityPopup(); }, 100);
				}
			});

			$('#chat').on('pagehide', function () {
				$('#text').val('');
				app.setConnection(false);
			});

			$('#text').on('input', function () {
				self.ui.checkSendButtonState();
			});

			$('#text').on('focus', function () {
				var content = $('#chat-content');
				if (self.ui.scrolltimeout !== null) {
					clearTimeout(self.ui.scrolltimeout);
				}
				self.ui.scrolltimeout = setTimeout(function () {
					self.ui.scrolltimeout = null;
					self.ui.scrollToBottom(content);
				}, 1000);
			});

			$('#text').on('blur', function () {
				var content = $('#chat-content');
				if (self.ui.scrolltimeout !== null) {
					clearTimeout(self.ui.scrolltimeout);
				}
				self.ui.scrolltimeout = setTimeout(function () {
					self.ui.scrolltimeout = null;
					self.ui.scrollToBottom(content);
				}, 700);
			});

			$('#ui-mySend').on('tap', function (event) {
				event.stopPropagation();
				var message = $('#text').val();
				$('#text').val('');
				self.ui.disableSendButton();
				app.sendMessage(message);
			});

			$('body').on('tap', '#byeOK', function () {
				self.ui.hideByePopup();
				$('#keyboard-back-button').trigger('tap');
			});

			$('body').on('touchstart', '#byePopup-screen', function () {
				$('#byeOK').trigger('tap');
			});

			$('body').on('tap', '#visibilityOK', function () {
				self.ui.hideVisibilityPopup();
			});

			$('body').on('touchstart', '#visibilityPopup-screen', function () {
				$('#visibilityOK').trigger('tap');
			});

			$('#chat-content').on('touchstart', function () {
				if (self.ui.scrolltimeout !== null) {
					clearTimeout(self.ui.scrolltimeout);
					self.ui.scrolltimeout = null;
				}
			});

			window.addEventListener('tizenhwkey', function(e) {
				if (e.keyName == "back") {
					event.preventDefault();
					app.setDoNotSendBye(true);
					if ($.mobile.activePage.attr('id') === 'start') {
						tizen.application.getCurrentApplication().exit();
					} else if ($.mobile.activePage.attr('id') === 'chat') {
						$.mobile.changePage('#start');
					} else {
						history.back();
					}
				}
			});

		}
	};
}());
