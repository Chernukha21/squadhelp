import LightBox from 'react-18-image-lightbox';
import { useState } from 'react';
import { toast } from 'react-toastify';
import styles from '../../Brief/Brief.module.sass';
import CONSTANTS from '../../../constants';
import LogoContestSpecialInfo from './LogoContestSpecialInfo';
import NameContestSpecialInfo from './NameContestSpecialInfo';
import TaglineContestSpecialInfo from './TaglineContestSpecialInfo';

const ContestInfo = props => {
  const { changeEditContest, userId, contestData, role, goChat } = props;
  const {
    typeOfTagline,
    brandStyle,
    typeOfName,
    styleName,
    contestType,
    title,
    focusOfWork,
    targetCustomer,
    industry,
    originalFileName,
    fileName,
    User,
    status,
  } = contestData;

  const [isImageOpen, setIsImageOpen] = useState(false);
  const appElement = document.getElementById('root');
  const fileUrl = `${CONSTANTS.publicURL}${fileName}`;

  const handleOpenImage = () => {
    setIsImageOpen(true);
  };

  const handleCloseImage = () => {
    setIsImageOpen(false);
  };

  const handleDownloadImage = async () => {
    try {
      const response = await fetch(fileUrl);

      if (!response.ok) {
        throw new Error('Failed to download image');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = originalFileName || fileName.split('/').pop();

      document.body.appendChild(link);
      link.click();
      link.remove();

      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 0);
    } catch (error) {
      console.error('Image download failed:', error);
      toast.error('Failed to download file');
    }
  };

  return (
    <div className={styles.mainContestInfoContainer}>
      <div className={styles.infoContainer}>
        <div className={styles.contestTypeContainer}>
          <div className={styles.dataContainer}>
            <span className={styles.label}>Contest Type</span>
            <span className={styles.data}>{contestType}</span>
          </div>
          {User.id === userId &&
            status !== CONSTANTS.CONTEST_STATUS_FINISHED && (
              <div
                onClick={() => changeEditContest(true)}
                className={styles.editBtn}
              >
                Edit
              </div>
            )}
          {role !== CONSTANTS.CUSTOMER && (
            <i onClick={goChat} className='fas fa-comments' />
          )}
        </div>
        <div className={styles.dataContainer}>
          <span className={styles.label}>Title of the Project</span>
          <span className={styles.data}>{title}</span>
        </div>
        {contestType === CONSTANTS.NAME_CONTEST ? (
          <NameContestSpecialInfo
            typeOfName={typeOfName}
            styleName={styleName}
          />
        ) : contestType === CONSTANTS.TAGLINE_CONTEST ? (
          <TaglineContestSpecialInfo
            typeOfTagline={typeOfTagline}
            nameVenture={contestData.nameVenture}
          />
        ) : (
          <LogoContestSpecialInfo
            brandStyle={brandStyle}
            nameVenture={contestData.nameVenture}
          />
        )}
        <div className={styles.dataContainer}>
          <span className={styles.label}>
            What is your Business/ Brand about?
          </span>
          <span className={styles.data}>{focusOfWork}</span>
        </div>
        <div className={styles.dataContainer}>
          <span className={styles.label}>
            Description target customers of company{' '}
          </span>
          <span className={styles.data}>{targetCustomer}</span>
        </div>
        <div className={styles.dataContainer}>
          <span className={styles.label}>Industry of company</span>
          <span className={styles.data}>{industry}</span>
        </div>
        {originalFileName && fileName && (
          <div className={styles.dataContainer}>
            <span className={styles.label}>Additional File</span>

            <button
              type='button'
              className={styles.filePreviewButton}
              onClick={handleOpenImage}
            >
              <img
                src={fileUrl}
                alt={originalFileName}
                className={styles.filePreview}
              />

              <span>{originalFileName}</span>
            </button>

            {isImageOpen && (
              <LightBox
                mainSrc={fileUrl}
                onCloseRequest={handleCloseImage}
                reactModalProps={{
                  appElement,
                }}
                toolbarButtons={[
                  <button
                    key='back'
                    type='button'
                    className={styles.lightboxButton}
                    onClick={handleCloseImage}
                  >
                    Back
                  </button>,
                  <button
                    key='download'
                    type='button'
                    className={styles.lightboxButton}
                    onClick={handleDownloadImage}
                  >
                    Download
                  </button>,
                ]}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContestInfo;
