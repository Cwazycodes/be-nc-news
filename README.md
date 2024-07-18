# Northcoders News API

Welcome to the NC news API! This project is a RESTful API built using Node.js, Express, and PostgreSQL. it provides endpoints for accessing and manipulating data related to articles, comments, users, and topics. The API is designed to serve as the backend for a news application, offering a range of functionality such as retrieving articles, posting comments, and voting on articles.

*Hosted Version*
You can access the hosted version of the NC News API https://cwazycodes-nc-news.onrender.com.

*Project Summary*

NC News API is a backend service that supports the functionality of a news aggregation website. it allows users to:

. Retrieve articles, topics, and user information
. Post comments on articles
. Vote on articles and comments
. Filter articles by topics and sort them by various criteria

*Getting Started*

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

*Prerequisites

Ensure you have the following software installed:

.Node.js (minimun version: 14.x)
.PostgreSQL (minimum version: 12.x)

*Installation*

1. Clone the repository in the terminal:

git clone https://github.com/your-github-username/be-nc-news.git
cd be-nc-news

2. Install dependencies:

npm install

3. Create the .env files:
You need to create two .env files in the root directory of the project: .env.development and .env.test.
. .env.development 

PGDATABASE=nc_news

. .env.test

PGDATABASE=nc_news_test

4. Set up and seed the local database:

npm run setup-dbs
npm run seed

5. Run the test:

npm test

*Database Setup for Production*

if you are deploying this API to a production environment, ensure you have the following environment variable set in a .env.production file:

DATABASE_URL=postgresql://postgres.cqmqywkplwyqkatstphd:CwazyMoBoxer1@aws-0-eu-west-2.pooler.supabase.com:6543/postgres

*Endpoints*

For a detailed description of the available endpoints, refer to the /api endpoint in the hosted version, which provides a JSON representation of all the endpoints and their functionalities.

Thank you for using the NC news API! if you have any questions or encounter any issues, feel free to open an issue on https://github.com/Cwazycodes/be-nc-news


--- 

This portfolio project was created as part of a Digital Skills Bootcamp in Software Engineering provided by [Northcoders](https://northcoders.com/)
