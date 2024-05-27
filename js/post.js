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

    // Show edit and delete buttons if logged in
    const token = localStorage.getItem('accessToken');
    if (token) {
        const postActions = document.getElementById('post-actions');
        if (postActions) {
            postActions.style.display = 'block';

            document.getElementById('edit-button').addEventListener('click', () => {
                window.location.href = `/post/edit.html?id=${postId}&name=${postName}`;
            });

            document.getElementById('delete-button').addEventListener('click', async () => {
                await deletePost(postName, postId);
            });
        }
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
            populateEditForm(post);
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
    const editButton = document.getElementById('edit-button');
    const deleteButton = document.getElementById('delete-button');

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

function populateEditForm(post) {
    const postIdElement = document.getElementById('post-id');
    const titleInputElement = document.getElementById('post-title-input');
    const contentInputElement = document.getElementById('post-content-input');
    const tagsInputElement = document.getElementById('post-tags-input');
    const imageUrlInputElement = document.getElementById('post-image-input');
    const imageAltInputElement = document.getElementById('post-image-alt-input');

    if (postIdElement) postIdElement.value = post.id;
    if (titleInputElement) titleInputElement.value = post.title;
    if (contentInputElement) contentInputElement.value = post.body;
    if (tagsInputElement) tagsInputElement.value = post.tags.join(', ');
    if (imageUrlInputElement) imageUrlInputElement.value = post.media.url;
    if (imageAltInputElement) imageAltInputElement.value = post.media.alt;
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
        window.location.href = `/index.html`;
    } catch (error) {
        console.error('Error editing post:', error);
    }
}

// Define the showCreatePostForm function
function showCreatePostForm() {
    document.getElementById('post-id').value = '';
    document.getElementById('post-form').reset();
    document.getElementById('submit-post-btn').textContent = 'Create Post';
    document.getElementById('post-form-section').style.display = 'block';
}

// Redirect to the edit form
function editPost(id) {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        alert('You need to log in to edit posts');
        return;
    }
    window.location.href = `post/edit.html?id=${id}&token=${token}`;
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
