import { Heart } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

const Navbar = () => {
  const location = useLocation();
  const isLanding = location.pathname === "/";

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/60 border-b border-border/30"
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <Heart className="w-6 h-6 text-primary fill-primary group-hover:scale-110 transition-transform" />
          <span className="text-xl font-display font-bold gradient-text">Campus Crush</span>
        </Link>

        <div className="flex items-center gap-4">
          {isLanding ? (
            <>
              <Link to="/login" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
                Login
              </Link>
              <Link to="/login" className="btn-gradient text-sm px-5 py-2">
                Get Started
              </Link>
            </>
          ) : (
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
              Back to Home
            </Link>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
