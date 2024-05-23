document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const postId = params.get('id');
    if (postId) {
      showLoader();
      await fetchPostById(postId);
      hideLoader();
    } else {
      console.error('Post ID not found in URL.');
    }
  
    setupSearch();
  
    const createPostBtn = document.getElementById('create-post-btn');
    const postForm = document.getElementById('post-form');
    if (createPostBtn) {
      createPostBtn.addEventListener('click', showCreatePostForm);
    }
    if (postForm) {
      postForm.addEventListener('submit', handleSubmitPostForm);
    }
  });
async function fetchPostById(id) {
    const name = "jolyn"; 
    try {
        const response = await fetch(`https://v2.api.noroff.dev/blog/posts/${name}/${id}`);
        const data = await response.json();
        const post = data.data;
        if (post) {
            populatePostContent(post);
        } else {
            console.error('Post not found.');
        }
    } catch (error) {
        console.error('Error fetching post:', error);
    }
}

function populatePostContent(post) {
    const titleElement = document.getElementById('post-title');
    const authorElement = document.getElementById('post-author');
    const createdElement = document.getElementById('post-created');
    const updatedElement = document.getElementById('post-updated');
    const imageElement = document.getElementById('post-image');
    const contentElement = document.getElementById('post-content');

    if (titleElement) titleElement.textContent = post.title;
    if (authorElement) authorElement.textContent = `Author: ${post.author.name}`;
    if (createdElement) createdElement.textContent = `Created: ${new Date(post.created).toLocaleDateString()}`;
    if (updatedElement) updatedElement.textContent = `Updated: ${new Date(post.updated).toLocaleDateString()}`;
    if (imageElement) {
        imageElement.src = post.media.url;
        imageElement.alt = post.media.alt;
    }
    if (contentElement) contentElement.innerHTML = post.body;
}

async function fetchPosts(query = '') {
    const name = "jolyn"; 
    try {
        let url = `https://v2.api.noroff.dev/blog/posts/${name}`;
        if (query) {
            url += `?_tag=${query}`;
        }
        const response = await fetch(url);
        const data = await response.json();
        console.log('Response data:', data); 
        if (data.data && Array.isArray(data.data)) {
            populatePostList(data.data);
        } else {
            console.error('No posts available or invalid response format');
        }
    } catch (error) {
        console.error('Error fetching posts:', error);
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
    fetchPosts(query);
}

async function handleSubmitPostForm(event) {
    event.preventDefault();
    const postId = document.getElementById('post-id').value;
    const title = document.getElementById('post-title-input').value;
    const body = document.getElementById('post-content-input').value;
    const tags = document.getElementById('post-tags-input').value.split(',').map(tag => tag.trim());
    const media = {
        url: document.getElementById('post-image-input').value,
        alt: document.getElementById('post-image-alt-input').value
    };
    const post = { title, body, tags, media };
    const name = "jolyn"; 

    if (postId) {
        await editPostRequest(name, postId, post);
    } else {
        await createPost(post, name);
    }
    document.getElementById('post-form-section').style.display = 'none';
    await fetchPosts();
}

async function createPost(post, name) {
    try {
        const token = localStorage.getItem('accessToken');
        console.log('Token:', token);
        const response = await fetch(`https://v2.api.noroff.dev/blog/posts/${name}`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(post)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Post created:', data);
    } catch (error) {
        console.error('Error creating post:', error);
    }
}

async function editPostRequest(name, id, post) {
    try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`https://v2.api.noroff.dev/blog/posts/${name}/${id}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(post)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Post edited:', data);
    } catch (error) {
        console.error('Error editing post:', error);
    }
}

async function deletePost(id) {
    const name = "jolyn"; 
    try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`https://v2.api.noroff.dev/blog/posts/${name}/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        await fetchPosts();
        console.log('Post deleted:', id);
    } catch (error) {
        console.error('Error deleting post:', error);
    }
}

function populatePostList(postsData) {
    const postList = document.getElementById('post-list');
    if (!postList) {
        console.error('Post list element not found.');
        return;
    }
    
    postList.innerHTML = '';

    if (!postsData || !Array.isArray(postsData)) {
        console.error('Invalid or empty posts data.');
        return;
    }

    postsData.forEach(post => {
        const item = document.createElement('div');
        item.className = 'post-item';
        const { id, title, author, created, updated, media, body } = post;
        item.innerHTML = `
            <h2><a href="index.html?id=${id}">${title}</a></h2>
            <p>Author: ${author.name}</p>
            <p>Created: ${new Date(created).toLocaleDateString()}</p>
            <p>Updated: ${new Date(updated).toLocaleDateString()}</p>
            <img src="${media.url}" alt="${media.alt}">
            <p>${body}</p>
            <div>
                <button onclick="editPost('${id}')">Edit</button>
                <button onclick="deletePost('${id}')">Delete</button>
            </div>
        `;
        postList.appendChild(item);
    });
}

function showCreatePostForm() {
    document.getElementById('post-id').value = '';
    document.getElementById('post-form').reset();
    document.getElementById('submit-post-btn').textContent = 'Create Post';
    document.getElementById('post-form-section').style.display = 'block';
}

function editPost(id) {
    const name = "jolyn"; 
    fetchPost(name, id);
    document.getElementById('post-id').value = id;
    document.getElementById('submit-post-btn').textContent = 'Edit Post';
    document.getElementById('post-form-section').style.display = 'block';
}

async function fetchPost(name, id) {
    try {
        const response = await fetch(`https://v2.api.noroff.dev/blog/posts/${name}/${id}`);
        const data = await response.json();
        const post = data.data;
        document.getElementById('post-title-input').value = post.title;
        document.getElementById('post-author-input').value = post.author.name;
        document.getElementById('post-date-input').value = post.created.split('T')[0];
        document.getElementById('post-image-input').value = post.media.url;
        document.getElementById('post-image-alt-input').value = post.media.alt;
        document.getElementById('post-content-input').value = post.body;
    } catch (error) {
        console.error('Error fetching post:', error);
    }
}

function showLoader() {
    document.getElementById('loader').style.display = 'block';
}

function hideLoader() {
    document.getElementById('loader').style.display = 'none';
}
