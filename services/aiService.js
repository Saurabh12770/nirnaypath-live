const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.AI_API_KEY || "DUMMY_KEY");

const SYSTEM_PROMPT = `You are "Nirnay Help Center", a highly knowledgeable AI Tutor for the NirnayPath platform.
Your goal is to help Indian students preparing for competitive exams like UPSC, BPSC, SSC, Banking, and Railways.

Guidelines:
1. Be professional, encouraging, and accurate.
2. Provide bilingual responses (English and Hindi) when explaining complex concepts if the user seems to prefer it or asks for it.
3. You can answer questions about exam syllabus, specific subjects (History, Polity, Geography, Maths, Science), and general study tips.
4. If asked about platform help, explain how to take mock tests, check leaderboards, or upgrade to Pro for unlimited tests.
5. Keep responses concise but comprehensive. Use bullet points for readability.
6. If you don't know something for sure, admit it and suggest the user consult official notifications.

Context: You are talking to a student on the NirnayPath platform.`;

const askAI = async (userMessage, history = []) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const chat = model.startChat({
            history: history.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }],
            })),
            generationConfig: {
                maxOutputTokens: 1000,
            },
        });

        // Prepend system prompt to the first message if history is empty
        const prompt = history.length === 0 
            ? `${SYSTEM_PROMPT}\n\nUser: ${userMessage}`
            : userMessage;

        const result = await chat.sendMessage(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("AI Service Error:", error);
        if (!process.env.AI_API_KEY || error.message.includes("API_KEY_INVALID")) {
            return "I’m currently learning. Please ask me general questions about exams, and I’ll do my best!";
        }
        throw new Error("Failed to get response from AI tutor.");
    }
};

module.exports = { askAI };
