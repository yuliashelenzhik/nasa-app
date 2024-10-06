import express, { Express, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import routes from "./src/routes/routes";
import cors from "cors";

dotenv.config();
// console.log(process.env);

const app: Express = express();

app.use(
  cors({
    origin: ["https://nasa-front-sand.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
const port = process.env.PORT || 3000;

app.get("/", (req: Request, res: Response) => {
  res.send("SERVER");
});

app.use(express.json());

app.use("/api", routes);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Internal Server Error",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
  });
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
