const express = require("express");
const { getTopics } = require("../controllers/topics.controller");
const { getArticleById} = require('../controllers/articles.controller')
const {getEndpoints} = require('../controllers/api.controller')


const app = express();


app.use(express.json())
app.get("/api/topics", getTopics);

app.get('/api', getEndpoints)

app.get('/api/articles/:article_id', getArticleById)

app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    res.status(404).send({ msg: "Not Found" });
  }
});

module.exports = app;
