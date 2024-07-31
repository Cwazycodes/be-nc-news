const db = require("../db/connection");

const fetchCommentsByArticleId = (article_id) => {
  return db
    .query(
      `
    SELECT
        comment_id,
        votes,
        created_at,
        author,
        body,
        article_id
    FROM comments
    WHERE article_id = $1
    ORDER BY created_at DESC;`,
      [article_id]
    )
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: "No comments found for this article",
        });
      }
      return result.rows;
    })
    .catch((err) => {
      if (err.code === "22P02") {
        return Promise.reject({ status: 400, msg: "Invalid article ID type" });
      }
      return Promise.reject(err);
    });
};

const insertCommentByArticleId = (article_id, author, body) => {
  if (!author || !body) {
    return Promise.reject({ status: 400, msg: "Missing required fields" });
  }

  return db
    .query(
      `
    INSERT INTO comments (article_id, author, body)
    VALUES ($1, $2, $3)
    RETURNING *;`,
      [article_id, author, body]
    )
    .then((result) => {
      return result.rows[0];
    })
    .catch((err) => {
      if (err.code === "23503") {
        return Promise.reject({
          status: 404,
          msg: "Article or user not found",
        });
      }
      if (err.code === "22P02") {
        return Promise.reject({ status: 400, msg: "Invalid article ID type" });
      }
      return Promise.reject(err);
    });
};

const removeCommentById = (comment_id) => {
  return db
    .query(
      `
  DELETE FROM comments
  WHERE comment_id = $1
  RETURNING *;`,
      [comment_id]
    )
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Comment not found" });
      }
    })
    .catch((err) => {
      if (err.code === "22P02") {
        return Promise.reject({ status: 400, msg: "Invalid comment ID type" });
      }
      return Promise.reject(err);
    });
};

const updateCommentVotes = (comment_id, inc_votes) => {
  return db
    .query(
      `UPDATE comments
    SET votes = votes + $1
    WHERE comment_id = $2
    RETURNING *;`,
      [inc_votes, comment_id]
    )
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Comment not found" });
      }
      return result.rows[0];
    });
};
module.exports = {
  fetchCommentsByArticleId,
  insertCommentByArticleId,
  removeCommentById,
  updateCommentVotes,
};
