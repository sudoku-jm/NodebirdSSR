const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const {Post, Hashtag, User, Image, Comment,} = require('../models');


//특정 해시태그 들고있는 포스트 검색
router.get('/:hashtag', async (req, res, next) => {   //GET /hashtag/노드
    //쿼리스트링을 받은 값 : req.query.로 불러옴
    try{
        let where = {};
        if (parseInt(req.query.lastId, 10)) { // 초기 로딩이 아닐 때
          where.id = { [Op.lt]: parseInt(req.query.lastId, 10)}
        } // 21 20 19 18 17 16 15 14 13 12 11 10 9 8 7 6 5 4 3 2 1
      

        const posts = await Post.findAll({    // 모든 게시글 가지고 오기
            where,
            limit : 10, //10개만 가져와라
            order: [
              ['createdAt', 'DESC'],
              [Comment, 'createdAt', 'DESC'],
            ],
            include : [{
                model : Hashtag,
                //인클루드 해서 조건 적어줄 수 있다.
                where : {name : req.params.hashtag},
            },{
              model: User,
              attributes: ['id', 'nickname'],
            }, {
              model: Image,
            }, {
              model: Comment,
              include: [{
                model: User,
                attributes: ['id', 'nickname'],
                order: [['createdAt', 'DESC']],
              }],
            }, {
              model: User, // 좋아요 누른 사람
              as: 'Likers',
              attributes: {
                exclude : ['createdAt','updateAt'],
                include : ['id']
              },
            }, {
              model: Post,
              as: 'Retweet',
              include: [{
                model: User,
                attributes: ['id', 'nickname'],
              }, {
                model: Image,
              }]
            }],
        });

        console.log(posts);
        res.status(200).json(posts);

    }catch(error){
        console.error(error);
        next(error);
    }
});

module.exports = router;