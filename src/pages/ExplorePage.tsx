import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProfileCard from "@/components/ProfileCard";
import profile1 from "@/assets/profile-1.jpg";
import profile2 from "@/assets/profile-2.jpg";
import profile3 from "@/assets/profile-3.jpg";
import profile4 from "@/assets/profile-4.jpg";

const profiles = [
  { id: 1, name: "Priya Sharma", branch: "Computer Science", year: "3rd Year", bio: "Coffee addict ☕ | Love coding late at night and stargazing 🌟", interests: ["Coding", "Music", "Photography", "Travel"], image: profile1 },
  { id: 2, name: "Arjun Kumar", branch: "Petroleum Eng.", year: "2nd Year", bio: "Gym enthusiast 💪 | Guitarist | Looking for someone to share chai with", interests: ["Fitness", "Music", "Movies", "Food"], image: profile2 },
  { id: 3, name: "Neha Mishra", branch: "Chemical Eng.", year: "4th Year", bio: "Bookworm 📚 | Dance like nobody's watching 💃 | Sunset chaser", interests: ["Reading", "Dance", "Art", "Travel"], image: profile3 },
  { id: 4, name: "Rahul Verma", branch: "Mechanical Eng.", year: "1st Year", bio: "New on campus! Football fanatic ⚽ | Anime lover | Always up for adventure", interests: ["Sports", "Gaming", "Movies", "Food"], image: profile4 },
];

const ExplorePage = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const handleAction = (dir: number) => {
    setDirection(dir);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % profiles.length);
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

      <div className="w-full max-w-sm relative">
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
      </div>
    </div>
  );
};

export default ExplorePage;
