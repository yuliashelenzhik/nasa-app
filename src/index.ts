import express, { Express, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server 000");
});

// app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
//   console.error(err.message);
//   res.status(500).send("Server Error");
// });

// export default app;

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
