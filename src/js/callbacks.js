// outside library
function fill_form_user(){
	var user_id = $$('#form_user input[name="Title"]').data('value');
	data.users.get(user_id, function(user) {
		var props = ['Rut', 'JobTitle', 'MobilePhone', 'Department', 'EMail', 'Society'];
		props.forEach(function(prop){
			$$('#form_user input[name="'+prop+'"]').focus();
			$$('#form_user input[name="'+prop+'"]').val(user[prop]);
		});
	});
}


var callbacks = function($$, page, router) {
	function validaRut(b){if(b.match(/^([0-9])+\-([kK0-9])+$/)){b=b.split("-");var a=b[0].split(""),c=2,d=0;for(i=a.length-1;0<=i;i--)c=7<c?2:c,d+=parseInt(a[i])*parseInt(c++);a=11-d%11;return(11==a?0:10==a?"k":a)==b[1].toLowerCase()}return!1};
	
	var pages_callbacks = {

		index: function() {
			// load Sucursales
		},

		equipments_detail: function() {
			popup_options(app, $$, '#form_application_asset input[name="Asset"]', '#assets_list', data.assets.fetch, 'Id', 'Title');

			// load reasons in select
			dom.load_reasons_select();

			// load costCenters in select
			dom.load_constCenters_select();

			//  reset custom validator
			$$('#form_application_asset input[name="RutReceptor"]').on('change', function(ev) {
				this.setCustomValidity('');
			});

			// form validator
			$$('#form_application_asset').on('submit', function(ev) {
				ev.preventDefault();
				// form extraction
				var form_values = {};
				for(var i=0; i<this.elements.length; ++i) {
					var elem = this.elements[i];
					if (elem.type == 'select-one'){
						form_values[elem.name] = elem.options[elem.options.selectedIndex].innerText;
						form_values[elem.name+'Id'] = elem.value;
					} else {
						form_values[this.elements[i].name] = this.elements[i].value;
					}
				}
				form_values['AssetId'] = $$('#form_application_asset input[name="Asset"]').data('value');

				// validates Rut
				if (!validaRut(form_values['RutReceptor'])){
					document.getElementsByTagName('input')[3].setCustomValidity('RUT en formato incorrecto');
					return;
				}

				// insert new row in table
				var tAssetRow = Template7.compile($$('#tAssetRow').html());
				$$('#table_assets').css('display', 'block');
				$('#table_assets tbody').append(tAssetRow(form_values));
				// reset form
				this.reset();
			});
			// confirm handler
			$$('a[href="pages/confirm.html"]').on('click', function(ev) {
				ev.preventDefault();
				var rows = $$('#table_assets tbody tr');
				var application_assets = [];

				if (rows.length == 0) {
					// TODO: prevent default
					alert('Sin items listados');
					return;
				}
				// retrieve values from table
				rows.each(function(row) {
					var cells = $$(this).find('td');
					application_assets.push({
						AssetId: cells[0].dataset.assetid,
						Asset: cells[0].innerHTML,
						Ammount: cells[1].innerHTML,
						CostCenter: cells[2].innerHTML,
						CostCenterId: cells[2].dataset.costcenterid,
						RutReceptor: cells[3].innerHTML,
						Reason: cells[4].innerHTML,
						ReasonId: cells[4].dataset.reasonid
					});
				});

				// saves values
				localStorage.setItem('application_assets', JSON.stringify(application_assets));

				router.load({
					url: 'pages/confirm.html'
				});
			});
		},

		user_detail: function() {
			popup_options(app, $$, '#form_user input[name="Title"]', '#users_list', data.users.fetch, 'Id', 'Title', fill_form_user);
			//  reset custom validator
			$$('#form_user input[name="Rut"]').on('change', function(ev) {
				this.setCustomValidity('');
			});
			// validates form
			$$('#form_user').on('submit', function(ev){
				ev.preventDefault();
				// form extraction
				var form_values = {};
				for(var i=0; i<this.elements.length; ++i) {
					form_values[this.elements[i].name] = this.elements[i].value;
				}
				//form_values['Id'] = $$()
				if (!validaRut(form_values['Rut'])){
					document.getElementsByTagName('input')[1].setCustomValidity('RUT en formato incorrecto');
					return;
				}
				localStorage.setItem('user_detail', JSON.stringify(form_values));
				router.load({
					url: 'pages/equipments_detail.html'
				});
			});
		},

		confirm: function() {

			dom.load_summary();

			// send handler
			$$('a[href="index.html"]').on('click', function(ev) {
				ev.preventDefault();
				// loads data
				var user_detail = JSON.parse(localStorage.getItem('user_detail'));
				var application_assets = JSON.parse(localStorage.getItem('application_assets'));

				data.applications.post(user_detail, function(resp){
					application_assets.forEach(function(asset) {
						data.application_assets.post(asset, resp.d.Id, function(d){});
					});		
					// loads index
					router.load({
						url: 'index.html'
					});
				});
			});
		},

		summary: function(){
			dom.load_summary();
		}
	};
	return pages_callbacks[page.name] || function(){console.log('No callback defined')};
};