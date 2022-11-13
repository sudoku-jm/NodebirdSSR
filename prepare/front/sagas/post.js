import { all, fork, put, takeLatest, throttle, call } from 'redux-saga/effects';
// import { nanoid } from 'nanoid';
import axios from 'axios';
import {
  // generateDummyPost,
  ADD_COMMENT_FAILRE, ADD_COMMENT_REQUEST, ADD_COMMENT_SUCCESS,
  ADD_POST_FAILRE, ADD_POST_REQUEST, ADD_POST_SUCCESS,
  LIKE_POST_FAILRE, LIKE_POST_REQUEST, LIKE_POST_SUCCESS,
  UNLIKE_POST_FAILRE, UNLIKE_POST_REQUEST, UNLIKE_POST_SUCCESS,
  LOAD_POSTS_FAILRE, LOAD_POSTS_REQUEST, LOAD_POSTS_SUCCESS,
  REMOVE_POST_FAILRE, REMOVE_POST_REQUEST, REMOVE_POST_SUCCESS,
  UPLOAD_IMAGES_FAILRE, UPLOAD_IMAGES_REQUEST, UPLOAD_IMAGES_SUCCESS,
  RETWEET_FAILRE, RETWEET_REQUEST, RETWEET_SUCCESS,
} from '../reducers/post';
import { ADD_POST_TO_ME, REMOVE_POST_OF_ME } from '../reducers/user';
// import axios from 'axios';

/* ==========retweet============ */
function retweetAPI(data) {
  // 해당 포스트 주소 리트윗
  return axios.post(`/post/${data}/retweet`);
}

