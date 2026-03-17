import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface MatchCardProps {
  id?: string;
  name: string;
  image: string;
  matchedAt: string;
}

const MatchCard = ({ id, name, image, matchedAt }: MatchCardProps) => {
  return (
    <motion.div
      className="glass-card-hover overflow-hidden"
      whileHover={{ y: -4 }}
    >
      <div className="h-48 overflow-hidden relative">
        <img src={image} alt={name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent" />
      </div>
      <div className="p-4">
        <h3 className="font-display font-semibold text-foreground">{name}</h3>
        <p className="text-xs text-muted-foreground mb-3">Matched {matchedAt}</p>
        <Link
          to={id ? `/chat?matchId=${id}` : "/chat"}
          className="btn-gradient w-full flex items-center justify-center gap-2 text-sm py-2"
        >
          <MessageCircle className="w-4 h-4" />
          Start Chat
        </Link>
      </div>
    </motion.div>
  );
};

export default MatchCard;
