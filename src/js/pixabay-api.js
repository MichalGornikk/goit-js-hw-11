import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

const API_KEY = '42651463-7e9bc4d6a898bed570bd4622e';
const BaseUrl = 'https://pixabay.com/api/';

function trackNetworkRequests() {
  var originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function () {
    this.addEventListener('load', function () {
      if (this.responseURL && this.responseURL.match(/\.(jpeg|jpg|gif|png)$/)) {
        console.log('Nowy obraz: ' + this.responseURL);
      }
    });
    originalOpen.apply(this, arguments);
  };
}

export function searchImages(searchQuery) {
  if (searchQuery.trim() === '') {
    iziToast.error({
      title: 'Error',
      fontSize: 'large',
      close: false,
      position: 'topRight',
      messageColor: 'white',
      timeout: 2000,
      backgroundColor: 'red',
      message: 'Please enter some text.',
    });
    return Promise.reject('Please enter some text.');
  }

  const keywords = searchQuery.trim().split(/\s+/);
  const sanitizedKeywords = keywords.join('+');

  const params = new URLSearchParams({
    key: API_KEY,
    q: sanitizedKeywords,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
  });

  trackNetworkRequests();

  return fetch(BaseUrl + '?' + params)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not OK');
      }
      return response.json();
    })
    .then(data => {
      if (data.hits.length === 0) {
        iziToast.error({
          title: 'Error',
          fontSize: 'large',
          close: false,
          position: 'topRight',
          messageColor: 'white',
          timeout: 2000,
          backgroundColor: 'red',
          message:
            'Sorry, there are no images matching your search query. Please try again!',
        });
      }
      return data;
    })
    .catch(error => console.error(error));
}
