import { Form, Input, Button } from 'antd';
import React, { useCallback, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';

import useInput from '../hooks/useInput';
import { ADD_COMMENT_REQUEST } from '../reducers/post';

const CommentForm = ({ post }) => {
  const dispatch = useDispatch();
  const { addCommentLoading, addCommentDone } = useSelector((state) => state.post);
  const id = useSelector((state) => state.user.me?.id);

  const [commentText, onChangeCommentText, setCommentText] = useInput('');
  useEffect(() => {
    if (addCommentDone) {
      setCommentText('');
    }
  }, [addCommentDone]);
  const onSubmitComment = useCallback(() => {
    dispatch({
      type: ADD_COMMENT_REQUEST,
      data: {
        content: commentText,
        postId: post.id, // 해당 포스트 id
        userId: id // 사용자 id
      }
    });
  }, [commentText, id]);

  const styleFormItem = useMemo(
    () => ({ position: 'relative', margin: 0 }),
    []
  );
  const styleButton = useMemo(
    () => ({ position: 'absolute', right: 0, bottom: -40, zIndex: 1 }),
    []
  );

  return (
    <Form onFinish={onSubmitComment}>
      <Form.Item style={styleFormItem}>
        <Input.TextArea
          value={commentText}
          onChange={onChangeCommentText}
          rows={4}
        />
        <Button type="primary" htmlType="submit" loading={addCommentLoading} style={styleButton}>
          삐약
        </Button>
      </Form.Item>
    </Form>
  );
};

CommentForm.propTypes = {
  post: PropTypes.object.isRequired,
};

export default CommentForm;
