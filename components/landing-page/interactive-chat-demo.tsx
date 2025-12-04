"use client";

import { useReducer, useMemo, useCallback } from "react";
import Link from "next/link";
import { ArrowUp, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { MarkdownRenderer } from "@/components/markdown-renderer";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  notes?: Array<{
    id: string;
    category: string;
    label: string;
    content: string;
    similarity: number;
  }>;
}

interface SampleNote {
  title: string;
  content: string;
  date: string;
}

interface ChatState {
  input: string;
  messages: ChatMessage[];
  isTyping: boolean;
}

type ChatAction =
  | { type: "SET_INPUT"; payload: string }
  | { type: "ADD_USER_MESSAGE"; payload: string }
  | { type: "SET_TYPING"; payload: boolean }
  | {
      type: "ADD_ASSISTANT_MESSAGE";
      payload: { response: string; notes: ChatMessage["notes"] };
    }
  | { type: "RESET_INPUT" }
  | { type: "RESET_CHAT" };

const SAMPLE_NOTES: SampleNote[] = [
  {
    title: "Productivity Systems",
    content:
      "Getting Things Done (GTD) method helps organize tasks by capturing everything in a trusted system. The key is regular review and breaking down projects into actionable next steps.",
    date: "2 days ago",
  },
  {
    title: "Learning Strategies",
    content:
      "Spaced repetition and active recall are the most effective learning techniques. Combining them with interleaving different topics creates stronger neural pathways.",
    date: "5 days ago",
  },
  {
    title: "Time Management",
    content:
      "Time blocking works best when you schedule both work and breaks. The Pomodoro technique (25 min work, 5 min break) helps maintain focus throughout the day.",
    date: "1 week ago",
  },
];

const SUGGESTED_QUESTIONS = [
  "What did I write about productivity?",
  "Tell me about learning strategies",
  "What are my recent notes about?",
];

const RESPONSE_DELAY = 1500;

interface ResponseConfig {
  keywords: string[];
  noteIndex: number;
  response: string;
  category: string;
  similarity: number;
}

const RESPONSE_CONFIGS: ResponseConfig[] = [
  {
    keywords: ["productivity", "gtd", "task"],
    noteIndex: 0,
    response: `Based on your notes, you've written about **productivity systems**:\n\n- **Getting Things Done (GTD) method** - from your note "Productivity Systems" (2 days ago)\n- The method focuses on capturing everything in a trusted system and breaking projects into actionable steps.`,
    category: "Productivity",
    similarity: 0.92,
  },
  {
    keywords: ["learning", "study", "knowledge"],
    noteIndex: 1,
    response: `From your notes on **learning**:\n\n- **Spaced repetition and active recall** - from "Learning Strategies" (5 days ago)\n- These techniques create stronger neural pathways when combined with interleaving different topics.`,
    category: "Learning",
    similarity: 0.88,
  },
  {
    keywords: ["time", "schedule", "pomodoro"],
    noteIndex: 2,
    response: `You've written about **time management**:\n\n- **Time blocking** and **Pomodoro technique** - from "Time Management" (1 week ago)\n- Time blocking works best when scheduling both work and breaks. The Pomodoro technique uses 25-minute work sessions with 5-minute breaks.`,
    category: "Productivity",
    similarity: 0.85,
  },
];

const DEFAULT_RESPONSE = {
  response: `I found relevant information in your notes:\n\n- Your notes cover productivity systems, learning strategies, and time management techniques.\n- Would you like me to dive deeper into any specific topic?`,
  notes: [] as ChatMessage["notes"],
};

function generateResponse(query: string): {
  response: string;
  notes: ChatMessage["notes"];
} {
  const queryLower = query.toLowerCase();
  const queryWords = new Set(queryLower.split(/\s+/));

  for (const config of RESPONSE_CONFIGS) {
    const hasMatch = config.keywords.some(
      (keyword) => queryWords.has(keyword) || queryLower.includes(keyword)
    );

    if (hasMatch) {
      const note = SAMPLE_NOTES[config.noteIndex];
      return {
        response: config.response,
        notes: [
          {
            id: String(config.noteIndex + 1),
            category: config.category,
            label: note.title,
            content: note.content,
            similarity: config.similarity,
          },
        ],
      };
    }
  }

  return DEFAULT_RESPONSE;
}

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "SET_INPUT":
      return { ...state, input: action.payload };
    case "RESET_INPUT":
      return { ...state, input: "" };
    case "RESET_CHAT":
      return initialState;
    case "ADD_USER_MESSAGE":
      return {
        ...state,
        messages: [
          ...state.messages,
          { role: "user", content: action.payload },
        ],
        input: "",
      };
    case "SET_TYPING":
      return { ...state, isTyping: action.payload };
    case "ADD_ASSISTANT_MESSAGE":
      return {
        ...state,
        messages: [
          ...state.messages,
          {
            role: "assistant",
            content: action.payload.response,
            notes: action.payload.notes,
          },
        ],
        isTyping: false,
      };
    default:
      return state;
  }
}

