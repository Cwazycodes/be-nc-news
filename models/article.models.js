const db = require("../db/connection");

const fetchArticleById = (id) => {
  return db
    .query(`SELECT * FROM articles WHERE article_id = $1;`, [id])
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({
          message: "Article does not exist",
          status: 404,
        });
      }
      console.log("Processing article request");
      return result.rows[0];
    });
};

module.exports = { fetchArticleById };
