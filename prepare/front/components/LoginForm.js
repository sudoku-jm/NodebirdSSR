import React, { useCallback, useMemo, useEffect } from 'react';
import { Form, Input, Button } from 'antd';
// import PropTypes from "prop-types";
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { loginRequestAction } from '../reducers/user';
import useInput from '../hooks/useInput';

const LoginForm = () => {
  const dispatch = useDispatch();
  const { logInLoading, logInError } = useSelector((state) => state.user);

  // const [email, setEmail] = useState('');
  // const [password, setPassword] = useState('');
  // const onChangeEmail = useCallback((e) => {
  //   setEmail(e.target.value);
  // }, []);
  // const onChangePassword = useCallback((e) => {
  //   setPassword(e.target.value);
  // }, []);

  const [email, onChangeEmail] = useInput('');
  const [password, onChangePassword] = useInput('');

  const styleFrom = useMemo(() => ({ padding: 10 }), []);
  const styleButton = useMemo(() => ({ marginTop: 10 }), []);

  // 로그인 실패 시
  useEffect(() => {
    if (logInError) {
      alert(logInError);
    }
  }, [logInError]);

  const onSubmitForm = useCallback(() => {
    /* onFinish는 e.preventDefault가 적용되어 있다. ant디자인에서는 쓰지 않는다. */
    // console.log('onSubmitForm', email, password);
    dispatch(loginRequestAction({ email, password }));
  }, [email, password]);

  return (
    <Form onFinish={onSubmitForm} style={styleFrom}>
      <div>
        <label htmlFor="user-email">이메일</label>
        <br />
        <Input name="user-email" type="email" value={email} onChange={onChangeEmail} required />
      </div>
      <div>
        <label htmlFor="user-password">비밀번호</label>
        <br />
        <Input
          type="password"
          name="user-password"
          value={password}
          onChange={onChangePassword}
          required
        />
      </div>
      <div style={styleButton}>
        <Button type="primary" htmlType="submit" loading={logInLoading}>
          로그인
        </Button>
        <Link href="/signup">
          <a>
            <Button>회원가입</Button>
          </a>
        </Link>
      </div>
    </Form>
  );
};

export default LoginForm;
