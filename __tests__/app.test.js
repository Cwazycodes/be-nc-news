const request = require("supertest");
const app = require("../db/app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data");
const fs = require("fs");
const path = require("path");
const { expect } = require("@jest/globals");
require("jest-sorted");

beforeEach(() => seed(testData));
afterAll(() => db.end());

describe("GET /api/topics", () => {
  it("should return an array of topics", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        expect(body.topics.length).toBe(3);
        body.topics.forEach((topic) => {
          expect(topic).toEqual(
            expect.objectContaining({
              slug: expect.any(String),
              description: expect.any(String),
            })
          );
        });
      });
  });

  it("contains the correct data", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        expect(body.topics[0].slug).toBe("mitch");
        expect(body.topics[0].description).toBe(
          "The man, the Mitch, the legend"
        );
      });
  });
});

describe("GET /api", () => {
  let server;

  beforeAll(() => {
    server = app.listen();
  });

  afterAll((done) => {
    server.close(done);
  });

  it("should return a JSON object describing all endpoints", () => {
    request(server)
      .get("/api")
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
        expect(res.body).toHaveProperty("GET /api");
        expect(res.body["GET /api"]).toHaveProperty("description");
        expect(res.body["GET /api"].description).toBe(
          "serves up a json representation of all the available endpoints of the api"
        );
        expect(res.body["GET /api/topics"]).toHaveProperty("description");
        expect(res.body["GET /api/topics"]).toHaveProperty("queries");
        expect(res.body["GET /api/topics"]).toHaveProperty("exampleResponse");
        expect(res.body["GET /api/topics"].description).toBe(
          "serves an array of all topics"
        );
        expect(res.body["GET /api/topics"].exampleResponse).toEqual({
          topics: [Array],
        });
      })
      .catch((err) => err);
  });

  it("should have the correct information matching endpoints.json", () => {
    const endpointsFile = path.join(__dirname, "..", "endpoints.json");
    const expectedEndpoints = JSON.parse(
      fs.readFileSync(endpointsFile, "utf-8")
    );

    request(server)
      .get("/api")
      .expect(200)
      .then((res) => {
        expect(res.body).toEqual(expectedEndpoints);
      })
      .catch((err) => err);
  });

  it("should handle errors when reading endpoints.json", () => {
    const wrongFilePath = path.join(__dirname, "..", "non-existent-file.json");
    jest.spyOn(path, "join").mockImplementation(() => wrongFilePath);

    request(server)
      .get("/api")
      .expect(500)
      .then((res) => {
        expect(res.body).toEqual({ error: "Internal Server Error" });
        jest.restoreAllMocks();
      })
      .catch((err) => {
        jest.restoreAllMocks();
        return err;
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  it("responds with an article object with correct article_id given", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then((res) => {
        expect(Object.values(res.body.article).length).toBe(9);
        expect(res.body.article.article_id).toBe(1);
        expect(res.body.article).toHaveProperty("comment_count");
      });
  });

  it("responds with an error when the given valid id is not registered", () => {
    return request(app)
      .get("/api/articles/87964")
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe("Not Found");
      });
  });
  it("responds with a 400 error for an invalid article ID type", () => {
    return request(app)
      .get("/api/articles/invalid-id")
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Invalid article ID type");
      });
  });
});

