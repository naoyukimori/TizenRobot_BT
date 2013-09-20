/*
 *      Copyright 2013  Samsung Electronics Co., Ltd
 *
 *      Licensed under the Flora License, Version 1.1 (the "License");
 *      you may not use this file except in compliance with the License.
 *      You may obtain a copy of the License at
 *
 *              http://floralicense.org/license/
 *
 *      Unless required by applicable law or agreed to in writing, software
 *      distributed under the License is distributed on an "AS IS" BASIS,
 *      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *      See the License for the specific language governing permissions and
 *      limitations under the License.
 */

/*global $, tizen, App */
var app = null;

(function () { // strict mode wrapper
	'use strict';

	({
		/**
		 * Loader init - load the App constructor
		 */
		init: function init() {
			var self = this;
			$.getScript('js/app.js')
				.done(function () {
					app = new App();
					self.loadLibs();
				})
				.fail(this.onGetScriptError);
		},

		/**
		 * Load dependencies
		 */
		loadLibs: function loadLibs() {
			var loadedLibs = 0;
			if ($.isArray(app.requires)) {
				$.each(app.requires, function (index, filename) {
					$.getScript(filename)
						.done(function () {
							loadedLibs += 1;
							if (loadedLibs >= app.requires.length) {
								app.init();
							}
						})
						.fail(this.onGetScriptError);
				});
			}
		},

		/**
		 * Handle ajax errors
		 */
		onGetScriptError: function onGetScriptError(e, jqxhr, setting, exception) {
			console.error('An error occurred: ' + e.message);
		}
	}).init(); // run the loader
}());
