import { handle } from "frog/next";
import { devtools } from "frog/dev";
import { serveStatic } from "frog/serve-static";
import { app } from "../src/frame";

// Use Edge Runtime for better performance
export const config = {
  runtime: "edge",
};

// Only use devtools in development
if (process.env.NODE_ENV === "development") {
  devtools(app, { serveStatic });
}

// Export handlers
export const GET = handle(app);
export const POST = handle(app);