describe("GET /api/articles", () => {
  it("should return an array of topics with the correct properties", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles.length).toBe(13);
        body.articles.forEach((article) => {
          expect(article).toHaveProperty("author");
          expect(article).toHaveProperty("title");
          expect(article).toHaveProperty("article_id");
          expect(article).toHaveProperty("topic");
          expect(article).toHaveProperty("created_at");
          expect(article).toHaveProperty("votes");
          expect(article).toHaveProperty("article_img_url");
          expect(article).toHaveProperty("comment_count");
          expect(article).not.toHaveProperty("body");
          expect(typeof article.comment_count).toBe("number");
        });
      });
  });

  it("contains the correct data", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles[0].author).toBe("icellusedkars");
        expect(body.articles[0].title).toBe(
          "Eight pug gifs that remind me of mitch"
        );
        expect(body.articles[0].article_id).toBe(3);
        expect(body.articles[0].topic).toBe("mitch");
        expect(body.articles[0].created_at).toBe("2020-11-03T09:12:00.000Z");
        expect(body.articles[0].votes).toBe(0);
        expect(body.articles[0].article_img_url).toBe(
          "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
        );

        expect(body.articles[0].comment_count).toBe(2);
      });
  });

  it("responds with articles in correct order", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((response) => {
        const { articles } = response.body;
        for (let i = 0; i < articles.length - 1; i++) {
          expect(
            new Date(articles[i].created_at).getTime()
          ).toBeGreaterThanOrEqual(
            new Date(articles[i + 1].created_at).getTime()
          );
        }
      });
  });

  it("handles errors gracefully", () => {
    jest.spyOn(db, "query").mockImplementation(() => {
      throw new Error("Database error");
    });

    return request(app)
      .get("/api/articles")
      .expect(500)
      .then((response) => {
        const { error } = response.body;
        expect(error).toBeDefined();
        expect(error.message).toBe("Database error");
      })
      .finally(() => {
        db.query.mockRestore();
      });
  });

  it("sorts articles by any valid column", () => {
    return request(app)
      .get("/api/articles?sort_by=author&order=asc")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toBeSortedBy("author");
      });
  });

  it("sorts articles in ascending order", () => {
    return request(app)
      .get("/api/articles?order=asc")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toBeSortedBy("created_at", { ascending: true });
      });
  });

  it("returns 400 for invalid sort_by column", () => {
    return request(app)
      .get("/api/articles?sort_by=invalid_column")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid sort column");
      });
  });

  it("returns 400 for invalid order query", () => {
    return request(app)
      .get("/api/articles?order=invalid_order")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid order query");
      });
  });

  it("returns 200 with articles filtered by the specified topic", () => {
    return request(app)
      .get("/api/articles?topic=mitch")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles.length).toBe(12);
        body.articles.forEach((article) => {
          expect(article.topic).toBe("mitch");
        });
      });
  });

  it("returns 200 with an empty array when the topic exists but there are no articles under that topic", () => {
    return request(app)
      .get("/api/articles/?topic=paper")
      .expect(200)
      .then((res) => {
        expect(res.body.articles).toEqual([]);
      });
  });

  it("returns 404 when the specified topic does not exist", () => {
    return request(app)
      .get("/api/articles?topic=not-a-topic")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Topic not found");
      });
  });
  
});

