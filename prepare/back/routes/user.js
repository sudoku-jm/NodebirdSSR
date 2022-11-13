const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const { User, Post } = require('../models');
const {isLoggedIn, isNotLoggedIn} = require('./middlewares');
const router = express.Router();

//회원정보 불러오기
router.get('/', async (req, res,next) => {  //GET /user
    try {
        if(req.user){
            const fullUserWithoutPassword = await User.findOne({
                where : { id : req.user.id },
                attributes : {
                    exclude : ['password']
                },
                include : [{
                    model : Post,
                    attributes : ['id'],// 데이터 효율을 위해 id만 가져온다. (length)
                },{
                    model : User,
                    as : 'Followings',
                    attributes : ['id'],
                },{
                    model : User,
                    as : 'Followers',
                    attributes : ['id'],
                }]
            });
            res.status(200).json(fullUserWithoutPassword); //사용자 있을 때만 보내기.
        }else{
            res.status(200).json(null);
        }

    } catch(error){
        console.error(error);
        return next(error);
    }
});
//passport.authenticate의 내부 메커니즘을 통해서 LocalStrategy 이쪽으로 인증 처리 위임. local.js 전략을 실행시킨다.

/*

    (err, user, info) : 서버에러, 인증객체, 정보
    예) return done(null, false, {reason : '존재하지 않는 사용자입니다.'});
    예) return done(null, user); 
    예) return done(null, false, {reason : '비밀번호가 틀렸습니다.'});
    예) return done(error); 서버쪽 에러
*/


//로그인
router.post('/login', isNotLoggedIn, (req, res, next) => {//미들웨어 확장.
    passport.authenticate('local', (err, user, info) => {
        //passport > local.js 성공 시 콜백 실행.
        if(err){ //done(erorr) 로 왔을 때. 클라이언트쪽에선 null이다.
            console.error(err);
            return next(err);
        }

        if(info){ //info에 값이 있을 경우는 클라이언트 에러.
            return res.status(401).send(info.reason);
        }

        return req.login(user, async(loginErr) => {
            //패스포트쪽 로그인
            if(loginErr){
                console.error(loginErr);
                return next(loginErr);
            }

            //로그인 성공
            // local.js > return done(null, user); 전달 받은 내용 

            // res.setHeader('Cookie', 'cxlhy');

            //fullUserWithoutPassword : password 제외 모든 정보를 다 집어넣은 유저.
            // 사용자 정보는 있는데 왜 다시 User DB에서 또 찾는가? 
            // include를 사용하여 여기에서 정보를 더해줄 수 있기 때문이다.
            // user는 필요없는 비밀번호는 있는데 Posts, Followers, Followings는 없기 때문이다.
            const fullUserWithoutPassword = await User.findOne({
                where : { id : user.id },
                // attributes : ['id','nickname','email'],
                attributes : {
                    exclude : ['password']
                },
                include : [{
                    model : Post,
                },{
                    model : User,
                    as : 'Followings'
                },{
                    model : User,
                    as : 'Followers'
                }]
            });

            //res.setHeader('Cookie','쿠키값');
            return res.status(200).json(fullUserWithoutPassword);
        })
    })(req, res, next);
});


//로그아웃
router.post('/logout', isLoggedIn, (req, res) => {
    //passport 0.5버전
    // req.logout(() => {});
    // req.session.destroy(); //유저 정보 세션에서 삭제
    // res.status(200).send('ok');
    console.log('logout?!');
    req.logout();
    req.session.destroy();
    res.status(200).json("server ok: 로그아웃 완료");
});

// 회원가입
router.post('/', isNotLoggedIn, async (req ,res, next) => {    //POST /user
    console.log('req',req.body);
    try{

        //비동기인지 아닌지는 공식문서를 통해 찾아보기
        const exUser = await User.findOne({
            where : {
                email : req.body.email,
            } 
        });

        if(exUser){ //exUser가 null이 아니라면 = 이미 존재한다면
            return res.status(403).send('이미 사용 중인 아이디입니다.'); //return을 꼭 붙여준다.
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10); //숫자가 높을 수록 암호화가 좋지만 서버가 좋지않다면 시간이 오래걸린다. 컴퓨터 성능에 따라 셋팅을 맞춰주자.
        await User.create({
            email: req.body.email,
            nickname : req.body.nickname,
            password : hashedPassword,
        });
    
        // res.setHeader('Access-Control-Allow-Origin', '*'); 
        // res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3060'); 
        /* 
        * : 모든 주소 허용.
        http://localhost:3060 : 3060(브라우저)에서 오는 것은 모두 허용하겠다.

        차단은 브라우저가 차단하지만 서버에서 허용해야한다.
        */
        res.status(201).send('ok');
    }catch(error){
        console.error(error);
        next(error);  //status(500) 500번 에러. 서버쪽 에러
    }

});

