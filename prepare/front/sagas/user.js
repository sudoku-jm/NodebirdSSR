import { all, fork, put, takeLatest, call } from 'redux-saga/effects';
import axios from 'axios';
import {
  FOLLOW_FAILRE, FOLLOW_REQUEST, FOLLOW_SUCCESS,
  UNFOLLOW_FAILRE, UNFOLLOW_REQUEST, UNFOLLOW_SUCCESS,
  LOG_IN_FAILRE, LOG_IN_REQUEST, LOG_IN_SUCCESS,
  LOG_OUT_FAILRE, LOG_OUT_REQUEST, LOG_OUT_SUCCESS,
  SIGN_UP_FAILRE, SIGN_UP_REQUEST, SIGN_UP_SUCCESS,
  LOAD_MY_INFO_REQUEST, LOAD_MY_INFO_SUCCESS, LOAD_MY_INFO_FAILRE,
  CHANGE_NICKNAME_REQUEST, CHANGE_NICKNAME_SUCCESS, CHANGE_NICKNAME_FAILRE,
  LOAD_FOLLOWERS_REQUEST, LOAD_FOLLOWERS_SUCCESS, LOAD_FOLLOWERS_FAILRE,
  LOAD_FOLLOWINGS_REQUEST, LOAD_FOLLOWINGS_SUCCESS, LOAD_FOLLOWINGS_FAILRE,
  REMOVE_FOLLOWER_REQUEST, REMOVE_FOLLOWER_SUCCESS, REMOVE_FOLLOWER_FAILRE,
} from '../reducers/user';

/* ==========유저로그인 유지============ */
function loadUserAPI() {
  return axios.get('/user'); // 3060 요청
}

