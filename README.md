![Version](https://img.shields.io/badge/Version-1.0-blue.svg?cacheSeconds=2592000)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Runs with Node.js](https://img.shields.io/badge/Runs%20with-Node.js-43853d.svg?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Runs with Express](https://img.shields.io/badge/Runs%20with-Express-000000.svg?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![Runs with Axios](https://img.shields.io/badge/Runs%20with-Axios-5A29E4.svg?style=flat-square&logo=axios&logoColor=white)](https://axios-http.com/)

# X Metrics App

<!-- ![X Metrics App Banner](./assets/banner.png) -->

**Project Description:**

X Metrics App is a Node.js backend service for retrieving and analyzing public Twitter (now X) user data.  
It fetches user profiles, tweets, likes, mentions, and aggregates engagement metrics using the official Twitter API v2 with Bearer Token authentication.

---

## Features

- Get user profile data by username, including public metrics (followers count, tweet count, etc.)
- Fetch latest tweets of a user with detailed engagement stats (likes, retweets, replies, quotes)
- Aggregate metrics over last N tweets (average likes, retweets, and top engaged posts)
- Retrieve tweets liked by a user (subject to API restrictions)
- Fetch tweets mentioning the user (comments/replies)
- Rate limit logging for better API quota management

---

## API Endpoints

| Method | Endpoint                   | Description                                                                              |
| ------ | -------------------------- | ---------------------------------------------------------------------------------------- |
| GET    | `/user/:username/profile`  | Returns user profile info and public metrics                                             |
| GET    | `/user/:username/tweets`   | Returns latest tweets by user (`max_results`, `pagination_token` query params supported) |
| GET    | `/user/:username/metrics`  | Aggregated metrics from last N tweets (`max_results` query param)                        |
| GET    | `/user/:username/likes`    | Tweets liked by the user (may be restricted)                                             |
| GET    | `/user/:username/mentions` | Tweets mentioning the user (comments, replies)                                           |

---

## Prerequisites

- Node.js (v14+ recommended)
- Twitter Developer Account with Bearer Token (App-only authentication)
- `.env` file with the following variable:

```env
X_BEARER_TOKEN=your_twitter_bearer_token_here
PORT=3000
```

## Installation & Running

#### 1. Clone the repository

```
git clone https://github.com/yourusername/x-metrics-app.git
cd x-metrics-app
```

#### 2. Install dependencies

```
npm install
```

#### 3. Create .env file with your Twitter Bearer Token and optionally PORT

#### 4. Run the app

```
npm start
```

#### 5. The app will be running at http://localhost:3000

## Example Usage

#### Fetch profile info:

```
curl http://localhost:3000/user/mezha_net/profile
```

#### Fetch latest tweets (max 50):

```
curl http://localhost:3000/user/mezha_net/tweets?max_results=50
```

#### Fetch aggregated metrics (last 100 tweets by default):

```
curl http://localhost:3000/user/mezha_net/metrics
```

## Rate Limits

The app logs Twitter API rate limit headers for each request to help you monitor quota usage.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Contribution

Contributions are welcome! Feel free to open issues or submit pull requests.
