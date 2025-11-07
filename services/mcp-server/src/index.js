import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

const PORT = process.env.MCP_SERVER_PORT || 4020;
const MCP_API_KEY = process.env.MCP_API_KEY || "sistemasumgsecret";
const EVENTS_URL = process.env.EVENTS_URL || "http://events-service:4002";
const REPORT_URL = process.env.REPORT_URL || "http://report-service:4003";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.LLM_API_KEY;
const GEMINI_MODEL = process.env.LLM_MODEL || "gemini-2.5-flash";

if (!GEMINI_API_KEY) {
  console.error("❌ ERROR: GEMINI_API_KEY no está configurado.");
  process.exit(1);
}

// Inicializa el cliente oficial de Gemini
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

/* ===================================
   🔐 Middleware de autenticación
=================================== */
app.use((req, res, next) => {
  const header = req.headers["authorization"] || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : header;
  if (req.path === "/health") return next();
  if (token && token === MCP_API_KEY) return next();
  return res.status(401).json({ message: "Unauthorized (MCP_API_KEY required)" });
});

/* ===================================
   🤖 Llamada directa al modelo Gemini
=================================== */
async function callGemini(prompt, context = "") {
  console.log(`🧩 Enviando prompt a Gemini → modelo: ${GEMINI_MODEL}`);
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: [
      {
        role: "user",
        parts: [{ text: context ? `${context}\n\n${prompt}` : prompt }],
      },
    ],
  });

  // SDK ya devuelve text() directamente
  return response.text || "(sin respuesta)";
}

/* ===================================
   🧠 JSON-RPC API
=================================== */
app.post("/rpc", async (req, res) => {
  const { id, method, params } = req.body || {};
  try {
    if (!method) throw new Error("method required");

    if (method === "chat") {
      const text = await callGemini(params.prompt, params.context);
      return res.json({ id, result: { text } });
    }

    if (method === "getPendingChanges") {
      const repoId = params?.repoId;
      if (!repoId) throw new Error("repoId required");
      const r = await fetch(`${EVENTS_URL}/changes/pending?repoId=${encodeURIComponent(repoId)}`);
      const j = await r.json();
      return res.json({ id, result: j });
    }

    if (method === "searchEvents") {
      const qs = new URLSearchParams(params || {}).toString();
      const r = await fetch(`${EVENTS_URL}/changes/search?${qs}`);
      const j = await r.json();
      return res.json({ id, result: j });
    }

    if (method === "generateReport") {
      const repoId = params?.repoId;
      const title = params?.title;
      if (!repoId) throw new Error("repoId required");
      const r = await fetch(`${REPORT_URL}/reports/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoId, title }),
      });
      const buf = Buffer.from(await r.arrayBuffer());
      const b64 = buf.toString("base64");
      return res.json({
        id,
        result: { pdfBase64: b64, filename: `reporte-${repoId}.pdf` },
      });
    }

    throw new Error("Unknown method");
  } catch (e) {
    console.error("❌ Error RPC:", e.message);
    return res.json({ id, error: { code: 500, message: e.message } });
  }
});

/* ===================================
   🩺 Health Check
=================================== */
app.get("/health", (_req, res) => res.json({ ok: true, service: "mcp" }));

app.listen(PORT, () => {
  console.log(`✅ MCP Server on port ${PORT}`);
  console.log(`🔑 MCP_API_KEY: ${MCP_API_KEY}`);
  console.log(`🤖 GEMINI_MODEL: ${GEMINI_MODEL}`);
});