describe("GET /api/articles/:article_id/comments", () => {
  it("responds with an array of comments for the given article_id", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then((res) => {
        expect(res.body.comments.length).toBeGreaterThan(0);
        res.body.comments.forEach((comment) => {
          expect(comment).toMatchObject({
            comment_id: expect.any(Number),
            votes: expect.any(Number),
            created_at: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            article_id: expect.any(Number),
          });
        });
      });
  });

  it("Contains the correct data in each object", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then((res) => {
        expect(res.body.comments[0].comment_id).toBe(5);
        expect(res.body.comments[0].votes).toBe(0);
        expect(res.body.comments[0].created_at).toBe(
          "2020-11-03T21:00:00.000Z"
        );
        expect(res.body.comments[0].author).toBe("icellusedkars");
        expect(res.body.comments[0].body).toBe("I hate streaming noses");
        expect(res.body.comments[0].article_id).toBe(1);
      });
  });

  it("responds with a 404 error when no comments are found for the given article_id", () => {
    return request(app)
      .get("/api/articles/99999/comments")
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe("No comments found for this article");
      });
  });

  it("responds with a 400 error for an invalid article ID type", () => {
    return request(app)
      .get("/api/articles/invalid-id/comments")
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Invalid article ID type");
      });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  it("adds a comment to the specifies article and responds with the posted comment", () => {
    const newComment = {
      username: "butter_bridge",
      body: "This is a new comment.",
    };
    return request(app)
      .post("/api/articles/1/comments")
      .send(newComment)
      .expect(201)
      .then((res) => {
        expect(res.body.comment).toMatchObject({
          comment_id: expect.any(Number),
          votes: 0,
          created_at: expect.any(String),
          author: newComment.username,
          body: newComment.body,
          article_id: 1,
        });
      });
  });

  it("responds with a 400 error when required fields are missing", () => {
    const newComment = { body: "This comment is missing a username." };
    return request(app)
      .post("/api/articles/1/comments")
      .send(newComment)
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Missing required fields");
      });
  });

  it("responds with a 404 error when the specified article does not exist", () => {
    const newComment = {
      username: "butter_bridge",
      body: "This is a new comment.",
    };
    return request(app)
      .post("/api/articles/99999/comments")
      .send(newComment)
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe("Article or user not found");
      });
  });

  it("responds with a 400 error for an invalid article ID type", () => {
    const newComment = {
      username: "butter_bridge",
      body: "This is a new comment.",
    };
    return request(app)
      .post("/api/articles/invalid-id/comments")
      .send(newComment)
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Invalid article ID type");
      });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  it("updates the votes of a specified article and responds with the updated article", () => {
    const updateVotes = { inc_votes: 1 };
    return request(app)
      .patch("/api/articles/1")
      .send(updateVotes)
      .expect(200)
      .then((res) => {
        expect(res.body.article).toMatchObject({
          article_id: 1,
          votes: 101,
        });
      });
  });

  it("responds with a 400 error when required fields are missing", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({})
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Missing required fields");
      });
  });

  it("responds with a 404 error when the specified article does not exist", () => {
    const updateVotes = { inc_votes: 1 };
    return request(app)
      .patch("/api/articles/99999")
      .send(updateVotes)
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe("Article not found");
      });
  });

  it("responds with a 400 error for an invalid article ID type", () => {
    const updateVotes = { inc_votes: 1 };
    return request(app)
      .patch("/api/articles/invalid-id")
      .send(updateVotes)
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Invalid article ID type");
      });
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  it("deletes the given comment and response with 204", () => {
    return request(app).delete("/api/comments/1").expect(204);
  });

  it("responds with a 404 error when the comment does not exist", () => {
    return request(app)
      .delete("/api/comments/99999")
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe("Comment not found");
      });
  });

  it("responds with a 400 error for an invalid comment ID type", () => {
    return request(app)
      .delete("/api/comments/invalid-id")
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Invalid comment ID type");
      });
  });
});

describe("GET /api/users", () => {
  it("Should return an array of users", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
        expect(body.users.length).toBe(4);
        body.users.forEach((user) => {
          expect(user).toEqual(
            expect.objectContaining({
              username: expect.any(String),
              name: expect.any(String),
              avatar_url: expect.any(String),
            })
          );
        });
      });
  });

  it("Contains the correct data", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
        expect(body.users[0].username).toBe("butter_bridge");
        expect(body.users[0].name).toBe("jonny");
        expect(body.users[0].avatar_url).toBe(
          "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg"
        );
      });
  });
});

describe("GET /api/users/:username", () => {
  it("should return a user object with the correct properties", () => {
    return request(app)
      .get("/api/users/butter_bridge")
      .expect(200)
      .then((res) => {
        expect(res.body.user).toHaveProperty("username");
        expect(res.body.user).toHaveProperty("avatar_url");
        expect(res.body.user).toHaveProperty("name");
      });
  });
  it("should return a user object with the correct data", () => {
    return request(app)
      .get("/api/users/butter_bridge")
      .expect(200)
      .then((res) => {
        expect(res.body.user.username).toBe("butter_bridge");
        expect(res.body.user.avatar_url).toBe(
          "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg"
        );
        expect(res.body.user.name).toBe("jonny");
      });
  });

  it("should return 404 for a non-existent user", () => {
    return request(app)
      .get("/api/users/non_existent_user")
      .expect(404)
      .then((res) => {
        expect(res.body.message).toBe("User not found");
      });
  });

  it("should return 400 for an invalid username format", () => {
    return request(app)
      .get("/api/users/invalid-username!")
      .expect(400)
      .then((res) => {
        expect(res.body.message).toBe("Invalid username format");
      });
  });
});

