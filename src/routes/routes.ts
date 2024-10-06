import { Router, Request, Response } from "express";
import axios from "axios";
import dotenv from "dotenv";

const router = Router();
dotenv.config();

const API_KEY = process.env.API_KEY;
const URL = process.env.URL;
const APOD_URL = process.env.APOD_URL;
const EONET_API_URL = process.env.EONET_API_URL;

if (!API_KEY || !URL || !APOD_URL || !EONET_API_URL) {
  throw new Error(
    "Missing API_KEY, URL, or APOD_URL in environment variables."
  );
}

const getContinentFromCoords = (lat: number, lon: number): string => {
  if (lat > 0 && lon < -30) return "North America";
  if (lat < 0 && lon < -30) return "South America";
  if (lat > 35 && lon > -30 && lon < 60) return "Europe";
  if (lat > -35 && lat < 35 && lon > -20 && lon < 50) return "Africa";
  if (lat > 20 && lon > 50 && lon < 150) return "Asia";
  if (lat < 0 && lon > 110) return "Australia";
  if (lat < -60) return "Antarctica";
  return "Unknown";
};

// router.get("/img", async (req: Request, res: Response) => {
//   try {
//     const apiUrl = `${URL}${APOD_URL}?api_key=${API_KEY}`;
//     const response = await axios.get(apiUrl);
//     res.json(response.data);
//   } catch (error) {
//     res.status(500).send("Failed to fetch data");
//   }
// });

//GET ALL CATEGORIES
router.get("/categories", async (req: Request, res: Response) => {
  try {
    const response = await axios.get(EONET_API_URL + "/categories");
    res.json(response.data.categories);
  } catch (error: any) {
    console.error("Error fetching categories:", error.message);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

//GET EVENTS BY CATEGORY
router.get("/events", async (req: Request, res: Response) => {
  try {
    const categoryIds: number[] = req.query.categoryIds
      ? (req.query.categoryIds as string).split(",").map(Number)
      : [];

    const response = await axios.get(EONET_API_URL + "/events");

    let events = response.data.events;

    if (categoryIds.length > 0) {
      events = events.filter((event: any) =>
        event.categories.some((category: any) =>
          categoryIds.includes(Number(category.id))
        )
      );
    }
    res.json(events);
  } catch (error: any) {
    console.error(error.message);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

// GET EVENTS BY CONTINENT
router.get("/events-by-continent", async (req: Request, res: Response) => {
  try {
    const continent = req.query.continent as string;

    if (!continent) {
      return res.status(400).json({ error: "Continent parameter is required" });
    }

    const response = await axios.get(EONET_API_URL + "/events");
    const events = response.data.events;

    const filteredEvents = events.filter((event: any) => {
      const { geometries } = event;
      const firstGeometry = geometries[0];
      const [lon, lat] = firstGeometry.coordinates;

      return getContinentFromCoords(lat, lon) === continent;
    });

    res.json(filteredEvents);
  } catch (error: any) {
    console.error(error.message);
    res.status(500).json({ error: "Failed to fetch events by continent" });
  }
});

//GET EVENTS COUNT
router.get("/events-count", async (req: Request, res: Response) => {
  try {
    const response = await axios.get(EONET_API_URL + "/events");
    const events = response.data.events;

    const categoryCounts: { [key: number]: { title: string; count: number } } =
      {};
    let totalEvents = 0;

    events.forEach((event: any) => {
      event.categories.forEach((category: any) => {
        const categoryId = category.id;
        const categoryTitle = category.title;

        if (!categoryCounts[categoryId]) {
          categoryCounts[categoryId] = { title: categoryTitle, count: 0 };
        }
        categoryCounts[categoryId].count++;
        totalEvents++;
      });
    });
    const categoryCountsArray = Object.entries(categoryCounts).map(
      ([categoryId, { title, count }]) => ({
        categoryId: Number(categoryId),
        categoryTitle: title,
        count,
      })
    );
    const sortedCategoryCountsArray = categoryCountsArray.sort(
      (a, b) => b.count - a.count
    );

    res.json({
      data: sortedCategoryCountsArray,
      total: totalEvents,
    });
  } catch (error: any) {
    console.error("Error fetching events:", error.message);
    res.status(500).json({ error: "Failed to fetch events count" });
  }
});

export default router;
