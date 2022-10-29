import React, { useCallback, useEffect, useRef } from 'react';
import { Form, Input, Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { ADD_POST_REQUEST, UPLOAD_IMAGES_REQUEST, REMOVE_IMAGE } from '../reducers/post';
import useInput from '../hooks/useInput';

const PostForm = () => {
  const dispatch = useDispatch();
  const { imagePaths, addPostLoading, addPostDone } = useSelector((state) => state.post);

  const [text, onChangeText, setText] = useInput('');
  useEffect(() => {
    if (addPostDone) {
      setText('');
    }
  }, [addPostDone]);
  const onSubmit = useCallback(() => {
    // dispatch(addPost(text));
    /*
    이미지가 없으면 formData로 쓸 필욘없음. json으로 보내도 됨
    dispatch({
      type: ADD_POST_REQUEST,
      data: {
        imagePaths,
        content: text
      }
    });

    multer를 사용하기 위해 formData로 이미지 전송했다.
    이미지 없으면안써도 됨. 비효율적이다!
    */
    if (!text || !text.trim()) {
      return alert('게시글을 작성하세요');
    }
    const formData = new FormData();
    imagePaths.forEach((p) => {
      formData.append('image', p); // req.body.image
    });
    formData.append('content', text); // req.body.content
    return dispatch({
      type: ADD_POST_REQUEST,
      data: formData
    });

    // 만약 서버쪽에서 문제가 생겨 다시 시도해달라고 했을 때, 텍스트를 지워버리면 문제가 될 수 있다. setText('') 의 위치는 여기가 맞지않다.
    // addPostDone 의 상태가 true가 되었을 때 지워주는게 더 정확하다.
    // setText('');
  }, [text, imagePaths]);

  const imageInput = useRef();
  const onClickImageUpload = useCallback(() => {
    imageInput.current.click();
  }, [imageInput.current]);

  const onChangeImages = useCallback((e) => {
    console.log('images', e.target.files);
    const imageFormData = new FormData();
    // 멀티파트 파일로 보내야 multer가 처리해준다.

    // e.target.files가 배열인지 아닌지 모름, 유사배열이라 []로 씀
    [].forEach.call(e.target.files, (f) => {
      imageFormData.append('image', f);
    });

    dispatch({
      type: UPLOAD_IMAGES_REQUEST,
      data: imageFormData,
    });
  }, []);

  const onRemoveImage = useCallback((index) => () => {
    dispatch({
      type: REMOVE_IMAGE,
      data: index,
    });
  }, []);

  return (
    <Form style={{ margin: '10px 0 20px' }} encType="multipart/form-data" onFinish={onSubmit}>
      <Input.TextArea value={text} onChange={onChangeText} maxLength={140} placeholder="어떤 신기한 일이 있었나요?" />
      <div>
        {/* 이미지 업로드란 */}
        <input type="file" name="image" multiple hidden ref={imageInput} onChange={onChangeImages} />
        <Button onClick={onClickImageUpload}>이미지 업로드</Button>
        <Button type="primary" loading={addPostLoading} htmlType="submit" style={{ float: 'right' }}>짹짹</Button>
      </div>
      <div>
        {/* 이미지 미리보기란 */}
        {imagePaths.map((y, i) => (
          <div key={y} style={{ display: 'inline-block' }}>
            <img src={`http://localhost:5500/images/${y}`} style={{ width: '200px' }} alt={y} />
            <div>
              <Button onClick={onRemoveImage(i)}>제거</Button>
            </div>
          </div>
        ))}
      </div>
    </Form>
  );
};

export default PostForm;
