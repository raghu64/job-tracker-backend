import express from "express"
import { login, register } from "../controllers/authController"

const router = express.Router()
console.log("Auth route loaded")

router.post("/login", login)
router.post("/signup", register)

export default router