// hashtag/[tag].js
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Avatar, Card } from 'antd';
import { END } from 'redux-saga';
import { useRouter } from 'next/router';
import { useInView } from 'react-intersection-observer';
import axios from 'axios';
import Head from 'next/head';
import AppLayout from '../../components/AppLayout';
import { LOAD_HASHTAG_POSTS_REQUEST, LOAD_USER_POSTS_REQUEST } from '../../reducers/post';
import PostCard from '../../components/PostCard';
import wrapper from '../../store/configureStore';
import { LOAD_MY_INFO_REQUEST } from '../../reducers/user';

function Hashtag() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { mainPosts, hasMorePosts, loadPostsLoading } = useSelector((state) => state.post);

  const { tag } = router.query;

  const [ref, inView] = useInView();

  useEffect(() => {
    function onScroll() {
      const winSrcollY = window.scrollY;
      const clientH = document.documentElement.clientHeight;
      const documentScrollH = document.documentElement.scrollHeight - 300;

      if (winSrcollY + clientH > documentScrollH) {
        if (hasMorePosts && !loadPostsLoading) {
          const lastId = mainPosts[mainPosts.length - 1]?.id;
          dispatch({
            type: LOAD_HASHTAG_POSTS_REQUEST,
            data: tag,
            lastId,
          });
        }
      }
    }
    window.addEventListener('scroll', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [hasMorePosts, loadPostsLoading, mainPosts, tag]);

  return (
    <AppLayout>
      {mainPosts.map((c) => (
        <PostCard key={c.id} post={c} />
      ))}
      <div ref={hasMorePosts && !loadPostsLoading ? ref : undefined} style={{ height: 10 }} />
    </AppLayout>

  );
}

export const getServerSideProps = wrapper.getServerSideProps(async (context) => {
  const cookie = context.req ? context.req.headers.cookie : '';

  axios.defaults.headers.Cookie = '';
  if (context.req && cookie) {
    axios.defaults.headers.Cookie = cookie;
  }

  context.store.dispatch({
    type: LOAD_HASHTAG_POSTS_REQUEST,
    data: context.params.tag,
  });
  context.store.dispatch({
    type: LOAD_MY_INFO_REQUEST,
  });
  context.store.dispatch(END);
  await context.store.sagaTask.toPromise();
});
export default Hashtag;
