import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

// Types based on the schema and routes provided
interface Conversation {
  id: number;
  title: string;
  createdAt: string;
}

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

interface ConversationWithMessages extends Conversation {
  messages: Message[];
}

export function useConversations() {
  return useQuery({
    queryKey: ["/api/conversations"],
    queryFn: async () => {
      const res = await fetch("/api/conversations");
      if (!res.ok) throw new Error("Failed to fetch sessions");
      return (await res.json()) as Conversation[];
    },
  });
}

export function useConversation(id: number | null) {
  return useQuery({
    queryKey: ["/api/conversations", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await fetch(`/api/conversations/${id}`);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch session");
      return (await res.json()) as ConversationWithMessages;
    },
    enabled: !!id,
  });
}

interface SessionContextPayload {
  exam: string;
  target: string;
  zone: string;
  query?: string;
}

export function useStartSession() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (payload: SessionContextPayload) => {
      // Create a conversation via the standard chat endpoint
      // Send structured context to the backend
      const title = `${payload.exam} - ${payload.target}`;
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          exam: payload.exam,
          target: payload.target,
          zone: payload.zone,
          initialQuery: payload.query || null,
        }),
      });
      
      if (!res.ok) throw new Error("Failed to start session");
      return (await res.json()) as Conversation;
    },
    onSuccess: (newConversation) => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      toast({
        title: "Session Initialized",
        description: `Preparation plan: ${newConversation.title}`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Could not start academic session",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteSession() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/conversations/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete session");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      toast({
        title: "Deleted",
        description: "Session history removed",
      });
    },
  });
}

// Custom hook for streaming chat messages
export function useChatStream(conversationId: number) {
  const queryClient = useQueryClient();
  const [isStreaming, setIsStreaming] = useState(false);
  const { toast } = useToast();

  const sendMessage = useCallback(async (content: string) => {
    setIsStreaming(true);

    // Optimistic update
    const optimisticMessageId = Date.now();
    queryClient.setQueryData<ConversationWithMessages>(
      ["/api/conversations", conversationId],
      (old) => {
        if (!old) return old;
        return {
          ...old,
          messages: [
            ...old.messages,
            {
              id: optimisticMessageId,
              role: "user",
              content,
              createdAt: new Date().toISOString(),
            },
            {
              id: optimisticMessageId + 1,
              role: "assistant",
              content: "", // Placeholder for stream
              createdAt: new Date().toISOString(),
            },
          ],
        };
      }
    );

    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) throw new Error("Failed to send message");

      // Read the stream
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      if (!reader) throw new Error("No reader available");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6);
            if (!dataStr || dataStr === "[DONE]") continue;

            try {
              const data = JSON.parse(dataStr);
              if (data.content) {
                assistantMessage += data.content;
                
                // Update the assistant message in real-time
                queryClient.setQueryData<ConversationWithMessages>(
                  ["/api/conversations", conversationId],
                  (old) => {
                    if (!old) return old;
                    const newMessages = [...old.messages];
                    const lastMsg = newMessages[newMessages.length - 1];
                    if (lastMsg.role === "assistant") {
                      lastMsg.content = assistantMessage;
                    }
                    return { ...old, messages: newMessages };
                  }
                );
              }
              if (data.error) throw new Error(data.error);
            } catch (e) {
              console.error("Error parsing stream chunk", e);
            }
          }
        }
      }
    } catch (err) {
      console.error("Streaming error", err);
      toast({
        title: "Communication Error",
        description: "Lost connection to the academic trainer.",
        variant: "destructive",
      });
    } finally {
      setIsStreaming(false);
      // Invalidate to ensure we have the persisted state
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", conversationId] });
    }
  }, [conversationId, queryClient, toast]);

  return { sendMessage, isStreaming };
}
