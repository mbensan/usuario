var fake_data = {

	users: {

		fetch: function(substr, limit, cb_success, cb_error) {
			$$.getJSON('mocks/users.json', '',
				function(data, status, xhr){
					var filtered_users = [];
					for (var i=0 ; i<data.length && filtered_users.length < limit; ++i){
						if (data[i].Title.toLowerCase().indexOf(substr.toLowerCase()) > -1){
							filtered_users.push(data[i]);
						}
					}

					cb_success(filtered_users, status);
				},
				function(xhr, status){
					if (cb_error != undefined){
						cb_error(xhr, status);
					}
				}
			);
		},

		get: function(id, cb_success, cb_error) {
			$$.getJSON('mocks/users.json', '',
				function(data, status, xhr) {
					var user = data.find(function(user){
						return user.Id == id;
					});
					if (user) {
						cb_success(user, status);
					} else {
						console.log('User not found');
					}
				},
				function(xhr, status) {
					if (cb_error != undefined){
						cb_error(xhr, status);
					}
				}
			);
		}
	},

	assets: {
		fetch: function(substr, limit, cb_success, cb_error) {
			$$.getJSON('mocks/assets.json', '',
				function(data, status, xhr){
					var filtered_reasons = [];
					for (var i=0 ; i<data.length && filtered_reasons.length < limit; ++i){
						if (data[i].Title.toLowerCase().indexOf(substr.toLowerCase()) > -1){
							filtered_reasons.push(data[i]);
						}
					}

					cb_success(filtered_reasons, status);
				},
				function(xhr, status){
					if (cb_error != undefined){
						cb_error(xhr, status);
					}
				}
			);
		}
	},

	reasons: {
		fetch: function(limit, cb_success, cb_error){
			$$.getJSON('mocks/reasons.json', '',
				function(data, status, xhr) {
					cb_success(data, status);
				},
				function(xhr, status){
					if (cb_error != undefined) {
						cb_error(xhr, status);
					}
				}
			);
		}
	},

	applications: {
		// TODO
		fetch: function(limit, cb_success, cb_error) {
			cb_success([]);
		}
	}

};

