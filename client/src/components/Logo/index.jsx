import { Link } from 'react-router-dom';
import CONSTANTS from '../../constants';

const Logo = ({
  to = '/',
  src = `${CONSTANTS.STATIC_IMAGES_PATH}blue-logo.png`,
  alt = 'Squadhelp',
  className,
  ...imageProps
}) => (
  <Link to={to}>
    <img {...imageProps} src={src} alt={alt} className={className} />
  </Link>
);

export default Logo;
