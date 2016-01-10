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
					var results=[];
					if (!force && (results = localStorage['synonym__'+word]))
						return when(JSON.parse(results));
					
					results = [];
					return xhr('http://cors-anywhere.herokuapp.com/http://www.synonymer.se/?query='+word+'&SOK=s%C3%B6k',
						{
							timeout:25000,
							//handleAs : 'html'
						}
					).then(function(html) {
						if(html.indexOf("Inga synonymer hittades")!==-1)
							return [];

						parser = new DOMParser();
						el = parser.parseFromString(html, "text/html");

						rNode = el.getElementById('middlebanner'); 

						//var el = construct.create('div', {id:'synResults', innerHTML: rNode.innerHTML},document.body, 'last');
						/*el.style.width = 0;
						el.style.height = 0;
						el.style.overflow = 'hidden';*/

						//document.body.appendChild(el);
						
						query('.boxContent a', rNode).forEach(function(a) {
							if(a.innerHTML.indexOf("Föreslå e")===-1)
								results.push(a.innerHTML);
						});

						construct.destroy(el);

						try {
							localStorage['synonym__'+word] = JSON.stringify(results);
						} catch(e){}

						return results;

					},function(error) {
						console.log(100);
						throw error;
					});
				}
            });

    });