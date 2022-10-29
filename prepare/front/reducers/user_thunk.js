export const initalState = {
  isLoggedIn: false,
  me: null,
  signUpdata: {},
  loginData: {},
};

// thunk를 쓰면 함수를 return 하는 비동기 action creator가 추가된다.
export const loginAction = (data) => {
  return (dispatch, getState) => {
    const state = getState(); // state는 초기화 state가 나올 것이다.

    dispatch(loginRequestAction());

    axios.post('/api/login')
      .then((res) => {
        dispatch(loginSuccessAction(res.data));
      })
      .catch((err) => {
        dispatch(loginFailureAction(err));
      });
  };
};

// 로그인 액션
export const loginRequestAction = (data) => {
  return {
    type: 'LOG_IN_REQUEST',
    data
  };
};
export const loginSuccessAction = (data) => {
  return {
    type: 'LOG_IN_SUCCESS',
    data
  };
};
export const loginFailureAction = (data) => {
  return {
    type: 'LOG_IN_FAILURE',
    data
  };
};

// 로그아웃 액션
export const logoutRequestAction = () => {
  return {
    type: 'LOG_OUT_REQUEST',
  };
};
export const logoutSuccessAction = () => {
  return {
    type: 'LOG_OUT_SUCCESS',
  };
};
export const logoutFailureAction = () => {
  return {
    type: 'LOG_OUT_FAILURE',
  };
};

const reducer = (state = initalState, action) => {
  switch (action.type) {
    case 'LOG_IN':
      return {
        ...state,
        isLoggedIn: true,
        me: action.data,
      };
    case 'LOG_OUT':
      return {
        ...state,
        isLoggedIn: false,
        me: null,
      };
    default:
      return state;
  }
};

export default reducer;
