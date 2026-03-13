import { motion } from "framer-motion";
import MatchCard from "@/components/MatchCard";
import profile1 from "@/assets/profile-1.jpg";
import profile3 from "@/assets/profile-3.jpg";

const matches = [
  { name: "Priya Sharma", image: profile1, matchedAt: "2 hours ago" },
  { name: "Neha Mishra", image: profile3, matchedAt: "1 day ago" },
];

const MatchesPage = () => {
  return (
    <div className="min-h-screen p-6">
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-display font-bold mb-8"
      >
        Your <span className="gradient-text">Matches</span> 💘
      </motion.h2>

      {matches.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((m, i) => (
            <motion.div
              key={m.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <MatchCard {...m} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <p className="text-muted-foreground">No matches yet. Keep crushing! 💖</p>
        </div>
      )}
    </div>
  );
};

export default MatchesPage;
