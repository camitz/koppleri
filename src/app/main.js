define([ 'dojo/has', 'require' ], function (has, require) {
	var app = {};


	require([ 
		'dojo/parser', 
		'dojo/_base/json',
		'dojo/_base/array',
		'dojo/_base/lang',
		'dojo/dom-construct',
		'dojo/on',
		"dojo/keys",
		"dojo/_base/event",
		'dojo/dom',
		'dojo/dom-class',
		"dojo/query",
		'dojox/grid/DataGrid', 
		'dojo/data/ItemFileWriteStore',
		'dojo/Deferred',
		'dojo/promise/all',
		'dojo/_base/config',
		'dojo/dom-style',
		'dijit/registry',
		'dojo/cookie',
		'dijit/form/CheckBox',
		'dojo/date/stamp',
		'dojo/date/locale',
		'dojox/html/entities',
		'app/KoppleriView',
		'app/SynonymAdapter',
		'app/RimlexikonAdapter',
		'app/KjellsRimlexikonAdapter',
		'app/SearchHistory',
		'dijit/layout/ContentPane',
		'dojo/ready',
		'dojo/NodeList-dom',
		'dojo/domReady!'
	], 
		function (parser, json, array, lang, construct, on, keys, event, dom, domClass, query, DataGrid, ItemFileWriteStore, 
					Deferred, all, config, style, registry, cookie, CheckBox, stamp, locale, html, 
					KoppleriView, SynonymAdapter, RimlexikonAdapter, KjellsRimlexikonAdapter, SearchHistory, ContentPane, ready) {

		
			ready(function() {
				parser.parse().then(function() {
					document.body.style.visibility = 'visible';
					registry.byId('tb_search').focus();

					var searchHistory = new SearchHistory();

					searchHistory.refresh();

					var view = new KoppleriView(searchHistory);

					on(registry.byId('tb_search'), 'keyup', function(e) {if (e.keyCode == keys.ENTER) { event.stop(e);  view.search(e.target.value);}});
					on(registry.byId('btn_search'), 'click', function(e) { event.stop(e);  view.search(registry.byId('tb_search').value);});
					on(registry.byId('btn_emptyCache'), 'click', function(e) { event.stop(e); localStorage.clear(); });
				});
			});

			

	});

});