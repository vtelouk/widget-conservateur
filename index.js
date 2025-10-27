import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const app = express();
const port = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.set("trust proxy", 1);

// Autoriser CORS depuis Webex Desktop
app.use(cors({
  origin: "https://desktop.wxcc-eu2.cisco.com",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// === 🧩 PROXY AUTH TOKEN ===
app.post("/api/token", async (req, res) => {
  try {
    const authUrl = "https://auth.conservateur.fr/auth/realms/LeConservateur/protocol/openid-connect/token";

    const response = await fetch(authUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        username: "cisco",            // ← remplace par ton vrai username
        password: "X8cNaoFf6JxN8xAbR3ZGWBp393U6*APEKzi",        // ← remplace par ton vrai mot de passe
        client_id: "ApiCiscoSaas",
        grant_type: "password",
      }),
    });

    const data = await response.text();
    console.log("🔑 Réponse du token Conservateur :", data);
    res.status(response.status).send(data);
  } catch (error) {
    console.error("❌ Erreur proxy token :", error);
    res.status(500).send({ error: error.message });
  }
});

// === 🧩 PROXY API CALL ===
app.post("/api/call", async (req, res) => {
  try {
    const apiUrl = "https://api.conservateur.fr/telephonie/appels";

    // Récupère le token transmis par ton front (facultatif)
    const token = req.headers.authorization || "";

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token, // ou rien si non requis
      },
      body: JSON.stringify({
        idPersonne: "304100",
        idAgent: "0020526",
        nom: "BB",
        prenom: "CC",
        role: "DD",
        fonction: "EE",
        sens: "E",
        loginWindows: "FF",
        dateDebutAppel: "2025-01-01 13:30:00",
        fiches: [
          {
            numFiche: 1,
            idContrat: "F-AHF-1263884",
            commentaireMotif: "AA",
            flagReclamation: true,
            codeMotif1: "RELA",
            codeMotif2: "PRDC",
            codeMotif3: "RENN",
            idPersonne: "304100",
            commentaireTache: "BB",
            codeTache: "ET04",
            dateTache: "2025-01-01 13:30:00",
          },
        ],
      }),
    });

    const result = await response.text();
    console.log("📞 Réponse API Conservateur :", result);
    res.status(response.status).send(result);
  } catch (error) {
    console.error("❌ Erreur proxy call :", error);
    res.status(500).send({ error: error.message });
  }
});

// === SERVEURS DE FICHIERS ===
app.use("/build", express.static(join(__dirname, "build")));
app.get("/build/bundle.js", (req, res) => {
  res.sendFile(join(__dirname, "/src/build", "bundle.js"));
});
app.use(express.static(join(__dirname, "src")));

app.listen(port, () => {
  console.log(`✅ Serveur proxy & statique démarré sur http://localhost:${port}`);
});
