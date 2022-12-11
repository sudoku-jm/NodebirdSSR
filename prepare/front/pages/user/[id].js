// user/[id].js
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Avatar, Card } from 'antd';
import { END } from 'redux-saga';
import { useRouter } from 'next/router';
import { useInView } from 'react-intersection-observer';
import axios from 'axios';
import Head from 'next/head';
import AppLayout from '../../components/AppLayout';
import { LOAD_USER_POSTS_REQUEST } from '../../reducers/post';
import PostCard from '../../components/PostCard';
import wrapper from '../../store/configureStore';
import { LOAD_MY_INFO_REQUEST, LOAD_USER_REQUEST } from '../../reducers/user';

function User() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { id } = router.query;
  const { mainPosts, hasMorePosts, loadPostsLoading } = useSelector((state) => state.post);
  const { me, userInfo } = useSelector((state) => state.user);

  const [ref, inView] = useInView();

  useEffect(
    () => {
      if (inView && hasMorePosts && !loadPostsLoading) {
        const lastId = mainPosts[mainPosts.length - 1]?.id;
        dispatch({
          type: LOAD_USER_POSTS_REQUEST,
          lastId,
          data: id,
        });
      }
    },
    [inView, hasMorePosts, loadPostsLoading, mainPosts, id],
  );
  // useEffect(() => {
  //   function onScroll() {
  //     const winSrcollY = window.scrollY;
  //     const clientH = document.documentElement.clientHeight;
  //     const documentScrollH = document.documentElement.scrollHeight - 300;

  //     if (winSrcollY + clientH > documentScrollH) {
  //       console.log('mainPosts1111', mainPosts);
  //       if (hasMorePosts && !loadPostsLoading) {
  //         console.log('hasMorePosts22222', hasMorePosts);
  //         console.log('loadPostsLoading22222', loadPostsLoading);
  //         console.log('mainPosts22222', mainPosts);
  //         const lastId = mainPosts[mainPosts.length - 1]?.id;
  //         dispatch({
  //           type: LOAD_USER_POSTS_REQUEST,
  //           data: id,
  //           lastId,
  //         });
  //       }
  //     }
  //   }
  //   window.addEventListener('scroll', onScroll);
  //   return () => {
  //     window.removeEventListener('scroll', onScroll);
  //   };
  // }, [hasMorePosts, loadPostsLoading, mainPosts, id]);

  return (
    <AppLayout>
      {userInfo && (
        <Head>
          <title>
            {userInfo.nickname}
            님의 글
          </title>
          <meta name="description" content={`${userInfo.nickname}님의 게시글`} />
          <meta property="og:title" content={`${userInfo.nickname}님의 게시글`} />
          <meta property="og:description" content={`${userInfo.nickname}님의 게시글`} />
          <meta property="og:image" content="https://nodebird.com/favicon.ico" />
          <meta property="og:url" content={`https://nodebird.com/user/${id}`} />
        </Head>
      )}
      {userInfo && (userInfo.id !== me?.id)
        ? (
          <Card
            style={{ marginBottom: 20 }}
            actions={[
              <div key="twit">
                짹짹
                <br />
                {userInfo.Posts}
              </div>,
              <div key="following">
                팔로잉
                <br />
                {userInfo.followings}
              </div>,
              <div key="follower">
                팔로워
                <br />
                {userInfo.followers}
              </div>,
            ]}
          >
            <Card.Meta
              avatar={<Avatar>{userInfo.nickname[0]}</Avatar>}
              title={userInfo.nickname}
            />
          </Card>

        )
        : null}
      {mainPosts.map((c) => (
        <PostCard key={c.id} post={c} />
      ))}

      <div ref={hasMorePosts && !loadPostsLoading ? ref : undefined} style={{ height: 50 }} />
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
    type: LOAD_USER_POSTS_REQUEST,
    data: context.params.id,
  });
  context.store.dispatch({
    type: LOAD_MY_INFO_REQUEST,
  });
  context.store.dispatch({
    type: LOAD_USER_REQUEST,
    data: context.params.id,
  });
  context.store.dispatch(END);
  await context.store.sagaTask.toPromise();
});
export default User;
