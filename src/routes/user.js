const express = require("express");
const router = express.Router();
const xApi = require("../services/xApi");

/**
 * GET /user/:username/profile
 * returns basic profile
 */
router.get("/:username/profile", async (req, res) => {
  try {
    const user = await xApi.getUserByUsername(req.params.username);

    res.json({ ok: true, user });
  } catch (e) {
    if (e.response) {
      const h = e.response.headers;
      console.error("❌ Ошибка:", e.response.status, e.response.statusText);
      console.log("🔹 Лимит окна:", h["x-rate-limit-limit"]);
      console.log("🔹 Осталось в окне:", h["x-rate-limit-remaining"]);
      console.log(
        "🔹 Сброс окна:",
        new Date(h["x-rate-limit-reset"] * 1000).toLocaleString()
      );
      console.log("🔹 Лимит в сутки:", h["x-app-limit-24hour-limit"]);
      console.log("🔹 Осталось в сутки:", h["x-app-limit-24hour-remaining"]);
      console.log(
        "🔹 Сброс суточного лимита:",
        new Date(h["x-app-limit-24hour-reset"] * 1000).toLocaleString()
      );
    }

    console.error(e?.response?.data || e.message);
    res
      .status(e?.response?.status || 500)
      .json({ ok: false, error: e?.response?.data || e.message });
  }
});

/**
 * GET /user/:username/tweets
 * query: max_results, pagination_token
 */
router.get("/:username/tweets", async (req, res) => {
  try {
    const username = req.params.username;
    const user = await xApi.getUserByUsername(username);
    if (!user)
      return res.status(404).json({ ok: false, error: "User not found" });

    const { max_results, pagination_token } = req.query;
    const data = await xApi.getUserTweets(
      user.id,
      Number(max_results) || 100,
      pagination_token
    );
    console.log("Fetched data:", data);

    res.json({
      ok: true,
      user,
      tweets: data.data || [],
      meta: data.meta || {},
    });
  } catch (e) {
    console.error(e?.response?.data || e.message);
    if (e.response) {
      const h = e.response.headers;
      console.error("❌ Ошибка:", e.response.status, e.response.statusText);
      console.log("🔹 Лимит окна:", h["x-rate-limit-limit"]);
      console.log("🔹 Осталось в окне:", h["x-rate-limit-remaining"]);
      console.log(
        "🔹 Сброс окна:",
        new Date(h["x-rate-limit-reset"] * 1000).toLocaleString()
      );
      console.log("🔹 Лимит в сутки:", h["x-app-limit-24hour-limit"]);
      console.log("🔹 Осталось в сутки:", h["x-app-limit-24hour-remaining"]);
      console.log(
        "🔹 Сброс суточного лимита:",
        new Date(h["x-app-limit-24hour-reset"] * 1000).toLocaleString()
      );
    }

    res
      .status(e?.response?.status || 500)
      .json({ ok: false, error: e?.response?.data || e.message });
  }
});

/**
 * GET /user/:username/metrics
 * aggregated metrics from last N tweets (query: max_results)
 */
router.get("/:username/metrics", async (req, res) => {
  try {
    const username = req.params.username;
    const limit = Number(req.query.max_results) || 100;
    const user = await xApi.getUserByUsername(username);
    if (!user)
      return res.status(404).json({ ok: false, error: "User not found" });

    const tweetsResp = await xApi.getUserTweets(user.id, limit);
    const tweets = tweetsResp.data || [];
    const total = tweets.length;
    const sums = tweets.reduce(
      (acc, t) => {
        const m = t.public_metrics || {};
        acc.likes += m.like_count || 0;
        acc.retweets += m.retweet_count || 0;
        acc.replies += m.reply_count || 0;
        acc.quotes += m.quote_count || 0;
        return acc;
      },
      { likes: 0, retweets: 0, replies: 0, quotes: 0 }
    );

    const avg = {
      likes: total ? sums.likes / total : 0,
      retweets: total ? sums.retweets / total : 0,
      replies: total ? sums.replies / total : 0,
      quotes: total ? sums.quotes / total : 0,
    };

    // top N by engagement (likes + retweets + replies + quotes)
    const top = tweets
      .map(t => ({
        ...t,
        engagement:
          (t.public_metrics?.like_count || 0) +
          (t.public_metrics?.retweet_count || 0) +
          (t.public_metrics?.reply_count || 0) +
          (t.public_metrics?.quote_count || 0),
      }))
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, 10);

    res.json({ ok: true, user, total_tweets: total, sums, avg, top });
  } catch (e) {
    if (e.response) {
      const h = e.response.headers;
      console.error("❌ Ошибка:", e.response.status, e.response.statusText);
      console.log("🔹 Лимит окна:", h["x-rate-limit-limit"]);
      console.log("🔹 Осталось в окне:", h["x-rate-limit-remaining"]);
      console.log(
        "🔹 Сброс окна:",
        new Date(h["x-rate-limit-reset"] * 1000).toLocaleString()
      );
      console.log("🔹 Лимит в сутки:", h["x-app-limit-24hour-limit"]);
      console.log("🔹 Осталось в сутки:", h["x-app-limit-24hour-remaining"]);
      console.log(
        "🔹 Сброс суточного лимита:",
        new Date(h["x-app-limit-24hour-reset"] * 1000).toLocaleString()
      );
    }

    console.error(e?.response?.data || e.message);
    res
      .status(e?.response?.status || 500)
      .json({ ok: false, error: e?.response?.data || e.message });
  }
});

