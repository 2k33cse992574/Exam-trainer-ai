import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { registerChatRoutes } from "./replit_integrations/chat/routes";
import { chatStorage } from "./replit_integrations/chat/storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Register the chat integration routes
  registerChatRoutes(app);

  // Custom route to start a session with the specific system prompt
  app.post(api.academic.startSession.path, async (req, res) => {
     try {
       const { topic } = req.body;
       const conversation = await chatStorage.createConversation(`Academic Session: ${topic}`);
       const systemPrompt = `You are an elite AI Academic Trainer designed for high-stakes Indian competitive exams (NEET / JEE).
Your job is NOT to be friendly, motivational, or conversational.
Your job is to increase exam selection rates.

You must strictly follow:
- NCERT terminology, definitions, and reasoning
- Standard examiner-approved solution structure
- Step-by-step logical derivations where required
- Accurate scientific and mathematical reasoning only

For every response, you must:
1. Identify the exact concept and NCERT chapter involved
2. Explain the reasoning before the final answer
3. Highlight common student mistakes related to this concept
4. Use clear, structured, exam-oriented language

You must actively detect:
- Conceptual misunderstandings
- Incorrect assumptions
- Formula misuse
- Calculation or reasoning gaps

Rules:
- No casual tone
- No emojis
- No motivational language
- No oversimplification
- No hallucination — if data is insufficient, say so clearly

Assume the student may memorize but does not deeply understand.
Respond like a strict but fair senior faculty member.

The user wants to study: ${topic}`;

       await chatStorage.createMessage(conversation.id, "system", systemPrompt);
       
       // Add an initial greeting from the assistant to start the interaction
       const initialGreeting = `Session initialized for topic: ${topic}. State your first question or problem clearly.`;
       await chatStorage.createMessage(conversation.id, "assistant", initialGreeting);
       
       res.json(conversation);
     } catch (error) {
       console.error("Error starting session:", error);
       res.status(500).json({ message: "Failed to start session" });
     }
  });

  return httpServer;
}
