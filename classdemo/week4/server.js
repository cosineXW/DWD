// library import
const express = require("express");

// setting up our express application
// instance of our express class
const app = express();

// allow the use of my static files (front-end code)
// html, css, js (interaction)
app.use(express.static("public"));
// FIX -- does not need body parser library or using enctype in form
// allows us to process the body of request data (eg. request.body)
app.use(express.urlencoded({ extended: true }));

let messages = [];

// setting up my first handler for a route
// http://localhost:8000/test
app.get("/test", (request, response) => {
  response.send("<h1>my server is live!</h1>");
});

// this is not a route we access through our own url, we access it from the form when we make a request
// specifically, we need the guestbook html
// http://localhost:8000/index.html contains the form that uses the POST method
app.post("/sign", (request, response) => {
  console.log(request.body);

  messages.push({
    guest: request.body.guestname,
    post: request.body.message,
    likes: 0,      
    dislikes: 0 
  });
  response.redirect("/index.html");
});


app.put("/like/:id", (request, response) => {
  let index = request.params.id;
  if (messages[index]) {
    messages[index].likes += 1; 
    response.send("Liked!");
  } else {
    response.send("Message not found.");
  }
});

app.put("/dislike/:id", (request, response) => {
  let index = request.params.id;
  if (messages[index]) {
    messages[index].dislikes += 1; 
    response.send("Disliked!");
  } else {
    response.send("Message not found.");
  }
});

// http://localhost:8000/all-messages
app.get("/all-messages", (req, res) => {
  //   response.send(messages);
  // if i want to send data back in json format
  res.json({ guests: messages });
});
app.delete("/delete/:id", (request, response) => {
  let index = request.params.id;
  if (messages[index]) {
    messages.splice(index, 1); 
    response.send("Message deleted successfully!");
  } else {
    response.send("Message not found.");
  }
});

app.put("/update/:id", (request, response) => {
  let index = request.params.id;
  
  if (messages[index]) {
    messages[index].post = request.body.newMessage;
    response.send("Message updated successfully!");
  } else {
    response.send("Message not found.");
  }
});


// LAST STEP ALWAYS
// start our express application
app.listen(8000, () => {
  console.log("starter server is working");
});