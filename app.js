const url = "https://news.ycombinator.com/";
const https = require('https');

parseElement = (ele)=>{
    let title = ele.match(/\"storylink\">(.*?)<\/a><span/g);
    title = title[0].replace('"storylink\">','').replace('</a><span','');
    console.log(title);
};

https.get(url, (resp) => {
  let data = '';

  // A chunk of data has been recieved.
  resp.on('data', (chunk) => {
    data += chunk;
  });

  resp.on('end', () => {
    console.log(data);
    let items = data.split('<table border="0" cellpadding="0" cellspacing="0" class="itemlist">')[1];
    items = items.split('</table>')[0];
    items = items.split('<tr class="spacer" style="height:5px"></tr>');
    parseElement(items[0]);
    //console.log(items);
  });

}).on("error", (err) => {
  console.log("Error: " + err.message);
});

