const http = require("http")
const express = require("express");
const { google } = require("googleapis");
const fs = require("fs");
require("dotenv").config();

const app = express();
const server = http.createServer((req, res)=>{
    res.end()
})

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.REDIRECT_URI
);

const SCOPES = [
  "https://www.googleapis.com/auth/youtube.readonly"
];

// Start authentication
app.get("/auth", (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
  
  });

  res.redirect(url);
});

// Google OAuth callback
app.get("/oauth2callback", async (req, res) => {
  try {
    const { code, error } = req.query;

    if (error) {
      return res.status(400).send(`Google OAuth Error: ${error}`);
    }

    if (!code) {
      return res.status(400).send("Authorization code missing");
    }

    const { tokens } = await oauth2Client.getToken(code);

    oauth2Client.setCredentials(tokens);

    fs.writeFileSync(
      "token.json",
      JSON.stringify(tokens, null, 2)
    );

    res.send("YouTube authentication successful!");

  } catch (error) {
    console.error("OAuth Error:", error.response?.data || error.message);

    res.status(500).send(
      "Authentication failed: " + error.message
    );
  }
});

// Load saved authentication
app.get("/load-token", (req, res) => {
  if (!fs.existsSync("token.json")) {
    return res.status(404).send("Authenticate first");
  }

  const tokens = JSON.parse(
    fs.readFileSync("token.json", "utf8")
  );

  oauth2Client.setCredentials(tokens);

  res.send("Token loaded successfully!");
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
