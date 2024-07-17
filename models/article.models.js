const db = require("../db/connection");

const fetchArticleById = (id) => {
  return db
    .query(`SELECT * FROM articles WHERE article_id = $1;`, [id])
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({
          message: "Not Found",
          status: 404,
        });
      }

      return result.rows[0];
    })
    .catch((err) => {
      if (err.code === "22P02") {
        return Promise.reject({ status: 400, msg: "Invalid article ID type" });
      }
      return Promise.reject(err);
    });
};

const fetchArticles = () => {
  return db
    .query(
      `
    SELECT
        articles.author,
        articles.title,
        articles.article_id,
        articles.topic,
        articles.created_at,
        articles.votes,
        articles.article_img_url,
        COUNT(comments.comment_id) AS comment_count
    FROM articles
    LEFT JOIN comments ON articles.article_id = comments.article_id
    GROUP BY articles.article_id
    ORDER BY articles.created_at DESC;`
    )
    .then((result) => {
      return result.rows.map((article) => ({
        author: article.author,
        title: article.title,
        article_id: article.article_id,
        topic: article.topic,
        created_at: new Date(article.created_at),
        votes: article.votes,
        article_img_url: article.article_img_url,
        comment_count: parseInt(article.comment_count) || 0,
      }));
    })
    .catch((err) => {
      throw new Error(`Error fetching articles: ${err.message}`);
    });
};

const updateArticleVotes = (article_id, inc_votes) => {
  if (!inc_votes) {
    return Promise.reject({ status: 400, msg: "Missing required fields" });
  }

  return db
    .query(
      `
  UPDATE articles
  SET votes = votes + $1
  WHERE article_id = $2
  RETURNING *;
  `,
      [inc_votes, article_id]
    )
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Article not found" });
      }
      return result.rows[0];
    })
    .catch((err) => {
      if (err.code === "22P02") {
        return Promise.reject({ status: 400, msg: "Invalid article ID type" });
      }
      return Promise.reject(err);
    });
};

module.exports = { fetchArticleById, fetchArticles, updateArticleVotes };
