import express from "express"
import auth from "../middleware/auth.js"

import { createCall, getAllCalls, updateCall, deleteCall } from "../controllers/callController.js"

const router = express.Router()
console.log("Calls route loaded")

router.post("/", auth, createCall)
router.get("/", auth, getAllCalls)
router.put("/:id", auth, updateCall)
router.delete("/:id", auth, deleteCall)

export default router