import iziToast from 'izitoast';

const API_KEY = '42651463-7e9bc4d6a898bed570bd4622e';
const BaseUrl = 'https://pixabay.com/api/';
let currentPage = 1;
const perPage = 40;

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

function displayErrorToast(message) {
  iziToast.error({
    title: 'Error',
    fontSize: 'large',
    close: false,
    position: 'topRight',
    messageColor: 'white',
    timeout: 2000,
    backgroundColor: 'red',
    message: message,
  });
}

export function searchImages(searchQuery) {
  if (searchQuery.trim() === '') {
    displayErrorToast('Please enter some text.');
    return Promise.reject('Please enter some text.');
  }

  currentPage = 1;

  return fetchImages(searchQuery);
}

function fetchImages(searchQuery) {
  const keywords = searchQuery.trim().split(/\s+/);
  const sanitizedKeywords = keywords.join('+');

  const params = new URLSearchParams({
    key: API_KEY,
    q: sanitizedKeywords,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    page: currentPage,
    per_page: perPage,
  });

  trackNetworkRequests();

  return fetch(BaseUrl + '?' + params)
    .then(response => {
      if (!response.ok) {
        throw new Error('Your network bad working ');
      }
      return response.json();
    })
    .then(data => {
      if (data.hits.length === 0) {
        displayErrorToast('U can try again :D');
      }

      currentPage++;

      return data;
    })
    .catch(error => console.error(error));
}

export function loadMoreImages(searchQuery) {
  return fetchImages(searchQuery)
    .then(data => {
      const gallery = document.getElementById('gallery');
      data.hits.forEach(image => {
        const imgElement = document.createElement('img');
        imgElement.src = image.previewURL;

        gallery.appendChild(imgElement);
      });

      const loadMoreButton = document.querySelector('.load-more');
      if (data.totalHits <= currentPage * perPage) {
        loadMoreButton.style.display = 'none';
        iziToast.info({
          title: 'Info',
          fontSize: 'large',
          close: false,
          position: 'topRight',
          messageColor: 'white',
          timeout: 2000,
          backgroundColor: 'blue',
          message: "We're sorry, but you've reached the end of search results.",
        });
      } else {
        loadMoreButton.style.display = 'block';
      }
    })
    .catch(error => console.error(error));
}
