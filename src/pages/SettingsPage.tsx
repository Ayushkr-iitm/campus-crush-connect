import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Lock, Trash2, Shield, UserX, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

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
  const { toast } = useToast();
  const [active, setActive] = useState<null | "changePassword" | "blockedUsers" | "deleteAccount">(null);
  const [blocked, setBlocked] = useState<any[]>([]);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (active !== "blockedUsers") return;
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.blockedUsers();
        setBlocked(res.blockedUsers || []);
      } catch (err: any) {
        toast({ variant: "destructive", title: "Failed to load blocked users", description: err.message ?? "Try again." });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [active, toast]);

  const onClickItem = async (label: string) => {
    if (label === "Change Password") setActive("changePassword");
    else if (label === "Blocked Users") setActive("blockedUsers");
    else if (label === "Delete Account") setActive("deleteAccount");
    else toast({ title: "Not implemented yet", description: "This setting screen is UI-only for now." });
  };

  const handleChangePassword = async () => {
    try {
      setLoading(true);
      await api.changePassword(currentPassword, newPassword);
      toast({ title: "Password updated" });
      setCurrentPassword("");
      setNewPassword("");
      setActive(null);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Password change failed", description: err.message ?? "Try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      await api.deleteAccount();
      localStorage.removeItem("token");
      toast({ title: "Account deleted" });
      window.location.href = "/";
    } catch (err: any) {
      toast({ variant: "destructive", title: "Delete failed", description: err.message ?? "Try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (userId: string) => {
    try {
      setLoading(true);
      await api.unblockUser(userId);
      setBlocked((prev) => prev.filter((u) => (u._id || u.id) !== userId));
    } catch (err: any) {
      toast({ variant: "destructive", title: "Unblock failed", description: err.message ?? "Try again." });
    } finally {
      setLoading(false);
    }
  };

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
        {active === "changePassword" && (
          <div className="glass-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold">Change Password</h3>
              <button className="text-sm text-muted-foreground hover:text-foreground" onClick={() => setActive(null)}>Close</button>
            </div>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current password"
              className="input-glow w-full"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className="input-glow w-full"
            />
            <button disabled={loading} onClick={handleChangePassword} className="btn-gradient w-full py-3 text-sm">
              {loading ? "Updating..." : "Update Password"}
            </button>
          </div>
        )}

        {active === "blockedUsers" && (
          <div className="glass-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold">Blocked Users</h3>
              <button className="text-sm text-muted-foreground hover:text-foreground" onClick={() => setActive(null)}>Close</button>
            </div>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : blocked.length === 0 ? (
              <p className="text-sm text-muted-foreground">No blocked users.</p>
            ) : (
              <div className="space-y-2">
                {blocked.map((u) => (
                  <div key={u._id} className="flex items-center justify-between bg-muted/30 rounded-xl p-3 border border-border/40">
                    <div className="flex items-center gap-3">
                      <img src={u.profilePhoto || ""} alt={u.name} className="w-10 h-10 rounded-xl object-cover bg-muted" />
                      <div>
                        <p className="text-sm font-medium">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.branch} • {u.year}</p>
                      </div>
                    </div>
                    <button disabled={loading} onClick={() => handleUnblock(u._id)} className="text-xs text-primary hover:underline">
                      Unblock
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {active === "deleteAccount" && (
          <div className="glass-card p-5 space-y-4 border border-destructive/30">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-destructive">Delete Account</h3>
              <button className="text-sm text-muted-foreground hover:text-foreground" onClick={() => setActive(null)}>Close</button>
            </div>
            <p className="text-sm text-muted-foreground">
              This will permanently delete your account.
            </p>
            <button disabled={loading} onClick={handleDeleteAccount} className="w-full py-3 text-sm rounded-xl bg-destructive text-destructive-foreground">
              {loading ? "Deleting..." : "Confirm Delete"}
            </button>
          </div>
        )}

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
                  onClick={() => onClickItem(item.label)}
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
