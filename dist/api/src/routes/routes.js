"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const router = (0, express_1.Router)();
dotenv_1.default.config();
const API_KEY = process.env.API_KEY;
const URL = process.env.URL;
const APOD_URL = process.env.APOD_URL;
const EONET_API_URL = process.env.EONET_API_URL;
if (!API_KEY || !URL || !APOD_URL || !EONET_API_URL) {
    throw new Error("Missing API_KEY, URL, or APOD_URL in environment variables.");
}
const getContinentFromCoords = (lat, lon) => {
    if (lat > 0 && lon < -30)
        return "North America";
    if (lat < 0 && lon < -30)
        return "South America";
    if (lat > 35 && lon > -30 && lon < 60)
        return "Europe";
    if (lat > -35 && lat < 35 && lon > -20 && lon < 50)
        return "Africa";
    if (lat > 20 && lon > 50 && lon < 150)
        return "Asia";
    if (lat < 0 && lon > 110)
        return "Australia";
    if (lat < -60)
        return "Antarctica";
    return "Unknown";
};
//GET ALL CATEGORIES
router.get("/categories", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.get(EONET_API_URL + "/categories");
        res.json(response.data.categories);
    }
    catch (error) {
        console.error("Error fetching categories:", error.message);
        res.status(500).json({ error: "Failed to fetch categories" });
    }
}));
//GET EVENTS BY CATEGORY
router.get("/events", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categoryIds = req.query.categoryIds
            ? req.query.categoryIds.split(",").map(Number)
            : [];
        const response = yield axios_1.default.get(EONET_API_URL + "/events");
        let events = response.data.events;
        if (categoryIds.length > 0) {
            events = events.filter((event) => event.categories.some((category) => categoryIds.includes(Number(category.id))));
        }
        res.json(events);
    }
    catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Failed to fetch events" });
    }
}));
// GET EVENTS BY CONTINENT
router.get("/events-by-continent", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const continent = req.query.continent;
        if (!continent) {
            return res.status(400).json({ error: "Continent parameter is required" });
        }
        const response = yield axios_1.default.get(EONET_API_URL + "/events");
        const events = response.data.events;
        const filteredEvents = events.filter((event) => {
            const { geometries } = event;
            const firstGeometry = geometries[0];
            const [lon, lat] = firstGeometry.coordinates;
            return getContinentFromCoords(lat, lon) === continent;
        });
        res.json(filteredEvents);
    }
    catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Failed to fetch events by continent" });
    }
}));
//GET EVENTS COUNT
router.get("/events-count", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.get(EONET_API_URL + "/events");
        const events = response.data.events;
        const categoryCounts = {};
        let totalEvents = 0;
        events.forEach((event) => {
            event.categories.forEach((category) => {
                const categoryId = category.id;
                const categoryTitle = category.title;
                if (!categoryCounts[categoryId]) {
                    categoryCounts[categoryId] = { title: categoryTitle, count: 0 };
                }
                categoryCounts[categoryId].count++;
                totalEvents++;
            });
        });
        const categoryCountsArray = Object.entries(categoryCounts).map(([categoryId, { title, count }]) => ({
            categoryId: Number(categoryId),
            categoryTitle: title,
            count,
        }));
        const sortedCategoryCountsArray = categoryCountsArray.sort((a, b) => b.count - a.count);
        res.json({
            data: sortedCategoryCountsArray,
            total: totalEvents,
        });
    }
    catch (error) {
        console.error("Error fetching events:", error.message);
        res.status(500).json({ error: "Failed to fetch events count" });
    }
}));
exports.default = router;
