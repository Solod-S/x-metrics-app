require("dotenv").config();
const express = require("express");
const morgan = require("morgan");

const userRoutes = require("./routes/user");

const app = express();
app.use(morgan("dev"));
app.use(express.json());

app.use("/user", userRoutes);

app.get("/", (req, res) => {
  res.send("X Metrics App — healthy");
});

// === Лог всех маршрутов и их описания ===
const ROUTES = [
  {
    method: "GET",
    path: "/user/:username/profile",
    description:
      "Профиль пользователя по username (имя, ник, метрики, дата регистрации)",
  },
  {
    method: "GET",
    path: "/user/:username/tweets?max_results=N",
    description:
      "Список последних твитов пользователя (с лайками, ретвитами, ответами)",
  },
  {
    method: "GET",
    path: "/user/:username/metrics?max_results=N",
    description:
      "Агрегированные метрики по последним N твитам (средние лайки, ретвиты, топ посты)",
  },
  {
    method: "GET",
    path: "/user/:username/likes",
    description:
      "Список твитов, которые лайкнул пользователь (может быть ограничено API)",
  },
  {
    method: "GET",
    path: "/user/:username/mentions",
    description:
      "Список твитов, в которых упоминается пользователь (комментарии/ответы)",
  },
];

console.log("Доступные эндпоинты на локальном сервере:");
ROUTES.forEach(r => {
  console.log(
    `${r.method} http://localhost:${process.env.PORT || 3000}${r.path} — ${r.description}`
  );
});
// =======================================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
