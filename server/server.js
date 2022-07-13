require('dotenv').config();

const port = 3000;
const express = require('express');
const app = express();
const authenticateToken = require('./middlewares/auth');
const orders = require('./utils/data/example');

app.use(express.json());

app.get('/orders', authenticateToken, (req, res) => {
  // have access to user (req.user) from authenticateToken middleware
  const result = orders.filter((order) => order.username === req.user.name);
  res.json(result);
});

app.listen(port, console.log(`Web server running on port ${port}`));
