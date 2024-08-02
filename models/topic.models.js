const db = require("../db/connection");

exports.fetchTopics = () => {
  return db.query("SELECT * FROM topics;").then((result) => {
    return result.rows;
  });
};

exports.addTopic = (newTopic) => {
  const { slug, description } = newTopic;

  if (!slug || !description) {
    return Promise.reject({ status: 400, msg: 'Missing required fields' });
  }

  const query = `
    INSERT INTO topics (slug, description)
    VALUES ($1, $2)
    RETURNING *;
  `;

  return db.query(query, [slug, description]).then((result) => {
    return result.rows[0];
  });
};