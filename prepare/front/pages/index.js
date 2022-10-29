import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AppLayout from '../components/AppLayout';
import PostForm from '../components/PostForm';
import PostCard from '../components/PostCard';
import { LOAD_POSTS_REQUEST } from '../reducers/post';
import { LOAD_MY_INFO_REQUEST } from '../reducers/user';

function Home() {
  const dispatch = useDispatch();
  const { logInDone } = useSelector((state) => state.user);
  const { mainPosts, hasMorePosts, loadPostsLoading, retweetError } = useSelector((state) => state.post);
  // 리트윗 에러 경고창
  useEffect(() => {
    console.log('rerender');
    if (retweetError) {
      alert(retweetError);
    }
  }, [retweetError]);
  useEffect(() => {
    // 메인 접속 시 : 유저정보, 페이지 정보 불러옴
    dispatch({
      type: LOAD_MY_INFO_REQUEST, // 매번 로그인 중인 것을 복구하기 위해(새로고침)
    });
    dispatch({
      type: LOAD_POSTS_REQUEST, // 페이지 정보 불러오기
    });
  }, []);
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
      {logInDone && <PostForm />}
      {mainPosts.map((post) => <PostCard key={post.id} post={post} />)}
    </AppLayout>
  );
}

export default Home;
