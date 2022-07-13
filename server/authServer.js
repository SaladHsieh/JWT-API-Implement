require('dotenv').config();

const port = 4000;
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

app.use(express.json());

// store refresh token locally
let refreshTokens = [];

const users = [];

app.post('/user/sign-up', async (req, res) => {
  try {
    const hashPassword = await bcrypt.hash(req.body.password, 10);
    const user = { username: req.body.username, password: hashPassword };
    users.push(user);
    res.status(201).send();
  } catch {
    res.status(500).send();
  }
});

app.post('/get-refresh-token', (req, res) => {
  const refreshToken = req.body.token;
  if (refreshToken == null) return res.sendStatus(401);
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    console.log('log user: ', user);
    if (err) return res.sendStatus(403);
    const accessToken = generateAccessToken({ name: user.name });
    res.json({ accessToken: accessToken });
  });
});

app.delete('/logout', (req, res) => {
  refreshTokens = refreshTokens.filter((token) => token !== req.body.token);
  res.sendStatus(204);
});

app.post('/login', async (req, res, next) => {
  // Authentication User
  const findUser = users.find((user) => user.username == req.body.username);
  if (findUser == null) return res.status(400).send('Can not find the user');
  try {
    if (await bcrypt.compare(req.body.password, findUser.password)) {
      // res.send('Success');
      next();
    } else {
      res.send('Not allowed');
    }
  } catch {
    res.status(500).send;
  }

  const user = { name: findUser.username };

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  refreshTokens.push(refreshToken);

  res.json({ accessToken: accessToken, refreshToken: refreshToken });
});

// create access token
function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15s' });
}

// create refresh token
function generateRefreshToken(user) {
  return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '30d' });
}

app.listen(port, console.log(`Web server running on port ${port}`));
