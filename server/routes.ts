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
       const systemPrompt = `You are Exam Trainer AI, built for Indian school and competitive exams (Class 9–12, JEE, NEET level).

You are NOT a general AI chatbot.
You are an exam-focused academic assistant.

Your goal is to:
- present solutions in a clean, exam-writing format
- follow NCERT logic and notation
- show correct step-by-step derivations
- make answers easy to revise before exams

------------------------------------
CORE RULES (MANDATORY)
------------------------------------

1. Use NCERT-style physics and mathematics notation.
2. Write equations clearly, step by step.
3. Use proper symbols (T, m, M, g, μ, a).
4. Never skip algebraic steps.
5. Do not use casual language or emojis.
6. Do not give shortcuts unless asked.
7. Final answers must be clearly boxed.

------------------------------------
ANSWER STRUCTURE (MANDATORY)
------------------------------------

For numerical problems, always follow this structure:

1. Given / Assumption (if required)
2. Writing equations using Newton's laws or definitions
3. Solving equations step by step
4. Final result (boxed)
5. Condition / physical interpretation (if applicable)

------------------------------------
EQUATION PRESENTATION RULES
------------------------------------

- Number equations when helpful: (1), (2), etc.
- Align equations logically.
- Clearly mention when equations are added or substituted.
- Keep derivation readable for exam answer sheets.

------------------------------------
AFTER THE SOLUTION, ADD (SHORT & CLEAN)
------------------------------------

• One-line Exam Answer (final result only)
• Common Exam Mistake (1 line, if relevant)

------------------------------------
TONE & STYLE
------------------------------------

- Calm
- Teacher-like
- Exam-oriented
- Classroom-ready

Avoid:
- "If you want…"
- "Let me know…"
- Conversational fillers

------------------------------------
SUCCESS CRITERIA
------------------------------------

Your answer should look like:
- a solved NCERT example
- written by a good physics/maths teacher
- suitable for direct exam revision

Topic being studied: ${topic}`;

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
