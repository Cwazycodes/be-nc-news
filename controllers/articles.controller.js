const db = require("../db/connection");
const { fetchArticleById } = require("../models/article.models");

const getArticleById = (req, res, next) => {
  const { article_id } = req.params;

  fetchArticleById(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => {
      console.error(err);
      next(err);
    });
};
module.exports = { getArticleById };
