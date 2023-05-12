const express = require("express");
const app = express();
const path = require("path");
const http = require("http");
const server = http.createServer(app);
require("dotenv").config();
const session = require("express-session");
const axios = require("axios");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const CLIENT_KEY = "awl0gd6ae6fksvpt";
const CLIENT_SECRET = "ba9c4404dc1f240c4dec0ae75f1c88ed";

app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());
app.use(
  session({
    secret: "ba9c4404dc1f240c4dec0ae75f1c88ed",
    resave: true,
    saveUninitialized: false,
    cookie: { maxAge: 60 * 60 * 1000 },
  })
);

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/public/index.html");
});

app.get("/term-of-service", function (req, res) {
  res.redirect(__dirname + "/public/term-of-service.html");
});
app.get("/privacy-policy", function (req, res) {
  res.redirect(__dirname + "/public/privacy-policy.html");
});

const port = process.env.port || 3000;
server.listen(port, () => {
  console.log(`server started on port ${port}`);
});

app.get("/login", (req, res) => {
  const isLoggedIn =  req.session.user;
  if (isLoggedIn) {
    res.json({
      isLoggedIn: true,
      user: req.session.user,
    });
  } else {
    res.json({ isLoggedIn: false });
  }
});

app.get("/oauth", (req, res) => {
  const DOMAIN = "tommy-test-piye.onrender.com";
  const csrfState = Math.random().toString(36).substring(2);
  res.cookie("csrfState", csrfState, { maxAge: 60000 });
  const redirect = encodeURIComponent(`https://${DOMAIN}/tiktok`);

  let url = "https://www.tiktok.com/auth/authorize/";

  url += "?client_key=" + CLIENT_KEY;
  url += "&scope=user.info.basic";
  url += "&response_type=code";
  url += "&redirect_uri=" + redirect;
  url += "&state=" + csrfState;

  res.redirect(url);
});

app.get("/tiktok", async (req, res) => {
  const { code, state } = req.query;
  const { csrfState } = req.cookies;

  if (state !== csrfState) {
    res.status(422).send("Invalid state");
    return;
  }

  let url_access_token = "https://open-api.tiktok.com/oauth/access_token/";
  url_access_token += "?client_key=" + CLIENT_KEY;
  url_access_token += "&client_secret=" + CLIENT_SECRET;
  url_access_token += "&code=" + code;
  url_access_token += "&grant_type=authorization_code";

  try {
    const response = await axios.post(url_access_token);
    console.log("response.data", response.data);
    const { access_token, refresh_token, open_id } = response.data.data;

    req.session.user = {
      access_token,
      refresh_token,
      open_id,
      state,
    };
    console.log("req.session.user", req.session.user);
    res.redirect("/?login=success");
  } catch (error) {
    console.error("Error fetching access token:", error);
    res.send(error);
    res.redirect("/?login=error");
  }
});

app.get("/refresh_token/", (req, res) => {
  const refresh_token = req.query.refresh_token;

  let url_refresh_token = "https://open-api.tiktok.com/oauth/refresh_token/";
  url_refresh_token += "?client_key=" + CLIENT_KEY;
  url_refresh_token += "&grant_type=refresh_token";
  url_refresh_token += "&refresh_token=" + refresh_token;

  fetch(url_refresh_token, { method: "post" })
    .then((res) => res.json())
    .then((json) => {
      res.send(json);
    });
});

app.get("/revoke", async (req, res) => {
  const { open_id, access_token } = req.query;

  let url_revoke = "https://open-api.tiktok.com/oauth/revoke/";
  url_revoke += "?open_id=" + open_id;
  url_revoke += "&access_token=" + access_token;

  await axios.post(url_revoke);
  req.session.user = null;
  req.session = null;

  res.cookie("csrfState", "", {
    expires: new Date(Date.now() - 1000),
    maxAge: 0,
  });

  res.redirect("/?login=logout");
});