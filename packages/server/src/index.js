import "./bootstrap.js";

import express from "express";
import cors from "cors";

import messageRoutes from "./routes/messageRoutes.js";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";
import valuationRoutes from "./routes/valuationRoutes.js";
import tradeRoutes from "./routes/tradeRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";



const app = express();

// CONNECT DATABASE
connectDB();

// MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/valuation", valuationRoutes);
app.use("/api/trades", tradeRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/admin", adminRoutes);
// TEST ROUTE
app.get("/", (req, res) => {
  res.send("SwapIt.io backend running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
