/**
 * [popup_options description]
 * @param  {[type]} app              Object with popover and modal methods
 * @param  {[type]} $$               DOM manipulating library (JQuery like)
 * @param  {[type]} target_css       CSS selector por input
 * @param  {string} popup_css        CSS selector for popover
 * @param  {function} fetcher_function function(substr:string, limit:int, callback:function)
 * @param  {string} value_key        ID of fetched elements
 * @param  {string} name_key         Shown name of elements
 * @return {[type]}                  [description]
 */
var popup_options = function(app, $$, target_css, popup_css, fetcher_function, value_key, name_key, postselect_callback) {
	// initializes popover

	$$(target_css).on('click', function(e){
		var self = $$(this);
		app.popover(popup_css, self);

		$(popup_css).css({
			top: self.offset().top + self.outerHeight(),
			width: self.outerWidth()
		});

		$$('.modal-overlay').css('display', 'none');
	});

	// reacts to keyup event
	$$(target_css).on('keyup', function(ev){
		var substr = $$(this).val();
		// fetch function
		fetcher_function(substr, 10, function(items){
			var items_html = '';
			items.forEach(function(item){
				items_html += '<li><a class="select-item" href="#" data-value="'+item[value_key]+'">'+item[name_key]+'</a></li>';
			});
			$$(popup_css + ' ul').html(items_html);
			$$('.select-item').on('click', function(ev){
				var input = $$(target_css);
				input.focus();
				app.closeModal(popup_css);
				input.val(ev.target.innerHTML);
				input.data('value', ev.target.dataset.value);

				if (postselect_callback){
					postselect_callback();
				}
			});
		}, function(a,b){debugger;});
	});
}