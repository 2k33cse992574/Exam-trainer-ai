import type { Express, Request, Response } from "express";
import OpenAI from "openai";
import { chatStorage } from "./storage";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export function registerChatRoutes(app: Express): void {
  // Get all conversations
  app.get("/api/conversations", async (req: Request, res: Response) => {
    try {
      const conversations = await chatStorage.getAllConversations();
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  // Get single conversation with messages
  app.get("/api/conversations/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const conversation = await chatStorage.getConversation(id);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      const messages = await chatStorage.getMessagesByConversation(id);
      res.json({ ...conversation, messages });
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ error: "Failed to fetch conversation" });
    }
  });

  // Create new conversation
  app.post("/api/conversations", async (req: Request, res: Response) => {
    try {
      const { title, exam, target, mode, initialQuery } = req.body;
      const conversation = await chatStorage.createConversation(title || "New Chat");
      
      // If structured context provided, create system prompt with context
      if (exam && target && mode) {
        const contextSystemPrompt = `You are Exam Preparation Accelerator — a structured academic system built for Indian competitive exams.

STUDENT CONTEXT:
- Exam: ${exam}
- Target: ${target}
- Study Mode: ${mode}

SUPPORTED EXAMS (CURRENT PHASE):
- JEE (Main / Foundation)
- NEET
- SSC (CGL / CHSL – basics)
- AKTU (B.Tech semester exams)
- GATE (foundation-level guidance)
- CAT (quantitative basics)

You are NOT a general AI chatbot.
You are a guided exam-preparation system used by serious students and coaching institutes.

Your primary goals are:
- reduce random studying
- provide exam-relevant guidance
- help students plan and execute preparation logically
- solve doubts clearly and correctly within syllabus limits

--------------------------------------------------
STUDY MODES (MANDATORY BEHAVIOR)
--------------------------------------------------

### MODE 1: FOLLOW ROADMAP

When the selected mode is "Follow Roadmap":

- Act like a senior academic mentor.
- Assume the student wants the most logical and effective preparation plan.
- Use exam type and time remaining to:
  • prioritize subjects and chapters
  • balance concepts, practice, revision, and tests
  • design a realistic daily / weekly structure
- Present plans in phase-wise or week-wise format.
- Keep recommendations practical and sustainable.
- Do NOT guarantee ranks, marks, or results.

--------------------------------------------------

### MODE 2: MAKE ROADMAP

When the selected mode is "Make Roadmap":

- Help the student refine their own study plan.
- Ask at most 2–3 necessary clarifying questions (hours/day, weak subjects, etc.).
- Identify logical issues such as:
  • no revision slots
  • weak subjects ignored
  • unrealistic scheduling
- Suggest improvements clearly and respectfully.
- Do not force a fixed roadmap.

--------------------------------------------------

### MODE 3: RANDOM SEARCH

When the selected mode is "Random Search":

- Behave as an exam-aware doubt solver.
- Answer strictly according to the selected exam level.
- Follow NCERT-aligned logic for JEE, NEET, and school-level questions.
- For SSC, AKTU, GATE, and CAT: keep explanations concise and exam-focused.
- Do not introduce roadmap discussion unless explicitly asked.

--------------------------------------------------
ANSWER QUALITY RULES (GLOBAL)
--------------------------------------------------

1. Use exam-appropriate terminology and depth.
2. Structure answers as:
   - Concept
   - Reasoning (cause → effect → logic)
   - Formula / Working (if required)
   - Clear conclusion
3. Never hallucinate facts.
4. If a question is outside the selected exam syllabus:
   - Clearly state that it is beyond scope.
5. Avoid motivational speeches and casual language.
6. Maintain a calm, teacher-like, authoritative tone.

--------------------------------------------------
MATH & EQUATION DISPLAY RULE (CRITICAL)
--------------------------------------------------

All equations must be written in clean, student-readable plain text.

DO NOT use LaTeX commands or code-style math.

Use textbook-style formatting:

Correct:
- d²x / dt² = −4x
- d²x / dt² = −ω²x
- ω² = 4 ⇒ ω = 2 rad/s
- T = 2π / ω = π s

Incorrect:
- \ddot{x}
- \frac{2\pi}{\omega}
- {\omega}

Your output must be readable without any math rendering engine.

--------------------------------------------------
EXAM-ORIENTED ADDITIONS (WHEN RELEVANT)
--------------------------------------------------

At the end of an answer, you may add:
• One-line exam answer
• Common exam mistake (one short line)

Keep these concise and factual.

--------------------------------------------------
TONE & POSITIONING
--------------------------------------------------

- Structured
- Exam-focused
- Classroom-ready
- Systematic, not conversational

Avoid phrases such as:
- "If you want…"
- "Let me know…"
- "As an AI…"

--------------------------------------------------
SUCCESS CRITERIA
--------------------------------------------------

Your responses should feel like:
- a guided exam preparation system
- driven by logic, not randomness
- clearly different from a normal AI chatbot
- suitable for institutional use and paid pilots`;

        await chatStorage.createMessage(conversation.id, "system", contextSystemPrompt);
        
        // Add initial onboarding message
        const onboardingMessage = `Welcome to Exam Preparation Accelerator.

Your context:
- Exam: ${exam}
- Target: ${target}
- Mode: ${mode}

${mode === "Follow Roadmap" ? "I will now generate a complete, mentor-designed preparation plan for your exam and timeline." : 
  mode === "Make Roadmap" ? "Share your current preparation plan and I will help refine it logically." :
  "Ask any exam-specific doubt or concept question. I will provide structured, accurate answers."}`;

        await chatStorage.createMessage(conversation.id, "assistant", onboardingMessage);

        // If initial query provided, send it for processing
        if (initialQuery && initialQuery.trim()) {
          // Save user's initial query
          await chatStorage.createMessage(conversation.id, "user", initialQuery);

          // Get conversation history for context
          const messages = await chatStorage.getMessagesByConversation(conversation.id);
          const chatMessages = messages.map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          }));

          // Stream response from OpenAI
          const stream = await openai.chat.completions.create({
            model: "gpt-5.1",
            messages: chatMessages,
            stream: true,
            max_completion_tokens: 2048,
          });

          let fullResponse = "";
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              fullResponse += content;
            }
          }

          // Save assistant response
          if (fullResponse) {
            await chatStorage.createMessage(conversation.id, "assistant", fullResponse);
          }
        }
      }
      
      res.status(201).json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  // Delete conversation
  app.delete("/api/conversations/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await chatStorage.deleteConversation(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting conversation:", error);
      res.status(500).json({ error: "Failed to delete conversation" });
    }
  });

  // Send message and get AI response (streaming)
  app.post("/api/conversations/:id/messages", async (req: Request, res: Response) => {
    try {
      const conversationId = parseInt(req.params.id);
      const { content } = req.body;

      // Save user message
      await chatStorage.createMessage(conversationId, "user", content);

      // Get conversation history for context
      const messages = await chatStorage.getMessagesByConversation(conversationId);
      const chatMessages = messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

      // Set up SSE
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      // Stream response from OpenAI
      const stream = await openai.chat.completions.create({
        model: "gpt-5.1",
        messages: chatMessages,
        stream: true,
        max_completion_tokens: 2048,
      });

      let fullResponse = "";

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          fullResponse += content;
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      // Save assistant message
      await chatStorage.createMessage(conversationId, "assistant", fullResponse);

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error) {
      console.error("Error sending message:", error);
      // Check if headers already sent (SSE streaming started)
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: "Failed to send message" })}\n\n`);
        res.end();
      } else {
        res.status(500).json({ error: "Failed to send message" });
      }
    }
  });
}

