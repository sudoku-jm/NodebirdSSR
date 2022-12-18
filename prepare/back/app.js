const express = require('express');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');
const hpp = require('hpp');
const helmet = require('helmet');

const postRouter = require('./routes/post');  //게시글 1개만
const postsRuter = require('./routes/posts'); //여러 게시글
const userRouter = require('./routes/user'); 
const hashtagRouter = require('./routes/hashtag'); 
const db = require('./models'); // model > index.js 에서 등록된 db를 들고온다.
const passportConfig = require('./passport'); //passport > index.js 등록

// env 파일 연결 들고오기
dotenv.config();

const app = express(); //호출을 한 번 해야한다.
//model > index.js 에서 등록한 db를 sync() 메소드를 통해 연결.
db.sequelize.sync().then(() => {
    // force: true ,
    console.log('db 연결 성공');
  })
  .catch(console.error);

//패스포트 연결
passportConfig();
if(process.env.NODE_ENV === 'production'){
  app.use(morgan('combined')); 
  app.use(hpp());
  app.use(helmet());
}else{
  app.use(morgan('dev')); //front -> back 요청 시 어디 api로 요청했는지 디버깅 용이.
}


//credential true가 되어야 쿠키도 같이 전달이 된다.
// origin : '*',
// origin : true,
app.use(cors({
  origin : ['http://localhost:3060', 'http://sudoku.pe.kr','http://13.125.249.212'],
  credentials : true, 
})); 


//upload 폴더를 프론트에도 제공할 수 있도록 한다
/*
노드에서는 path.join() 를 쓴다.
window에서는 / 를 쓰지만 MAC이나 리눅스에서는 \를 쓰는 경우가 있다.
운영체제에 대한 차이점으로 인해 문제가 생길 수 있다. 이를 운영체제에 맞에 알아서 해준다.

localhost:5500/images
*/
app.use('/images', express.static(path.join(__dirname,'uploads')));

//front -> back으로보낼 때 json과 url인코디드로만 받고있다. 멀티파트데이터를 받을 수 없다.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));

//세션
app.use(session({
  saveUninitialized: false,
  resave: false,
  secret: process.env.COOKIE_SECRET,
}));
app.use(passport.initialize());
app.use(passport.session());



app.get('/',(req, res) => {
  res.send('hello express');
});


// app.get('/posts',(req, res) => {
//   //json 객체로 응답
//   res.json([
//     { id : 1, content: 'hello' },
//     { id : 2, content: 'hello' },
//     { id : 3, content: 'hello' },
//   ]);
// });

//==================라우터 분리===========

app.use('/posts',postsRuter); 
//게시글 작성
app.use('/post',postRouter); 

//유저정보, 회원가입
app.use('/user',userRouter); 

//해시태그 라우터
app.use('/hashtag',hashtagRouter); 

//에러처리 미들웨어는 마지막으로 들어감. 직접 작성해줄 수 있다.
// app.use((err, req, res, next) => {

// });

app.listen(80, () => {
  console.log('서버 실행 중~!~!~!');
});