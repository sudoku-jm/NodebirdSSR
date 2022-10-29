const Sequelize = require('Sequelize');
const env = process.env.NODE_ENV || 'development';  
const config = require('../config/config')[env];
const db = {};
//development : 개발중 일 때 , 운영 배포 시 production 로 변경된다.
//개발 환경변수 설정.


//시퀄라이즈 = 노드 + MYSQL2 연결시켜줌.
const sequelize = new Sequelize(config.database, config.username, config.password, config)
/* 
  congig.json에 있던 development 환경변수들을 가지고 오는 것이다.
  "development": {
    "username": "root",
    "password": "ss1202!@",
    "database": "react-nodebird",
    "host": "127.0.0.1", 
    "dialect": "mysql"
  },
  해당부분 가져옴.
*/


// 모델 등록
db.sequelize = sequelize;
db.Sequelize = Sequelize;


//model > 에서 작성하고 module.export 했던 각각의 모델을 가져온다.
db.Comment = require('./comment')(sequelize, Sequelize);
db.Hashtag = require('./hashtag')(sequelize, Sequelize);
db.Image = require('./image')(sequelize, Sequelize);
db.Post = require('./post')(sequelize, Sequelize);
db.User = require('./user')(sequelize, Sequelize);


//각 모델에서 associate에 작성했던 것을 실행시켜주는 반복문.
//각 모델의 associate에서 db를 붙인 이유. db.User = db[User]
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});



module.exports = db;
