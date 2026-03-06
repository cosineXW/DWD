require('dotenv').config();
const express = require("express");
const nedb = require("@seald-io/nedb");
const app = express();
app.use(express.static("public"));
app.use(express.json());

app.use(express.urlencoded({ extended: true })); 
const database = new nedb({ filename: "database.txt", autoload: true });

const AUTH_TOKEN = process.env.AUTH_TOKEN || "balabalabalabaabc";

app.get("/api/latest", (request, response) => {
    database.find({}, (err, dbData) => {
        if (err) return response.json({ posts: [] });
        dbData.sort((a, b) => b.timestamp - a.timestamp);
        response.json({ posts: dbData.slice(0, 3) });
    });
});

app.get("/api/users", (request, response) => {
    database.find({}, (err, dbData) => {
        if (err) return response.json({ users: [] });
        dbData.sort((a, b) => b.timestamp - a.timestamp);
        
        let uniqueUsers = [];
        for (let i = 0; i < dbData.length; i++) {
            let humanName = dbData[i].username; 
            if (humanName && !uniqueUsers.includes(humanName)) {
                uniqueUsers.push(humanName);
            }
            if (uniqueUsers.length >= 20) break; 
        }
        response.json({ users: uniqueUsers });
    });
});

app.get("/api/search", (request, response) => {
    let searchName = request.query.username;
    database.find({ username: searchName }, (err, docs) => {
        if (err) return response.json({ posts: [] });
        docs.sort((a, b) => b.timestamp - a.timestamp);
        response.json({ posts: docs.slice(0, 3) });
    });
});

app.post("/submit", async (request, response) => {
    let username = request.body.username;
    let content = request.body.content;
    let systemPrompt = "You are the AI citizen for a social media simulation game. Your goal is to generate 10 to 20 user ids(looks like a real person's) and comments that reflect the DIVERSE and CHAOTIC nature of the real internet. Mix personas: 1. Supportive, 2. Cynical, 3. Dismissive, 4. Bot/Spam. Respond as valid JSON without any prefix. Use the properties \"id\" and \"comment\" for each comment.";
    let messages = [
        { 
            role: "user", 
            content: systemPrompt + ` The user's ID/username is "${username}" and their post content is: "${content}". IMPORTANT: You MUST read the username and the content together to understand the context.` 
        }
    ];

    let options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": "Bearer " + AUTH_TOKEN
        },
        body: JSON.stringify({
            model: "openai/gpt-4o",
            input: { messages: messages }
        })
    };

    try {
        let raw_response = await fetch("https://itp-ima-replicate-proxy.web.app/api/create_n_get", options);
        let json_response = await raw_response.json();
        let resultText = json_response.output.join("");
        let cleanedText = resultText.replace(/```json/g, "").replace(/```/g, "").replace(/ কলকাতায়/g, "").trim();
        const firstBracket = cleanedText.indexOf("[");
        const lastBracket = cleanedText.lastIndexOf("]");

        if (firstBracket !== -1 && lastBracket !== -1) {
            cleanedText = cleanedText.substring(firstBracket, lastBracket + 1);
        }

        console.log("Cleaned AI Response:", cleanedText);

        let commentsArray = JSON.parse(cleanedText);
        let dataToBeAdded = {
            username: username,
            content: content,
            comments: commentsArray,
            timestamp: Date.now() 
        };

        database.insert(dataToBeAdded, (err, newDoc) => {
            response.redirect("/");
            
        });
    } catch (error) {
        console.log("Fetch or Parse error:", error);
        response.send("<h1>ERROR Server Meltdown.</h1>");
    }
});

app.listen(8080, () => {
    console.log("Server running on port 8080");
});