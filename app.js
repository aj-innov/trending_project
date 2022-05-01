const express=require('express');
const app=express();
const path=require('path');
const bodyParser= require('body-parser');
const axios = require('axios');
const mongoose= require('mongoose');
require('./models/publish');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(require('express-session')({
    secret: 'Trends',
    resave: true,
    saveUninitialized: true
}));
var cors = require('cors');
app.use(cors());

const superagent = require('superagent');
const request = require('request');
const NewsAPI = require('newsapi');
const newsapi = new NewsAPI('ea2c16b4e6194dda98e9b0875015300b');
// const { response } = require('express');

app.set('views',path.join(__dirname,'views'));
app.use(express.static(path.join(__dirname,'public')));
app.set('view engine','ejs');;
app.use(express.json());
app.use(bodyParser.json());
const uri="mongodb+srv://divyansh:divyansh@cluster0.ur2oc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
var code='IN';
var country="India";
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
const Publishes= mongoose.model('publishes');


app.get('/',(req,res)=>{
    res.render('landing');
});

app.get('/home',async(req,res)=>{
    res.render('home');
});

app.get('/board',(req,res)=>{
    res.render('board',{code:code,country:country});
});
app.get('/stories',async (req,res)=>{
    await newsapi.v2.topHeadlines({
        country:`${code}`,
        pageSize:100,
      }).then(response => {
        if(response.status == 'ok'){
            // res.json(response);
            res.render('stories',{posts:response});
        }
        else{
            res.render('error');
        }
        
      });
});

app.get('/movie',(req,res)=>{
    superagent
    .get('https://api.themoviedb.org/3/movie/now_playing')
    .query({ api_key: 'e94a138f48d20ab0284394c71999aaf4', region: `${code}` }) // query string
    .end((err, response) => {
      // Do something
      console.log(response)
      if(response.status==200){
        var data=JSON.parse(response.text);
        // console.log(data);
        res.render('movie',{data:data});
      }
      else{
          res.render('error');
      }
    });
    // res.render('movie');
    
})

app.get('/createPost',(req,res)=>{
    res.render('createPost');
})
app.post('/createPost',async (req,res)=>{
    var j={author:`${req.body.author}`,title:`${req.body.title}`,tags:`${req.body.tags}`,
    description:`${req.body.description}`,content:`${req.body.content}`,dating:`${req.body.dating}`,
    imgurl:`${req.body.imgurl}`};

j.content=j.content.replace(/\r\n/g,'<br>');
j.content=j.content.replace(/\t/g,'   ');
let publishes=await new Publishes({});
publishes.author=j.author;
publishes.title=j.title;
publishes.tags=j.tags;
publishes.description=j.description;
publishes.content=j.content;
publishes.dating=j.dating;
publishes.imgurl= j.imgurl || "https://picsum.photos/600/400";
let purl="/postview/?author="+j.author+"&title="+j.title;
publishes.postUrl=purl;
await publishes.save();
res.redirect('/blogs');
});
app.get('/blogs',async (req,res)=>{
    let articles=await Publishes.find({flag:1});
    res.render('blogs',{articles:articles});
})
app.get('/postview',async (req,res)=>{
    let author=req.query.author;
    let postTitle=req.query.title;
    let article=await Publishes.findOne({author:author,title:postTitle});
    res.render('postview',{blog:article});
});



app.get('/error',(req,res)=>{
    res.render('error');
});

app.listen(5000,()=>{
    console.log("server started at 5000");
});