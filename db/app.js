const express = require("express");
const { getTopics } = require("../controllers/topics.controller");
const {
  getArticleById,
  getArticles,
} = require("../controllers/articles.controller");
const { getEndpoints } = require("../controllers/api.controller");
const {
  getCommentsByArticleId,
} = require("../controllers/comments.controller");

const app = express();

app.get("/api/topics", getTopics);

app.get("/api", getEndpoints);

app.get("/api/articles/:article_id", getArticleById);
app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id/comments", getCommentsByArticleId);

app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else if (err.message === "Not Found") {
    res.status(404).send({ msg: "Not Found" });
  } else if (err.message === "Invalid article ID type") {
    res.status(400).send({ msg: "Invalid article ID type" });
  } else {
    res
      .status(500)
      .send({ error: { message: err.message || "Internal Server Error" } });
  }
});

module.exports = app;
