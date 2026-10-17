import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import apiRouter from "./routes/api.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", apiRouter);

app.get("/", (_, res) => res.json({ status: "ok", service: "vtu-directory" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server on :${PORT}`));