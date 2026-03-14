require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const workerRoutes = require('./routes/workerRoutes');
const jobRoutes = require('./routes/jobRoutes'); 
const employerRoutes = require('./routes/employerRoutes');
const contractorRoutes = require('./routes/contractorRoutes');
const projectRoutes = require('./routes/projectRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/employers', employerRoutes);
app.use('/api/contractors', contractorRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/projects', projectRoutes);

console.log('MONGO URI:', process.env.MONGO_URI);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
})
.then(() => {
  console.log("✅ MongoDB connected SUCCESSFULLY");
})
.catch((err) => {
  console.error("❌ MongoDB FAILED:", err);
});

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});