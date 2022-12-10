import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import Router from 'next/router';
import axios from 'axios';
import { END } from 'redux-saga';
import useSWR from 'swr';
import NicknameEditForm from '../components/NicknameEditForm';
import AppLayout from '../components/AppLayout';
import FollowList from '../components/FollowList';
import wrapper from '../store/configureStore';
import { LOAD_MY_INFO_REQUEST } from '../reducers/user';
import { backUrl } from '../config/config';

const fetcher = (url) => axios.get(url, { withCredentials: true }).then((result) => result.data);

function Profile() {
  const { me } = useSelector((state) => state.user);
  const [followersLimit, setFollowersLimit] = useState(3);
  const [followingsLimit, setFollowingsLimit] = useState(3);
  const [followerOffset, setFollowerOffset] = useState(0);

  const { data: followersData, error: followerError } = useSWR(`${backUrl}/user/followers?limit=${followersLimit}&offset=${followerOffset}`, fetcher);
  const { data: followingsData, error: followingError } = useSWR(`${backUrl}/user/followings?limit=${followingsLimit}`, fetcher);

  useEffect(() => {
    // 로그아웃 하는 경우
    if (!(me && me.id)) {
      Router.push('/');
    }
  }, [me && me.id]);

  const loadMoreFollowings = useCallback(() => {
    setFollowingsLimit((prev) => prev + 3);
  }, []);

  const loadMoreFollowers = useCallback(() => {
    setFollowersLimit((prev) => prev + 3);
    setFollowerOffset((prev) => prev + 3);
  }, []);

  if (followerError || followingError) {
    console.error(followerError || followingError);
    return <div>팔로워/팔로잉 로딩 중 에러가 발생합니다.</div>;
  }

  if (!me) {
    return '내 정보 로딩중...';
  }

  return (
    <AppLayout>
      {/* 닉네임 수정 from */}
      <NicknameEditForm />

      {/* 팔로잉, 팔로워 */}
      <FollowList header="팔로잉" data={followingsData} onClickMore={loadMoreFollowings} loading={!followingsData && !followingError} />
      <FollowList header="팔로워" data={followersData} onClickMore={loadMoreFollowers} loading={!followersData && !followerError} />
    </AppLayout>
  );
}

// 서버에서 작동하는 것
export const getServerSideProps = wrapper.getServerSideProps(async (context) => {
  const cookie = context.req ? context.req.headers.cookie : '';
  axios.defaults.headers.Cookie = ''; // 기본적으로 쿠키를 지워준다.
  if (context.req && cookie) { // 서버로 보낼 때 쿠키가 있을때만 넣어준다.
    axios.defaults.headers.Cookie = cookie;
  }
  context.store.dispatch({
    type: LOAD_MY_INFO_REQUEST,
  });
  context.store.dispatch(END);

  await context.store.sagaTask.toPromise();
});

export default Profile;
