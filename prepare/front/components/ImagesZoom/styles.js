import styled, { createGlobalStyle } from 'styled-components';
import { CloseOutlined } from '@ant-design/icons';

export const Overlay = styled.div`
position: fixed;
top:0;
left:0;
right:0;
bottom:0;
z-index: 5000;
`;

export const Header = styled.header`
height: 44px;
background:white;
position: relative;
padding:0;
text-align: center;
& > h1 {
    margin:0;
    font-size: 17px;
    color:#333;
    line-height: 44px;
}
`;

export const CloseBtn = styled(CloseOutlined)`
position: absolute;
top:0;
right:0;
padding:15px;
line-height: 14px;
cursor: pointer;
`;

export const SlickWrapper = styled.div`
height:calc(100% - 44px);
background: #090909;
`;

export const ImgWrapper = styled.div`
padding:32px;
text-align: center;
& > img {
    margin: 0 auto;
    max-height:550px;
}
`;

export const Indicator = styled.div`       //자식선택자
text-align: center;
& > div {
    width: 75px;
    height:38px;
    line-height: 30px;
    border-radius: 15px;
    background: #313131;
    display:inline-block;
    text-align: center;
    color:white;
    font-size:15px;
}
`;

export const Global = createGlobalStyle`
.slick-slide {
    display:inline-block;
}
.ant-card-cover{
    transform: none !important;
}
`;
