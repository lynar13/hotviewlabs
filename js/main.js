document.addEventListener('DOMContentLoaded', async () => {
  await fetchPosts();
  setupCarousel();
});

let allPosts = [];
let filteredPosts = [];
let currentPage = 1;
const postsPerPage = 6;

async function fetchPosts() {
  try {
      const response = await fetch('https://v2.api.noroff.dev/blog/posts/jolyn');
      const data = await response.json();
      allPosts = data;
      filteredPosts = data;
      populateCarousel(data);
      populateThumbnails();
      setupFilterButtons();
      updatePagination();
  } catch (error) {
      console.error('Error fetching posts:', error);
  }
}

function populateCarousel(posts) {
  const carousel = document.getElementById('carousel');
  posts.slice(0, 3).forEach(post => {
      const item = document.createElement('div');
      item.innerHTML = `
          <img src="${post.image}" alt="${post.title}">
          <button onclick="window.location.href='post/index.html?id=${post.id}'">Read More</button>
      `;
      carousel.appendChild(item);
  });
}

function setupCarousel() {
  const carousel = document.getElementById('carousel');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  let index = 0;

  prevBtn.addEventListener('click', () => {
      index = (index > 0) ? index - 1 : carousel.children.length - 1;
      updateCarousel();
  });

  nextBtn.addEventListener('click', () => {
      index = (index < carousel.children.length - 1) ? index + 1 : 0;
      updateCarousel();
  });

  function updateCarousel() {
      const offset = -index * 100;
      carousel.style.transform = `translateX(${offset}%)`;
  }
}

function setupFilterButtons() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(button => {
      button.addEventListener('click', () => {
          filterButtons.forEach(btn => btn.classList.remove('active'));
          button.classList.add('active');
          const category = button.getAttribute('data-category');
          filterPosts(category);
      });
  });
}

function filterPosts(category) {
  if (category === 'all') {
      filteredPosts = allPosts;
  } else {
      filteredPosts = allPosts.filter(post => post.category === category);
  }
  currentPage = 1;
  populateThumbnails();
  updatePagination();
}

function populateThumbnails() {
  const thumbnailsContainer = document.getElementById('thumbnails-container');
  thumbnailsContainer.innerHTML = '';
  const start = (currentPage - 1) * postsPerPage;
  const end = start + postsPerPage;
  const postsToDisplay = filteredPosts.slice(start, end);
  postsToDisplay.forEach(post => {
      const item = document.createElement('div');
      item.innerHTML = `
          <img src="${post.image}" alt="${post.title}">
          <a href="post/index.html?id=${post.id}">${post.title}</a>
      `;
      thumbnailsContainer.appendChild(item);
  });
}

function updatePagination() {
  const pageInfo = document.getElementById('page-info');
  const prevPageBtn = document.getElementById('prev-page');
  const nextPageBtn = document.getElementById('next-page');

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
}
