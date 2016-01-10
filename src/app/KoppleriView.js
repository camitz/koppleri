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
				searchHistory:null,
				rows:null,
				mainSearches:null,
				tbl:null,
				word:null,

				createRow: function(w) {
					this.rows[w] = construct.create('tr', null, this.tbl, 'last');
					var td = construct.create('td', {innerHTML: w+'<div class="searchStatus"></div><div class="message"></div>', 'class': 'searchTerm searchTerm___' + w.replace(/ /g, '_') } , this.rows[w], 'last');
					on(query('.searchStatus', td)[0], 'click', lang.hitch(this, function(e) { 
						if (!domClass.contains(e.target, 'refresh'))
							return;

						event.stop(e); 

						query('.searchTerm___' + w.replace(/ /g, '_') + ' ~ td').forEach(construct.destroy);

						if (w == this.word)
							this.mainSearch(true);
						else
							this.subSearch(w, true);
					}));
				},

				constructor: function(searchHistory) {
					this.searchHistory = searchHistory;
					this.searchHistory.onSearch = lang.hitch(this, this.search);
				},

				kjellOpts: function() { 
					return {
						fonetiskt: registry.byId('cb_fonetiskt').get('value') ? 1 : 0,
						minimalord: registry.byId('cb_helord').get('value') ? 1 : 0,
						forwardmatch: registry.byId('cb_ordstart').get('value') ? 1 : 0,
						exclude: registry.byId('cb_ordslut').get('value') ? 1 : 0,
						gradera: registry.byId('cb_gradera').get('value') ? 1 : 0
					};
				},

				rimOpts:function() {
					return {
						gradera: registry.byId('cb_gradera').get('value') ? 1 : 0
					};
				},

				unWrap: function(nthOrder, callback) {
					if (!Array.isArray(nthOrder))
						callback(nthOrder);
					else
						array.forEach(nthOrder, lang.hitch(this,function(n_1thOrder) {
							this.unWrap(n_1thOrder, callback);
						}));
				},

				placeResult: function(results) {
					c = function(rimmet) {
						if (!rimmet.result)
							return;

						var existingCell = query('.result___' + rimmet.result, this.rows[rimmet.searchTerm])[0];

						if (existingCell) {
							construct.create('span', {'class': 'service___'+rimmet.service}, existingCell, 'last');
						} else {
							var cells = query('td', this.rows[rimmet.searchTerm]);

							for (i = cells.length; i <= rimmet.stavelser; i++)
								cells.push(construct.create('td', null, this.rows[rimmet.searchTerm], 'last'));

							construct.create('span', {'class': 'service___'+rimmet.service}, 
								construct.create('div', {innerHTML: '<div><div class="rim">' + rimmet.result + '</div></div>', 'class': 'result result___' + rimmet.result.replace(/ /g, '_')}, cells[rimmet.stavelser], 'last')
								, 'last');
						}
					};

					/*if (!results.length) //Hade funkat om det bara varit en söktjänst.
						query('.searchTerm___' + w.replace(/ /g, '_') + ' .message')[0].innerHTML = "Inga resultat hittades.";
						*/

					var d = function(results) {
						var leftOverResults = results.splice(500,results.length);
						this.unWrap(results, lang.hitch(this, c));

						if (leftOverResults.length > 0) {
							var rimmet = leftOverResults[0];
							while(Array.isArray(rimmet))
								rimmet=rimmet[0];

							var cells = query('td', this.rows[rimmet.searchTerm]);
							lengths	= array.map(cells,function(n){return n.childNodes.length;});
							var max = Math.max.apply( Math, lengths);
							var cell = cells[array.indexOf(lengths, max)];
							var l = construct.create('div', {innerHTML: '<div><div class="rim show-more"><a href="#">(visa fler...)</a></div></div>', 'class': 'result' }, cell, 'last');
							on(l, 'click', lang.hitch(this,function(e) { 
								event.stop(e); 
								lang.hitch(this, d,leftOverResults)(leftOverResults);
								construct.destroy(l);
							}));
						}
					};

					lang.hitch(this, d,results)(results);
				},

				 subSearch: function(w, force) {
					domClass.add(query('.searchTerm___' + w.replace(/ /g, '_') + ' .searchStatus', resultTab.domNode)[0], 'loading');

					var ds = [];
					if (registry.byId('cb_rim').get('value'))
						ds.push(new RimlexikonAdapter()
							.search(w, this.rimOpts(), force)
							.then(function(rim) {return rim;}, function(e) { 
							console.log(1);
							})
							.then(lang.hitch(this,this.placeResult)), function(e) { console.log(2);});
				
					if (registry.byId('cb_kjell').get('value'))
						ds.push(new KjellsRimlexikonAdapter()
							.search(w, this.kjellOpts(), force)
							.then(function(rim) {return rim;}, function(e) { 
								console.log(3);
							})
							.then(lang.hitch(this,this.placeResult)), function(e) { console.log(4);});

					var gradeSearch = null;

					if (registry.byId('cb_gradera').get('value')) 
					{
						gradeSearch = new KjellsRimlexikonAdapter().search(w, { fonetiskt:1, vokalsort:0, minimalord:0});
						ds.push(gradeSearch);
					}

					all(ds).then(lang.hitch(this,function() {
						var n = query('.searchTerm___' + w.replace(/ /g, '_') + ' .searchStatus', resultTab.domNode)[0]; 
						domClass.add(n,'refresh'); 
						domClass.remove(n,'loading');

						if (gradeSearch)
							gradeSearch.then(function(rim){ return rim; }, function(e) { console.log(10);})
								.then(lang.hitch(this,function(rim){ this.unWrap(rim, this.domGrade)}), function(e) { console.log(11);});

					}), 
					lang.hitch(this, function(e) { 
						console.log(31);
						this.displayError(w);
					}));
				},

				domGrade: function(rimmet) {
					query('.result___' + rimmet.result, this.rows[rimmet.searchTerm])
					.forEach(function(n) {
						domClass.add(n, 'level__'+rimmet.level);
						domClass.add(n, 'level');
					});
				},
				displayError: function(w) {
						var n = query('.searchTerm___' + w.replace(/ /g, '_') + ' .searchStatus', resultTab.domNode)[0]; 
						domClass.add(n,'refresh'); 
						domClass.remove(n,'loading');
						query('.message',this.rows[w])[0].innerHTML = "Något gick fel. Resultaten kanske inte visas korrekt.";
				},

				mainSearch: function(force) {
					domClass.add(query('.searchTerm___'+this.word+' .searchStatus', resultTab.domNode)[0], 'loading');

					if (registry.byId('cb_rim').get('value'))
						this.mainSearches.push(new RimlexikonAdapter().search(this.word, this.rimOpts(), force)
							.then(lang.hitch(this,this.placeResult), lang.hitch(this, function(e) { 
								console.log(7);
								this.displayError(this.word);
							})));

					if (registry.byId('cb_kjell').get('value')){
						this.mainSearches.push(new KjellsRimlexikonAdapter().search(this.word, this.kjellOpts(), force)
							.then(lang.hitch(this,this.placeResult), lang.hitch(this, function(e) { 
								console.log(8);
								this.displayError(this.word);
							})));
					}

					var gradeSearch = null;
					if (registry.byId('cb_gradera').get('value')) 
					{
						this.mainSearches.push(new KjellsRimlexikonAdapter().search(this.word, {fonetiskt:1,vokalsort:0,minimalord:0,})
						.then(function(e) { 
								console.log(81);
							},function(e) { 
								console.log(82);
								this.displayError(this.word);
							})
						);
					}

					all(this.mainSearches).then(lang.hitch(this,function() {
						var n = query('.searchTerm___'+this.word+' .searchStatus', resultTab.domNode)[0]; 
						domClass.add(n,'refresh'); 
						domClass.remove(n,'loading');

						if (registry.byId('cb_gradera').get('value'))
							gradeSearch.then(function(rim){ return rim; }, function(e) { console.log(10);})
								.then(lang.hitch(this,function(rim){ this.unWrap(rim, this.domGrade)}), function(e) { console.log(11);});

					}, function(e) { console.log(9);}));
				},
						
				search: function(w) {
					if(!w)
						return;

					this.word = w;
					this.rows = [];
					this.mainSearches = [];

					this.searchHistory.push(w);
					this.searchHistory.refresh();

					if (resultsContainer.getChildren() && resultsContainer.getChildren()[0]['data-koppleri'] == 'fresh')
						resultTab = resultsContainer.getChildren()[0];
					else {
						resultsContainer.addChild(resultTab = new ContentPane({closable:true}));
					}

					resultTab.set('title', w);
					resultTab.set('closable', true);
					resultTab.set('data-koppleri', null);
					resultsContainer.selectChild(resultTab);

					this.tbl = query('#resultTable', resultTab.domNode)[0];

					if(!this.tbl)
						this.tbl = construct.create('table', {id:'resultTable'}, resultTab.domNode, 'only');
						

					this.createRow(w);


					
					if (registry.byId('cb_synonymer').get('value')) {
						var search = new SynonymAdapter().search(w);
						this.mainSearches.push(search);

						search.then(lang.hitch(this,function(synonymer) {
							array.forEach(synonymer, lang.hitch(this,function(synonym) { 
								this.createRow(synonym);
							}));

							array.forEach(synonymer, lang.hitch(this,function(synonym) { 									
								this.subSearch(synonym);
							}));
						}), function(e) { 
							console.log(6);
						});
					}


					this.mainSearch();
				}
			});

    });