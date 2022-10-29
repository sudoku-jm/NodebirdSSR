module.exports = (sequelize, DataTypes) => {
    //모델 만들기
    const User = sequelize.define('User',{
        // id : {}, 자동으로 생성되므로 생략.
        email : {
            type : DataTypes.STRING(30),    //문자열 30글자 이내
            allowNull : false,      //필수
            unique : true,      //고유한 값
        },
        nickname : {
            type : DataTypes.STRING(30),
            allowNull : false,
        },  
        password : {
            type : DataTypes.STRING(100),   //비밀번호 암호화가 되면서 길어질 수 있다.
            allowNull : false,
        },
    },{
        chareset : 'utf8',
        collate : 'utf8_general_ci',
    });
    User.associate = (db) => {
        db.User.hasMany(db.Post); //User가 Post를 여러개 가질 수 있다.
        db.User.hasMany(db.Comment); 
        db.User.belongsToMany(db.Post, { through : 'Like' , as : 'Liked'}); //좋아요 수, 사용자 관계. 내가 좋아요 누른 게시글 들. 별칭들은 대문자로 시작하는게 좋다
        db.User.belongsToMany(db.User, {through : 'Follow', as : 'Followers' , foreignKey : 'FollowingId'}); //팔로워들을 찾기위해 팔로잉하는 사람을 먼저 찾아야한다.
        db.User.belongsToMany(db.User, {through : 'Follow', as : 'Followings', foreingKey : 'FollowerId'}); // 팔로잉을 찾기위해 팔로우하는 사람을 먼저 찾아야한다.
    };
    return User;

}