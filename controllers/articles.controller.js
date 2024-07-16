const db = require("../db/connection");
const { fetchArticleById, fetchArticles } = require("../models/article.models");

const getArticleById = (req, res, next) => {
  const { article_id } = req.params;

  if (isNaN(parseInt(article_id, 10))) {
    return res.status(400).send({ msg: "Invalid article ID type" });
  }

  fetchArticleById(article_id)
    .then((article) => {
      if (!article) {
        return next({ status: 404, msg: "Not Found" });
      }
      res.status(200).json({ article });
    })
    .catch((err) => {
      console.error(err);
      next(err);
    });
};

const getArticles = (req, res, next) => {
  fetchArticles()
    .then((articles) => {
      res.status(200).json({ articles });
    })
    .catch((err) => {
      next(err);
    });
};
module.exports = { getArticleById, getArticles };
