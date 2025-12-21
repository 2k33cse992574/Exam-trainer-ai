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
      const { title, exam, target, zone, initialQuery } = req.body;
      const conversation = await chatStorage.createConversation(title || "New Chat");
      
      // Create context-aware system prompt
      if (exam && target) {
        const systemPrompt = `You are an exam-preparation assistant for Indian competitive exams and academic studies.

CORE INSTRUCTIONS:
- Answer only according to ${exam} exam level and scope.
- Use plain-text formatting for all equations (no LaTeX).
- Be concise, authoritative, and classroom-ready.
- Avoid conversational phrases; be direct and academic.

RESPONSE STRUCTURE:
1. Concept / Explanation
2. Reasoning (cause → effect → logic)
3. Formula / Working (if required)
4. Clear conclusion

For equations, use textbook style like:
- d²x / dt² = −4x
- ω² = 4 ⇒ ω = 2 rad/s
- T = 2π / ω = π s

EXAM-SPECIFIC BEHAVIOR:
${exam === "AKTU" ? "- For AKTU, structure answers by semester context when relevant.\n- If semester is not mentioned, ask once and remember it for the session." : "- Follow NCERT-aligned logic for ${exam} concepts."}

ZONE-BASED BEHAVIOR:
${
  zone === "roadmap"
    ? `- You are in ROADMAP GENERATION mode.
- Create a complete, mentor-designed preparation plan.
- Use exam type and target (${target}) to prioritize subjects, balance concepts/practice/revision.
- Present in phase-wise or week-wise format.
- Make it practical and sustainable.
- Do NOT guarantee ranks or results.`
    : zone === "optimize"
    ? `- You are in PLAN OPTIMIZATION mode.
- Help refine the student's existing study plan.
- Ask at most 2-3 clarifying questions if needed.
- Identify logical issues (missing revision, weak subjects ignored, unrealistic scheduling).
- Suggest improvements respectfully.`
    : `- You are in DOUBT-SOLVING mode (default).
- Answer exam-specific questions directly.
- Solve concepts and numerical problems.
- Do NOT introduce roadmaps unless explicitly asked.`
}`;

        await chatStorage.createMessage(conversation.id, "system", systemPrompt);
        
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

