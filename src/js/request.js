/*!
 * Sharepoint Request v3.12
 * Copyright 2017, Envision (@gobudan)
 * License: 
 */

var __CURRENTUSER;
var __REQUESTDIGEST;

// Get SharePoint current site
function getSPSite(){
    siteUrl = (document.location.href).split('front/')[0];
    return siteUrl;
}

// Get SharePoint Tenant Domain
function getSPDomain(){
    SPUrl = document.location.origin;
    return SPUrl;
}

// Get SharePoint DIGEST value
function getContextWebInformation(){
    return $.ajax({
        url: getSPSite() + "_api/contextinfo",
        method: "POST",
        headers: {
            "ACCEPT": "application/json;odata=verbose",
            "content-type": "application/json;odata=verbose"
        },
        success: function (data) {
            __REQUESTDIGEST = data.d.GetContextWebInformation.FormDigestValue;
        },
        error: function(response, errorCode, errorMessage){
            console.log("Could not complete list permission call: " + errorMessage);
        }
    })
}

// Get SharePoint current user Id
function getUserId(url, complete, failure){
	// Getting our list items
	$.ajax({
		url: url + "_api/Web/CurrentUser?$select=Id",
		method: "GET",
		headers: { "Accept": "application/json; odata=verbose" },
		success: function (data) {
			// Returning the results
			complete(data);
		},
		error: function (data) {
			failure(data);
		}
	});
}

// Get SharePoint current user information
function getCurrentUserInformation(){
    var deferred = $.Deferred();

    function getUserInfo(id){
        $.ajax({
            url: getSPSite() + "/_api/Web/SiteUserInfoList/Items(" + id + ")?$select=*,Picture",
            method: "GET",
            headers: {
                "ACCEPT": "application/json;odata=verbose",
                "content-type": "application/json;odata=verbose"
            },
            success: function (data) {
                __CURRENTUSER = data.d;
                deferred.resolve();
            },
            error: function(response, errorCode, errorMessage){
                console.log("Could not complete list permission call: " + errorMessage);
            }
        })
    }

    // complete function
    var complete = function(data){
        getUserInfo(data.d.Id);
    }

    // failure function
    var failure = function(response, errorCode, errorMessage){
        console.log("Could not complete list permission call: " + errorMessage);
    }

    getUserId(getSPSite(), complete, failure);

    return deferred.promise();
}

// Getting the item type for the list
function getListItemType(name) {
    return "SP.Data." + name[0].toUpperCase() + name.substring(1) + "ListItem";
}

// Getting the item type for a library
function getDocumentItemType(name) {
    return "SP.Data." + SPEncode(name[0].toUpperCase() + name.substring(1)) + "Item";;
}

// Getting list item based on ODATA Query
function getListItem(url, listname, id, complete, failure) {
	// Getting our list items
	$.ajax({
		url: url + "/_api/web/lists/getbytitle('" + listname + "')/items(" + id + ")",
		method: "GET",
		headers: { "Accept": "application/json; odata=verbose" },
		success: function (data) {
			// Returning the results
			complete(data);
		},
		error: function (data) {
			failure(data);
		}
	});
}


// Getting list items based on ODATA Query
function getListItems(url, listname, query, complete, failure) {
    // Executing our items via an ajax request
    $.ajax({
        url: url + "/_api/web/lists/getbytitle('" + listname + "')/items" + query,
        method: "GET",
        headers: { "Accept": "application/json; odata=verbose" },
        success: function (data) {
            complete(data); // Returns JSON collection of the results
        },
        error: function (data) {
            failure(data);
        }
    });
}

// Getting list fields based on ODATA Query
function getListFields(url, listname, query, complete, failure) {
    // Executing our items via an ajax request
    $.ajax({
        url: url + "/_api/web/lists/getbytitle('" + listname + "')//fields" + query,
        method: "GET",
        headers: { "Accept": "application/json; odata=verbose" },
        success: function (data) {
            complete(data); // Returns JSON collection of the results
        },
        error: function (data) {
            failure(data);
        }
    });
}

// Adding a list item with the metadata provided
function addListItem(url, listname, metadata, success, failure) {
    // Prepping our update
    var item = $.extend({
        "__metadata": { "type": getListItemType(listname)}
    }, metadata);

    // Executing our add
    $.ajax({
        url: url + "/_api/web/lists/getbytitle('" + listname + "')/items",
        type: "POST",
        contentType: "application/json;odata=verbose",
        data: JSON.stringify(item),
        headers: {
            "Accept": "application/json;odata=verbose",
            "X-RequestDigest": __REQUESTDIGEST
        },
        success: function (data) {
            success(data); // Returns the newly created list item information
        },
        error: function (data) {
            failure(data);
        }
    });
}

