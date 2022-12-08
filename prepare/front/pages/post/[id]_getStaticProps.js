// post/[id].js
// getStaticProps를 사용한 예제

import React from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { END } from 'redux-saga';
import { useSelector } from 'react-redux';
import Head from 'next/head';
import wrapper from '../../store/configureStore';
import { LOAD_MY_INFO_REQUEST } from '../../reducers/user';
import { LOAD_POST_REQUEST } from '../../reducers/post';
import AppLayout from '../../components/AppLayout';
import PostCard from '../../components/PostCard';

const Post = () => {
  const router = useRouter();
  const { id } = router.query;
  const { singlePost } = useSelector((state) => state.post);

  if (router.isFallback) {
    return <div>로딩중...</div>;
  }

  console.log('singlePost', singlePost);

  return (
    <AppLayout>
      {
        singlePost === null ?
          <>존재하지않는페이지</>
          :
          <>
            <Head>
              {singlePost.User.nickname}님의 글
              <meta name="description" content={singlePost.content} />
              <meta property="og:title" content={`${singlePost.User.nickname}님의 게시글`} />
              <meta property="og:description" content={singlePost.content} />
              <meta property="og:image" content={singlePost.Images[0] ? singlePost.Images[0].src : 'https://nodebird.com/favicon.ico'} />
              <meta property="og:url" content={`https://nodebird.com/post/${id}`} />
            </Head>
            <PostCard post={singlePost} />
          </>
      }
    </AppLayout>
  );
};

// getStaticProps 사용시 getStaticPaths와 함께 사용해서 다이나믹라우팅을 사용해준다.
export async function getStaticPaths() {
  // const result = await axios.get('/posts/list');
  // console.log(result);
  return {
    paths: [
      { params: { id: '1' } },
      { params: { id: '2' } },
      { params: { id: '3' } },
    ],
    fallback: true,
  };
}

export const getStaticProps = wrapper.getStaticProps(async (context) => {
  const cookie = context.req ? context.req.headers.cookie : '';

  axios.defaults.headers.Cookie = '';
  if (context.req && cookie) {
    axios.defaults.headers.Cookie = cookie;
  }
  context.store.dispatch({
    type: LOAD_MY_INFO_REQUEST,
  });
  context.store.dispatch({ // 단일 게시글 불러오는 용도
    type: LOAD_POST_REQUEST,
    data: context.params.id,
  });

  context.store.dispatch(END);

  await context.store.sagaTask.toPromise();
});

export default Post;
