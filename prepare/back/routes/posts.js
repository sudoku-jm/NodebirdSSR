const express = require('express');
const { Op } = require('sequelize');

const { Post, Image, User, Comment } = require('../models');

const router = express.Router();

router.get('/', async (req, res, next) => {   //GET /posts
    //쿼리스트링을 받은 값 : req.query.로 불러옴
    try{
        let where = {};
        if (parseInt(req.query.lastId, 10)) { // 초기 로딩이 아닐 때
          where.id = { [Op.lt]: parseInt(req.query.lastId, 10)}
        } // 21 20 19 18 17 16 15 14 13 12 11 10 9 8 7 6 5 4 3 2 1
        // lastId보다 작은 10개를 불러와라.
        // ~보다 작은 것 : [Op.lt]

        const posts = await Post.findAll({    // 모든 게시글 가지고 오기
            where,
            limit : 10, //10개만 가져와라
            //offset : 0, // 1 ~ 10번 게시글, 10이면 11~20번 게시글
            //하지만 실무에서는 이런 방식 잘 안씀. 중간에 게시글을 지워버리거나 추가하면 로딩하는 와중에 꼬인다. 게시글을 빼먹거나 같은 게시글을 2번 불러오기도 함.
            //limit 과 lastId 방식을 많이씀. lastId는 고정이므로.
            // 무한스크롤, 페이징에서 많이쓰임.
            //정렬 : 최신부터
            //where : { id : lastId },~
            order: [
              ['createdAt', 'DESC'],
              [Comment, 'createdAt', 'DESC'],
            ],
            include: [{
              model: User,
              attributes: ['id', 'nickname'],
            }, {
              model: Image,
            }, {
              model: Comment,
              include: [{
                model: User,
                attributes: ['id', 'nickname'],
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