const Parser = require("rss-parser");

let EXTERNAL_URL = "https://www.who.int/rss-feeds/news-english.xml";

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

function mapFunc(item) {
  let splitItems = item.link.split("/")[5];
  splitItems = splitItems.split("-");
  const dateStr = splitItems[2] + "-" + splitItems[1] + "-" + splitItems[0];
  const date = new Date(dateStr);
  item.isoDate = date;
  return item;
}

function swap(item){
  item.content = item.content.replace(/\&nbsp;/g, " ");
  item.contentSnippet = item.contentSnippet.replace(/\&nbsp;/g, " ");
  return item;
}

// declare and assign function to export, note that I've removed the () at the end, since that transforms it into a function call
const callExternalApiUsingHttp = async () => {
  let feed = await parser.parseURL(EXTERNAL_URL);
  feed["source"] = feed["title"];
  delete feed["title"];

  // filter items using the function we wrote up top
  feed.items = feed.items.filter(filterFun);
  feed.items = feed.items.map(mapFunc);
  feed.items.sort((a, b) => {
    return new Date(b.isoDate) - new Date(a.isoDate);
  });
  feed.items = feed.items.map(swap);
  return feed;
};

module.exports.callApi = callExternalApiUsingHttp;
