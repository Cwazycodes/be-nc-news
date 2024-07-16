const db = require("../db/connection");
const { fetchArticleById, fetchArticles } = require("../models/article.models");

const getArticleById = (req, res, next) => {
  const { article_id } = req.params;

  fetchArticleById(article_id)
    .then((article) => {
        if (!article) {
            return Promise.reject({status: 404, msg:'Not Found'})
        }
      res.status(200).json({ article });
    })
    .catch((err) => {
      console.error(err);
      next(err);
    });
};

const getArticles = (req,res,next) => {
    fetchArticles()
    .then(articles => {
        res.status(200).json({articles})
    })
    .catch(err => {
        next(err)
    })
}
module.exports = { getArticleById, getArticles };
