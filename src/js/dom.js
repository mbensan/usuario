/**
 * DOM manipulation object
 */
var dom = (function(){
	/* loads a select html with options retrieved from a fetcher function defined in data obj */
	function load_select_options(fetcher_func, select_css){
		fetcher_func(20, function(items) {
			var options_html = '';
			items.forEach(function(item) {
				options_html += '<option value="'+item.Id+'">'+item.Title+'</option>';
			});
			$$(select_css).html(options_html);
		});
	}

	return {
		load_applications_template: function(applications) {
			var tApplications = Template7.compile($$('#tApplications').html());
			$$('#applications').html(tApplications({applications: applications}));
		},
		load_reasons_select: function(){
			load_select_options(data.reasons.fetch, '#form_application_asset select[name="Reason"]');
		},
		load_costCenters_select: function(){
			load_select_options(data.cost_centers.fetch, '#form_application_asset select[name="CostCenter"]');
		},

		load_summary: function(){
			// loads data
				var user_detail = JSON.parse(localStorage.getItem('user_detail'));
				var application_assets = JSON.parse(localStorage.getItem('application_assets'));

				var tSummaryRow = Template7.compile($$('#tSummaryRow').html());
				$$('#summaryRowContainer').html(tSummaryRow(user_detail));

				var tSummaryApplicationAssets = Template7.compile($$('#tSummaryApplicationAssets').html());
				$$('#summaryApplicationAssets').html(tSummaryApplicationAssets({assets: application_assets}));
		}

	};
})();