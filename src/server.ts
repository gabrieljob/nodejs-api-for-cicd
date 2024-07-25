import dotenv from "dotenv";
dotenv.config();
import serverless from "serverless-http";
import express from "express";
import userRoutes from "./routes/userRoutes";
import db from "./database/mysql/db";
import serverConfig from "./config/server";

const app = express();

app.use(express.json());
app.use("/api/v1", userRoutes);

db.authenticate()
  .then(() => {
    console.log("database connected");

    app.listen(serverConfig.PORT, () => {
      console.log("server running");
    });
  })
  .catch((err: Error) => {
    console.error("Error connection to database:", err);
  });

export const handler = serverless(app);
