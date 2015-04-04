// Retrieve content from the API
// Parse content into JSON
// Retrieve relevant data from JSON objects

// Sample Query for retrieving java and c# keyword and occurances from specific date
// trendyskills.com/service?q=keywordDate&keyID[]=915&keyID[]=691&dateFrom=2013/02/17&dateTo=2013/02/24&key=###

// This query will only retrieve languages (as opposed to all sort of skills) and count the occurances of these languages. I may have to select the top 10 (if possible) and render these depending on the size.

// Get all of the keywords available. This is a massive list. Data represented is the id and keyname.

// Use KeywordDate to display all of the keywords's occurances within a date. Current and the last year.

var baseUrl = "trendyskills.com/service";
var apiKey = "###";

var xhr = new XMLHttpRequest();

var query = baseUrl + "?q=keywords&key=" + apiKey;

xhr.open("GET", query, false);
xhr.send();

var keywords = JSON.parse(request.responseText);

console.log("Test");

// Can't test locally. I don't want to push with my api key.
// Trying to create a website in IIS locally so that I can test this Javascript.