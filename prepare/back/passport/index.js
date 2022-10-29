const passport = require('passport');
const local = require('./local');
const {User} = require('../models');

//해당 module.exports는 app.js에서 실행(중앙통제실과 같다.)
module.exports = () => {
  console.log("serializeUser 실행")
    //로그인 시도 시 
    //user.js의 return req.login(user,... 정보가 이리로 들어옴.
    //브라우저로 유저 아이디만 가져온다.(쿠키정보와 아이디만)
    passport.serializeUser((user, done) => { // 서버쪽에 [{ id: 1, cookie: 'clhxy' }]
        done(null, user.id);
    });


    //로그인 시도 후 그 다음 요청부터 실행
    //받은 아이디(쿠키)를 들고 서버로 요청
    //id는 서버단으로 전달되어 DB에서 사용자 비교 후 나머지 데이터 복구
    passport.deserializeUser(async (id, done) => {
      console.log("deserializeUser 실행")
        try {
          const user = await User.findOne({ where: { id }});
          done(null, user); // req.user
        } catch (error) {
          console.error(error);
          done(error);
        }
      });

    local();
};