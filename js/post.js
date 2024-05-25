document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const postId = params.get('id');
    const postName = params.get('name');
    
    
    // Try fetching the post
    try {
        if (postId && postName) {
            showLoader();
            await fetchPostById(postName, postId);
            hideLoader();
        } else {
            console.error('Post ID or name not found in URL.');
        }
    } catch (error) {
        console.error('Error fetching post:', error);
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

async function fetchPostById(name, id) {
    const token = localStorage.getItem('accessToken');
    try {
        const response = await fetch(`https://v2.api.noroff.dev/blog/posts/${name}/${id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error('Post not found');
        }
        const data = await response.json();
        console.log('API Response:', data); // Add this line to log the response
        const post = data.data; // Ensure this matches the API response structure
        if (post) {
            populatePostContent(post);
        } else {
            console.error('Post not found.');
        }
    } catch (error) {
        console.error('Error fetching post:', error);
        throw error;
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
    if (contentElement) {
        contentElement.innerHTML = post.body;
    }
}

function editPost(id) {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        alert('You need to log in to edit posts');
        return;
    }
    window.location.href = `/post/edit.html?id=${id}&token=${token}`;
}

// Delete a post
async function deletePost(name, id) {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        alert('You need to log in to delete posts');
        return;
    }

    try {
        const response = await fetch(`https://v2.api.noroff.dev/blog/posts/${name}/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error('Failed to delete post');
        }
        alert('Post deleted successfully');
        window.location.href = '/index.html'; // Redirect to the main page after deletion
    } catch (error) {
        console.error('Error deleting post:', error);
        alert('Error deleting post: ' + error.message);
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
