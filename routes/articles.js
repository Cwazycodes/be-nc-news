const express = require("express");
const {
  getArticleById,
  getArticles,
  patchArticleById,
  postArticle,
  deleteArticle,
} = require("../controllers/articles.controller");
const {
  getCommentsByArticleId,
  addCommentByArticleId,
} = require("../controllers/comments.controller");

const router = express.Router();

router.get("/", getArticles);
router.get("/:article_id", getArticleById);
router.patch("/:article_id", patchArticleById);
router.get("/:article_id/comments", getCommentsByArticleId);
router.post("/:article_id/comments", addCommentByArticleId);
router.post("/", postArticle);
router.delete("/:article_id", deleteArticle);

module.exports = router;
