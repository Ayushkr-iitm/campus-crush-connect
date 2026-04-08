import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import MatchCard from "@/components/MatchCard";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

const MatchesPage = () => {
  const { toast } = useToast();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.matches();
        setMatches(
          res.matches.map((m: any) => ({
            id: m.id,
            name: m.user.name,
            image: m.user.profilePhoto || "",
            matchedAt: new Date(m.matchedAt).toLocaleString()
          }))
        );
      } catch (err: any) {
        toast({
          variant: "destructive",
          title: "Could not load matches",
          description: err.message ?? "Something went wrong."
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [toast]);
  return (
    <div className="min-h-screen p-6">
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-display font-bold mb-8"
      >
        Your <span className="gradient-text">Matches</span> 💘
      </motion.h2>

      {loading ? (
        <div className="glass-card p-12 text-center">
          <p className="text-muted-foreground">Loading matches...</p>
        </div>
      ) : matches.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((m, i) => (
            <motion.div
              key={m.id ?? m.name}
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
