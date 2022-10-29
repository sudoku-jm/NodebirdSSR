import React from 'react';
import Link from 'next/link';
import PropTypes from 'prop-types';

const PostCardContent = ({ postData }) => {
  // 첫 번째 게시글 #해시태그 #익스프레스
  // 해당 텍스트에서 어떤 부분이 해시태그이고 아닌지 구분을 해야한다.
  // 정규표현식을 이용한다.
  return (
    <div>
      {/*
                postData.split(/(#[^\s#]+)/g)
                [결과]
                ['첫 번째 게시글 ', '#해시태그', ' ', '#익스프레스', '']
            */}
      {
        postData.split(/(#[^\s#]+)/g).map((v, i) => {
        // 일반 텍스트는 v로 그냥 리턴 정규표현식에 부합하는 경우는 Link안에 넣어서 리턴
          if (v.match(/(#[^\s#]+)/)) {
            return <Link href={`/hashtag/${v.slice(1)}`} key={i}><a>{v}</a></Link>;
          }

          return v;
        })
      }
    </div>
  );
};

PostCardContent.propTypes = {
  postData: PropTypes.string.isRequired,
};

export default PostCardContent;