const initialState: ChatState = {
  input: "",
  messages: [],
  isTyping: false,
};

export function InteractiveChatDemo() {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  const handleSubmit = useCallback(
    async (message: string) => {
      const trimmedMessage = message.trim();
      if (!trimmedMessage || state.isTyping || state.messages.length >= 4)
        return;

      dispatch({ type: "ADD_USER_MESSAGE", payload: trimmedMessage });
      dispatch({ type: "SET_TYPING", payload: true });

      await new Promise((resolve) => setTimeout(resolve, RESPONSE_DELAY));

      const { response, notes } = generateResponse(trimmedMessage);
      dispatch({ type: "ADD_ASSISTANT_MESSAGE", payload: { response, notes } });
    },
    [state.isTyping, state.messages.length]
  );

  const handleFormSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      handleSubmit(state.input);
    },
    [state.input, handleSubmit]
  );

  const handleResetChat = useCallback(() => {
    dispatch({ type: "RESET_CHAT" });
  }, []);

  const hasMessages = useMemo(
    () => state.messages.length > 0,
    [state.messages.length]
  );

  const isChatLimitReached = useMemo(
    () => state.messages.length >= 4,
    [state.messages.length]
  );

  return (
    <div className="w-full max-w-[960px] lg:w-[960px] px-2 sm:px-4 md:px-6 lg:px-11 flex flex-col justify-center items-center gap-2 relative z-5 mb-0 lg:pb-0">
      <div className="w-full max-w-[960px] lg:w-[960px] min-h-[200px] sm:min-h-[280px] md:min-h-[450px] lg:min-h-[500px] bg-card border border-border shadow-sm overflow-hidden rounded-lg sm:rounded-xl lg:rounded-2xl flex flex-col justify-start items-start">
        <div className="self-stretch flex-1 flex justify-start items-start p-6 sm:p-8 md:p-10 lg:p-12">
          <div className="w-full flex flex-col gap-5 sm:gap-6 md:gap-8 h-full">
            <div className="flex flex-col gap-2">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-xl sm:text-2xl font-lora font-semibold tracking-tight text-foreground">
                    Talk with your notes
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground font-sans leading-relaxed mt-1">
                    Ask questions about your notes and get instant answers
                  </p>
                </div>
                {hasMessages && (
                  <button
                    onClick={handleResetChat}
                    disabled={state.isTyping}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/50 bg-background hover:bg-muted/50 hover:border-border transition-all text-xs text-foreground font-sans disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                    title="New chat"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">New chat</span>
                  </button>
                )}
              </div>
            </div>

            <SampleNotesGrid />

            <div className="flex-1 flex flex-col min-h-[200px] border-t border-border/50 pt-6">
              <div className="flex-1 overflow-y-auto -mx-6 sm:-mx-8 md:-mx-10 lg:-mx-12 px-6 sm:px-8 md:px-10 lg:px-12">
                {!hasMessages ? (
                  <EmptyState onQuestionClick={handleSubmit} />
                ) : (
                  <div className="space-y-6">
                    {state.messages.map((msg, i) => (
                      <ChatMessage key={i} message={msg} />
                    ))}
                    {state.isTyping && <TypingIndicator />}
                  </div>
                )}
              </div>
              {isChatLimitReached ? (
                <ChatCTA />
              ) : (
                <ChatInput
                  value={state.input}
                  onChange={(value) =>
                    dispatch({ type: "SET_INPUT", payload: value })
                  }
                  onSubmit={handleFormSubmit}
                  disabled={state.isTyping}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SampleNotesGrid() {
  return (
    <div className="flex flex-col gap-3">
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide font-sans">
        Your Notes
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {SAMPLE_NOTES.map((note, i) => (
          <div
            key={i}
            className="p-4 border border-border rounded-md bg-background hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="font-medium text-sm text-foreground font-sans">
                {note.title}
              </div>
              <div className="text-xs text-muted-foreground font-sans shrink-0">
                {note.date}
              </div>
            </div>
            <div className="text-xs text-muted-foreground line-clamp-2 leading-relaxed font-sans">
              {note.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState({
  onQuestionClick,
}: {
  onQuestionClick: (question: string) => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3">
      <div className="text-xs text-muted-foreground text-center font-sans">
        Try asking:
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {SUGGESTED_QUESTIONS.map((question, i) => (
          <button
            key={i}
            onClick={() => onQuestionClick(question)}
            className="px-3 py-1.5 rounded-full border border-border/50 bg-background hover:bg-muted/50 hover:border-border transition-all text-xs text-foreground font-sans"
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
}

function ChatMessage({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className="group">
      <div className={cn("flex items-start gap-3", isUser && "justify-end")}>
        {!isUser && (
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground text-background text-xs font-medium mt-1">
            A
          </div>
        )}
        <div
          className={cn(
            "flex-1 space-y-2",
            isUser && "flex flex-col items-end"
          )}
        >
          <div
            className={cn(
              "inline-block rounded-lg px-4 py-2.5 max-w-[85%]",
              isUser ? "bg-foreground text-background" : "bg-muted/50"
            )}
          >
            {isUser ? (
              <div className="text-sm leading-relaxed whitespace-pre-line font-sans">
                {message.content}
              </div>
            ) : (
              <MarkdownRenderer content={message.content} compact />
            )}
          </div>
          {!isUser && message.notes && message.notes.length > 0 && (
            <div className="space-y-2">
              {message.notes.map((note) => (
                <div
                  key={note.id}
                  className="rounded-lg border bg-card/50 p-3 text-card-foreground shadow-sm hover:bg-card transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-foreground/80 px-2 py-0.5 rounded-md bg-muted/50">
                        {note.category}
                      </span>
                      {note.label && (
                        <span className="text-xs text-muted-foreground font-medium">
                          {note.label}
                        </span>
                      )}
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium shrink-0">
                      {(note.similarity * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="text-sm text-foreground/90 leading-relaxed">
                    <MarkdownRenderer content={note.content} compact />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {isUser && (
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground text-background text-xs font-medium mt-1">
            U
          </div>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="group">
      <div className="flex items-start gap-3">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground text-background text-xs font-medium mt-1">
          A
        </div>
        <div className="flex-1 space-y-1">
          <div className="inline-block rounded-lg px-4 py-2.5 max-w-[85%] bg-muted/50">
            <div className="flex items-center gap-1">
              {[0, 150, 300].map((delay) => (
                <div
                  key={delay}
                  className="w-2 h-2 bg-foreground/60 rounded-full animate-bounce"
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatInput({
  value,
  onChange,
  onSubmit,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  disabled: boolean;
}) {
  return (
    <div className="border-t border-border/50 pt-4 mt-4">
      <form onSubmit={onSubmit}>
        <div className="relative flex items-center">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            placeholder="Ask about your notes..."
            className="w-full rounded-full border bg-background px-4 py-2.5 pr-11 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={disabled || !value.trim()}
            className={cn(
              "absolute right-1.5 flex h-7 w-7 items-center justify-center rounded-full transition-all",
              value.trim() && !disabled
                ? "bg-foreground text-background hover:bg-foreground/90"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

function ChatCTA() {
  return (
    <div className="border-t border-border/50 pt-6 mt-4">
      <div className="flex flex-col items-center justify-center gap-3">
        <p className="text-sm text-muted-foreground text-center font-sans">
          Want to continue the conversation? Start using Recoil for free.
        </p>
        <Link
          href="/signup"
          className="h-10 px-6 rounded-full bg-[#F0EFEA] border border-[rgba(55,50,47,0.12)] text-[#37322F] hover:bg-[#E8E6E0] hover:border-[rgba(55,50,47,0.18)] shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center text-sm font-medium font-sans"
        >
          Start for free
        </Link>
      </div>
    </div>
  );
}
