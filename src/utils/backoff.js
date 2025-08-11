function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function handleRateLimit(err, attempt = 0) {
  // err.response?.headers['retry-after'] может быть задан
  const retryAfter = err?.response?.headers?.["retry-after"];
  let waitMs = 0;
  if (retryAfter) waitMs = parseInt(retryAfter, 10) * 1000;
  else waitMs = Math.min(60000, 1000 * Math.pow(2, attempt)); // экспоненциально
  await sleep(waitMs);
}

module.exports = { handleRateLimit, sleep };

// Этот файл содержит функции для обработки ошибок и задержек при превышении лимитов API.
// Функция `sleep` создает задержку в миллисекундах.