function* loadUser(action) {
  try {
    const result = yield call(loadUserAPI, action.data);
    console.log('result loadUserAPI', result);

    yield put({
      type: LOAD_MY_INFO_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    console.error(err);
    yield put({
      type: LOAD_MY_INFO_FAILRE,
      error: err.response.data
    });
  }
}

/* ==========로그인============ */
function loginAPI(data) {
  // data.email, data.password 전달.
  return axios.post('/user/login', data);
}

function* logIn(action) {
  try {
    const result = yield call(loginAPI, action.data);
    console.log('result loginAPI', result);
    // yield delay(1000);

    yield put({
      type: LOG_IN_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    console.error(err);
    yield put({
      type: LOG_IN_FAILRE,
      error: err.response.data
    });
  }
}

/* ==========로그아웃============ */
function logOutAPI() {
  return axios.post('/user/logout');
}

function* logOut() {
  try {
    yield call(logOutAPI);
    // yield delay(1000);

    yield put({
      type: LOG_OUT_SUCCESS,
    });
  } catch (err) {
    console.error(err);
    yield put({
      type: LOG_OUT_FAILRE,
      error: err.response.data
    });
  }
}

/* ==========회원가입============ */

function signUpAPI(data) {
  return axios.post('/user', data);
  /*
    data는 email, nickname, password라는 객체이다.
    backend로 전달(서버)
  */
}

function* signUp(action) {
  try {
    const result = yield call(signUpAPI, action.data);
    console.log('signUpAPI', result);
    // throw new Error('');
    yield put({
      type: SIGN_UP_SUCCESS,
    });
  } catch (err) {
    console.error(err);
    yield put({
      type: SIGN_UP_FAILRE,
      error: err.response.data
    });
  }
}

/* ==========팔로워 리스트 불러오기============ */

function loadFollowersAPI(data) {
  return axios.get('/user/followers', data);
}

function* loadFollowers(action) {
  try {
    const result = yield call(loadFollowersAPI, action.data);
    console.log('loadFollowersAPI result', result);
    // yield delay(1000);
    yield put({
      type: LOAD_FOLLOWERS_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    console.error(err);
    yield put({
      type: LOAD_FOLLOWERS_FAILRE,
      error: err.response.data,
    });
  }
}
/* ==========팔로잉 리스트 불러오기============ */

function loadFollowingsAPI(data) {
  return axios.get('/user/followings', data);
}

function* loadFollowings(action) {
  try {
    const result = yield call(loadFollowingsAPI, action.data);
    console.log('loadFollowingsAPI result', result);
    // yield delay(1000);
    yield put({
      type: LOAD_FOLLOWINGS_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    console.error(err);
    yield put({
      type: LOAD_FOLLOWINGS_FAILRE,
      error: err.response.data,
    });
  }
}

/* ==========팔로우============ */

function followAPI(data) {
  return axios.post(`/user/${data}/follow`);
}

function* follow(action) {
  try {
    const result = yield call(followAPI, action.data);
    console.log('followAPI result', result);
    // yield delay(1000);
    yield put({
      type: FOLLOW_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    console.error(err);
    yield put({
      type: FOLLOW_FAILRE,
      error: err.response.data,
    });
  }
}
/* ==========언팔로우============ */

function unfollowAPI(data) {
  return axios.post(`/user/${data}/unfollow`);
}

function* unfollow(action) {
  try {
    const result = yield call(unfollowAPI, action.data);
    // yield delay(1000);
    yield put({
      type: UNFOLLOW_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    console.error(err);
    yield put({
      type: UNFOLLOW_FAILRE,
      error: err.response.data
    });
  }
}

/* ==========팔로워 차단============ */
function removeFollowerAPI(data) {
  return axios.delete(`/user/follower/${data}`);
}

function* removeFollower(action) {
  try {
    const result = yield call(removeFollowerAPI, action.data);
    // yield delay(1000);
    yield put({
      type: REMOVE_FOLLOWER_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    console.error(err);
    yield put({
      type: REMOVE_FOLLOWER_FAILRE,
      error: err.response.data
    });
  }
}

/* ==========닉네임변경============ */

function changeNicknameAPI(data) {
  return axios.post('/user/nickname', { nickname: data });
}

function* changeNickname(action) {
  try {
    const result = yield call(changeNicknameAPI, action.data);
    console.log('changeNicknameAPI result', result);
    // yield delay(1000);
    yield put({
      type: CHANGE_NICKNAME_SUCCESS,
      data: result.data
    });
  } catch (err) {
    console.error(err);
    yield put({
      type: CHANGE_NICKNAME_FAILRE,
      error: err.response.data
    });
  }
}

// LOG_IN_REQUEST 실행 : saga와 reducer LOG_IN_REQUEST는 동시에 실행된다.
function* watchLoadUser() {
  yield takeLatest(LOAD_MY_INFO_REQUEST, loadUser);
}
function* watchLogin() {
  yield takeLatest(LOG_IN_REQUEST, logIn);
}
function* watchLogout() {
  yield takeLatest(LOG_OUT_REQUEST, logOut);
}
function* watchSignUp() {
  yield takeLatest(SIGN_UP_REQUEST, signUp);
}
function* watchLoadFollowers() {
  yield takeLatest(LOAD_FOLLOWERS_REQUEST, loadFollowers);
}
function* watchLoadFollowings() {
  yield takeLatest(LOAD_FOLLOWINGS_REQUEST, loadFollowings);
}
function* watchFollow() {
  yield takeLatest(FOLLOW_REQUEST, follow);
}
function* watchUnFollow() {
  yield takeLatest(UNFOLLOW_REQUEST, unfollow);
}
function* watchRemoveFollower() {
  yield takeLatest(REMOVE_FOLLOWER_REQUEST, removeFollower);
}
function* watchChangeNickname() {
  yield takeLatest(CHANGE_NICKNAME_REQUEST, changeNickname);
}

export default function* userSaga() {
  yield all([
    fork(watchChangeNickname),
    fork(watchLoadUser),
    fork(watchLoadFollowers),
    fork(watchLoadFollowings),
    fork(watchFollow),
    fork(watchUnFollow),
    fork(watchRemoveFollower),
    fork(watchLogin),
    fork(watchLogout),
    fork(watchSignUp),
  ]);
}
