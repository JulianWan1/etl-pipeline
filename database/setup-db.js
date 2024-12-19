import { exec } from "child_process";

const startDatabase = () => {
  exec("docker-compose up -d", (error, stdout, stderr) => {
    if (error) {
      console.error(`Error starting database: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
    }
    console.log(`stdout: ${stdout}`);
    console.log("PostgreSQL database started successfully.");
  });
};

startDatabase();