// TODO: Set limit for querys
var data = {
	users: {
		fetch: function(substr, limit, cb_success, cb_error) {
			getListItems(getSPSite(),
				'users2',
				"?$select=Id,Rut,Society,user/Id,user/Title,user/EMail,user/JobTitle,user/Department,user/MobilePhone&$expand=user&$filter=(substringof('"+substr+"',user/Title))",
				function(res){
					var filtered_users = [];
					res.d.results.forEach(function(user2){
						filtered_users.push({
							Id: user2.Id,
							Rut: user2.Rut,
							Society: user2.Society,
							EMail: user2.user.EMail,
							MobilePhone: user2.user.MobilePhone,
							Title: user2.user.Title,
							JobTitle: user2.user.JobTitle,
							Department: user2.user.Department
						});
					});
					cb_success(filtered_users);
				},
				function(xhr, status){
					if (cb_error != undefined){
						cb_error(xhr, status);
					}
				}
			);
		},

		get: function(id, cb_success, cb_error) {

			$.ajax({
				url: getSPSite() + "/_api/web/lists/getbytitle('users2')/items(" + id + ")?$select=Id,Rut,Society,user/Id,user/Title,user/EMail,user/JobTitle,user/Department,user/MobilePhone&$expand=user",
				method: "GET",
				headers: { "Accept": "application/json; odata=verbose" },
				success: function (user2) {
					// Returning the results
					cb_success({
						Id: user2.d.Id,
						Rut: user2.d.Rut,
						Society: user2.d.Society,
						EMail: user2.d.user.EMail,
						MobilePhone: user2.d.user.MobilePhone,
						Title: user2.d.user.Title,
						JobTitle: user2.d.user.JobTitle,
						Department: user2.d.user.Department
					});
				},
				function(xhr, status){
					if (cb_error != undefined){
						cb_error(xhr, status);
					}
				}
			});
		}
	},
	assets: {
		fetch: function(substr, limit, cb_success, cb_error) {
			getListItems(getSPSite(), 'assets', "?$select=Id,Title,Brand&$filter=(substringof('"+substr+"',Title))",
				function(data){
					cb_success(data.d.results);
				},
				function(xhr, status){
					if (cb_error != undefined){
						cb_error(xhr, status);
					}
				}
			);
		}
	},
	reasons: {
		fetch: function(limit, cb_success, cb_error) {
			getListItems(getSPSite(), 'reasons', '?$select Id,Title',
				function(data){
					cb_success(data.d.results);
				},
				function(xhr, status){
					if (cb_error != undefined){
						cb_error(xhr, status);
					}
				}
			);
		}
	},

	applications: {
		post: function(form_user, cb_success, cb_error) {
			addListItem(getSPSite(), 'applications',
				{Title: form_user.Title, Rut: form_user.Rut, JobTitle: form_user.JobTitle, MobilePhone: form_user.MobilePhone, Department: form_user.Department, EMail: form_user.EMail, Society: form_user.Society, DeliveryAddress: form_user.DeliveryAddress},
				function(ret) {
					cb_success(ret);
				},
				function(err){
					if (cb_error != undefined){
						cb_error(xhr, status);
					}
				}
			); 
		},

		fetch: function(limit, cb_success, cb_error) {
			getListItems(getSPSite(), 'applications', '?$select=Title,Modified,Rut,Department,Id',
				function(ret){
					cb_success(ret.d.results);
				},
				function(xhr, status){
					if (cb_error != undefined){
						cb_error(xhr, status);
					}
				}
			);
		},

		get: function(id, cb_success, cb_error) {
			getListItem(getSPSite(), 'applications', id,
				function(res) {
					cb_success({
						Title: res.d.Title,
						EMail: res.d.EMail,
						Society: res.d.Society,
						Rut: res.d.Rut,
						Id: res.d.Id,
						JobTitle: res.d.JobTitle,
						MobilePhone: res.d.MobilePhone,
						Department: res.d.Department,
						DeliveryAddress: res.d.DeliveryAddress
					});
				},
				function(xhr, status){
					if (cb_error != undefined){
						cb_error(xhr, status);
					}
				}
			);
		}
	},

	application_assets: {
		post: function(asset, ApplicationId, cb_success, cb_error) {
			addListItem(getSPSite(), 'applicationAssets',
				{Title: localStorage.getItem('user_detail'), AssetId: asset.AssetId, Ammount: asset.Ammount, CostCenterId: asset.CostCenterId, RutReceptor: asset.RutReceptor, ReasonId: asset.ReasonId, ApplicationId: ApplicationId},
				function(data){
					cb_success(data);
				},
				function(err){
					if (cb_error != undefined){
						cb_error(xhr, status);
					}
				}
			);
		},

		from_application: function(applicationId, cb_success, cb_error) {
			getListItems(getSPSite(), 'applicationAssets',
				'?$select=Id,Ammount,RutReceptor,CostCenterId,AssetId,ReasonId,CostCenter/Title,Asset/Title,Reason/Title&$expand=Asset,Reason,CostCenter&$filter=ApplicationId eq ' + applicationId,
				function(res){
					var filtered = [];
					res.d.results.forEach(function(item) {
						filtered.push({
							Id: item.Id,
							Reason: item.Reason.Title,
							CostCenter: item.CostCenter.Title,
							Ammount: item.Ammount,
							Asset: item.Asset.Title,
							RutReceptor: item.RutReceptor
						});
					});
					cb_success(filtered);
				},
				function(err){
					if (cb_error != undefined){
						cb_error(xhr, status);
					}
				}
			);
		}
	},

	cost_centers: {
		fetch: function(limit, cb_success, cb_error) {
			getListItems(getSPSite(), 'costCenters', '?$select Id,Title',
				function(res){
					cb_success(res.d.results);
				},
				function(xhr, status){
					if (cb_error != undefined){
						cb_error(xhr, status);
					}
				}
			);
		}
	}
};

if (document.location.href.indexOf('localhost')>=0) {
	data = fake_data;
}