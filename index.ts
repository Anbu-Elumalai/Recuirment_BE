import express, { Application } from "express";
import rateLimit from "express-rate-limit";
import cors from "cors";
import path from "path";
import fileUpload from 'express-fileupload';
import { loadConfig, Configuration, _config } from "./config/config";
import { setupRoutes } from "./api/route/base.routes";
import { initDB } from "./config/database";
import dodoWebhook from "./utils/common/dodo.webhook.service";

async function main() {

  try {
    const config: Configuration = await loadConfiguration();
    await setupServer(config);
  } catch (err) {
    console.error("Startup Error:", err);
    process.exit(1);
  }
}

async function loadConfiguration() {
  return loadConfig();
}

function setupRateLimiter(app: Application) {
  const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 500, // limit each IP to 80 requests per windowMs
    //  max: 100,
    handler: (req, res) => {
      console.warn(`⚠️ Rate limit hit: ${req.ip}`);
      res.status(429).json({ message: "Too many requests. Please try again later." });
    }
  });
  app.use(limiter);
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

}

function setupCors(app: Application) {
  app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Origin", "Content-Type", "Authorization"],
  }));
}

async function setupServer(config: Configuration) {

  const db = await initDB(config.DbDsn);

  const app = express();

  // Mount the webhook route
  app.use('/webhook', dodoWebhook);


  setupCors(app);
  setupRateLimiter(app);
  app.use(express.urlencoded({ extended: true }));
  app.use(fileUpload());
  app.use(express.json());
  setupRoutes(app, db); // define your routes inside ./routes/index.ts
  // check and update expired products
  // cron.schedule('* * * * *', () => {
  //   console.log("Cron job running every day 10.00  at " + new Date().toISOString());
  // });

  app.use("/api/public",
    express.static(path.join(__dirname, "public"))
  );

  app.listen(Number(config?.Port), () => {
    console.log(`Server running on port ${config?.Port}, ${config?.Name}`);
  });
}

main();
