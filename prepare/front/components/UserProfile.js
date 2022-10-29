import React, { useCallback } from 'react';
import { Card, Avatar, Button } from 'antd';
// import PropTypes from "prop-types";
import { useDispatch, useSelector } from 'react-redux';
import { logoutRequestAction } from '../reducers/user';

const UserProfile = () => {
  const dispatch = useDispatch();
  const { me, logOutLoading } = useSelector((state) => state.user);

  // 로그아웃
  const onLogout = useCallback(() => {
    dispatch(logoutRequestAction());
  }, []);
  return (
    <Card
      actions={[
        <div key="twit">짹짹<br />{me.Posts.length}</div>,
        <div key="followings"> 팔로잉 <br />{me.Followings.length}</div>,
        <div key="follower"> 팔로워<br />{me.Followers.length}</div>,
      ]}
    >
      <Card.Meta avatar={<Avatar>JM</Avatar>} title={me.nickname} />
      <Button onClick={onLogout} loading={logOutLoading}>로그아웃</Button>
    </Card>
  );
};

// UserProfile.propTypes = {
//   setIsLoggedIn: PropTypes.node.isRequired,
// };

export default UserProfile;
