import { motion } from "framer-motion";
import { Lock, Trash2, Shield, UserX, ChevronRight } from "lucide-react";

const settingsSections = [
  {
    title: "Account",
    items: [
      { icon: Lock, label: "Change Password", desc: "Update your password" },
      { icon: Trash2, label: "Delete Account", desc: "Permanently delete your account", danger: true },
    ],
  },
  {
    title: "Privacy",
    items: [
      { icon: Shield, label: "Privacy Settings", desc: "Control who can see your profile" },
      { icon: UserX, label: "Blocked Users", desc: "Manage your block list" },
    ],
  },
];

const SettingsPage = () => {
  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto">
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-display font-bold mb-8"
      >
        Settings
      </motion.h2>

      <div className="space-y-8">
        {settingsSections.map((section, si) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: si * 0.1 }}
          >
            <h3 className="text-sm font-medium text-muted-foreground mb-3 px-1">{section.title}</h3>
            <div className="glass-card divide-y divide-border/30">
              {section.items.map((item) => (
                <button
                  key={item.label}
                  className="w-full flex items-center gap-4 p-4 hover:bg-muted/20 transition-colors text-left"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.danger ? "bg-destructive/10" : "bg-muted/50"}`}>
                    <item.icon className={`w-5 h-5 ${item.danger ? "text-destructive" : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium text-sm ${item.danger ? "text-destructive" : "text-foreground"}`}>{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SettingsPage;
