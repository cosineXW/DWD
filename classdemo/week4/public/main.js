window.onload = () => {
  messageRequest();
};

const messageRequest = async () => {
  const response = await fetch("/all-messages");
  const json = await response.json();
  
  let guests = json.guests;
  
  for (let i = 0; i < guests.length; i++) {
    let g = guests[i]; 

    let message = document.createElement("p");
    message.textContent = `${g.post} —— ${g.guest}   `; 
    
    //👍
    let likeBtn = document.createElement("button");
    likeBtn.textContent = `👍 (${g.likes})`; 
    likeBtn.onclick = async () => {
        await fetch(`/like/${i}`, { method: 'PUT' });
        window.location.reload(); 
    };
    message.appendChild(likeBtn);
    // 👎
    let dislikeBtn = document.createElement("button");
    dislikeBtn.textContent = `👎 (${g.dislikes})`; 
    dislikeBtn.onclick = async () => {
        await fetch(`/dislike/${i}`, { method: 'PUT' });
        window.location.reload(); 
    };
    message.appendChild(dislikeBtn);
    let deleteBtn = document.createElement("button");
    deleteBtn.textContent = "delete";
    deleteBtn.onclick = async () => {
        await fetch(`/delete/${i}`, { method: 'DELETE' });
        window.location.reload(); 
    };
    message.appendChild(deleteBtn);

    let editBtn = document.createElement("button");
    editBtn.textContent = "edit";
    editBtn.onclick = async () => {
        let newText = prompt("new content", g.post);
        if (newText) {
            await fetch(`/update/${i}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ newMessage: newText })
            });
            window.location.reload();
        }
    };
    message.appendChild(editBtn);

    document.body.appendChild(message);
  }
};