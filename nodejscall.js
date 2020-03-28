const Parser = require("rss-parser");

EXTERNAL_URL = "https://www.who.int/rss-feeds/news-english.xml";

const parser = new Parser();

// function that filters returns true if item title contains some COVID related term
function filterFun(item) {
  const e = item.title;
  return (
    e.includes("covid") ||
    e.includes("COVID") ||
    e.includes("coronavirus") ||
    e.includes("Coronavirus")
  );
}

// declare and assign function to export, note that I've removed the () at the end, since that transforms it into a function call
const callExternalApiUsingHttp = async () => {
  let feed = await parser.parseURL(EXTERNAL_URL);
  feed["source"]=feed["title"];
  delete feed['title'];
  console.log(feed.source);

  // filter items using the function we wrote up top
  feed.items = feed.items.filter(filterFun);
  return(feed);
};

module.exports.callApi = callExternalApiUsingHttp;
