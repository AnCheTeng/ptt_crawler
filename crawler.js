var request = require('request');
var mongoose = require('mongoose');
var cheerio = require("cheerio");

var Ptt = require('./Ptt');

mongoose.connect('mongodb://localhost/ptt');


var main = (function() {

  // url parameters
  var domain = 'https://www.ptt.cc'
  var board = "/bbs/Tech_Job/";
  var ptt_board = board + "index";
  var html_tail = ".html";

  var check_article_index = board.length;
  var promise_list = [];
  var cnt = 0;

  // First page
  promise_list.push(ParseHTMLhref(domain + ptt_board + html_tail, check_article_index));

  // From index2147 to indexXXXX
  for (var i = 2147; i > 2145; i--) {
    var combined_url = domain + ptt_board + i + html_tail;
    promise_list.push(ParseHTMLhref(combined_url, check_article_index));
  }

  // Wait for all Promises in the promise_list
  Promise.all(promise_list).then(function(values) {

    // console.log(values); // [3, 1337, "foo"]
    var combined_url_list = [];
    values.map((temp_list) => {
      combined_url_list = combined_url_list.concat(temp_list);
    });

    console.log(combined_url_list);

    var timer = setInterval(() => {
      var fetched_url = combined_url_list.shift();
      if (!fetched_url) {

        console.log("Totally " + cnt + " articles.");
        mongoose.disconnect();
        clearInterval(timer);
      } else {
        GetArticle(domain + fetched_url, cnt);
        cnt = cnt + 1;
      }
    }, 1000);

  });
})();


// Parse "href"s in the webpage of parsed_uri
function ParseHTMLhref(parsed_uri, check_article_index) {

  // return a Promise
  return new Promise(function(resolve, reject) {

    // href_list is the list of all "href"s in the webpage of parsed_uri
    var href_list = [];

    request({
      uri: parsed_uri,
    }, function(error, response, body) {

      // body is the parsed_uri's html
      if (error) {
        // ------Reject the promise------
        console.log("Error!");
        reject(Error("It broke"));
      } else {
        var ParseBody = cheerio.load(body);
        // fetch all contents of "<a></a>"
        ParseBody('a').map(function(i, link) {
          var href = ParseBody(link).attr('href');
          var title = ParseBody(link).text();
          if (href) {
            // Here the keyword = "dog"

            // Filt out the article's href
            if (href[check_article_index] == 'M') {
              href_list.push(href);
            }
          }
        });
        // ------Resolve the promise------
        resolve(href_list.reverse());
      }
    });
  });
}


// Get the article from the url
function GetArticle(complete_url, countNum) {
  request.get({
    url: complete_url
  }, (err, response, body) => {
    console.log("Get one article: " + complete_url);
    // Create a document and save the html of the complete_url
    new Ptt({
      article: body,
      url: complete_url,
      count: countNum
    }).save();
  });
}
