const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const fs = require('fs'); //uploads라는 폴더를 만들어도 되지만 알아서 만들어주는 파일시스템 모듈.
const {Post, Image, User, Hashtag, Comment} = require("../models");
const {isLoggedIn} = require('./middlewares');

try{
  fs.accessSync('uploads');
}catch(error){
  console.log('uploads 폴더가 없으므로 생성합니다.');
  fs.mkdirSync('uploads');
}

//upload multer
const upload = multer({
  storage : multer.diskStorage({
    destination(req, file, done){
      done(null, 'uploads');  //uploads라는 폴더에 업로드.
    },
    filename(req, file, done){
      //path 라는 모듈을 통해 파일 정보 추출.
      const ext = path.extname(file.originalname);  //확장자 추출 (png)
      const basename  = path.basename(file.originalname, ext);  //제로초.png
      done(null, basename + '_' + new Date().getTime() + ext); //제로초_125751634.png 
    }
  }),
  //limits 파일 업로드 사이즈 제한
  limits : {fileSize : 20 * 1024 * 1024}, //20MB
});


//post 작성
router.post('/', isLoggedIn, upload.none(), async (req, res, next) => { // POST /post
  try{
    const hashtags = req.body.content.match(/#[^\s#]+/g);  //해시태그 찾는 정규표현식
    const post = await Post.create({
      content : req.body.content,
      UserId: req.user.id, //로그인 시 라우터에 serializeUser를 통해 user.id를 들고 있다.(passport참고) 그래서 req.user에 접근이 가능하다.
    });

    if(hashtags){
      //Hashtag 테이블에 내용 추가. 검색되는건 똑같이 하기 위해 소문자로 저장.
      const result = await Promise.all( 
        hashtags.map((tag) => 
          // Hashtag.create({ name : tag.slice(1).toLowerCase() }) 이렇게 저장하면 중복저장된다.
          Hashtag.findOrCreate(
            { where : { name : tag.slice(1).toLowerCase() } }
          )   //중복안하고 저장
          //findOrCreate : where로 검색 후 저장. 없을때만 등록 있으면 가져옴.
        )
      );
      
      // [ [#노드, true], [#리액트, true] ]  findOrCreate모양이 이런식으로 저장되므로 아래와 같이 addHashtags해준다. 배열에서 0번째것만 저장.
      await post.addHashtags(result.map((v) => v[0]));
    }

    //이미지 추가
    if(req.body.image){
      if(Array.isArray(req.body.image)){  //이미지를 여러 개 올리면 image : [제로초.png, 부기초.png]
        // Promise.all을 여러개를 병렬로 비동기 함수 실행.
        // await Promise.all([display(3000), display(2000), display(1000)])
        const images = await Promise.all(req.body.image.map((image) => Image.create({src : image}))); //시퀄라이즈로 올려준다. DB에는 파일 주소만 올려놓음.
        await post.addImages(images);   //const post 만들어 놓은곳에 추가 된다.
      }else{ // 이미지를 하나만 올리면 image : 제로초.png
          const image = await Image.create({src : req.body.image });
          await post.addImages(image);
          /*
            create 시 id를 직접 넣은 경우는 addX...를 안해도 되는데, id를 안 넣은 경우는 addX...를 해야 된다.그래야 연결 됨. 댓글 comment에서는 postId를 직접 넣음.
          */
      }
    }

    const fullPost = await Post.findOne({
      where : { id : post.id },
      include : [{
        model : Image,
      },{
        model : Comment,
        include : [{
          model : User,
          attributes : ['id', 'nickname'],
        }],
      },{
        model : User,
        attributes : ['id', 'nickname'],
      },{
        model : User,
        as : 'Likers',
        attributes : ['id']
      }]
    });
    
    res.status(201).json(fullPost); //다시 프론트로 json형태로 돌려줌.

  }catch(error){
    console.error(error);
    next(error);
  }
});


//이미지 업로드용 (멀티파트파일 처리)
router.post('/images',isLoggedIn, upload.array('image'), async(req, res, next) => {    //POST  /post/images
  //이미지 업로드 후 실행되는 부분
  console.log(req.files);
  res.json(req.files.map((v) => v.filename)); //어디로 업로드되었는지 프론트로 넘겨준다.
});

// post 코멘트 작성
router.post('/:postId/comment', isLoggedIn, async (req ,res, next) => {  //POST /post/postID/comment
  // :postId 주소부분에서 동적으로 바뀌는 것을 파라미터라고 한다
  try{
    // 존재하지 않는 게시글에 댓글 달 우려가 있으므로 한 번 더 검사를 해준다.
    // 서버 쪽에서는 한 번 더 꼼꼼히 검사를 해주는 것이 좋다.
    const post = await Post.findOne({
      where : { id : req.params.postId },
    });
    if( !post ) {
      return res.status(403).send('존재하지 않는 게시글입니다.');
    }

    //코멘트 데이터 생성
    const comment = await Comment.create({
      content : req.body.content, // 데이터로 전달받은 부분 req.body...
      PostId : parseInt(req.params.postId, 10), // 파라미터로 전달받은 부분 req.params...
      UserId : req.user.id,
    });

    const fullComment = await Comment.findOne({
      where: { id: comment.id },
      include: [{
        model: User,
        attributes: ['id', 'nickname'],
      }],
    });

    res.status(201).json(fullComment); //다시 프론트로 json형태로 돌려줌.

  }catch(error){
    console.error(error);
    next(error);
  }
});


//like post 좋아요
router.patch('/:postId/like', isLoggedIn, async(req, res, next) => { //PATCH /post/1/like
  try{
    const post = await Post.findOne({ where : {id : req.params.postId } });

    if(!post){
      return res.status(403).send('게시글이 존재하지 않습니다.');
    }

    //테이블 관계를 이용 models > post.js > associate부분 참고
    //Post와 User 테이블 관계 중 as Likers 부분 관계 ,
    // DB조작 시 await 꼭 붙여주기
    await post.addLikers(req.user.id);  //Like테이블에 추가. (다대다관계)
    //어떤 포스트(PostId)에 어떤 유저가(req.user.id) 좋아요를 했는지 넣는다(addLikers).
    //시퀄라이즈를 통해 만들면 쉽게 구현할 수 있음.
    /*
      PostId   UserId
      1         30        1번 게시글 30번 유저 좋아요 추가addLikers
      1         60        1번 게시글 60번 유저 좋아요 추가addLikers
      2         59
      2         30
    */

    res.status(200).json({ PostId : post.id, UserId : req.user.id });
  }catch(error){
    console.error(error);
    next(error);
  }
});

//like post 좋아요 취소
router.delete('/:postId/like', isLoggedIn, async(req, res, next) => { //DELETE /post/1/like
  try{
    const post = await Post.findOne({ where : {id : req.params.postId } });

    if(!post){
      return res.status(403).send('게시글이 존재하지 않습니다.');
    }
    await post.removeLikers(req.user.id);

    res.status(200).json({ PostId : post.id, UserId : req.user.id });
  }catch(error){
    console.error(error);
    next(error);
  }
});

//post 삭제
router.delete('/:postId', isLoggedIn, async (req, res, next) => {  //DELETE post/1
  try{
    //시퀄라이즈에서는 제거할 때 destroy로 삭제한다.
    await Post.destroy({
      where:{
        id : req.params.postId,
        UserId : req.user.id,   //본인이 작성한 게시글만 삭제할 수 있도록
      }
    });
    
    res.status(200).json({ PostId : parseInt(req.params.postId, 10) }); //문자가 아닌 숫자로 전달
  
  }catch(error){
    console.error(error);
    next(error);
  }
});


// post 리트윗
router.post('/:postId/retweet', isLoggedIn, async (req ,res, next) => {  //POST /post/postID/retweet

  try{
    const post = await Post.findOne({
      where : {id : req.params.postId},
      include : [{
        model : Post,
        as : 'Retweet',
      }],
    });

    if( !post ) {
      return res.status(403).send('존재하지 않는 게시글입니다.');
    }
    //자기 게시글 리트윗 하거나, 남이 리트윗한 게시글을 다시 자기가 리트윗한 경우
    if(req.user.id === post.UserId || (post.Retweet && post.Retweet.UserId === req.user.id)){
      return res.status(403).send('자신의 글은 리트윗 할 수 없습니다.');
    }

    const retweetTargetId = post.RetweetId || post.id; //남이 리트윗 한 게시글이거나 리트윗 없는 게시글(null)
    const exPost = await Post.findOne({
      where : {
        UserId : req.user.id,
        RetweetId : retweetTargetId,
      }
    });
    //내가 리트윗 했던 게시글 막기
    if(exPost){
      return res.status(403).send('이미 리트윗했습니다.');
    }

    const retweet = await Post.create({
      UserId : req.user.id,
      RetweetId : retweetTargetId,
      content : 'retweet',
    });

    //내가 어떤 글을 리트윗 했는지 알 수 있게.
    const retweetWithPrevPost = await Post.findOne({
      where : { id : retweet.id },  //리트윗 포스트 아이디.
      //해당 게시글이 가지고 있는 데이터들을 프론트로 전달.
      include : [{
        model : Post,
        as : 'Retweet',
        include : [{
          model : User,
          attributes : ['id','nickname'],
        },{
          model : Image,
        }]  //리트윗 게시글의 작성자와 이미지
      },{
        model : User,
        attributes : ['id','nickname'],
      },{
        model: User, // 좋아요 누른 사람
        as: 'Likers',
        attributes: {
          include : ['id'],
        },
      },{
        model : Image,
      },{
        model : Comment,  //댓글을 따로들고온다던가 하는 라우터를 따로 만들어줘도 좋다.(속도 성능 측면)
        include : [{
          model : User,
          attributes : ['id','nickname'],
        }],
      }],
    });
    res.status(201).json(retweetWithPrevPost); //다시 프론트로 json형태로 돌려줌.

  }catch(error){
    console.error(error);
    next(error);
  }
});

module.exports = router;