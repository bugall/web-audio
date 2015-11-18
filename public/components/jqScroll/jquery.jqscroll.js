/*!
 _        _         _            
| \      (_)       | |           
| |       _  ____  | |  _   ___  
| |      | ||  _ \ | |_/ ) / _ \ 
| |_____ | || | | ||  _ ( | (_) |
\_______)|_||_| |_||_| \_) \___/ 
                                      

 * jqScroll v1.6.3
 * jQuery Plugin for Infinite Scrolling 
 *
 * http://ddmweb.it/
 * Licensed under the MIT license
 *
 * @author Davide Di Modica
 * @requires jQuery v1.4.3+
 
*/


//dichiaro la variabile globale per le opzioni
window.jqScroll = {};
window.jqScroll.opts = {};
(function($){

	//start plugin
	$.fn.jqScroll = function(options) {
		//aggiorno le opzioni
		var opts = $.extend($.fn.jqScroll.defaults, options);  
		var target = opts.scrollTarget;
		if (target == null){
			target = $(window); 
		}
		opts.scrollTarget = target;

		window.jqScroll.opts = opts;
		
		if (opts.loading != null && opts.firstLoad){
			opts.loading();
		}

		//associo il plugin ad ogni elemento corrispondente al selettore
		return this.each(function() {
			$.fn.jqScroll.init($(this), opts);
		});
	};

	//disabilito il plugin
	$.fn.jqScrollStopScroll = function(){
		return this.each(function() {
			$(this).attr('jqScroll', 'disabled');
		});
	};

	//riavvio il plugin
	$.fn.jqScrollRestartScroll = function(){
		return this.each(function() {
			$(this).attr('jqScroll', 'enabled');
			$.fn.jqScroll.init($(this), window.jqScroll.opts);
		});
	};

	//riabilito il plugin
	$.fn.jqScrollRestoreScroll = function(){
		return this.each(function() {
			$(this).attr('jqScroll', 'enabled');
		});
	};

	// fade-in per i nuovi elementi
	$.fn.jqScrollfadeInWithDelay = function(){
		var delay = 0;
		return this.each(function(){
			$(this).delay(delay).animate({opacity:1}, 400);
			delay += 200;
		});
	};

	//carico i contenuti
	$.fn.jqScroll.loadContent = function(obj, opts){
		if ($(obj).attr('jqScroll') == 'enabled'){
			var target = opts.scrollTarget;
			//verifico se sono arrivato a fondo pagina più eventuale offset
			var mayLoadContent = $(target).scrollTop()+opts.heightOffset >= $(document).height() - $(target).height();
			if (mayLoadContent){
				if (opts.beforeLoad != null){
					opts.beforeLoad(); 
				}
				$(obj).children().attr('rel', 'loaded');


				if (opts.loading != null){
					opts.loading();
					//restituisco i nuovi elementi
					var objectsRendered = $(obj).children('[rel!=loaded]');
					if (opts.afterLoad != null){
						opts.afterLoad(objectsRendered);	
					}
				}else{// qui posso avviare una funzione predefinita ajax
					$.ajax({
						type: opts.typeRequest,
						url: opts.contentPage,
						data: opts.contentData,
						dataType: opts.dataType,
						success: function(data){
							if (opts.ajaxCallback != null){
								opts.ajaxCallback(data);	
							}else{
								$(obj).append(data); 							
							}
							var objectsRendered = $(obj).children('[rel!=loaded]');

							if (opts.afterLoad != null){
								opts.afterLoad(objectsRendered);	
							}
						}
					});				
				}
				
				if(opts.persistentLoad){
					//aggiungo elementi fino a riempire tutto l'elemento contenitore, 
					//così da poter riabilitare lo scroll 
					while($(target).scrollTop()+opts.heightOffset > $(document).height() - $(target).height() && $(obj).attr('jqScroll') == 'enabled'){
						$.fn.jqScroll.loadContent(obj, opts);
					}
				}else{
					if (opts.lastCheckScroll){
						$.fn.jqScroll.loadContent(obj, opts);
					}
				}
			}
		}
	};

	//ascolto l'evento scroll e carico i contenuti
	$.fn.jqScroll.init = function(obj, opts){
		console.log(opts);
		var target = opts.scrollTarget;
		$(obj).attr('jqScroll', 'enabled');

		//leggo evento scroll
		$(target).scroll(function(event){
			if ($(obj).attr('jqScroll') == 'enabled'){
				console.log('scroll');	
				$.fn.jqScroll.loadContent(obj, opts);	
			}
			else {
				event.stopPropagation();	
			}
		});

		//leggo evento resize
		$(target).resize(function(event){
			if ($(obj).attr('jqScroll') == 'enabled'){
				console.log('resize');	
				$.fn.jqScroll.loadContent(obj, opts);	
			}
			else {
				event.stopPropagation();	
			}
		});

		//while($(target).scrollTop()+opts.heightOffset > $(document).height() - $(target).height()){
			if (opts.firstLoad){
				$.fn.jqScroll.loadContent(obj, opts);
			}
		//}
	};

	//opzioni di default
	$.fn.jqScroll.defaults = {
		'contentPage' : null,//url per funzione ajax predefinita, es: http://miosito.com/page.php
		'contentData' : {},//parametri da inviare all'url, es: {'key1': val1, 'key2': val2}
		'typeRequest': null,//tipo di richiesta, es: POST, GET, PUT, DELETE
		'dataType': null,//tipo di dato in ascolto, es: json
		'beforeLoad': null,//funzione prima del caricamento
		'loading': null,//funzione per il caricamento (se è valida non viene eseguita la funzione ajax predefinita)
		'afterLoad': null,//funzione dopo il caricamento (alla quale vengono restituiti i nuovi elementi)
		'ajaxCallback': null,//callback della funzione ajax predefinita
		'scrollTarget': null,//elemento per il quale si deve ascoltare l'evento scroll
		'heightOffset': 0,//(integer) serve a caricare gli elementi prima di arrivare a fondo pagina, es: 200, $('#footer').height()		  
		'firstLoad': true,//viene effettuato un primo caricamento a priori
		'persistentLoad': false,//viene finchè non si ottiene lo scroll
		'lastCheckScroll': false//viene effettuato un singolo controllo al termine del caricamento degli elementi
	};	
})( jQuery );
