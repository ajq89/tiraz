import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Set payload limits high enough for base64 images
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // API to save the custom state from development Admin panel directly to the workspace filesystem
  app.post("/api/save-state", (req, res) => {
    try {
      const { settings, catalogItems, colors, garments } = req.body;
      
      const dbPath = path.join(process.cwd(), "src", "data", "db.json");
      
      const dataToSave = {
        settings: settings || null,
        catalogItems: catalogItems || null,
        colors: colors || null,
        garments: garments || null,
        updatedAt: new Date().toISOString()
      };

      fs.writeFileSync(dbPath, JSON.stringify(dataToSave, null, 2), "utf-8");
      
      console.log(`[Server] State successfully saved to ${dbPath}`);
      res.json({ success: true, message: "State saved to filesystem" });
    } catch (error: any) {
      console.error("[Server] Error saving state:", error);
      res.status(500).json({ success: false, error: error.message });
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
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
