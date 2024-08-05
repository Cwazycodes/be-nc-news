const express = require('express');
const app = express();
const cors = require('cors')

const apiRouter = require('../routes/api.js');
const articlesRouter = require('../routes/articles');
const commentsRouter = require('../routes/comments');
const topicsRouter = require('../routes/topics');
const usersRouter = require('../routes/users');

app.use(cors())
app.use(express.json());

app.use('/api', apiRouter);
app.use('/api/articles', articlesRouter);
app.use('/api/comments', commentsRouter);
app.use('/api/topics', topicsRouter);
app.use('/api/users', usersRouter);

app.use((err, req, res, next) => {
  console.error('Error handler:', err);
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else if (err.message === 'Not Found') {
    res.status(404).send({ msg: 'Not Found' });
  } else if (err.message === 'Invalid article ID type') {
    res.status(400).send({ msg: 'Invalid article ID type' });
  } else {
    res
      .status(500)
      .send({ error: { message: err.message || 'Internal Server Error' } });
  }
});

module.exports = app;
