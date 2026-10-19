import { memo } from 'react';
import Flickity from 'react-flickity-component';
import style from './SlideBar.module.sass';
import carouselConstants from '../../carouselConstants';
import './flickity.css';

const flickityOptions = {
  draggable: true,
  wrapAround: true,
  pageDots: false,
  prevNextButtons: true,
  autoPlay: 3000,
  groupCells: true,
};

const SliderBar = props => {
  const getStyleName = () => {
    const { carouselType } = props;
    switch (carouselType) {
      case carouselConstants.MAIN_SLIDER:
        return style.mainCarousel;
      case carouselConstants.EXAMPLE_SLIDER:
        return style.exampleCarousel;
      case carouselConstants.FEEDBACK_SLIDER:
        return style.feedbackCarousel;
    }
  };

  const renderSlides = () => {
    const { carouselType, images } = props;
    switch (carouselType) {
      case carouselConstants.MAIN_SLIDER: {
        return Object.keys(images).map((key, index) => (
          <img
            src={images[key]}
            alt='slide'
            key={index}
            className={style['carousel-cell']}
          />
        ));
      }
      case carouselConstants.EXAMPLE_SLIDER: {
        return Object.keys(images).map((key, index) => (
          <div className={style['example-cell']} key={index}>
            <img src={images[key]} alt='slide' />
            <p>{carouselConstants.EXAMPLE_SLIDER_TEXT[index]}</p>
          </div>
        ));
      }
      case carouselConstants.FEEDBACK_SLIDER: {
        return Object.keys(images).map((key, index) => (
          <div className={style['feedback-cell']} key={index}>
            <img src={images[key]} alt='slide' />
            <p>{carouselConstants.FEEDBACK_SLIDER_TEXT[index].feedback}</p>
            <span>{carouselConstants.FEEDBACK_SLIDER_TEXT[index].name}</span>
          </div>
        ));
      }
    }
  };
  return (
    <Flickity
      className={getStyleName()}
      elementType='div'
      options={flickityOptions}
    >
      {renderSlides()}
    </Flickity>
  );
};

export default memo(SliderBar);
