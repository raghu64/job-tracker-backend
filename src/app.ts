import express from "express"
import dotenv from "dotenv"
import cors from "cors";
import authRoutes from "./routes/auth"
import jobRoutes from "./routes/jobs"
import callRoutes from "./routes/calls"
import employerRoutes from "./routes/employers"
import { connectDB } from "./db"

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