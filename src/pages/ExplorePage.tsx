import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import ProfileCard from "@/components/ProfileCard";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

const SWIPE_THRESHOLD_PX = 90;

const ExplorePage = () => {
  const { toast } = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [genderFilter, setGenderFilter] = useState<"all" | "male" | "female" | "other">("all");
  const actingRef = useRef(false);

  const loadDiscover = useCallback(async () => {
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
  }, [genderFilter, toast]);

  useEffect(() => {
    loadDiscover();
  }, [loadDiscover]);

  const handleAction = async (dir: number) => {
    if (actingRef.current || !profiles.length) return;
    const current = profiles[currentIndex];
    if (!current) return;

    actingRef.current = true;
    try {
      if (dir === -1) {
        try {
          await api.skipUser(current.id);
        } catch (err: any) {
          toast({
            variant: "destructive",
            title: "Could not pass",
            description: err.message ?? "Please try again."
          });
          return;
        }
      }

      if (dir === 1) {
        try {
          const res = await api.sendCrush(current.id);
          if (res.matched) {
            toast({
              title: "It's a match!",
              description: `You matched with ${current.name}. Open Chat to say hi.`
            });
          }
        } catch (err: any) {
          toast({
            variant: "destructive",
            title: "Could not send crush",
            description: err.message ?? "Please try again."
          });
          return;
        }
      }

      setDirection(dir);
      setTimeout(() => {
        setCurrentIndex((prev) => {
          const next = prev + 1;
          if (next >= profiles.length) {
            void loadDiscover();
            return 0;
          }
          return next;
        });
      }, 200);
    } finally {
      setTimeout(() => {
        actingRef.current = false;
      }, 320);
    }
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const { offset, velocity } = info;
    const vx = velocity.x;
    if (offset.x > SWIPE_THRESHOLD_PX || vx > 500) {
      void handleAction(1);
    } else if (offset.x < -SWIPE_THRESHOLD_PX || vx < -500) {
      void handleAction(-1);
    }
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

      <p className="text-xs text-muted-foreground mb-2 max-w-sm text-center">
        Swipe left to pass, right to crush — or use the buttons below.
      </p>

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

      <div className="w-full max-w-sm relative touch-pan-y">
        {loading ? (
          <div className="glass-card p-8 text-center text-muted-foreground">Loading students...</div>
        ) : profiles.length === 0 ? (
          <div className="glass-card p-8 text-center text-muted-foreground">No more students to discover right now.</div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.85}
              onDragEnd={onDragEnd}
              initial={{ opacity: 0, x: direction * 100, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: direction * -100, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="cursor-grab active:cursor-grabbing"
            >
              <ProfileCard
                {...current}
                onPass={() => void handleAction(-1)}
                onCrush={() => void handleAction(1)}
                onSuperCrush={() => void handleAction(1)}
              />
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;
