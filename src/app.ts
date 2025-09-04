import express from "express"
import dotenv from "dotenv"
import cors from "cors";
import authRoutes from "./routes/auth.js"
import jobRoutes from "./routes/jobs.js"
import callRoutes from "./routes/calls.js"
import employerRoutes from "./routes/employers.js"
import { connectDB } from "./db.js"

dotenv.config();

const app = express();

app.use(cors({ origin: "http://localhost:3000" }));

(async () => {

    await connectDB()
    
    app.use(express.json())

    app.use("/api/v1/auth", authRoutes)
    app.use("/api/v1/jobs", jobRoutes)
    app.use("/api/v1/calls", callRoutes)
    app.use("/api/v1/employers", employerRoutes)


    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
        console.log(`Backend listening on port ${PORT}`);
    });

})()

export default app