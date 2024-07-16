const request = require("supertest");
const app = require("../db/app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data");
const fs = require("fs");
const path = require("path");

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
        expect(Object.values(res.body.article).length).toBe(8);
        expect(res.body.article.article_id).toBe(1);
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

  it('responds with articles in correct order', () => {
    return request(app)
    .get('/api/articles')
    .expect(200)
    .then(response => {
        const {articles} = response.body
        for (let i =0; i < articles.length - 1; i++) {
            expect(new Date(articles[i].created_at).getTime()).toBeGreaterThanOrEqual(new Date(articles[i + 1].created_at).getTime())
        }
    })
  })

  it('handles errors gracefully', () => {
    jest.spyOn(db, 'query').mockImplementation(() => {
        throw new Error('Database error')
    })

    return request(app)
    .get('/api/articles')
    .expect(500)
    .then((response) => {
        const {error} = response.body
        expect(error).toBeDefined()
        expect(error.message).toBe('Database error')
    })
    .finally(() => {
        db.query.mockRestore()
    })
  })
});