/**
 * GET /user/:username/likes
 * returns liked tweets by this user (may be restricted)
 */
router.get("/:username/likes", async (req, res) => {
  try {
    const username = req.params.username;
    const user = await xApi.getUserByUsername(username);
    if (!user)
      return res.status(404).json({ ok: false, error: "User not found" });

    const { max_results, pagination_token } = req.query;
    const data = await xApi.getUserLikedTweets(
      user.id,
      Number(max_results) || 100,
      pagination_token
    );
    res.json({ ok: true, user, likes: data.data || [], meta: data.meta || {} });
  } catch (e) {
    if (e.response) {
      const h = e.response.headers;
      console.error("❌ Ошибка:", e.response.status, e.response.statusText);
      console.log("🔹 Лимит окна:", h["x-rate-limit-limit"]);
      console.log("🔹 Осталось в окне:", h["x-rate-limit-remaining"]);
      console.log(
        "🔹 Сброс окна:",
        new Date(h["x-rate-limit-reset"] * 1000).toLocaleString()
      );
      console.log("🔹 Лимит в сутки:", h["x-app-limit-24hour-limit"]);
      console.log("🔹 Осталось в сутки:", h["x-app-limit-24hour-remaining"]);
      console.log(
        "🔹 Сброс суточного лимита:",
        new Date(h["x-app-limit-24hour-reset"] * 1000).toLocaleString()
      );
    }

    console.error(e?.response?.data || e.message);
    res
      .status(e?.response?.status || 500)
      .json({ ok: false, error: e?.response?.data || e.message });
  }
});

/**
 * GET /user/:username/mentions
 * returns tweets that mention this user (comments)
 */
router.get("/:username/mentions", async (req, res) => {
  try {
    const username = req.params.username;
    const user = await xApi.getUserByUsername(username);
    if (!user)
      return res.status(404).json({ ok: false, error: "User not found" });

    const { max_results, pagination_token } = req.query;
    const data = await xApi.getUserMentions(
      user.id,
      Number(max_results) || 100,
      pagination_token
    );
    res.json({
      ok: true,
      user,
      mentions: data.data || [],
      meta: data.meta || {},
    });
  } catch (e) {
    if (e.response) {
      const h = e.response.headers;
      console.error("❌ Ошибка:", e.response.status, e.response.statusText);
      console.log("🔹 Лимит окна:", h["x-rate-limit-limit"]);
      console.log("🔹 Осталось в окне:", h["x-rate-limit-remaining"]);
      console.log(
        "🔹 Сброс окна:",
        new Date(h["x-rate-limit-reset"] * 1000).toLocaleString()
      );
      console.log("🔹 Лимит в сутки:", h["x-app-limit-24hour-limit"]);
      console.log("🔹 Осталось в сутки:", h["x-app-limit-24hour-remaining"]);
      console.log(
        "🔹 Сброс суточного лимита:",
        new Date(h["x-app-limit-24hour-reset"] * 1000).toLocaleString()
      );
    }

    console.error(e?.response?.data || e.message);
    res
      .status(e?.response?.status || 500)
      .json({ ok: false, error: e?.response?.data || e.message });
  }
});

module.exports = router;
