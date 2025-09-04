import { Request, Response } from "express"
import { getDb } from "../db.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { ObjectId } from "mongodb"

export async function register(req: Request, res: Response) {
  const db = getDb()
  console.log("Received new Register request")
  const { email, password, name, role = "consultant" } = req.body
  
  if (!email || !password) return res.status(400).json({ error: "Missing fields" })

  const existing = await db.collection("user").findOne({ email })
  if (existing) return res.status(400).json({ error: "Email already registered" })

  const hashed = await bcrypt.hash(password, 10)

  const { insertedId } = await db.collection("user").insertOne({
    email,
    name,
    password: hashed,
    role,
  })

  res.json({ id: insertedId.toString(), email, role })
}

export async function login(req: Request, res: Response) {
  const db = getDb()
  const { email, password } = req.body

  const user = await db.collection("user").findOne({ email })

  if (!user) return res.status(401).json({ error: "Invalid credentials" })

  const isMatch = await bcrypt.compare(password, user.password)

  if (!isMatch) return res.status(401).json({ error: "Invalid credentials" })

  const token = jwt.sign(
    { id: (user._id as ObjectId).toString(), role: user.role, name: user.name },
    process.env.JWT_SECRET as string,
    { expiresIn: "8h" }
  )

  res.json({ token, role: user.role, name: user.name })
}
