import React, { useMemo, } from 'react';
import PropTypes from 'prop-types';
import { List, Card, Button } from 'antd';
import { StopOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { useDispatch } from 'react-redux';

import { UNFOLLOW_REQUEST, REMOVE_FOLLOWER_REQUEST } from '../reducers/user';

const ListMoreWrap = styled.div`
  text-align: center;
  margin:10px 0;
`;

const FollowList = ({ header, data, onClickMore, loading }) => {
  const dispatch = useDispatch();
  const onCancle = (id) => () => { // 반복문에 onClick 대한 고차함수는 이런식으로 적어준다.
    if (header === '팔로잉') {
      dispatch({
        type: UNFOLLOW_REQUEST,
        data: id
      });
    }
    // 팔로워 차단
    dispatch({
      type: REMOVE_FOLLOWER_REQUEST,
      data: id,
    });
  };

  const styleList = useMemo(
    () => ({
      marginBottom: '20px',
    }),
    []
  );
  const styleListItem = useMemo(
    () => ({
      marginTop: '20px',
    }),
    []
  );

  return (
    <List
      style={styleList}
      grid={{ gutter: 4, xs: 2, md: 3 }}
      size="small"
      header={<div>{header}</div>}
      loadMore={(
        <ListMoreWrap>
          <Button onClick={onClickMore} loading={loading}>더 보기</Button>
        </ListMoreWrap>
      )}
      bordered
      dataSource={data}
      renderItem={(item) => (
        <List.Item style={styleListItem}>
          <Card actions={[<StopOutlined key="stop" onClick={onCancle(item.id)} />]}>
            <Card.Meta description={item.nickname} />
          </Card>
        </List.Item>
      )}
    />
  );
};

// defaultProps : props를 따로 지정해주지 않아도 기본값으로 전달 해주는 props
FollowList.defaultProps = {
  data: [],
};

FollowList.propTypes = {
  header: PropTypes.string.isRequired,
  data: PropTypes.array,
  onClickMore: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired
};

export default FollowList;
