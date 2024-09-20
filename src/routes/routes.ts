import { Router, Request, Response } from "express";
import axios from "axios";

const router = Router();

router.get("/apod", async (req: Request, res: Response) => {
  try {
    const apiKey = process.env.NASA_API_KEY;
    const response = await axios.get(
      `https://api.nasa.gov/planetary/apod?api_key=${apiKey}`
    );

    res.json(response.data);
  } catch (error: any) {
    console.error("Error fetching data from NASA API:", error.message);
    res.status(500).send("Failed to fetch data");
  }
});

export default router;
