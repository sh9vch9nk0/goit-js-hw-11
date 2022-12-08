import Notiflix from 'notiflix';
import SearchImg from './fetchSomething';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const searchImg = new SearchImg();
const lightbox = new SimpleLightbox('div.photo-card a', {
  captionDelay: 250,
});

const refs = {
  form: document.querySelector('.search-form'),
  galleryDiv: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
  resetBtn: document.querySelector('.reset'),
  buttonsDiv: document.querySelector('.buttons-container'),
};

refs.form.addEventListener('submit', onFormSearch);
refs.loadMoreBtn.addEventListener('click', onLoadMoreBtn);
refs.resetBtn.addEventListener('click', onResetBtn);

function onFormSearch(e) {
  e.preventDefault();
  const {
    elements: { searchQuery },
  } = e.target;

  const searchValue = searchQuery.value.toLowerCase().trim();

  if (!searchValue) {
    Notiflix.Notify.failure('Please, type below your search query!');
    return;
  }
  searchImg.query = searchValue;
  refs.galleryDiv.innerHTML = '';
  searchImg.page = 1;
  searchImg
    .fetchImgByName()
    .then(data => {
      const isMorePhotos = searchImg.page <= Math.ceil(data.totalHits / 12);
      if (!data.total) {
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
        return;
      }
      if (!isMorePhotos) {
        createMarkUp(data.hits);
        return;
      } else {
        refs.buttonsDiv.classList.remove('is-hidden');
        createMarkUp(data.hits);
      }
    })
    .catch(error => console.log(error));
  e.target.reset();
}

function createMarkUp(arrayOfPhotos) {
  const allImg = arrayOfPhotos.map(
    ({
      webformatURL,
      largeImageURL,
      tags,
      likes,
      views,
      comments,
      downloads,
    }) => {
      return `
        <div class="photo-card">
          <a class="photo-card__link" href="${largeImageURL}">          
          <img src="${webformatURL}" alt="${tags}" loading="lazy" />
           
          </a>  
          <div class="info">
            <p class="info-item">
              <b> ${likes}</b>
            </p>
            <p class="info-item"> 
              <b> ${views}</b>
            </p>
            <p class="info-item">
              <b> ${comments}</b>
            </p>
            <p class="info-item">
              <b> ${downloads}</b>
            </p>
          </div>                  
        </div>`;
    }
  );
  const firstImg = allImg.slice(0, 4).join('');
  const secondImg = allImg.slice(4, 8).join('');
  const thirdImg = allImg.slice(8).join('');
  const markUp = `<div class="column">${firstImg}</div><div class="column">${secondImg}</div><div class="column">${thirdImg}</div>`;
  refs.galleryDiv.insertAdjacentHTML('beforeend', markUp);

  lightbox.refresh();
}

function onLoadMoreBtn() {
  searchImg
    .fetchImgByName()
    .then(data => {
      if (data.hits.length >= 12) {
        Notiflix.Notify.success(
          `Hooray! We found ${(searchImg.page - 1) * 12} images.`
        );
        createMarkUp(data.hits);
      } else if (data.hits.length < 12) {
        refs.buttonsDiv.classList.add('is-hidden');
        createMarkUp(data.hits);
        Notiflix.Notify.failure(
          "We're sorry, but you've reached the end of search results."
        );
        return;
      }
    })
    .catch(error => console.log(error));
}

function onResetBtn() {
  location.reload();
}
