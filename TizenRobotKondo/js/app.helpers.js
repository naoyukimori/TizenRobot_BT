/*jslint plusplus: true, sloppy: true, todo: true, vars: true, browser: true, devel: true, maxerr: 999 */
/*global $, tizen, app */
/**
 * @class Helpers
 */
function Helpers() {
	'use strict';
}

(function () { // strict mode wrapper
	'use strict';
	Helpers.prototype = {

		checkStringLength: function Helpers_checkStringLength(value) {
			return value.length > 0 ? true : false;
		}

	};
}());