describe("PATCH /api/comments/:comment_id", () => {
  it("should update the votes on a comment and return the updated comment", () => {
    return request(app)
      .patch("/api/comments/1")
      .send({ inc_votes: 1 })
      .expect(200)
      .then((res) => {
        expect(res.body.comment).toHaveProperty("comment_id", 1);
        expect(res.body.comment).toHaveProperty("votes", expect.any(Number));
      });
  });

  it("should decrement the votes on a comment and return the updated comment", () => {
    return request(app)
      .patch("/api/comments/1")
      .send({ inc_votes: -1 })
      .expect(200)
      .then((res) => {
        expect(res.body.comment).toHaveProperty("comment_id", 1);
        expect(res.body.comment).toHaveProperty("votes", expect.any(Number));
      });
  });

  it("should return 400 for an invalid vote increment value", () => {
    return request(app)
      .patch("/api/comments/1")
      .send({ inc_votes: "invalid" })
      .expect(400)
      .then((res) => {
        expect(res.body.message).toBe("Invalid vote increment value");
      });
  });

  it("should return 404 for a non existent comment", () => {
    return request(app)
      .patch("/api/comments/9999")
      .send({ inc_votes: 1 })
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe("Comment not found");
      });
  });
});

describe("POST /api/articles", () => {
  it("should add a new article and return the newly added article", () => {
    const newArticle = {
      author: "butter_bridge",
      title: "New Article Title",
      body: "This is the body of the new article",
      topic: "mitch",
      article_img_url: "https://example.com/image.jpg",
    };

    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(201)
      .then((res) => {
        expect(res.body.article).toHaveProperty("article_id");
        expect(res.body.article).toHaveProperty("author", newArticle.author);
        expect(res.body.article).toHaveProperty("title", newArticle.title);
        expect(res.body.article).toHaveProperty("body", newArticle.body);
        expect(res.body.article).toHaveProperty("topic", newArticle.topic);
        expect(res.body.article).toHaveProperty(
          "article_img_url",
          newArticle.article_img_url
        );
        expect(res.body.article).toHaveProperty("votes", 0);
        expect(res.body.article).toHaveProperty("created_at");
        expect(res.body.article).toHaveProperty("comment_count", 0);
      });
  });

  it("should return 400 for missing required fields", () => {
    const newArticle = {
      title: "New Article Title",
      body: "This is the body of the new article",
    };

    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(400)
      .then((res) => {
        expect(res.body.message).toBe("Missing required fields");
      });
  });
});

describe("POST /api/topics", () => {
  it("should add a new topic and return the newly added topic", () => {
    const newTopic = {
      slug: "new-topic",
      description: "This is a new topic",
    };

    return request(app)
      .post("/api/topics")
      .send(newTopic)
      .expect(201)
      .then((res) => {
        expect(res.body.topic).toHaveProperty("slug", newTopic.slug);
        expect(res.body.topic).toHaveProperty(
          "description",
          newTopic.description
        );
      });
  });

  it("should return 400 for missing required fields", () => {
    const incompleteTopic = {
      description: "This is a topic without a slug",
    };

    return request(app)
      .post("/api/topics")
      .send(incompleteTopic)
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Missing required fields");
      });
  });
});

describe("DELETE /api/articles/:article_id", () => {
  it("should delete an article and its comments and return 204", () => {
    return request(app).delete("/api/articles/1").expect(204);
  });

  it("should return 404 if the article does not exist", () => {
    return request(app)
      .delete("/api/articles/999999")
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe("Article not found");
      });
  });

  it("should return 400 for an invalid article ID type", () => {
    return request(app)
      .delete("/api/articles/invalid-id")
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Invalid article ID type");
      });
  });
});
