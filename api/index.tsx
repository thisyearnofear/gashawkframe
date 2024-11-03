import { handle } from "frog/next";
import { devtools } from "frog/dev";
import { serveStatic } from "frog/serve-static";
import { app } from "../src/frame";

// Devtools setup
if (process.env.NODE_ENV === "development") {
  devtools(app, { serveStatic });
} else {
  devtools(app, { assetsPath: "/.frog" });
}

// Export Vercel handlers
export const GET = handle(app);
export const POST = handle(app);
