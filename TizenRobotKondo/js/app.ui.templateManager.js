/*global tizen, $, app */
/**
 * @class TemplateManager
 */
function TemplateManager() {
	'use strict';
	this.init();
}

(function () { // strict mode wrapper
	'use strict';
	TemplateManager.prototype = {

		/**
		 * Template cache
		 */
		cache: {},

		/**
		 * UI module initialisation
		 */
		init: function init() {
		},

		/**
		 * Returns template html (from cache)
		 * @param {string} tplName
		 * @param {string} tplParams
		 */
		get: function TemplateManager_get(tplName, tplParams) {
			if (this.cache[tplName] !== undefined) {
				return this.getCompleted(this.cache[tplName], tplParams);
			}
			return '';
		},

		/**
		 * Load templates to cache
		 * @param {string} tplNames
		 * @param {function} onSuccess
		 */
		loadToCache: function TemplateManager_loadToCache(tplNames, onSuccess) {
			var self = this,
				cachedTemplates = 0,
				tplName,
				tplPath;

			if ($.isArray(tplNames)) {

				// for each template
				$.each(tplNames, function (index, fileName) {

					// cache template html
					if (self.cache[fileName] === undefined) {
						tplName = [fileName, app.config.get('templateExtension')].join('');
						tplPath = [app.config.get('templateDir'), tplName].join('/');

						$.ajax({
							url: tplPath,
							cache: true,
							dataType: 'html',
							async: true,
							success: function (data) {
								// increase counter
								cachedTemplates += 1;

								// save to cache
								self.cache[fileName] = data;

								// if all templates are cached launch callback
								if (cachedTemplates >= tplNames.length && typeof onSuccess === 'function') {
									onSuccess();
								}
							},
							error: function (jqXHR, textStatus, errorThrown) {
								console.error('templateManagerError: ' + errorThrown);
							}
						});
					} else {
						// template is already cached
						cachedTemplates += 1;
						// if all templates are cached launch callback
						if (cachedTemplates >= tplNames.length && typeof onSuccess === 'function') {
							onSuccess();
						}
					}
				});

			}
		},

		/**
		 * Returns template completed by specified params
		* @param {string} tplHtml
		* @param {string} tplParams
		 */
		getCompleted: function TemplateManager_getCompleted(tplHtml, tplParams) {
			var tplParam, replaceRegExp;

			for (tplParam in tplParams) {
				if (tplParams.hasOwnProperty(tplParam)) {
					replaceRegExp = new RegExp(['%', tplParam, '%'].join(''), 'g');
					tplHtml = tplHtml.replace(replaceRegExp, tplParams[tplParam]);
				}
			}

			return tplHtml;
		}
	};

}());