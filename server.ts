import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const DIARY_PATH = path.join(process.cwd(), "public", "aiinsightdiary.json");

  // API Routes
  app.get("/api/insights", async (req, res) => {
    try {
      const data = await fs.readFile(DIARY_PATH, "utf-8");
      res.json(JSON.parse(data));
    } catch (error) {
      res.status(500).json({ error: "Failed to read ledger" });
    }
  });

  app.post("/api/insights", async (req, res) => {
    try {
      const { aifact, aifactinsight, contributor, date, practicalUsage } = req.body;
      
      if (!aifact || !aifactinsight || !contributor || !date) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Enforce length limits
      if (aifact.length > 120) return res.status(400).json({ error: "Fact too long (max 120 chars)" });
      if (aifactinsight.length > 600) return res.status(400).json({ error: "Insight too long (max 600 chars)" });
      if (contributor.length > 30) return res.status(400).json({ error: "Contributor name too long (max 30 chars)" });
      if (practicalUsage && practicalUsage.length > 300) return res.status(400).json({ error: "Practical usage too long (max 300 chars)" });

      const data = await fs.readFile(DIARY_PATH, "utf-8");
      const insights = JSON.parse(data);
      
      const newEntry = { aifact, aifactinsight, contributor, date, practicalUsage };
      insights.unshift(newEntry); // Add to top

      await fs.writeFile(DIARY_PATH, JSON.stringify(insights, null, 2));
      res.status(201).json(newEntry);
    } catch (error) {
      res.status(500).json({ error: "Failed to update ledger" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Insight Hub running on http://localhost:${PORT}`);
  });
}

startServer();
