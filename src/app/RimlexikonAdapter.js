define([
        "dojo/_base/declare",
        "dojo/_base/array",
        "dojo/on",
        "dojo/_base/lang",
        "dojo/keys",
        "dojo/_base/event",
        "dojo/request/xhr",
        "dojo/query",
		"dojo/_base/window",
		'dojo/dom-construct',
		'dojo/when',
		"dojo/NodeList-traverse"
    ], function (declare, array, on, lang, keys, event, xhr, query, win, construct, when) {

		return declare([],
            {
				
				search: function(word, force) {
					var results = [];
					if (!force && (results = localStorage['rim__'+word]))
						return when(JSON.parse(results));

					results = [];
					return xhr('http://cors-anywhere.herokuapp.com/http://rimlexikon.com/index.php?rim=' + escape(word),
						{
							timeout:25000,
							//handleAs : 'html'
						}
					).then(function(html) {
						if (html.indexOf("Inga ord hittades") !== -1)
							return [];
							
						parser = new DOMParser();
						el = parser.parseFromString(html, "text/html");

						rNode = el.getElementsByClassName('output')[0]; 

											
						var stavelser = 1;
						query('tr', rNode).forEach(function(tr) {
							var s = query('td', tr);
							if (s[1].innerHTML)
								stavelser = s[1].innerHTML * 1;

							results.push({service: 'rim', searchTerm: word, stavelser: stavelser, result: s[2].innerHTML});
						});

						try {
							localStorage['rim__'+word] = JSON.stringify(results);
						} catch(e){}

						return results;

					}, function(error) {
						consolo.log(200);
						throw error;
					});
				}
            });

    });