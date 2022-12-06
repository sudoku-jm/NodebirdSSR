// post/[id].js
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
  const { singlePost, loadPostError } = useSelector((state) => state.post);
  return (
    <AppLayout>
      {
            loadPostError ?
              <div>존재하지 않는 게시글입니다.</div>
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
// getServerSideProps 사용
export const getServerSideProps = wrapper.getServerSideProps(async (context) => {
  console.log(context.req.headers);
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
