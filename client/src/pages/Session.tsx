import { useEffect, useRef, useState } from "react";
import { useRoute } from "wouter";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useConversation, useChatStream } from "@/hooks/use-academic";
import { Loader2, SendHorizontal, AlertCircle, StopCircle } from "lucide-react";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import NotFound from "./not-found";

export default function Session() {
  const [, params] = useRoute("/session/:id");
  const id = params ? parseInt(params.id) : null;
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: conversation, isLoading, error } = useConversation(id);
  const { sendMessage, isStreaming } = useChatStream(id || 0);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [conversation?.messages, isStreaming]);

  // Initial greeting trigger if empty
  useEffect(() => {
    if (conversation && conversation.messages.length === 0 && !isStreaming) {
      sendMessage(`I want to study ${conversation.title}. Please start the session according to NCERT standards.`);
    }
  }, [conversation?.id, conversation?.messages.length]); 

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isStreaming) return;
    sendMessage(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  if (error || !conversation) {
    return <NotFound />;
  }

  return (
    <Layout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <header className="px-6 py-4 border-b border-border bg-card/50 backdrop-blur flex items-center justify-between">
          <div>
            <h2 className="font-mono font-bold text-lg">{conversation.title}</h2>
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              SESSION ACTIVE
            </div>
          </div>
          <Button variant="outline" size="sm" className="font-mono text-xs uppercase" disabled>
            Strict Mode
          </Button>
        </header>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4 md:p-8" ref={scrollRef}>
          <div className="max-w-4xl mx-auto space-y-8 pb-8">
            {conversation.messages.map((msg, idx) => (
              <div
                key={msg.id || idx}
                className={cn(
                  "flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300",
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                {/* Avatar */}
                <div
                  className={cn(
                    "w-8 h-8 rounded flex items-center justify-center shrink-0 border text-xs font-bold font-mono shadow-sm",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border text-foreground"
                  )}
                >
                  {msg.role === "user" ? "ME" : "AI"}
                </div>

                {/* Content */}
                <div
                  className={cn(
                    "relative max-w-[85%] rounded-lg px-5 py-4 shadow-sm border",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground border-primary/50"
                      : "bg-card text-card-foreground border-border"
                  )}
                >
                  {msg.role === "user" ? (
                    <div className="whitespace-pre-wrap font-sans">{msg.content}</div>
                  ) : (
                    <MarkdownRenderer content={msg.content} />
                  )}
                  
                  <span className="text-[10px] opacity-40 font-mono absolute bottom-1 right-2">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            
            {isStreaming && (
              <div className="flex gap-4">
                 <div className="w-8 h-8 rounded flex items-center justify-center shrink-0 border bg-background border-border text-foreground text-xs font-bold font-mono">
                   AI
                 </div>
                 <div className="flex items-center gap-1.5 h-10 px-4">
                   <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                   <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                   <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
                 </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 md:p-6 border-t border-border bg-background/95 backdrop-blur z-20">
          <div className="max-w-4xl mx-auto relative flex gap-2">
             <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your answer or question here..."
              className="min-h-[60px] max-h-[200px] resize-none pr-20 py-4 px-4 bg-secondary/30 border-border focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-lg font-mono text-sm shadow-inner"
              disabled={isStreaming}
             />
             <div className="absolute right-2 bottom-2 flex gap-2">
               <Button 
                onClick={handleSubmit} 
                disabled={!input.trim() || isStreaming}
                size="icon"
                className="h-10 w-10 rounded-md shadow-md"
              >
                {isStreaming ? (
                  <StopCircle className="h-5 w-5" />
                ) : (
                  <SendHorizontal className="h-5 w-5" />
                )}
              </Button>
             </div>
          </div>
          <div className="text-center mt-2">
            <p className="text-[10px] text-muted-foreground font-mono">
              Press Enter to send • Shift + Enter for new line • Markdown supported
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
