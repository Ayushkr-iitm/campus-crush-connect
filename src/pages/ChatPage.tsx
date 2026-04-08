import { useEffect, useMemo, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Send, Smile, Search, MoreVertical, Flag, UserX } from "lucide-react";
import ChatBubble from "@/components/ChatBubble";
import { api, getAuthToken } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { useLocation } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

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
  const [socket, setSocket] = useState<Socket | null>(null);
  const [listQuery, setListQuery] = useState("");
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");

  const meIdRef = useRef("");
  const activeConvIdRef = useRef<string | null>(null);

  useEffect(() => {
    meIdRef.current = meId;
  }, [meId]);

  useEffect(() => {
    activeConvIdRef.current = activeConv?.id ?? null;
  }, [activeConv?.id]);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;
    const s = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"]
    });
    setSocket(s);
    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, []);

  useEffect(() => {
    const loadMatches = async () => {
      try {
        const me = await api.me();
        const uid = String(me.user?.id ?? "");
        setMeId(uid);

        const res = await api.matches();
        const convs = res.matches.map((m: any) => ({
          id: m.id,
          otherUserId: String(m.user?.id ?? ""),
          name: m.user.name,
          image: m.user.profilePhoto || "/placeholder.svg",
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
    if (!socket || !activeConv?.id) return;
    socket.emit("join_match", activeConv.id);
  }, [socket, activeConv?.id]);

  useEffect(() => {
    if (!socket) return;

    const onNewMessage = (payload: any) => {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === payload.matchId
            ? {
                ...c,
                messages: [
                  ...c.messages,
                  {
                    message: payload.message,
                    isSent: String(payload.senderId) === String(meIdRef.current),
                    time: new Date(payload.timestamp).toLocaleTimeString()
                  }
                ],
                lastMessage: payload.message,
                time: new Date(payload.timestamp).toLocaleTimeString()
              }
            : c
        )
      );
    };

    const onTyping = (data: { matchId?: string; userId: string; isTyping: boolean }) => {
      const { matchId, userId, isTyping } = data;
      const ac = activeConvIdRef.current;
      if (!matchId || !ac || matchId !== ac) return;
      setTypingUserIds((prev) => {
        if (isTyping) {
          if (prev.includes(userId)) return prev;
          return [...prev, userId];
        }
        return prev.filter((id) => id !== userId);
      });
    };

    socket.on("new_message", onNewMessage);
    socket.on("typing", onTyping);

    return () => {
      socket.off("new_message", onNewMessage);
      socket.off("typing", onTyping);
    };
  }, [socket]);

  useEffect(() => {
    if (!activeConv?.id || !meId) return;
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
  }, [activeConv?.id, meId, toast]);

  const filteredConversations = useMemo(() => {
    const q = listQuery.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => c.name.toLowerCase().includes(q));
  }, [conversations, listQuery]);

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

  const handleBlock = async () => {
    if (!activeConv?.otherUserId) return;
    try {
      await api.blockUser(activeConv.otherUserId);
      toast({ title: "User blocked" });
      setConversations((prev) => prev.filter((c) => c.id !== activeConv.id));
      setActiveConv(null);
      setShowList(true);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Block failed", description: err.message ?? "Try again." });
    }
  };

  const handleSubmitReport = async () => {
    if (!activeConv?.otherUserId) return;
    const reason = reportReason.trim();
    if (reason.length < 5) {
      toast({ variant: "destructive", title: "Add a bit more detail", description: "Reason must be at least 5 characters." });
      return;
    }
    try {
      await api.reportUser(activeConv.otherUserId, reason);
      toast({ title: "Report submitted", description: "Thanks — our team will review it." });
      setReportOpen(false);
      setReportReason("");
    } catch (err: any) {
      toast({ variant: "destructive", title: "Report failed", description: err.message ?? "Try again." });
    }
  };

  const isTyping = typingUserIds.length > 0;

  return (
    <div className="h-screen flex">
      <div className={`${showList ? "flex" : "hidden"} md:flex flex-col w-full md:w-80 border-r border-border/30 bg-card/20`}>
        <div className="p-4 border-b border-border/30">
          <h2 className="font-display font-bold text-lg mb-3">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={listQuery}
              onChange={(e) => setListQuery(e.target.value)}
              placeholder="Search conversations..."
              className="input-glow w-full pl-10 text-sm py-2"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => {
                setActiveConv(conv);
                setShowList(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors ${
                activeConv?.id === conv.id ? "bg-primary/5 border-l-2 border-primary" : ""
              }`}
            >
              <div className="relative shrink-0">
                <img
                  src={conv.image}
                  alt={conv.name}
                  className="w-12 h-12 rounded-full object-cover border border-border/30 bg-muted"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
                {conv.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card bg-emerald-500" />
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="font-medium text-foreground text-sm truncate">{conv.name}</p>
                <p className="text-xs text-muted-foreground truncate">{conv.lastMessage || "Say hi…"}</p>
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0">{conv.time}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={`${!showList ? "flex" : "hidden"} md:flex flex-col flex-1`}>
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/30 bg-card/20">
          <button type="button" onClick={() => setShowList(true)} className="md:hidden text-muted-foreground mr-1">
            ←
          </button>
          {activeConv ? (
            <>
              <div className="relative">
                <img
                  src={activeConv.image}
                  alt={activeConv.name}
                  className="w-10 h-10 rounded-full object-cover border border-border/30 bg-muted"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
                {activeConv.online && (
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-card bg-emerald-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-semibold text-sm truncate">{activeConv.name}</p>
                <p className="text-xs text-muted-foreground">{isTyping ? "Typing…" : "Chat"}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="p-2 rounded-lg text-muted-foreground hover:bg-muted/40"
                    aria-label="Chat actions"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setReportOpen(true)}>
                    <Flag className="w-4 h-4 mr-2" />
                    Report user
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => void handleBlock()}>
                    <UserX className="w-4 h-4 mr-2" />
                    Block user
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Select a conversation</p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {activeConv ? (
            activeConv.messages.map((msg: any, i: number) => (
              <motion.div
                key={`${msg.time}-${i}-${msg.message.slice(0, 12)}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.4) }}
              >
                <ChatBubble {...msg} />
              </motion.div>
            ))
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No conversation selected.</div>
          )}
        </div>

        <div className="p-4 border-t border-border/30">
          <div className="flex items-center gap-2">
            <button type="button" className="text-muted-foreground hover:text-foreground transition-colors p-1" title="Emoji">
              <Smile className="w-5 h-5" />
            </button>
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onFocus={() => socket?.emit("typing", { matchId: activeConv?.id, isTyping: true })}
              onBlur={() => socket?.emit("typing", { matchId: activeConv?.id, isTyping: false })}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={!activeConv}
              placeholder={activeConv ? "Type a message…" : "Select a chat first"}
              className="input-glow flex-1 py-2.5 text-sm"
            />
            <motion.button
              type="button"
              onClick={handleSend}
              disabled={!activeConv}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center disabled:opacity-50"
            >
              <Send className="w-4 h-4 text-primary-foreground" />
            </motion.button>
          </div>
        </div>
      </div>

      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report {activeConv?.name ?? "user"}</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Describe what happened (min 5 characters)…"
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            rows={4}
            className="resize-none"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void handleSubmitReport()}>Submit report</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatPage;
