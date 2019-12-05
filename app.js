const url = "https://news.ycombinator.com/";
const https = require('https');

parseElement = (ele)=>{
  let newsData = {};
  let title = ele.match(/\"storylink\">(.*?)<\/a><span/g);
  if(title!=null){
    newsData.title = title[0].replace('"storylink\">','').replace('</a><span','');
    let author = ele.match(/\"hnuser\">(.*?)<\/a>/g);
    newsData.author = author[0].replace('"hnuser">','').replace('</a>','');
    let comments = ele.match(/hide<\/a> | <a href=\"(.*?)\">(.*?)&nbsp;comments<\/a>/g);
    comments = comments[0].replace('&nbsp;comments</a>','')
    newsData.comments = comments.substr(comments.lastIndexOf(">")+1,5);
    let authorLink = ele.match(/by <a href=\"(.*?)" class=\"hnuser\">/g);
    newsData.authorLink = authorLink[0].replace('by <a href="','').replace('" class="hnuser">','');
    return newsData;
  }
  return false;
};

getKarma = (authorLink)=>{
  return new Promise((resolve, reject)=>{
    getData(url+authorLink)
    .then(res => {
      if(res.length > 0 && res != null){
        let raw = res.replace(/>\s+</g,'><').replace(/(\r\n|\n|\r)/gm,'').replace('              ','').replace('          ','');
        let karma = raw.match(/karma:<\/td><td>(.*?)<\/td>/g);
        return karma[0].replace('karma:</td><td>','').replace('</td>','')
      }
      else{
        return 'Blank Page';
      }
    }); 
  })
}

getNewsListContent = (data)=>{
  return new Promise((resolve, reject)=>{
    let result = [];
    let items = data.split('<table border="0" cellpadding="0" cellspacing="0" class="itemlist">')[1];
    items = items.split('</table>')[0];
    items = items.split('<tr class="spacer" style="height:5px"></tr>');
    items.forEach(item =>{
      let details = parseElement(item);
      if(details){
        result.push(details);
      }
    });
    resolve(result);
  });
}

getData = (url)=>{
  console.log(url);
  return new Promise((resolve, reject)=>{
    https.get(url, (resp) => {
      let data = '';
      resp.on('data', (chunk) => {
        data += chunk;
      });

      resp.on('end', () => {
        resolve(data);
      });

    }).on("error", (err) => {
      console.log("Error: " + err.message);
      reject(err.message);
    });
  });
}

getData(url)
  .then(res =>{
   return getNewsListContent(res);
  })
  .then(news =>{
    console.log(news)
      let i = 0;
      //site has some limit, it does not respond to too many requests quickly
      waitloop = ()=>{
        getKarma(news[i].authorLink)
        setTimeout(()=>{
          i++;
          if(i < news.length){
            waitloop();
          }
        },1000);
      }
      waitloop();
      console.log(news);
  });
