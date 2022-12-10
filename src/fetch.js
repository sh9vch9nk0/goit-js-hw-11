import Notiflix from 'notiflix';
import { scrollEnd } from '.';

const axios = require('axios').default;
const API_key = '31392505-41b93051c6715e7012a1d9703';

export async function fetchPictures(search, pageNumber) {
  const url = `https://pixabay.com/api/?key=${API_key}&q=${search}&image_type=photo&orientation=horizontal&safesearch=true&per_page=40&page=${pageNumber}`;
  const imgs = await axios.get(url);
  if (!imgs.data.totalHits) {
    Notiflix.Notify.warning(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    if (pageNumber === 1) {
      gallery.innerHTML = '';
    }
    return;
  }
  if (imgs.data.totalHits / 40 < pageNumber) {
    Notiflix.Notify.warning(
      "We're sorry, but you've reached the end of search results."
    );
    gallery.removeEventListener('scroll', scrollEnd);
    return;
  }
  return imgs.data;
}