function* retweet(action) {
  try {
    const result = yield call(retweetAPI, action.data);
    // yield delay(1000);
    console.log('retweetAPI result', result);
    yield put({
      type: RETWEET_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    console.error(err);
    yield put({
      type: RETWEET_FAILRE,
      error: err.response.data
    });
  }
}

/* ==========loadPosts============ */
function loadPostsAPI(lastId) {
  /*
    get에서 데이터를 넣는 방법(쿼리스트링) : 주소에 데이터가 다 포함되어있다.
    ?키=값
    &로 다음 키=값 구분.
    예) /posts?lastId=${lastId}&limit=10&offset=10

    lastId가 undefined인 경우 0으로 불러온다.
  */
  return axios.get(`/posts?lastId=${lastId || 0}`);
}

function* loadPosts(action) {
  try {
    const result = yield call(loadPostsAPI, action.data);
    // yield delay(1000);
    console.log('loadPostsAPI result', result);
    yield put({
      type: LOAD_POSTS_SUCCESS,
      // data: generateDummyPost(10),
      data: result.data, // 게시글 배열 가지고 왔음.
    });
  } catch (err) {
    console.error(err);
    yield put({
      type: LOAD_POSTS_FAILRE,
      error: err.response.data
    });
  }
}

/* ==========addPost============ */
function addPostAPI(data) {
  // return axios.post('/post', { content: data });
  // formData는 바로 data를 전송. {} 객체로 감싸지 않음
  return axios.post('/post', data);
}

function* addPost(action) {
  try {
    const result = yield call(addPostAPI, action.data);
    // yield delay(1000);
    console.log('result addPostAPI', result);

    // const id = nanoid();
    yield put({
      type: ADD_POST_SUCCESS,
      data: result.data,
    });
    // saga에서는 user.js 리듀서에 접근 할 수 있다.
    yield put({
      type: ADD_POST_TO_ME,
      data: result.data.id,
    });
  } catch (err) {
    console.error(err);
    yield put({
      type: ADD_POST_FAILRE,
      error: err.response.data
    });
  }
}

/* ==========removePost============ */
function removePostAPI(data) {
  return axios.delete(`/post/${data}`);
}

function* removePost(action) {
  try {
    const result = yield call(removePostAPI, action.data);
    // yield delay(1000);
    console.log('removePostAPI result', result);

    yield put({
      type: REMOVE_POST_SUCCESS,
      data: result.data
    });
    // saga에서는 user.js 리듀서에 접근 할 수 있다.
    yield put({
      type: REMOVE_POST_OF_ME,
      data: action.data
    });
  } catch (err) {
    console.error(err);
    yield put({
      type: REMOVE_POST_FAILRE,
      error: err.response.data
    });
  }
}

/* ==========addComment============ */
function addCommentAPI(data) {
  // 주소만 봐도 어떤 의미인지 알 수 있게 만들어주는게 좋긴하다. 프론트와 백엔드 약속이다.
  // return axios.post(`/comment`, { // POST /comment

  return axios.post(`/post/${data.postId}/comment`, data); // POST /post/1/comment
  // data.postId는 파라미터로 전달된다(req.params.postId)
}

function* addComment(action) {
  try {
    const result = yield call(addCommentAPI, action.data);
    // yield delay(1000);
    console.log('addCommentAPI result', result);

    yield put({
      type: ADD_COMMENT_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    console.error(err);
    yield put({
      type: ADD_COMMENT_FAILRE,
      error: err.response.data
    });
  }
}

/* ==========likePost============ */
function likePostAPI(data) {
  // patch : 데이터 일부 수정
  return axios.patch(`/post/${data}/like`); // PATCH /post/1/like
}

function* likePost(action) {
  try {
    const result = yield call(likePostAPI, action.data);
    console.log('likePostAPI result', result);

    yield put({
      type: LIKE_POST_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    console.error(err);
    yield put({
      type: LIKE_POST_FAILRE,
      error: err.response.data
    });
  }
}

/* ==========unlikePost============ */
function unlikePostAPI(data) {
  return axios.delete(`/post/${data}/like`); // DELETE /post/1/like
}

function* unlikePost(action) {
  try {
    const result = yield call(unlikePostAPI, action.data);
    console.log('unlikePostAPI result', result);

    yield put({
      type: UNLIKE_POST_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    console.error(err);
    yield put({
      type: UNLIKE_POST_FAILRE,
      error: err.response.data
    });
  }
}
/* ==========uploadImages============ */
function uploadImagesAPI(data) {
  // formdata가 그대로 들어간다. { name : data } 이런식으로쓰면 json이 되어버린다.
  return axios.post('/post/images', data); // POST /post/images
}

function* uploadImages(action) {
  try {
    const result = yield call(uploadImagesAPI, action.data);
    console.log('uploadImagesAPI result', result);

    yield put({
      type: UPLOAD_IMAGES_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    console.error(err);
    yield put({
      type: UPLOAD_IMAGES_FAILRE,
      error: err.response.data
    });
  }
}

function* watchLoadPosts() {
  // yield takeLatest(LOAD_POSTS_REQUEST, loadPosts);
  yield throttle(2000, LOAD_POSTS_REQUEST, loadPosts);
}

function* watchAddPost() {
  yield takeLatest(ADD_POST_REQUEST, addPost);
}

function* watchRemovePost() {
  yield takeLatest(REMOVE_POST_REQUEST, removePost);
}

function* watchAddComment() {
  yield takeLatest(ADD_COMMENT_REQUEST, addComment);
}
function* watchLikePost() {
  yield takeLatest(LIKE_POST_REQUEST, likePost);
}
function* watchUnlikePost() {
  yield takeLatest(UNLIKE_POST_REQUEST, unlikePost);
}
function* watchUploadImages() {
  yield takeLatest(UPLOAD_IMAGES_REQUEST, uploadImages);
}
function* watchRetweet() {
  yield takeLatest(RETWEET_REQUEST, retweet);
}

export default function* postSaga() {
  yield all([
    fork(watchUploadImages),
    fork(watchLoadPosts),
    fork(watchAddPost),
    fork(watchRemovePost),
    fork(watchAddComment),
    fork(watchLikePost),
    fork(watchUnlikePost),
    fork(watchRetweet),
  ]);
}
