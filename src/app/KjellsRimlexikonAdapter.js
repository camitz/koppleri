define([
        "dojo/_base/declare",
        "dojo/_base/array",
        "dojo/on",
        "dojo/_base/lang",
        "dojo/keys",
        "dojo/_base/event",
        "dojo/request/xhr",
        "dojo/query",
		"dojo/io-query",
		"dojo/_base/window",
		'dojo/dom-construct',
		'dojo/when',
		"dojo/NodeList-traverse"
    ], function (declare, array, on, lang, keys, event, xhr, query, ioQuery, win, construct, when) {

		return declare([],
            {
				
				search: function(word, opt, force ) {
					var results=[];
					
					delete opt.gradera;

					var key = lang.mixin({
								ord:word,
								fonetiskt:1,
								vokalsort:1,
								minimalord:1,
								forwardmatch:0,
								exclude:0,
								maxlength:null
							}, opt);

					if (!force && (results = localStorage[JSON.stringify(key)]))
						return when(JSON.parse(results));

					results=[];

					return xhr.post('http://cors-anywhere.herokuapp.com/http://kjell.haxx.se/rimlexikon/',
						{
							timeout:25000,
							data: ioQuery.objectToQuery(lang.mixin({
								ord:word,
								fonetiskt:1,
								vokalsort:1,
								minimalord:1,
								forwardmatch:0,
								exclude:0,
								maxlength:null,
								action:"Sök efter rimord",
								".cgifields": ["exclude","minimalord","vokalsort","alfabetiskt","forwardmatch","fonetiskt"]
							}, opt)).replace('%C2%A4','%A4').replace('%C3%B6','%F6').replace('%C3%A5','%E5').replace('%C3%A4','%E4')
						}
					).then(function(html) {
						parser = new DOMParser();
						el = parser.parseFromString(html, "text/html");

						tblNode = el.getElementsByTagName('table')[0]; 
						if(!tblNode)					
							return [];
							
						var vokaler = 1, level = 0;
						query('td', tblNode).forEach(function(td) {
							array.forEach(td.innerHTML.split("<br>"), function(s) {
								if (s.indexOf('Nivå')!=-1)
									level++;
							});
						});

						query('td', tblNode).forEach(function(td) {
							array.forEach(td.innerHTML.split("<br>"), function(s) {
								if (s.indexOf('Nivå')!=-1)
									level--;
								else if (s.indexOf('Vokaler')==-1)
									results.push({service: 'kjell', searchTerm: word, stavelser: vokaler, level: level, result: s.trim()});
							});
							vokaler++;
						});
						
						try {
							localStorage[JSON.stringify(key)] = JSON.stringify(results);
						} catch(e){}

						return results;

					});
				}
            });

    });