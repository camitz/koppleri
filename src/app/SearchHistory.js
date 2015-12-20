define([
        "dojo/_base/declare",
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
		'app/SynonymAdapter',
		'app/RimlexikonAdapter',
		'app/KjellsRimlexikonAdapter',
		'dijit/layout/ContentPane',
		'dojo/ready',
		'dojo/NodeList-dom'
    ], 
		function (declare, json, array, lang, construct, on, keys, event, dom, domClass, query, DataGrid, ItemFileWriteStore, 
					Deferred, all, config, style, registry, cookie, CheckBox, stamp, locale, html, 
					SynonymAdapter, RimlexikonAdapter, KjellsRimlexikonAdapter, ContentPane) {

		return declare([],
            {
				searches:null,
				constructor: function(){
					searches = JSON.parse(cookie('searchHistory') || '[]') ;
					this.searches = Array.isArray(searches) ? searches : [searches];
				},

				push: function(word){
						this.searches.push(word);
						this.searches.splice(0, this.searches.length - 50);
						cookie('searchHistory', JSON.stringify(this.searches), {expires: 'never'});
				},

				refresh: function()
				{
					query('#searchHistory li').forEach(construct.destroy);

					array.forEach(this.searches, lang.hitch(this, function(h){
						var a = construct.create('a', {innerHTML: h, href: '#'}, construct.create('li', null, dom.byId('searchHistory'), 'first'));
						on(a, 'click', lang.hitch(this, function(e) { 
							event.stop(e); 
							this.onSearch(h);
						}));
					}));
				},
				
				onSearch: function(){}
            });

    });