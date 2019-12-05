const url = "https://news.ycombinator.com/";
const express = require('express');
const app = express();
const { getData, getNewsListContent, getKarma, sortByComments, sortByKarma } = require('./crawler');
let finalResults = [];

getData(url)
  .then(res =>{
   return getNewsListContent(res);
  })
  .then(news =>{
    console.log(news)
      let i = 0;
      //site has some limit, it does not respond to too many requests quickly
      return new Promise((resolve,reject)=>{
        waitloop = ()=>{
          getKarma(url+news[i].authorLink).then(l => {news[i].karma = l});
          setTimeout(()=>{
            i++;
            if(i < news.length){
              waitloop();
            }
            else{
              resolve(news);
            }
          },1000);
        }
        waitloop();
      });
  })
  .then(final=>{finalResults=final});

app.get('/sort_by_comments',(req,res)=>{
  res.json(sortByComments(finalResults));
});

app.get('/get_top_rated_author',(req,res)=>{
  res.json(sortByKarma(finalResults));
});

app.listen(3000);