const express = require("express");
const { getTopics } = require("../controllers/topics.controller");
const apiController = require('../controllers/api.controller')

const app = express();

app.use("/api/topics", getTopics);

app.use(express.json())
app.use('/api', apiController.getEndpoints)


app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    res.status(500).send({ msg: "Internal Server Error" });
  }
});

module.exports = app;
