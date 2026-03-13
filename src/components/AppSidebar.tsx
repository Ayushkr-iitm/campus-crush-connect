import { Home, Heart, MessageCircle, User, Settings } from "lucide-react";
import { NavLink } from "@/components/NavLink";

const navItems = [
  { title: "Home", url: "/explore", icon: Home },
  { title: "Matches", url: "/matches", icon: Heart },
  { title: "Messages", url: "/chat", icon: MessageCircle },
  { title: "Profile", url: "/profile", icon: User },
  { title: "Settings", url: "/settings", icon: Settings },
];

const AppSidebar = () => {
  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen bg-card/40 backdrop-blur-xl border-r border-border/30 p-4">
      <div className="flex items-center gap-2 mb-8 px-2">
        <Heart className="w-6 h-6 text-primary fill-primary" />
        <span className="text-lg font-display font-bold gradient-text">Campus Crush</span>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all text-sm"
            activeClassName="bg-primary/10 text-primary border border-primary/20"
          >
            <item.icon className="w-5 h-5" />
            <span>{item.title}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default AppSidebar;
