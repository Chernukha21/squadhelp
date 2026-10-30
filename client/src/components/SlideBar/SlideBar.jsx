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

const carouselClassNames = {
  [carouselConstants.MAIN_SLIDER]: style.mainCarousel,
  [carouselConstants.EXAMPLE_SLIDER]: style.exampleCarousel,
  [carouselConstants.FEEDBACK_SLIDER]: style.feedbackCarousel,
};

const SliderBar = ({ carouselType, images = {} }) => {
  const renderSlides = () => {
    const imageEntries = Object.entries(images);

    switch (carouselType) {
      case carouselConstants.MAIN_SLIDER:
        return imageEntries.map(([imageKey, imageSrc], index) => (
          <img
            key={imageKey}
            src={imageSrc}
            alt={`Slide ${index + 1}`}
            className={style['carousel-cell']}
          />
        ));

      case carouselConstants.EXAMPLE_SLIDER:
        return imageEntries.map(([imageKey, imageSrc], index) => (
          <div className={style['example-cell']} key={imageKey}>
            <img src={imageSrc} alt={`Example ${index + 1}`} />

            <p>{carouselConstants.EXAMPLE_SLIDER_TEXT[index]}</p>
          </div>
        ));

      case carouselConstants.FEEDBACK_SLIDER:
        return imageEntries.map(([imageKey, imageSrc], index) => (
          <div className={style['feedback-cell']} key={imageKey}>
            <img src={imageSrc} alt={`Feedback ${index + 1}`} />

            <p>{carouselConstants.FEEDBACK_SLIDER_TEXT[index].feedback}</p>

            <span>{carouselConstants.FEEDBACK_SLIDER_TEXT[index].name}</span>
          </div>
        ));

      default:
        return null;
    }
  };

  return (
    <Flickity
      className={carouselClassNames[carouselType] ?? ''}
      elementType='div'
      options={flickityOptions}
    >
      {renderSlides()}
    </Flickity>
  );
};

export default memo(SliderBar);
