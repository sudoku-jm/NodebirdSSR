const passport = require('passport');
const { Strategy : LocalStrategy } = require('passport-local'); //LocalStrategy로 이름 변경하여 사용.
const bcrypt = require('bcrypt');
const {User} = require('../models'); //데이터 베이스 만들었던 시퀄라이즈 재사용

/*
추후 
- 로컬 : LocalStrategy, 
- 카카오 : kakaoStrategy, 
- 네이버는 naverStrategy와 같이 이름 설정
*/


//해당 module.exports는 passport > index.js에서 실행
module.exports = () => {

    //로그인 전략 
    //1. 객체
    //2. 함수
    passport.use(new LocalStrategy({
        //req.body에 대한 내용
        usernameField : 'email',
        passwordField : 'password',
    }, async (email, password, done) => {
        // 비동기요청
        try{ 
            //함수에 대한 내용, 클라이언트에서의 에러 등...
    
            //1. 기존 유저가 있는지 검색 'email'로 찾기
            const user  = await User.findOne({
                where : { email }
            });
    
            //2. 사용자가 없다면
            if(!user){
                return done(null, false, {reason : '존재하지 않는 사용자입니다.'});
            }
            //3. 사용자가 있다면 -> 비밀번호 비교
            //bcrypt hash로 암호화 했었다.
            //compare(지금입력된 비밀번호, DB에 저장된 비밀번호)
            const result = await bcrypt.compare(password, user.password);
            if(result){ // true : 이메일 존재, 비밀번호 일치
                return done(null, user); //사용자 정보 전달.
            }
            //false : 이메일 존재, 비밀번호 불일치.
            return done(null, false, {reason : '비밀번호가 틀렸습니다.'});

        }catch(error){
            //서버에러
            console.error(error);
            return done(error);
        }

    }));
}
