// =====================
// ENV SETUP
// =====================
require("dotenv").config();

// =====================
// IMPORTS
// =====================
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const Groq = require("groq-sdk");

// =====================
// APP SETUP
// =====================
const app = express();

// Render uses an environment variable for PORT (usually 10000)
const PORT = process.env.PORT || 5001;

// =====================
// CORS CONFIGURATION
// =====================
// Explicitly allowing your Firebase domains and Localhost
app.use(cors({
    origin: [
        "https://suntrackers-9171b.web.app",
        "https://suntrackers-9171b.firebaseapp.com",
        "http://localhost:5173"
    ],
    methods: ["GET", "POST"],
    credentials: true
}));

app.use(bodyParser.json());

// =====================
// GROQ CLIENT
// =====================
const groqApiKey = process.env.GROQ_API_KEY;

let groq;
if (groqApiKey) {
    groq = new Groq({ apiKey: groqApiKey });
    console.log("✅ Groq Client Initialized");
} else {
    console.warn("⚠️ Warning: GROQ_API_KEY is missing from Render environment variables.");
}

// =====================
// DATA (In-Memory Database)
// =====================
let schools = [
    { id: 1, name: "SMA 1 Bandung", district: "Bandung", target_amount: 100000000, raised_amount: 45000000 },
    { id: 2, name: "SMK 3 Bekasi", district: "Bekasi", target_amount: 150000000, raised_amount: 12000000 },
    { id: 3, name: "SDN 2 Bogor", district: "Bogor", target_amount: 50000000, raised_amount: 48000000 }
];

// =====================
// ROUTES
// =====================

// 1. Health Check (Check this URL in your browser to see if server is awake)
app.get("/", (req, res) => {
    res.send("✅ West Java Solar Backend is LIVE and Running on Render!");
});

// 2. Get school projects
app.get("/api/projects", (req, res) => {
    res.json(schools);
});

// 3. Chat endpoint (Groq AI Integration)
app.post("/api/chat", async (req, res) => {
    try {
        const { messages } = req.body;

        if (!groq) {
            return res.status(500).json({ error: "AI service not configured on server. Please check GROQ_API_KEY on Render." });
        }

        if (!Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ error: "Messages are required." });
        }

        // Inject a system prompt to constrain the assistant to solar/West Java topics
        // and add navigation capabilities
        const systemPrompt = `You are an expert assistant focused on solar energy systems, investments, and local West Java (Jawa Barat) policy and regulations. You also help users navigate the PowerWestJava platform.

**LANGUAGE SUPPORT:**
You can respond in both English and Bahasa Indonesia. When users communicate in Bahasa Indonesia, respond naturally in Bahasa Indonesia. When users communicate in English, respond in English.

**PLATFORM NAVIGATION:**
- /home - Main landing page with hero section, featured articles, and quick actions
- /planner - Solar Calculator: Estimate solar savings, costs, payback period, CO2 reduction
- /invest - Investment Page: Browse and invest in community solar projects
- /analysis - Impact Dashboard: View real-time monitoring of solar installations (requires login)
- /articles - Knowledge Center: Educational articles about solar energy, finance, and sustainability
- /chat - AI Chat Assistant (current conversation)
- /login - User authentication page
- /profile - User profile and settings (requires login)

When users ask questions related to specific platform features, suggest the appropriate page and encourage them to explore. Be helpful, concise, and factual. For technical questions, recommend consulting certified solar professionals.

**CONTENT SCOPE:**
Only answer questions directly related to:
- Solar energy (system sizing, panels, inverters, batteries, costs, payback)
- Energy savings and tariff calculations
- West Java (Jawa Barat) solar policies and regulations
- Community solar investments
- Platform features and navigation

If users ask about unrelated topics (movies, sports, unrelated finance, gossip, etc.), politely refuse and redirect to solar/West Java topics.`;

        // Prepend the system message so the model is guided by it
        const messagesWithSystem = [
            { role: "system", content: systemPrompt },
            ...messages
        ];

        // Generate completion with a lower temperature to reduce creative off-topic answers
        const completion = await groq.chat.completions.create({
            model: "moonshotai/kimi-k2-instruct",
            messages: messagesWithSystem,
            temperature: 0.2,
            max_tokens: 800
        });

        const assistantMsg = completion.choices[0].message;
        const assistantText = (assistantMsg?.content || "").toString();

        // Simple allowlist-based post-check to detect clearly off-topic responses.
        // If the model's reply doesn't contain known solar/West Java keywords, refuse.
        const allowKeywords = [
            "solar",
            "panel",
            "pv",
            "photovoltaic",
            "payback",
            "kwh",
            "kw",
            "inverter",
            "battery",
            "storage",
            "west java",
            "jawa barat",
            "policy",
            "regulation",
            "subsidy",
            "installation",
            "tariff",
            "energy",
            "savings",
            "invest",
            "investment",
            "capacity",
            "efficiency",
            "irradiance",
            "insolation",
            "system sizing",
            "cost",
            "payback period"
        ];

        const textLower = assistantText.toLowerCase();
        const containsAllow = allowKeywords.some(k => textLower.includes(k));

        if (!containsAllow) {
            // Return a polite refusal instead of the off-topic assistant text
            return res.json({
                assistant: {
                    role: "assistant",
                    content: "I can only answer questions about solar energy systems, investments, and West Java (Jawa Barat) policy. Please ask a question related to those topics."
                }
            });
        }

        // If it looks on-topic, forward the assistant message
        res.json({ assistant: assistantMsg });

    } catch (err) {
        console.error("❌ Groq Error:", err.message);
        res.status(500).json({
            error: "AI Generation Failed",
            message: err.message
        });
    }
});

// =====================
// START SERVER
// =====================
app.listen(PORT, () => {
    console.log(`🚀 Server is listening on Port ${PORT}`);
});