//회원정보 수정. 닉네임 수정
router.patch('/nickname', isLoggedIn, async(res, req, next) => {    // PATCH /user/nickname
    try{
        //update
        await User.update({
            //변경할 정보
            nickname : req.body.nickname,   //프론트에서 받은 닉네임을 가져오고,(바뀔 닉네임)
        },{
            //필터 : 조건 정확하게. 내 닉네임의 닉네임을 프론트에서 받은 닉네임으로 교체한다.
            where : { id: req.user.id, }    //내 아이디로 본인 인증.
        });
        res.status(200).json({ nickname : req.body.nickname });

    }catch(error){
        console.error(error);
        next(error);
    }
});


//팔로우
router.patch('/:userId/follow', isLoggedIn, async (req, res, next) => { // PATCH /user/1/follow
    try {
      const user = await User.findOne({ where: { id: req.params.userId }});
        if(!user){
            res.status(403).send('없는 사람을 팔로우하려고 하시네요?');
        }
        await user.addFollowers(req.user.id);   
        // 대다대관계 테이블
        // follow테이블에 어떤 유저가(req.user.id)가 following 했는지(따랐는지) 테이블 추가.
        /*
            FollowingId     UserId
            3               1           //1번 유저가 3번 유저를 팔로잉.(추가 addFollowers)
        */
        //update
        res.status(200).json({ UserId: parseInt(req.params.userId, 10) });
        
    }catch(error){
        console.error(error);
        next(error);
    }
});

//언팔로우(팔로우 취소)
router.delete('/:userId/follow', isLoggedIn, async (req, res, next) => {     //DELETE /user/1/follow

    try{
        //언팔로우 할 유저 존재 여부 확인
        const user = await User.findOne({ where: { id: req.params.userId }});
        if(!user){
            res.status(403).send('없는 사람을 언팔로우하려고 하시네요?');
        }
        await user.removeFollowers(req.user.id);   
        res.status(200).json({ UserId : parseInt(req.params.userId , 10) });

    }catch(error){
        console.error(error);
        next(error);
    }
});

//팔로워 목록 불러오기
router.get('/followers', isLoggedIn, async (req, res, next) => {       // GET /user/followers
    try{
        //사용자 먼저 찾기
        const user = await User.findOne({ where : {id : req.user.id} });
        if(!user){
            res.status(403).send('없는 사람을 찾으려고 하시네요');
        }
        // 사용자의 팔로워 가져오기
        const followers = await user.getFollowers();
        res.status(200).json(followers);

    }catch(error){
        console.error(error);
        next(error);
    }
});

//팔로잉 목록 불러오기
router.get('/followings', isLoggedIn, async (req, res, next) => {       // GET /user/followings
    try{
        //사용자 먼저 찾기
        const user = await User.findOne({ where : {id : req.user.id} });
        if(!user){
            res.status(403).send('없는 사람을 찾으려고 하시네요');
        }
        // 사용자의 팔로잉 가져오기
        const followings = await user.getFollowings();
        res.status(200).json(followings);

    }catch(error){
        console.error(error);
        next(error);
    }
});

//팔로워 차단,제거
router.delete('/follower/:userId', isLoggedIn, async (req, res, next) => {       // DELETE /user/follower/3
    try{
    //차단할 사람을 먼저 찾아, 그 사람의 목록에서 팔로잉을 끊는다.
      const user = await User.findOne({ where : { id : req.params.userId} });
      if(!user){
        res.status(403).send('없는 사람을 차단하려고 하시네요.');
      }
      //차단 할 사용자 팔로워 목록에서 나를 제거
      await user.removeFollowings(req.user.id);
      res.status(200).json({ UserId : parseInt(req.params.userId, 10)});

    }catch(error){
        console.error(error);
        next(error);
    }
});


module.exports = router;