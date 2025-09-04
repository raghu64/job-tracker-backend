import express from "express";
import {
  createEmployer,
  getAllEmployers,
  getEmployerById,
  updateEmployer,
  deleteEmployer,
} from "../controllers/employerController.js";
import auth from "../middleware/auth.js";
console.log("Employers route loaded");

const router = express.Router();

router.get("/", auth, getAllEmployers);
router.get("/:id", auth, getEmployerById);
router.post("/", auth, createEmployer);
router.put("/:id", auth, updateEmployer);
router.delete("/:id", auth, deleteEmployer);

export default router;
