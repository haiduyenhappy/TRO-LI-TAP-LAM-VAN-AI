import express from "express";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.post("/api/send-email", (req, res) => {
    const { email, studentName, prompt, essay, feedback, improvement } = req.body;
    
    console.log(`Sending email to ${email}...`);
    console.log(`Subject: Bài Tập Làm Văn Của Học Sinh - ${studentName}`);
    
    // In a real app, use Nodemailer or Resend here
    // For this demo, we'll just simulate success
    
    res.json({ 
      success: true, 
      message: "Email đã được gửi thành công cho giáo viên!" 
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
