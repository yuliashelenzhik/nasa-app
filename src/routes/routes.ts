import { Router, Request, Response } from "express";
import axios from "axios";
import dotenv from "dotenv";

const router = Router();

dotenv.config();
console.log(process.env);

const API_KEY = process.env.API_KEY;
const URL = process.env.URL;
const APOD_URL = process.env.APOD_URL;

if (!API_KEY || !URL || !APOD_URL) {
  throw new Error(
    "Missing API_KEY, URL, or APOD_URL in environment variables."
  );
}

router.get("/img", async (req: Request, res: Response) => {
  try {
    const apiUrl = `${URL}${APOD_URL}?api_key=${API_KEY}`;
    const response = await axios.get(apiUrl);
    res.json(response.data);
  } catch (error) {
    res.status(500).send("Failed to fetch data");
  }
});

export default router;
