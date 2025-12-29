import { Router } from "express";
import { saveUserPreferences, getUserPreferences } from "../controllers/preferences.controller";
import { protectRoute } from "../middleware/auth.middleware";


const router = Router();


// FETCH PREFERENCES
// Endpoint: GET /api/preferences/get

router.get("/get", protectRoute, getUserPreferences);


//  SAVE/UPDATE PREFERENCES
//  Endpoint: POST /api/preferences/save
//  Endpoint: PUT /api/preferences/update

router.post("/save", protectRoute, saveUserPreferences);
router.put("/update", protectRoute, saveUserPreferences); // Re-uses the upsert logic

export default router;