
const express = require("express");
const { google } = require("googleapis");

const app = express();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.REDIRECT_URI
);

const SCOPES = [
  "https://www.googleapis.com/auth/youtube.readonly"
];

// Home route
app.get("/", (req, res) => {
  res.send("MeTube API is running!");
});

// Start Google authentication
app.get("/auth", (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES
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

    // Do not save tokens in local files on Vercel.
    // Store them in a database associated with the user.

    res.json({
      success: true,
      message: "MeTube authentication successful!",
      tokens
    });

  } catch (error) {
    console.error(
      "OAuth Error:",
      error.response?.data || error.message
    );

    res.status(500).json({
      success: false,
      message: "Authentication failed",
      error: error.message
    });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

module.exports = app;
