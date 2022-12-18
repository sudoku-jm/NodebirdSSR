const DataTypes = require('sequelize');
const {Model} = DataTypes;

module.exports = class Image extends Model {
    static init(sequelize){
        return super.init({
            src : {
                type : DataTypes.STRING(200),   //이미지 URL 경로는 길어질 수 있음.
                allowNull : false,
            }
        },{
            modelName : 'Image',
            tableName : 'images',
            chareset : 'utf8',
            collate : 'utf8_general_ci',
            sequelize,
        });
    }

    static associate(db){
        db.Image.belongsTo(db.Post);
    }
}

