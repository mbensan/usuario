/*var $ = require('jquery');
console.log($('body'));*/
$(document).ready(function(){
	if (document.location.href.indexOf('localhost')<0){
		$.when(
				getContextWebInformation(), 
				getCurrentUserInformation()
		).done(function(){
			;
		})
	}
});
// callbacks for page
var $$ = Dom7;
Template7.registerHelper('ISODate2Human', function(date, options){
	// First we need to check is the passed date argument is function
	if(typeof date == 'function'){
		date = date.call(this);
	}
	return date.split('T')[0];
});


function preprocesor(content, url, next) {
	if (url=='pages/about.html'){
		var template = Template7.compile(content);
		return template({
			message: "Sobre nosotros",
			items: ['item 1', 'el dos', 'drei']
		});
	}
}

var app = new Framework7({
	material: true,
	pushState: true,
	router: true/*,
	preprocess: preprocesor*/
});
var viewMain = app.addView('.view-main');


$$(document).on('page:init', function(e) {
	var page = e.detail.page;
	var cb = callbacks($$, page, viewMain.router);
	cb();
});

$(document).ready(function(ev){
	// hack for initial index page callback
	callbacks($$, viewMain.activePage, viewMain.router)();
});




/*
getListItems(getSPSite(), 'users2', '?$select=user/Id,user/Title,user/EMail&$expand=user',cb,err)
addListItem(getSPSite(), 'Insumos', {Title: 'Nuevo Insumo', descripcion: 'desccc....', cantidad: 4}, cb, err)
*/
function cb(data){console.log(data);}
function err(e){console.log(e.responseText);}