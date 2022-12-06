import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { END } from 'redux-saga';
import axios from 'axios';
import AppLayout from '../components/AppLayout';
import PostForm from '../components/PostForm';
import PostCard from '../components/PostCard';
import { LOAD_POSTS_REQUEST } from '../reducers/post';
import { LOAD_MY_INFO_REQUEST } from '../reducers/user';
import wrapper from '../store/configureStore';

function Home() {
  const dispatch = useDispatch();
  const { me } = useSelector((state) => state.user);
  // const { logInDone } = useSelector((state) => state.user);
  const { mainPosts, hasMorePosts, loadPostsLoading, retweetError } = useSelector((state) => state.post);
  // 리트윗 에러 경고창
  useEffect(() => {
    if (retweetError) {
      alert(retweetError);
    }
  }, [retweetError]);

  // useEffect(() => {
  //   dispatch({
  //     type: LOAD_MY_INFO_REQUEST,
  //   });

  //   dispatch({
  //     type: LOAD_POSTS_REQUEST,
  //   });
  // }, []);
  useEffect(() => {
    function onScroll() {
      const winSrcollY = window.scrollY;
      const clientH = document.documentElement.clientHeight;
      const documentScrollH = document.documentElement.scrollHeight - 300;
      /* scrollY : 얼마나 내렸는지,
        clientHeight : 화면 높이,
        scrollHeight : 총 길이

        scrollY + clientHeight = scrollHeight
      */
      // console.log(winSrcollY, clientH, documentScrollH);
      if (winSrcollY + clientH > documentScrollH) {
        if (hasMorePosts && !loadPostsLoading) {
          const lastId = mainPosts[mainPosts.length - 1]?.id; // 총 게시글 수 - 1 = 라스트 아이디
          // 게시글이 없는경우 undefind에러가 날 수 있음.
          dispatch({
            type: LOAD_POSTS_REQUEST, // 새로운 것
            lastId,
          });
        }
      }
    }
    window.addEventListener('scroll', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [hasMorePosts, loadPostsLoading, mainPosts]);

  return (
    <AppLayout>
      {/* 로그인 했을 때만 PostForm이 보인다. */}
      {me && <PostForm />}
      {mainPosts.map((post) => <PostCard key={post.id} post={post} />)}
    </AppLayout>
  );
}

// 서버사이드랜더링
// 리덕스의 데이터가 채워진상태로 들고오게 함.
// export const getServerSideProps = wrapper.getServerSideProps((store) => async ({ req }) => {
//   const cookie = req ? req.headers.cookie : '';
//   axios.defaults.headers.Cookie = '';
//   if (req && cookie) {
//     axios.defaults.headers.Cookie = cookie;
//   }
//   store.dispatch({
//     type: LOAD_MY_INFO_REQUEST,
//   });

//   store.dispatch({
//     type: LOAD_POSTS_REQUEST,
//   });

//   // REQUEST 가 saga 에서 SUCCESS 될 때까지 기다려준다
//   store.dispatch(END);
//   await store.sagaTask.toPromise();
// });

// 서버에서 작동하는 것
export const getServerSideProps = wrapper.getServerSideProps(async (context) => {
  console.log(context.req.headers);
  const cookie = context.req ? context.req.headers.cookie : '';
  // 다른사람이 요청보내도 나의 정보를 다른사람이 로그인 될 수 있다.
  // 쿠키가 공유되어버린다.
  axios.defaults.headers.Cookie = ''; // 기본적으로 쿠키를 지워준다.
  if (context.req && cookie) { // 서버로 보낼 때 쿠키가 있을때만 넣어준다.
    axios.defaults.headers.Cookie = cookie;
  }
  context.store.dispatch({
    type: LOAD_MY_INFO_REQUEST,
  });
  context.store.dispatch({
    type: LOAD_POSTS_REQUEST,
  });
  context.store.dispatch(END);

  await context.store.sagaTask.toPromise();
});

export default Home;
