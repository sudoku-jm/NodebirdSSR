import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Slick from 'react-slick';
import { Global, Overlay, Header, CloseBtn, SlickWrapper, ImgWrapper, Indicator } from './styles';

const ImagesZoom = ({ images, onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  return (
    <Overlay>
      <Global />
      <Header>
        <h1>상세이미지</h1>
        <CloseBtn onClick={onClose}>X</CloseBtn>
      </Header>
      <SlickWrapper>
        <div>
          <Slick
            initialSlide={0}
            beforeChange={(slide) => setCurrentSlide(slide)}
            infinite
            arrows={false}
            slidesToShow={1}
            slidesToScroll={1}
          >
            {images.map((y) => (
              <ImgWrapper key={y.src}>
                <img src={`http://localhost:5500/images/${y.src}`} alt={y.src} />
              </ImgWrapper>
            )) }
          </Slick>
          <Indicator>
            <div>
              {currentSlide + 1}
              {''}
              /
              {images.length}
            </div>
          </Indicator>
        </div>
      </SlickWrapper>
    </Overlay>
  );
};

ImagesZoom.prototypes = {
  images: PropTypes.arrayOf(PropTypes.object),
  onClose: PropTypes.func.isRequired,
};

export default ImagesZoom;
