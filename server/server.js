require('dotenv').config();

const port = 3000;
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');

app.use(express.json());

const orders = require('./utils/data/example');

app.get('/orders', authenticateToken, (req, res) => {
  // have access to user (req.user) from authenticateToken middleware
  const result = orders.filter((order) => order.username === req.user.name);
  res.json(result);
});

app.post('/login', (req, res) => {
  // Authentication User
  const username = req.body.username;
  const user = { name: username };

  const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
  res.json({ accessToken: accessToken });
});

// middleware for authentication
function authenticateToken(req, res, next) {
  // get request header -> authorization: Bearer Token
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

app.listen(port, console.log(`Web server running on port ${port}`));
