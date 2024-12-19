function dayOfWeekConverter(dayOfWeek) {
  let day = "";

  switch (dayOfWeek) {
    case 0:
      day = "Sunday";
      break;
    case 1:
      day = "Monday";
      break;
    case 2:
      day = "Tuesday";
      break;
    case 3:
      day = "Wednesday";
      break;
    case 4:
      day = "Thursday";
      break;
    case 5:
      day = "Friday";
      break;
    case 6:
      day = "Saturday";
  }

  return day;
}

function initializeHeatmap(heatmapData) {
  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const timeBlocks = [
    "01-03",
    "04-06",
    "07-09",
    "10-12",
    "13-15",
    "16-18",
    "19-21",
    "22-00",
  ];

  const ctx = document.getElementById("heatmap").getContext("2d");

  new Chart(ctx, {
    type: "matrix",
    data: {
      datasets: [
        {
          label: "Commit Heatmap",
          data: heatmapData,
          backgroundColor: function (context) {
            const value = context.raw.v;
            return value
              ? `rgba(0, 123, 255, ${value / 50})`
              : "rgba(200, 200, 200, 0.1)";
          },
          borderColor: "rgba(0, 123, 255, 0.5)",
          borderWidth: 1,
          width: (context) => {
            const chartArea = context.chart.chartArea;
            return chartArea ? chartArea.width / timeBlocks.length - 1 : 10;
          },
          height: (context) => {
            const chartArea = context.chart.chartArea;
            return chartArea ? chartArea.height / daysOfWeek.length - 1 : 10;
          },
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "Heatmap of Commits from Github Repo of Each Day of the Week of Every 3 Hours of the Day (Past 6 Months)",
        },
        tooltip: {
          callbacks: {
            title: (tooltipItems) =>
              `Day of the Week: ${tooltipItems[0].raw.y}
							Time Block: ${tooltipItems[0].raw.x}`,
            label: (tooltipItem) => `Commits: ${tooltipItem.raw.v}`,
          },
        },
        datalabels: {
          color: "black",
          align: "base",
          formatter: (value) => value.v || "",
        },
      },
      scales: {
        x: {
          type: "category",
          labels: timeBlocks,
          title: { display: true, text: "3-Hour Time Blocks" },
          grid: { display: true },
        },
        y: {
          type: "category",
          labels: daysOfWeek,
          title: { display: true, text: "Day of the Week" },
          grid: { display: true },
          offset: true,
        },
      },
    },
  });
}

fetch("http://localhost:3000/heatmap-data")
  .then((response) => response.json())
  .then((data) => {
    const heatmapData = data.map((d) => ({
      x: d.time_block_label,
      y: dayOfWeekConverter(Number(d.day_of_week)),
      v: d.commit_count,
    }));

    initializeHeatmap(heatmapData);
  })
  .catch((error) => console.error("Error loading heatmap data:", error));

fetch("http://localhost:3000/longest-streak")
  .then((response) => response.json())
  .then((data) => {
    document.getElementById("longest-streak").innerHTML = data.map(
      (committer) => {
        return `${committer.committer_name}: ${committer.longest_streak} consecutive days`;
      }
    );
  })
  .catch((error) =>
    console.error("Error fetching committer with longest streak data:", error)
  );

fetch("http://localhost:3000/top-five-committers")
  .then((response) => response.json())
  .then((data) => {
    document.getElementById("top-five").innerHTML = data.map((committer) => {
      return `${data.indexOf(committer) + 1}. ${committer.committer_name}: ${
        committer.commit_count
      } commits`;
    });
  })
  .catch((error) =>
    console.error("Error fetching top five committers data:", error)
  );
