import './css/styles.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { PixabayApi } from './pixabay-api';
import createGallery from './templates/markup.hbs';

const lightbox = new SimpleLightbox('.photo-card a', {
  captionsData: 'alt',
  captionDelay: 250,
});
const searchFormEl = document.querySelector('#search-form');
const galleryEl = document.querySelector('.gallery');
const targetElement = document.querySelector('.js-target-element');

let searchCompare;

const pixabayApi = new PixabayApi();

const observer = new IntersectionObserver(
  async (entries, observer) => {
    if (entries[0].isIntersecting) {
      try {
        const { data } = await pixabayApi.fetchPhotos();
        renderMarkup(data);

        const { height: cardHeight } = document
          .querySelector('.gallery')
          .firstElementChild.getBoundingClientRect();

        window.scrollBy({
          top: cardHeight * 2,
          behavior: 'smooth',
        });

        lightbox.refresh();
        if (Math.ceil(data.totalHits / 40) === pixabayApi.page) {
          observer.unobserve(targetElement);
          Notify.info(
            "We're sorry, but you've reached the end of search results."
          );
        }
      } catch (err) {
        console.log(err);
      } finally {
        pixabayApi.page += 1;
      }
    }
  },
  {
    root: null,
    rootMargin: '0px 0px 400px 0px',
    threshold: 1,
  }
);

const onSearchFormSubmit = async event => {
  event.preventDefault();
  pixabayApi.searchQuery = event.target.elements.searchQuery.value.trim();
  if (pixabayApi.searchQuery === searchCompare) {
    return;
  }
  pixabayApi.page = 1;
  searchCompare = event.target.elements.searchQuery.value.trim();
  galleryEl.innerHTML = '';

  try {
    const { data } = await pixabayApi.fetchPhotos();
    if (data.hits.length === 0) {
      galleryEl.innerHTML = '';
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }

    Notify.success(`Hooray! We found ${data.totalHits} images.`);
    renderMarkup(data);
    lightbox.refresh();
    if (data.totalHits / 40 > pixabayApi.page) {
      observer.observe(targetElement);
      pixabayApi.page += 1;
    }
  } catch (err) {
    galleryEl.innerHTML = '';
    console.log(err);
    Notify.failure('Error');
    return;
  }
};

function renderMarkup(promiseArray, position = 'beforeend') {
  const markup = createGallery(promiseArray.hits);
  galleryEl.insertAdjacentHTML(position, markup);
}

searchFormEl.addEventListener('submit', onSearchFormSubmit);
