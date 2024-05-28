let allPosts = [];
let filteredPosts = [];
let currentPage = 1;
const postsPerPage = 12;
const userName = 'jolyn';

document.addEventListener('DOMContentLoaded', async () => {
  showLoader();
  await fetchPosts();
  hideLoader();

  const logoutButton = document.getElementById('logout-button');
  if (logoutButton) {
      logoutButton.addEventListener('click', logout);
  }

  setupCarousel();
  setupSearch();
});

async function fetchPosts(tag = '') {
  const token = localStorage.getItem('accessToken');
  let url = `https://v2.api.noroff.dev/blog/posts/${userName}`;
  if (tag) {
    url += `?_tag=${tag}`;
  }

  try {
      const response = await fetch(url, {
          method: 'GET',
          headers: {
              'Authorization': `Bearer ${token}`
          }
      });
      const data = await response.json();
      if (data.data && data.data.length > 0) {
          allPosts = data.data;
          filteredPosts = data.data;
          populateCarousel(data.data);
          populateThumbnails();
          setupFilterButtons();
          updatePagination();
      } else {
          console.error('No posts available');
      }
  } catch (error) {
      console.error('Error fetching posts:', error);
  }
}

function populateCarousel(posts) {
  const carousel = document.getElementById('carousel');
  if (carousel) {
    carousel.innerHTML = ''; // Clear existing content
    posts.slice(0, 3).forEach(post => {
      const item = document.createElement('div');
      item.className = 'carousel-item'; 
      item.innerHTML = `
        <a href="post/index.html?name=${userName}&id=${post.id}">
          <img src="${post.media.url}" alt="${post.media.alt}">
          <div class="carousel-content">
            <div class="carousel-title">${post.title}</div> 
          </div> 
          <button class="read-more-btn">Read More</button> 
        </a>
      `;
      carousel.appendChild(item);
    });
  } else {
    console.error('Carousel element not found');
  }
}

function setupCarousel() {
  const carousel = document.getElementById('carousel');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');

  if (!carousel || !prevBtn || !nextBtn) {
      console.error('Carousel or navigation buttons not found');
      return; // Exit the function if elements are not found
  }

  let index = 0;

  function updateCarousel() {
      const offset = -index * 100;
      carousel.style.transform = `translateX(${offset}%)`;
  }

  function showNextSlide() {
      index = (index < carousel.children.length - 1) ? index + 1 : 0;
      updateCarousel();
  }

  function showPrevSlide() {
      index = (index > 0) ? index - 1 : carousel.children.length - 1;
      updateCarousel();
  }

  prevBtn.addEventListener('click', showPrevSlide);
  nextBtn.addEventListener('click', showNextSlide);

  // Automatically move to the next slide every 5 seconds
  setInterval(showNextSlide, 5000);
}

function setupFilterButtons() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(button => {
    button.addEventListener('click', async () => {
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      const category = button.getAttribute('data-category');
      showLoader();
      await fetchPosts(category === 'all' ? '' : category);
      hideLoader();
    });
  });
}

function populateThumbnails() {
  const thumbnailsContainer = document.getElementById('thumbnails-container');
  if (thumbnailsContainer) {
      thumbnailsContainer.innerHTML = '';
      const start = (currentPage - 1) * postsPerPage;
      const end = start + postsPerPage;
      const postsToDisplay = filteredPosts.slice(start, end);
      postsToDisplay.forEach(post => {
          const item = document.createElement('div');
          item.className = 'thumbnail-item'; 
          item.innerHTML = `
          <a href="post/index.html?name=${userName}&id=${post.id}">
            <img src="${post.media.url}" alt="${post.media.alt}">
              <div class="thumbnail-content">
                  <h3 class="thumbnail-title">${post.title}</h3>
                  <div class="thumbnail-text">
                  <p class="thumbnail-author">Author: ${post.author.name}</p>
                  <p class="thumbnail-date">Date: ${new Date(post.created).toLocaleDateString()}</p>
                  </div>
                  <button class="read-more-btn">Read More</button>
              </div>
          </a>
          `;
          thumbnailsContainer.appendChild(item);
      });
  } else {
      console.error('Thumbnails container not found');
  }
}

function updatePagination() {
  const pageInfo = document.getElementById('page-info');
  const prevPageBtn = document.getElementById('prev-page');
  const nextPageBtn = document.getElementById('next-page');

  if (pageInfo && prevPageBtn && nextPageBtn) {
    pageInfo.textContent = `Page ${currentPage} of ${Math.ceil(filteredPosts.length / postsPerPage)}`;

    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === Math.ceil(filteredPosts.length / postsPerPage);

    prevPageBtn.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        populateThumbnails();
        updatePagination();
      }
    });

    nextPageBtn.addEventListener('click', () => {
      if (currentPage < Math.ceil(filteredPosts.length / postsPerPage)) {
        currentPage++;
        populateThumbnails();
        updatePagination();
      }
    });
  } else {
    console.error('Pagination elements not found');
  }
}

function setupSearch() {
  const searchIcon = document.getElementById('search-icon');
  const searchInput = document.getElementById('search-input');

  if (searchIcon && searchInput) {
    searchIcon.addEventListener('click', () => {
      searchInput.style.display = 'inline-block';
      searchInput.focus();
    });

    searchInput.addEventListener('blur', () => {
      if (!searchInput.value) {
        searchInput.style.display = 'none';
      }
    });

    searchInput.addEventListener('input', handleSearch);
  }
}

function handleSearch(event) {
  const query = event.target.value.toLowerCase();
  filteredPosts = allPosts.filter(post => post.title.toLowerCase().includes(query) || post.body.toLowerCase().includes(query));
  currentPage = 1;
  populateThumbnails();
  updatePagination();
}

function showLoader() {
  const loader = document.getElementById('loader');
  if (loader) {
    loader.style.display = 'block';
  } else {
    console.error('Loader element not found.');
  }
}

function hideLoader() {
  const loader = document.getElementById('loader');
  if (loader) {
    loader.style.display = 'none';
  } else {
    console.error('Loader element not found.');
  }
}
