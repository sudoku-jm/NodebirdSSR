import { HYDRATE } from 'next-redux-wrapper';
import { combineReducers } from 'redux';
import user from './user';
import post from './post';

// reducer
const rootReducer = (state, action) => {
  switch (action.type) {
    case HYDRATE:
      console.log('HYDRATE', HYDRATE);
      return action.payload;
    default: {
      const combinedReducer = combineReducers({ // user와 post를 합친 리듀서 함수
        user,
        post,
      });
      return combinedReducer(state, action);
    }
  }
};

export default rootReducer;
