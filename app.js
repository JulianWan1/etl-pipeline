import express from "express";
import bodyParser from "body-parser";
import {
  fetchCommits,
  insertCommits,
  cleanupOldCommits,
  getHeatMapData,
  getLongestStreak,
  getTopFiveCommitters,
} from "./services.js";
import { PORT } from "./config.js";
import cors from "cors";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// API to fetch, insert, and cleanup commits
app.post("/fetch-commits", async (req, res) => {
  try {
    const commits = await fetchCommits();

    await insertCommits(commits);

    await cleanupOldCommits();

    res
      .status(200)
      .send(
        "Commits fetched, inserted, and old commits cleaned up successfully."
      );
  } catch (error) {
    console.error("Error in /fetch-commits:", error);

    res.status(500).send("Failed to fetch, insert, or clean up commits.");
  }
});

app.get("/heatmap-data", async (req, res) => {
  try {
    const result = await getHeatMapData();

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching heatmap data:", error);

    res.status(500).send("Internal Server Error");
  }
});

app.get("/top-five-committers", async (req, res) => {
  try {
    const result = await getTopFiveCommitters();

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching top five committers data:", error);

    res.status(500).send("Internal Server Error");
  }
});

app.get("/longest-streak", async (req, res) => {
  try {
    const result = await getLongestStreak();

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching committer with longest streak data:", error);

    res.status(500).send("Internal Server Error");
  }
});

app.get("/health", (req, res) => {
  res.status(200).send("API is running.");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
