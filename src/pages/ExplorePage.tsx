import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProfileCard from "@/components/ProfileCard";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

const ExplorePage = () => {
  const { toast } = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [genderFilter, setGenderFilter] = useState<"all" | "male" | "female" | "other">("all");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.discover(genderFilter === "all" ? undefined : genderFilter);
        setProfiles(
          res.users.map((u: any) => ({
            id: u._id || u.id,
            name: u.name,
            branch: u.branch,
            year: u.year,
            bio: u.bio,
            interests: u.interests || [],
            image: u.profilePhoto || "/placeholder.svg"
          }))
        );
        setCurrentIndex(0);
      } catch (err: any) {
        toast({
          variant: "destructive",
          title: "Could not load students",
          description: err.message ?? "Something went wrong."
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [toast, genderFilter]);

  const handleAction = async (dir: number) => {
    if (!profiles.length) return;
    const current = profiles[currentIndex];

    if (dir === 1) {
      try {
        const res = await api.sendCrush(current.id);
        if (res.matched) {
          toast({
            title: "It's a match!",
            description: `You matched with ${current.name}. Go to Matches to start chatting.`
          });
        }
      } catch (err: any) {
        toast({
          variant: "destructive",
          title: "Could not send crush",
          description: err.message ?? "Please try again."
        });
      }
    }

    setDirection(dir);
    setTimeout(() => {
      setCurrentIndex((prev) => {
        const next = prev + 1;
        if (next >= profiles.length) return 0;
        return next;
      });
    }, 200);
  };

  const current = profiles[currentIndex];

  return (
    <div className="min-h-screen p-6 flex flex-col items-center justify-center">
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-2xl font-display font-bold mb-8 text-center"
      >
        Discover <span className="gradient-text">Students</span>
      </motion.h2>

      <div className="w-full max-w-sm mb-4">
        <label className="text-xs text-muted-foreground block mb-1">Show</label>
        <select
          value={genderFilter}
          onChange={(e) => setGenderFilter(e.target.value as any)}
          className="input-glow w-full py-2 text-sm"
        >
          <option value="all">All</option>
          <option value="female">Females</option>
          <option value="male">Males</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="w-full max-w-sm relative">
        {loading ? (
          <div className="glass-card p-8 text-center text-muted-foreground">Loading students...</div>
        ) : profiles.length === 0 ? (
          <div className="glass-card p-8 text-center text-muted-foreground">No more students to discover right now.</div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, x: direction * 100, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: direction * -100, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <ProfileCard
                {...current}
                onPass={() => handleAction(-1)}
                onCrush={() => handleAction(1)}
                onSuperCrush={() => handleAction(1)}
              />
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;
