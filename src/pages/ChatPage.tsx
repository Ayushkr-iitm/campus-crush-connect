import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Send, Smile, Search } from "lucide-react";
import ChatBubble from "@/components/ChatBubble";
import { api, getAuthToken } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { useLocation } from "react-router-dom";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

const ChatPage = () => {
  const { toast } = useToast();
  const location = useLocation();
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<any | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [showList, setShowList] = useState(true);
  const [typingUserIds, setTypingUserIds] = useState<string[]>([]);
  const [meId, setMeId] = useState<string>("");

  const socket: Socket | null = useMemo(() => {
    const token = getAuthToken();
    if (!token) return null;
    const s = io(SOCKET_URL, {
      auth: { token }
    });
    return s;
  }, []);

  useEffect(() => {
    const loadMatches = async () => {
      try {
        const me = await api.me();
        setMeId(me.user?.id || "");

        const res = await api.matches();
        const convs = res.matches.map((m: any) => ({
          id: m.id,
          name: m.user.name,
          image: m.user.profilePhoto || "",
          online: false,
          lastMessage: "",
          time: "",
          messages: []
        }));
        setConversations(convs);

        const params = new URLSearchParams(location.search);
        const initialMatchId = params.get("matchId");
        const initial = convs.find((c: any) => c.id === initialMatchId) || convs[0] || null;
        setActiveConv(initial || null);
      } catch (err: any) {
        toast({
          variant: "destructive",
          title: "Could not load chats",
          description: err.message ?? "Something went wrong."
        });
      }
    };
    loadMatches();
  }, [location.search, toast]);

  useEffect(() => {
    if (!socket) return;

    if (activeConv?.id) {
      socket.emit("join_match", activeConv.id);
    }

    socket.on("new_message", (payload: any) => {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === payload.matchId
            ? {
                ...c,
                messages: [
                  ...c.messages,
                  {
                    message: payload.message,
                    isSent: String(payload.senderId) === String(meId),
                    time: new Date(payload.timestamp).toLocaleTimeString()
                  }
                ],
                lastMessage: payload.message,
                time: new Date(payload.timestamp).toLocaleTimeString()
              }
            : c
        )
      );
    });

    socket.on("typing", ({ matchId, userId, isTyping }) => {
      if (!activeConv || matchId !== activeConv.id) return;
      setTypingUserIds((prev) => {
        if (isTyping) {
          if (prev.includes(userId)) return prev;
          return [...prev, userId];
        }
        return prev.filter((id) => id !== userId);
      });
    });

    return () => {
      socket.off("new_message");
      socket.off("typing");
    };
  }, [socket, activeConv]);

  useEffect(() => {
    if (!activeConv?.id) return;
    const loadMessages = async () => {
      try {
        const res = await api.messagesForMatch(activeConv.id);
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConv.id
              ? {
                  ...c,
                  messages: res.messages.map((m: any) => ({
                    message: m.message,
                    isSent: String(m.senderId) === String(meId),
                    time: new Date(m.timestamp).toLocaleTimeString()
                  }))
                }
              : c
          )
        );
      } catch (err: any) {
        toast({
          variant: "destructive",
          title: "Could not load messages",
          description: err.message ?? "Something went wrong."
        });
      }
    };
    loadMessages();
  }, [activeConv, toast, meId]);

  const handleSend = () => {
    if (!socket || !activeConv || !newMessage.trim()) return;
    const msg = newMessage.trim();
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConv.id
          ? {
              ...c,
              messages: [
                ...c.messages,
                {
                  message: msg,
                  isSent: true,
                  time: new Date().toLocaleTimeString()
                }
              ],
              lastMessage: msg,
              time: new Date().toLocaleTimeString()
            }
          : c
      )
    );
    socket.emit("send_message", { matchId: activeConv.id, message: msg });
    setNewMessage("");
  };

  const isTyping = typingUserIds.length > 0;

  return (
    <div className="h-screen flex">
      {/* Conversations list */}
      <div className={`${showList ? "flex" : "hidden"} md:flex flex-col w-full md:w-80 border-r border-border/30 bg-card/20`}>
        <div className="p-4 border-b border-border/30">
          <h2 className="font-display font-bold text-lg mb-3">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input placeholder="Search conversations..." className="input-glow w-full pl-10 text-sm py-2" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => {
                setActiveConv(conv);
                setShowList(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors ${
                activeConv.id === conv.id ? "bg-primary/5 border-l-2 border-primary" : ""
              }`}
            >
              <div className="relative shrink-0">
                <img src={conv.image} alt={conv.name} className="w-12 h-12 rounded-full object-cover border border-border/30" />
                {conv.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card bg-emerald-500" />
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="font-medium text-foreground text-sm truncate">{conv.name}</p>
                <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0">{conv.time}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className={`${!showList ? "flex" : "hidden"} md:flex flex-col flex-1`}>
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/30 bg-card/20">
          <button onClick={() => setShowList(true)} className="md:hidden text-muted-foreground mr-1">←</button>
          {activeConv && (
            <>
              <div className="relative">
                <img src={activeConv.image} alt={activeConv.name} className="w-10 h-10 rounded-full object-cover border border-border/30" />
                {activeConv.online && (
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-card bg-emerald-500" />
                )}
              </div>
              <div>
                <p className="font-display font-semibold text-sm">{activeConv.name}</p>
                <p className="text-xs text-muted-foreground">
                  {isTyping ? "Typing..." : activeConv.online ? "Online" : "Offline"}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {activeConv &&
            activeConv.messages.map((msg: any, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <ChatBubble {...msg} />
              </motion.div>
            ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border/30">
          <div className="flex items-center gap-2">
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <Smile className="w-5 h-5" />
            </button>
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onFocus={() => socket?.emit("typing", { matchId: activeConv?.id, isTyping: true })}
              onBlur={() => socket?.emit("typing", { matchId: activeConv?.id, isTyping: false })}
              placeholder="Type a message..."
              className="input-glow flex-1 py-2.5 text-sm"
            />
            <motion.button
              type="button"
              onClick={handleSend}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center"
            >
              <Send className="w-4 h-4 text-primary-foreground" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
