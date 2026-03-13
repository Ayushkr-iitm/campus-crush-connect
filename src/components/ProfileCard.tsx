import { Heart, X, Star } from "lucide-react";
import { motion } from "framer-motion";

interface ProfileCardProps {
  name: string;
  branch: string;
  year: string;
  bio: string;
  interests: string[];
  image: string;
  onPass?: () => void;
  onCrush?: () => void;
  onSuperCrush?: () => void;
  compact?: boolean;
}

const ProfileCard = ({ name, branch, year, bio, interests, image, onPass, onCrush, onSuperCrush, compact }: ProfileCardProps) => {
  if (compact) {
    return (
      <div className="glass-card-hover overflow-hidden">
        <div className="h-48 overflow-hidden">
          <img src={image} alt={name} className="w-full h-full object-cover" />
        </div>
        <div className="p-4">
          <h3 className="font-display font-semibold text-foreground">{name}</h3>
          <p className="text-sm text-muted-foreground">{branch} • {year}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {interests.slice(0, 3).map((tag) => (
              <span key={tag} className="tag-chip text-xs">{tag}</span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="glass-card overflow-hidden max-w-sm mx-auto w-full"
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="relative h-80 overflow-hidden">
        <img src={image} alt={name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-2xl font-display font-bold text-foreground">{name}</h3>
          <p className="text-sm text-muted-foreground">{branch} • {year}</p>
        </div>
      </div>

      <div className="p-5">
        <p className="text-sm text-foreground/80 mb-3">{bio}</p>
        <div className="flex flex-wrap gap-2 mb-5">
          {interests.map((tag) => (
            <span key={tag} className="tag-chip">{tag}</span>
          ))}
        </div>

        <div className="flex items-center justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={onPass}
            className="w-14 h-14 rounded-full bg-muted flex items-center justify-center border border-border/50 hover:border-destructive/50 transition-colors"
          >
            <X className="w-6 h-6 text-muted-foreground" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={onSuperCrush}
            className="w-12 h-12 rounded-full bg-neon-blue/20 flex items-center justify-center border border-neon-blue/30 hover:border-neon-blue/60 transition-colors"
          >
            <Star className="w-5 h-5 text-neon-blue" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={onCrush}
            className="w-14 h-14 rounded-full gradient-bg flex items-center justify-center neon-glow"
          >
            <Heart className="w-6 h-6 text-primary-foreground" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileCard;
