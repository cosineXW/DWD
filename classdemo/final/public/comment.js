function togglePostForm() {
    let formContainer = document.getElementById("post-form-container");
    formContainer.classList.toggle("show-form");
}
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function loadLatestPosts() {
    let container = document.getElementById("posts-container");
    let loadingDiv = document.getElementById("loading-div");
    loadingDiv.classList.add("active-loading"); 
    await sleep(1000); 

    try {
        let response = await fetch('/api/latest?t=' + Date.now());
        let data = await response.json();
        renderPostsToScreen(data.posts); 
        loadingDiv.classList.remove("active-loading"); 
    } catch (error) {
        container.innerHTML = "<i>Failed to load database.</i>";
        loadingDiv.classList.remove("active-loading");
    }
}

window.onload = () => {
    loadLatestPosts();
    loadNeighbors();
};

async function searchUser() {
    let searchInput = document.getElementById("search-input").value.trim();
    if (!searchInput) return; 
    let container = document.getElementById("posts-container");
    let loadingDiv = document.getElementById("loading-div");
    loadingDiv.classList.add("active-loading");
    await sleep(1500); 

    try {
        let response = await fetch(`/api/search?username=${searchInput}&t=${Date.now()}`);
        let data = await response.json();
        
        if (data.posts.length === 0) {
            container.innerHTML = "<i>No records found for user: <b>" + searchInput + "</b></i>";
        } else {
            renderPostsToScreen(data.posts);
        }
        loadingDiv.classList.remove("active-loading");
    } catch (error) {
        container.innerHTML = "<i>Search failed.</i>";
        loadingDiv.classList.remove("active-loading");
    }
}

function resetHome() {
    document.getElementById("search-input").value = ""; 
    loadLatestPosts(); 
}

async function loadNeighbors() {
    let listDiv = document.getElementById("neighbor-list");
    try {
        let response = await fetch('/api/users?t=' + Date.now());
        let data = await response.json();
        
        if (data.users.length === 0) {
            listDiv.innerHTML = "No neighbors yet.";
            return;
        }
        
        listDiv.innerHTML = ""; 
        for (let i = 0; i < data.users.length; i++) {
            let name = data.users[i];
            listDiv.innerHTML += `<span class="fake-link radar-name" onclick="quickSearch('${name}')">${name}</span>`;
        }
    } catch (error) {
        listDiv.innerHTML = "Failed to load neighbors.";
    }
}

function quickSearch(targetName) {
    document.getElementById("search-input").value = targetName;
    searchUser(); 
}

function renderPostsToScreen(posts) {
    let container = document.getElementById("posts-container");
    container.innerHTML = ""; 

    if (posts.length === 0) {
        container.innerHTML = "<i>No posts yet. Be the first to build a page!</i>";
    } else {
        for (let i = 0; i < posts.length; i++) {
            container.innerHTML += createPostHTML(posts[i]);
        }
    }
    loadNeighbors(); 
}

function createPostHTML(postData) {
    let commentsHTML = "";
    let commentsArray = postData.comments || [];
    let postTime = new Date(postData.timestamp).toLocaleString();

    for (let i = 0; i < commentsArray.length; i++) {
        commentsHTML += "<div class='single-comment'><b>" + commentsArray[i].id + ":</b> " + commentsArray[i].comment + "</div>";
    }
    let htmlString = "<div class='post-item'>" +
        "<div class='post-author'>👤 User: " + postData.username + " <span class='post-time'>(" + postTime + ")</span></div>" +
        "<div class='post-content'>📝 " + postData.content + "</div>" +
        "<div class='post-ai-comments'>" +
            "<b>🤖 AI Interactive Comments:</b><hr>" + commentsHTML +
        "</div>" +
    "</div>";

    return htmlString;
}

function showSubmitLoading() {
    let loadingDiv = document.getElementById("loading-div");
    loadingDiv.classList.add("active-loading");
}