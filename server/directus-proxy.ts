import express from "express";
import fetch from "node-fetch";

const router = express.Router();

// Handle CORS preflight requests
router.options("/*", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.status(200).send();
});

// Proxy endpoint for Directus API
router.all("/*", async (req, res) => {
  try {
    const directusUrl = process.env.DIRECTUS_URL || "https://admin.cnsubscribe.xyz";
    const proxyUrl = `${directusUrl}${req.path}${req.url.includes("?") ? req.url.substring(req.url.indexOf("?")) : ""}`;

    const options: any = {
      method: req.method,
      headers: {
        ...req.headers,
        host: new URL(directusUrl).host,
      },
    };

    // Remove content-length header to let node-fetch calculate it
    delete options.headers["content-length"];

    // Forward the request body if it exists
    if (req.method !== "GET" && req.method !== "HEAD") {
      options.body = JSON.stringify(req.body);
    }

    const response = await fetch(proxyUrl, options);
    const data = await response.text();

    // Set CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    // Copy response headers
    response.headers.forEach((value: string, name: string) => {
      if (
        !name.toLowerCase().includes("transfer-encoding") &&
        !name.toLowerCase().includes("content-encoding")
      ) {
        res.setHeader(name, value);
      }
    });

    res.status(response.status).send(data);
  } catch (error) {
    console.error("Directus proxy error:", error);
    res.status(500).json({ error: "Failed to proxy request to Directus" });
  }
});

export default router;
