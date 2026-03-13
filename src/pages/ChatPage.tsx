import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Smile, Search } from "lucide-react";
import ChatBubble from "@/components/ChatBubble";
import profile1 from "@/assets/profile-1.jpg";
import profile3 from "@/assets/profile-3.jpg";

const conversations = [
  {
    id: 1,
    name: "Priya Sharma",
    image: profile1,
    lastMessage: "That sounds fun! 😊",
    time: "2m ago",
    online: true,
    messages: [
      { message: "Hey! We matched! 🎉", time: "10:30 AM", isSent: false },
      { message: "Hi Priya! Yeah, I noticed we have similar interests!", time: "10:31 AM", isSent: true },
      { message: "Right? I love coding too! What are you working on?", time: "10:32 AM", isSent: false },
      { message: "Building a campus dating app actually 😄", time: "10:33 AM", isSent: true },
      { message: "That sounds fun! 😊", time: "10:34 AM", isSent: false },
    ],
  },
  {
    id: 2,
    name: "Neha Mishra",
    image: profile3,
    lastMessage: "See you at the library!",
    time: "1h ago",
    online: false,
    messages: [
      { message: "Hey Neha! Nice to match with you 😊", time: "9:00 AM", isSent: true },
      { message: "Hi! Your profile is so cool! 💖", time: "9:05 AM", isSent: false },
      { message: "Thanks! Want to grab coffee sometime?", time: "9:06 AM", isSent: true },
      { message: "See you at the library!", time: "9:10 AM", isSent: false },
    ],
  },
];

const ChatPage = () => {
  const [activeConv, setActiveConv] = useState(conversations[0]);
  const [newMessage, setNewMessage] = useState("");
  const [showList, setShowList] = useState(true);

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
              onClick={() => { setActiveConv(conv); setShowList(false); }}
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
          <div className="relative">
            <img src={activeConv.image} alt={activeConv.name} className="w-10 h-10 rounded-full object-cover border border-border/30" />
            {activeConv.online && (
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-card" />
            )}
          </div>
          <div>
            <p className="font-display font-semibold text-sm">{activeConv.name}</p>
            <p className="text-xs text-muted-foreground">{activeConv.online ? "Online" : "Offline"}</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {activeConv.messages.map((msg, i) => (
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
              placeholder="Type a message..."
              className="input-glow flex-1 py-2.5 text-sm"
            />
            <motion.button
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
