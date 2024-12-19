# **ETL Pipeline**

---

## **Table of Contents**

1. [Overview](#overview)
2. [Installation](#installation)
3. [Usage](#usage)
4. [Technologies](#technologies)
5. [API Documentation](#api-documentation)

---

## **Overview**

![Screenshot 2024-12-19 at 3 23 14 PM](https://github.com/user-attachments/assets/fb4c7b60-ed51-4a26-8edc-e3e5acbf187b)


A simple ETL Pipeline that:

- Stores the last 6 months of commits from any Github Repo in a PostgreSQL database(Tested with Apache Airflow GH Repo)
- Provides the heatmap of commits from Github Repo of each day of the week of every 3 hours of the day (Past 6 Months)
- Provides top 5 committers & committer with longest committing streak (daily basis)

## **Installation**

This repo consists of a Node application with Javascript files & a PostgreSQL database.

1. Create .env file with reference to .env.example file and populate the variables.
2. Deploy the Database.

- Run "yarn setup-db" to spin up the docker database and create a commits table in said database.

3. Run the application.

- Run "yarn start" to run the node application. This will:
  - populate the database with the latest 6 months of commits from the GH repo.
  - return the heatmap, top 5 committers & committers with longest committing streak in a html file

4. Open the HTML file to view data.
5. Done

### **Prerequisites**

1. Docker Client.

- To instantiate the PostgreSQL database.

2. Run Yarn to install all dependencies.

---

## **Usage**

```bash
# Spin up Database
yarn setup-db
```

```bash
# Run the project
yarn start
```

---

## **Technologies**

- **FrontEnd**: Chartjs
- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **Other**: Docker

---

## **API Documentation**

### Health Endpoint

#### `GET /health`

- **Description**: Checks health of application.
- **Response**:

```json
API is running.
```

### Fetch Commits Endpoint

#### `POST /fetch-commits`

- **Description**: Fetches a list of the last 6 months worth of commits, insert into DB & remove any old commits (if relevant).
- **Response**:

```json
Commits fetched, inserted, and old commits cleaned up successfully.
```

### Heatmap Data Endpoint

#### `GET /heatmap-data`

- **Description**: Fetches each day of the week, their respective time block and frequency of commits at that block.
- **Response**:

```json
[
  {
    "day_of_week": "Fri",
    "time_block": "0",
    "commit_count": "22"
  }
]
```

### Top Five Committers Endpoint

#### `GET /top-five-committers`

- **Description**: Fetches the top five committers leaderboard throughout the 6 months.
- **Response**:

```json
[
  {
    "committer_name": "web-flow",
    "commit_count": "2493"
  }
]
```

### Longest Commit Streak Endpoint

#### `GET /longest-streak`

- **Description**: Fetches the committer with the longest commit streak in days within the past 6 months.
- **Response**:

```json
[
  {
    "committer_name": "web-flow",
    "longest_streak": "95"
  }
]
```
