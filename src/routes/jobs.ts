import express from "express"
import auth from "../middleware/auth.js"
import role from "../middleware/role.js"

import { createJob, getMyJobs, getAllJobs, updateJob, deleteJob } from "../controllers/jobController.js"

const router = express.Router()

console.log("Jobs route loaded")

// consultant
router.get("/mine", auth, role(["consultant"]), getMyJobs)
router.post("/", auth, role(["consultant"]), createJob)

// employer
router.get("/", auth, role(["employer"]), getAllJobs)

router.put("/:id", auth, updateJob)
router.delete("/:id", auth, deleteJob)

export default router