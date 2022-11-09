import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { FOLLOW_REQUEST, UNFOLLOW_REQUEST } from '../reducers/user';

const FollowButton = ({ post }) => {
  const dispatch = useDispatch();
  const { me, followLoading, unfollowLoading } = useSelector((state) => state.user);

  // 포스팅 작성자의 id와 내가 Following 한 유저 id가 같으면 isFollowing은 true.
  const isFollowing = me?.Followings.find((v) => v.id === post.User.id); // 팔로잉 여부
  const onClickButton = useCallback(() => {
    if (isFollowing) { // 팔로우 했을 경우
      dispatch({
        type: UNFOLLOW_REQUEST,
        data: post.User.id,
      });
    } else {
      dispatch({ // 팔로우 안했을 경우
        type: FOLLOW_REQUEST,
        data: post.User.id,
      });
    }
  }, [isFollowing]);

  // 게시글 작성자 id와 나의 id가 같으면 안뜨게 함.
  if (post.User.id === me.id) return null;

  return (
    <Button loading={followLoading || unfollowLoading} onClick={onClickButton}>
      { isFollowing ? '언팔로우' : '팔로우' }
    </Button>
  );
};

FollowButton.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.number,
    User: PropTypes.object,
    content: PropTypes.string,
    createdAt: PropTypes.string,
    Comments: PropTypes.arrayOf(PropTypes.object),
    Images: PropTypes.arrayOf(PropTypes.object),
  }).isRequired,
};

export default FollowButton;
