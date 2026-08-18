import express from 'express'
import cors from 'cors'

export const app = express();

import authRoutes from '@routes/auth.routes'
import userRoutes from '@routes/user.routes'
import courseRoutes from '@routes/course.routes'
import uploadRoutes from '@routes/upload.routes'
import forumRoutes from '@routes/forum.routes'
import quizRoutes from './routes/quiz.routes';
import materialRoutes from './routes/material.route';
import purchaseRoutes from './routes/purchase.routes';
import viewingHistoryRoutes from './routes/viewingHistory.routes';
import statisticsRoutes from './routes/statistics.routes';
import adminRoutes from './routes/admin.route';
import userManagementRoutes from './routes/userMsnsgement.route';
import notificationRoutes from './routes/notification.route';
import workflowTrackingRoutes from './routes/workflowTracking.routes';
import contactRoutes from './routes/contact.routes';
import cartRoutes from './routes/cart.routes';
import faqAdminRoutes from './routes/faq-admin.routes';
import bannerRoutes from './routes/banner.routes';
import clientLogoRoutes from './routes/clientLogo.routes';
import studentStoriesRoutes from './routes/studentStories.routes';

// --- Add test email route ---
import { sendOTPEmail } from './utils/email/email';

app.use(cors())
app.use(express.json());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/upload", uploadRoutes);
app.use("/api/v1/forum", forumRoutes);
app.use("/api/v1/quiz", quizRoutes);
app.use('/api/v1/material', materialRoutes);
app.use("/api/v1/purchase", purchaseRoutes);
app.use("/api/v1/viewing-history", viewingHistoryRoutes);
app.use("/api/v1/statistics", statisticsRoutes);
app.use("/api/v1/notification", notificationRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/admin", userManagementRoutes);
app.use('/api/v1/wt', workflowTrackingRoutes);
app.use("/api/v1/contact", contactRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/faq-admin", faqAdminRoutes);
app.use("/api/v1/banner", bannerRoutes);
app.use("/api/v1/client-logo", clientLogoRoutes);
app.use("/api/v1/student-stories", studentStoriesRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
})

// --- Test email API endpoint ---
app.post("/api/v1/test-email", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, error: "Email is required" });
  }
  try {
    await sendOTPEmail(email, "123456");
    return res.json({ success: true, message: "Test email sent!" });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Failed to send email" });
  }
});