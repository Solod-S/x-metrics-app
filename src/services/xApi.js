const axios = require("axios");
const { handleRateLimit } = require("../utils/backoff");

const BASE = process.env.BASE_URL || "https://api.x.com/2";
const BEARER = process.env.BEARER_TOKEN;

if (!BEARER) {
  console.error("BEARER_TOKEN is required in env");
  process.exit(1);
}

const instance = axios.create({
  baseURL: BASE,
  headers: { Authorization: `Bearer ${BEARER}` },
  timeout: 20000,
});

async function requestWithRetry(config, attempt = 0) {
  try {
    const res = await instance.request(config);
    return res.data;
  } catch (err) {
    const status = err?.response?.status;
    if (status === 429 && attempt < 5) {
      await handleRateLimit(err, attempt);
      return requestWithRetry(config, attempt + 1);
    }
    // bubble up for non-rate-limit errors or too many attempts
    throw err;
  }
}

async function getUserByUsername(username) {
  const params = {
    "user.fields": "id,name,username,public_metrics,protected,created_at",
  };
  const data = await requestWithRetry({
    url: `/users/by/username/${encodeURIComponent(username)}`,
    method: "GET",
    params,
  });
  return data.data;
}

// get recent tweets of a user (paginated)
async function getUserTweets(userId, max_results = 100, pagination_token) {
  const params = {
    max_results: Math.min(max_results, 100),
    "tweet.fields":
      "created_at,public_metrics,entities,conversation_id,author_id",
  };
  if (pagination_token) params.pagination_token = pagination_token;
  const data = await requestWithRetry({
    url: `/users/${userId}/tweets`,
    method: "GET",
    params,
  });
  return data;
}

// liked tweets by a user (may be restricted)
async function getUserLikedTweets(userId, max_results = 100, pagination_token) {
  const params = {
    max_results: Math.min(max_results, 100),
    "tweet.fields": "created_at,public_metrics,entities,author_id",
  };
  if (pagination_token) params.pagination_token = pagination_token;
  const data = await requestWithRetry({
    url: `/users/${userId}/liked_tweets`,
    method: "GET",
    params,
  });
  return data;
}

// mentions of the user (comments/mentions)
async function getUserMentions(userId, max_results = 100, pagination_token) {
  const params = {
    max_results: Math.min(max_results, 100),
    "tweet.fields":
      "created_at,public_metrics,entities,author_id,conversation_id",
  };
  if (pagination_token) params.pagination_token = pagination_token;
  const data = await requestWithRetry({
    url: `/users/${userId}/mentions`,
    method: "GET",
    params,
  });
  return data;
}

module.exports = {
  getUserByUsername,
  getUserTweets,
  getUserLikedTweets,
  getUserMentions,
};
