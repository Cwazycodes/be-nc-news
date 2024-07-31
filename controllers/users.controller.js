const { fetchUsers, fetchUserByUsername } = require("../models/users.models");
exports.getUsers = (req, res, next) => {
  fetchUsers()
    .then((users) => {
      res.status(200).send({ users });
    })
    .catch(next);
};

exports.getUserByUsername = (req, res, next) => {
  const { username } = req.params;
  if (/[^a-zA-Z0-9_]/.test(username)) {
    return res.status(400).send({ message: "Invalid username format" });
  }

  fetchUserByUsername(username)
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: "User not found" });
      }
      res.status(200).send({ user });
    })
    .catch(next);
};
