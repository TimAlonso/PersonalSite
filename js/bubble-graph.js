var baseUrl = "trendyskills.com/service";
var apiKey = "###";

var xhr = new XMLHttpRequest();

var categoryQuery = baseUrl + "q=categories&" + "key=";
var query = baseUrl + "q=status&" + "key=" + apiKey;

xhr.open("GET", query, false);
xhr.send();

function getCategories(query, apiKey) {
	var query = categoryQuery + apiKey;
	xhr.open("GET", query, false);
	var request = xhr.send();

	return categories = JSON.parse(request.responseText);
}