import { motion } from "framer-motion";
import { Camera, Edit2 } from "lucide-react";
import profile2 from "@/assets/profile-2.jpg";

const ProfilePage = () => {
  const user = {
    name: "Arjun Kumar",
    branch: "Petroleum Eng.",
    year: "2nd Year",
    bio: "Gym enthusiast 💪 | Guitarist | Looking for someone to share chai with",
    interests: ["Fitness", "Music", "Movies", "Food"],
    likes: "Late night conversations, live music, chai",
    dislikes: "Ghosting, monotone lectures",
    image: profile2,
  };

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card overflow-hidden">
        {/* Cover */}
        <div className="h-40 bg-gradient-to-r from-neon-pink/20 via-neon-purple/20 to-neon-blue/20 relative">
          <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-muted/80 flex items-center justify-center">
            <Camera className="w-4 h-4 text-foreground" />
          </button>
        </div>

        {/* Avatar */}
        <div className="px-6 -mt-16 relative">
          <div className="relative inline-block">
            <img src={user.image} alt={user.name} className="w-28 h-28 rounded-2xl object-cover border-4 border-card" />
            <button className="absolute bottom-1 right-1 w-8 h-8 rounded-full gradient-bg flex items-center justify-center">
              <Camera className="w-4 h-4 text-primary-foreground" />
            </button>
          </div>
        </div>

        <div className="p-6 pt-4 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold">{user.name}</h1>
              <p className="text-muted-foreground text-sm">{user.branch} • {user.year}</p>
            </div>
            <button className="flex items-center gap-1.5 text-sm text-primary hover:underline">
              <Edit2 className="w-4 h-4" /> Edit
            </button>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Bio</h3>
            <p className="text-foreground">{user.bio}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {user.interests.map((t) => <span key={t} className="tag-chip active">{t}</span>)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Likes</h3>
              <p className="text-sm text-foreground">{user.likes}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Dislikes</h3>
              <p className="text-sm text-foreground">{user.dislikes}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