// Update a List Item based on the ID
function updateListItem(url, listname, id, metadata, success, failure) {
    // Prepping our update
    var item = $.extend({
        "__metadata": { "type": getListItemType(listname) }
    }, metadata);

    getListItem(url, listname, id, function (data) {
        console.log(data);
        $.ajax({
            url: data.d.__metadata.uri,
            type: "POST",
            contentType: "application/json;odata=verbose",
            data: JSON.stringify(item),
            headers: {
                "Accept": "application/json;odata=verbose",
                "X-RequestDigest": __REQUESTDIGEST,
                "X-HTTP-Method": "MERGE",
                "If-Match": data.d.__metadata.etag
            },
            success: function (data) {
                success(id);
            },
            error: function (data) {
                failure(id);
            }
        });

    }, function (data) {
        failure(data);
    });
}

// Upload a Document Item 
function uploadDocument(serverRelativeUrl, buffer, fileName, success, failure, overview) {
    function getEndpoint() {
        return getSPSite() + "_api/web/getFolderByServerRelativeUrl('" + serverRelativeUrl + "')/Files/add(url='" + fileName + "', overwrite=" + overview + ")?$expand=ListItemAllFields";
    }
    return $.ajax({
        url: getEndpoint(),
        type: "POST",
        data: buffer,
        processData: false,
        headers: {
            Accept: "application/json;odata=verbose",
            "X-RequestDigest": __REQUESTDIGEST,
        },
        success: success,
        failure: failure
    })
}

// Update a Document Item based on the ID
function updateDocumentItem(url, library, id, metadata, success, failure) {
    var item = $.extend({
        "__metadata": { "type": getDocumentItemType(library) }
    }, metadata);

    getListItem(url, library, id, function (data) {
        $.ajax({
            url: data.d.__metadata.uri,
            type: "POST",
            contentType: "application/json;odata=verbose",
            data: JSON.stringify(item),
            headers: {
                "Accept": "application/json;odata=verbose",
                "X-RequestDigest": __REQUESTDIGEST,
                "X-HTTP-Method": "MERGE",
                "If-Match": data.d.__metadata.etag
            },
            success: function (response) {
                success(response);
            },
            error: function (response) {
                failure(response);
            }
        });
    }, function (data) {
        failure(data);
    });
}

// Deleting a List Item based on the ID
function deleteListItem(url, listname, id, success, failure) {
    // getting our item to delete, then executing a delete once it's been returned
    getListItem(url, listname, id, function (data) {
        $.ajax({
            url: data.d.__metadata.uri,
            type: "POST",
            headers: {
                "Accept": "application/json;odata=verbose",
                "X-Http-Method": "DELETE",
                "X-RequestDigest": __REQUESTDIGEST,
                "If-Match": data.d.__metadata.etag
            },
            success: success,
            error: failure
        });
    });
};

/* Función capaz de codificar strings hacia el tipo de Unicode que utiliza SHarepoint en los nombres
de sus columnas. Se agregan aparte ciertos carácteres que no cubre la función "escape" */
function SPEncode(toEncode){
	var charToEncode = toEncode.split('');
	var encodedString = "";

	for(i = 0; i < charToEncode.length; i++) {
		encodedChar = escape(charToEncode[i]).replace(/\-/g, "%2D").replace(/\_/g, "%5F").replace(/\./g, "%2E").replace(/\*/g, "%2A").replace(/\//g, "%2F");
		if(encodedChar.length == 3){
			encodedString += encodedChar.replace("%", "_x00").toLowerCase() + "_";
		} else if(encodedChar.length == 5){
			encodedString += encodedChar.replace("%u", "_x").toLowerCase() + "_";
		} else {
			encodedString += encodedChar;
		}
	}
	return encodedString;
}


///////////////////////////////////////
/*module.exports = {
    getSPSite: getSPSite,
    getSPDomain: getSPDomain,
    getContextWebInformation: getContextWebInformation,
    getUserId: getUserId,
    getCurrentUserInformation: getCurrentUserInformation,
    getListItemType: getListItemType,
    getDocumentItemType: getDocumentItemType,
    getListItem: getListItem,
    getListItems: getListItems,
    getListFields: getListFields,
    addListItem: addListItem,
    updateListItem: updateListItem,
    uploadDocument: uploadDocument,
    updateDocumentItem: updateDocumentItem,
    deleteListItem: deleteListItem,
    SPEncode: SPEncode
}*/

