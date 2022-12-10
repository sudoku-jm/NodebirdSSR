import React, { useCallback } from 'react';
import Link from 'next/link';
import PropTypes from 'prop-types';
import { Col, Input, Menu, Row } from 'antd';

import { useSelector } from 'react-redux';
import styled, { createGlobalStyle } from 'styled-components';
import Router, { useRouter } from 'next/router';
import LoginForm from './LoginForm';
import UserProfile from './UserProfile';
import useInput from '../hooks/useInput';

const Global = createGlobalStyle`
  .ant-row {
    margin-right: 0 !important;
    margin-left:0 !important;
  }
  .ant-col:first-child{
    padding-left:0 !important;
  }
  .ant-col:last-child{
    padding-right: 0 !important;
  }
`;

const SearchInput = styled(Input.Search)`
  vertical-align : middle;
`;

const AppLayout = ({ children }) => {
  // isLoggedIn의 결과가 바뀌면 AppLayout 컴포넌트가 리렌더링 된다.
  // const isLoggedIn = useSelector((state) => state.user.isLoggedIn);
  const [searchInput, onChangeSearchInput] = useInput('');
  const { me } = useSelector((state) => state.user);
  const router = useRouter();
  const onSearch = useCallback(() => {
    Router.push(`/hashtag/${searchInput}`);
  }, [searchInput]);

  return (
    <div>
      <Global />

      <Menu
        mode="horizontal"
        selectedKeys={[router.pathname]}
        items={[
          { label: <Link href="/"><a>노드버드</a></Link>, key: '/' },
          { label: <Link href="/profile"><a>프로필</a></Link>, key: '/profile' },
          { label: <SearchInput
            enterButton
            value={searchInput}
            onChange={onChangeSearchInput}
            onSearch={onSearch}
          />,
          key: '/search' }
        ]}
      />
      <Row gutter={8}>
        <Col xs={24} md={6}>
          {me ? (
            <UserProfile />
          ) : (
            <LoginForm />
          )}
        </Col>
        <Col xs={24} md={12}>
          {children}
        </Col>
        <Col xs={24} md={6}>
          <a
            href="https://www.zerocho.com"
            target="_blank"
            rel="noreferrer noopener"
          >
            Made by ZeroCho
          </a>
        </Col>
      </Row>
    </div>
  );
};

AppLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AppLayout;
