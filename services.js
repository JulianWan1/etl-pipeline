import fetch from "node-fetch";
import { client } from "./database/database.js";
import { GITHUB_TOKEN, REPO_NAME, REPO_OWNER } from "./config.js";

const sixMonthsAgo = new Date();
sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

const since = sixMonthsAgo.toISOString();

function parseLinkHeader(header) {
  const links = {};
  const regex = /<([^>]+)>;\s*rel="([^"]+)"/g;
  let match;
  while ((match = regex.exec(header)) !== null) {
    links[match[2]] = match[1];
  }
  return links;
}

export async function fetchCommits() {
  const baseUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/commits?since=${since}`;
  const headers = { Authorization: `token ${GITHUB_TOKEN}` };

  let allCommits = [];

  let nextPage = baseUrl;

  try {
    while (nextPage) {
      const response = await fetch(nextPage, { headers });

      if (!response.ok) {
        throw new Error(
          `GitHub API error: ${response.status} - ${response.statusText}`
        );
      }

      // Append current page's commits
      const commits = await response.json();
      allCommits = allCommits.concat(commits);

      // Parse `Link` header to find the next page
      const linkHeader = response.headers.get("link");
      if (linkHeader) {
        const links = parseLinkHeader(linkHeader);
        nextPage = links.next || null; // Set `nextPage` to the next URL or null if there's no more
      } else {
        nextPage = null; // No `Link` header means no more pages
      }
    }
		
    return allCommits;
  } catch (error) {
    console.error("Error fetching commits:", error);
    throw error;
  }
}

export async function insertCommits(commits) {
  try {
    for (const commit of commits) {
      const sha = commit.sha;
      const committerId = commit.committer.id;
      const committerName = commit.committer.login;
      const commitDate = commit.commit.committer.date;

      await client.query(
        `
        INSERT INTO commits (sha, committer_id, committer_name, commit_date)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (sha) DO NOTHING
        `,
        [sha, committerId, committerName, commitDate]
      );
    }
    console.log("Commits inserted successfully (duplicates skipped).");
  } catch (error) {
    console.error("Error inserting commits:", error);
  }
}

export async function cleanupOldCommits() {
  try {
    const result = await client.query(
      `DELETE FROM commits WHERE commit_date < NOW() - INTERVAL '6 months';`
    );
    console.log(`${result.rowCount} old commits deleted.`);
  } catch (error) {
    console.error("Error cleaning up old commits:", error);
  } finally {
    client.release();
  }
}

export async function getHeatMapData() {
  const query = `
		SELECT 
	    EXTRACT(DOW FROM commit_date) AS day_of_week,
	    CASE
	    WHEN FLOOR(EXTRACT(HOUR FROM commit_date) / 3) * 3 = 0 THEN '01-03'
	    WHEN FLOOR(EXTRACT(HOUR FROM commit_date) / 3) * 3 = 3 THEN '04-06'
	    WHEN FLOOR(EXTRACT(HOUR FROM commit_date) / 3) * 3 = 6 THEN '07-09'
	    WHEN FLOOR(EXTRACT(HOUR FROM commit_date) / 3) * 3 = 9 THEN '10-12'
	    WHEN FLOOR(EXTRACT(HOUR FROM commit_date) / 3) * 3 = 12 THEN '13-15'
	    WHEN FLOOR(EXTRACT(HOUR FROM commit_date) / 3) * 3 = 15 THEN '16-18'
	    WHEN FLOOR(EXTRACT(HOUR FROM commit_date) / 3) * 3 = 18 THEN '19-21'
	    WHEN FLOOR(EXTRACT(HOUR FROM commit_date) / 3) * 3 = 21 THEN '22-00'
			END AS time_block_label,
	    COUNT(*) AS commit_count -- Count of commits in this combination
		FROM commits
		GROUP BY day_of_week, FLOOR(EXTRACT(HOUR FROM commit_date) / 3)
		ORDER BY day_of_week, time_block_label
`;

  const result = await client.query(query);

  return result;
}

export async function getTopFiveCommitters() {
  const query = `
		SELECT committer_name, COUNT(*) AS commit_count
		FROM commits
		GROUP BY committer_name
		ORDER BY commit_count DESC
		LIMIT 5;
	`;

  const result = await client.query(query);

  return result;
}

export async function getLongestStreak() {
  const query = `
		WITH daily_commits AS (
				SELECT committer_name,
						DATE(commit_date) AS commit_day
				FROM 
						commits
				GROUP BY 
						committer_name, DATE(commit_date)
		),
		streaks AS (
				SELECT 
						committer_name,
						commit_day,
						ROW_NUMBER() OVER (PARTITION BY committer_name ORDER BY commit_day) AS row_num
				FROM 
						daily_commits
		),
		streak_groups AS (
				SELECT 
						committer_name,
						commit_day,
						EXTRACT(EPOCH FROM commit_day)::INTEGER / 86400 - row_num AS streak_group
				FROM 
						streaks
		),
		streak_lengths AS (
				SELECT 
						committer_name,
						streak_group,
						COUNT(*) AS streak_length
				FROM 
						streak_groups
				GROUP BY 
						committer_name, streak_group
		)
		SELECT 
				committer_name,
				MAX(streak_length) AS longest_streak
		FROM 
				streak_lengths
		GROUP BY 
				committer_name
		ORDER BY 
				longest_streak DESC
		LIMIT 1;
`;

  const result = await client.query(query);

  return result;
}
