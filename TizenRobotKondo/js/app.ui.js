/*global $, tizen, app, UiEvents, TemplateManager, document, window, setTimeout */
/**
 * @class Ui
 */

function Ui(callback) {
	'use strict';
	this.init(callback);
}

(function () { // strict mode wrapper
	'use strict';
	Ui.prototype = {

		templateManager: null,

		/**
		 * UI object for UI events
		 */
		uiEvents: null,

		/**
		 * Timeout for chat scroll.
		 */
		scrolltimeout: null,

		/**
		 * UI module initialisation
		 */
		init: function Ui_init(callback) {
			this.templateManager = new TemplateManager();
			this.uiEvents = new UiEvents(this);
			$.mobile.tizen.disableSelection(document);

			$(document).ready(this.domInit.bind(this, callback));
		},

		/**
		 * When DOM is ready, initialise it (bind events)
		 */
		domInit: function Ui_domInit(callback) {
			var templates = [
				'keyboard_page',
				'chat_page',
				'choose_page',
				'server_row',
				'left_bubble',
				'right_bubble',
				'bye_popup',
				'visibility_popup'
			];

			this.templateManager.loadToCache(templates, this.initPages.bind(this, callback));
		},

		initPages: function Ui_initPages(callback) {
			var pages = [], body = $('body');

			body.append(this.templateManager.get('bye_popup')).append(this.templateManager.get('visibility_popup')).trigger('create');

			pages.push(this.templateManager.get('keyboard_page'));
			pages.push(this.templateManager.get('chat_page'));
			pages.push(this.templateManager.get('choose_page'));
			body.append(pages.join(''));

			this.uiEvents.init();
			this.fixContentHeight();
			callback();
		},

		setContentStartAttributes: function Ui_setContentStartAttributes(callback) {
			var contentStart, contentStartHeight;
			contentStart = $('#start-content');
			if (contentStart.height() > $(window).height()) {
				contentStartHeight = $(window).height() - $('#start-header').height()
					- parseInt(contentStart.css('padding-top'), 10) - parseInt(contentStart.css('padding-bottom'), 10);
			} else {
				contentStartHeight = contentStart.height();
			}
			setTimeout(function () { // workaround (setTimeout with 0 delay)
				contentStart
					.css('height', contentStartHeight  + 'px')
					.css('min-height', 'auto')
					.css('width', contentStart.width() + 'px');
				$('#start').css('min-height', 'auto');
				callback();
			}, 0);
		},

		showChatPage: function Ui_showChatPage(serverName) {
			if (serverName !== undefined) {
				$('#chat').data('serverName', serverName);
			}
			$.mobile.changePage('#chat');
		},

		showKeyboardPage: function Ui_showKeyboardPage() {
			$.mobile.changePage('#keyboard');
		},

		clearChatDialog: function Ui_clearChatDialog() {
			$('#chat-content .ui-listview').empty();
		},

		showPowerOnButton: function Ui_showPowerOnButton() {
			$('#start-monit').hide();
			$('#serverButton').hide();
			$('#clientButton').hide();
			$('#turnOnButton').show();
		},

		showStartButtons: function Ui_showStartButtons() {
			$('#start-monit').hide();
			$('#turnOnButton').hide();
			$('#serverButton').show();
			$('#clientButton').show();
		},

		hideStartButtons: function Ui_hideStartButtons() {
			$('#serverButton').hide();
			$('#clientButton').hide();
			$('#turnOnButton').hide();
			$('#start-monit').show();
		},

		addDeviceToList: function Ui_addDeviceToList(device) {
			var listElement, address, sub2, ul = $('#choose-content ul.ui-listview');

			listElement = this.templateManager.get('server_row', {
				'deviceAddress': device.address,
				'deviceName': device.name
			});

			ul.append(listElement);
			ul.listview('refresh');
		},

		clearListOfServers: function Ui_clearListOfServers() {
			$('#choose-content ul.ui-listview').empty();
		},

		showByePopup: function Ui_showByePopup(name) {
			var mode = app.getApplicationMode(), message = $('#byeMessage');
			if (mode === 'server') {
				message.html('Client name "' + name + '" is unavailable.\nYour bluetooth device will be automatically restarted.');
			} else if (mode === 'client') {
				message.html('Server name "' + name + '" is unavailable.\nYour bluetooth device will be automatically restarted.');
			}
			$('#byePopup').popup('open', {'positionTo': 'window'});
		},

		hideByePopup: function Ui_hideByePopup() {
			$('#byePopup').popup('close');
		},

		showVisibilityPopup: function Ui_showVisibilityPopup() {
			$('#visibilityPopup').popup('open', {'positionTo': 'window'});
		},

		hideVisibilityPopup: function Ui_hideVisibilityPopup() {
			$('#visibilityPopup').popup('close');
		},

		displayReceivedMessage: function Ui_displayReceivedMessage(name, text, ping, bye) {
			var listElement, span, ul;
			text = decodeURIComponent(text);
			name = decodeURIComponent(name);
			if (bye) {
				this.showByePopup(name);
			} else if (ping) {
				app.setConnection(true);
				$('#chat-header-type').append(' - connected with ' + name);
				this.checkSendButtonState();
			} else {
				listElement = this.templateManager.get('left_bubble', {
					'text': text
				});
				ul = $('#chat-content > .ui-scrollview-view > ul');
				ul.append(listElement);
				ul.listview('refresh');
			}
		},

		enableSendButton: function Ui_enableSendButton() {
			$('#ui-mySend')
				.css({'pointer-events': 'auto', 'color': '#000'})
				.removeClass('ui-disabled');
		},

		disableSendButton: function Ui_disableSendButton() {
			$('#ui-mySend')
				.css({'pointer-events': 'none', 'color': '#bbb'})
				.removeClass('ui-btn-down-s')
				.addClass('ui-disabled');
		},

		checkSendButtonState: function Ui_checkSendButtonState() {
			if (app.helpers.checkStringLength($('#text').val().trim()) && app.isConnection()) {
				this.enableSendButton();
			} else {
				this.disableSendButton();
			}
		},

		scrollToBottom: function Ui_scrollToBottom(element) {
			var bottom = element.children().first().outerHeight(true) - element.height();
			element.scrollview('scrollTo', 0, -Math.max(0, bottom), 0);
		},

		displaySentMessage: function Ui_displaySentMessage(message) {
			var listElement, span, ul, content, self = this;
			message = decodeURIComponent(message);
			listElement = this.templateManager.get('right_bubble', {
				'text': message
			});
			content = $('#chat-content');
			ul = content.find('ul');
			ul.append(listElement);
			ul.listview('refresh');
			this.checkSendButtonState();
			this.scrolltimeout = setTimeout(function () {
				self.scrolltimeout = null;
				self.scrollToBottom(content);
			}, 700);
		},

		setDiscoveringProgress: function Ui_setDiscoveringProgress(boolean) {
			$('#discovering').progress('hide', !boolean).progress('running', boolean);
		},

		fixContentHeight: function Ui_fixContentHeight() {
			var contentHeight = screen.availHeight - $('div[data-role="header"]').outerHeight() - $('div[data-role="footer"]').outerHeight();
			$('div[data-role="content"]').css('height', contentHeight);
		}

	};

}());
