import { useState, useEffect } from 'react';
import Loader from 'react-loader-spinner';
import fetchImage from './Services/apiService';
import Searchbar from './Components/Searchbar';
import ImageGallery from './Components/ImageGallery';
import Notify from './Components/Notify';
import Modal from './Components/Modal';
import Button from './Components/Button';
import s from './App.module.css';

const App = () => {
  const [images, setImages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [notify, setNotify] = useState({ status: false, message: '' });
  const [showPopup, setShowPopup] = useState({
    status: false,
    targetImage: null,
  });
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    setPage(1);
    searchImages(searchQuery, 1);
  }, [searchQuery]);

  function searchImages(searchQuery, page) {
    if (searchQuery === '') {
      setImages([]);
      setShowButton(false);
      setNotify({ status: true, message: 'Please input search request' });
      return;
    }

    setIsLoading(true);
    setNotify({ status: false, message: '' });

    fetchImage(searchQuery, page)
      .then(data => {
        if (page === 1) {
          setImages(data.hits);
        } else {
          setImages(prevState => [...prevState, ...data.hits]);
          window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: 'smooth',
          });
        }

        checkButtonAndNotify(data.totalHits, images.length + data.hits.length);
        setPage(prevState => prevState + 1);
      })
      .catch(error =>
        setNotify({
          status: true,
          message: `Something wrong: ${error.message}`,
        }),
      )
      .finally(() => setIsLoading(false));
  }

  function checkButtonAndNotify(total, current) {
    setShowButton(total > current ? true : false);

    setNotify(
      !total
        ? { status: true, message: 'Nothing was found. Try again.' }
        : { status: false, message: '' },
    );
  }

  const toggleModal = ({ status, src, alt }) => {
    setShowPopup(
      status
        ? { status: true, targetImage: { src, alt } }
        : { status: false, targetImage: null },
    );
  };

  return (
    <div className={s.App}>
      <Searchbar onSubmit={setSearchQuery} />
      {notify.status && <Notify message={notify.message} />}
      {isLoading && (
        <Loader type="Circles" color="#00BFFF" height={80} width={80} />
      )}
      {images.length > 0 && (
        <ImageGallery images={images} toggleModal={toggleModal} />
      )}
      {showPopup.status && (
        <Modal
          src={showPopup.targetImage.src}
          alt={showPopup.targetImage.alt}
          toggleModal={toggleModal}
        />
      )}
      {showButton && <Button onClick={() => searchImages(searchQuery, page)} />}
    </div>
  );
};

export default App;
