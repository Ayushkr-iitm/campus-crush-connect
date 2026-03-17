import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Camera, Edit2 } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

const BRANCHES = ["Petroleum Eng.", "Chemical Eng.", "Computer Science", "CSD", "IT", "IDD", "Mathematics and Computing", "Mechanical Eng.", "Electrical Eng."];
const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
const SUGGESTED_INTERESTS = ["Music", "Sports", "Coding", "Photography", "Travel", "Food", "Movies", "Reading", "Gaming", "Art", "Dance", "Fitness"];

const ProfilePage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);
  const [savingPhoto, setSavingPhoto] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const profileInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  const [editName, setEditName] = useState("");
  const [editBranch, setEditBranch] = useState("");
  const [editYear, setEditYear] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editInterests, setEditInterests] = useState<string[]>([]);
  const [editLikes, setEditLikes] = useState("");
  const [editDislikes, setEditDislikes] = useState("");

  const toBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });

  const toggleInterest = (tag: string) => {
    setEditInterests((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const canEdit = useMemo(() => !loading && !!user, [loading, user]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.me();
        setUser(res.user);
        setEditName(res.user?.name || "");
        setEditBranch(res.user?.branch || "");
        setEditYear(res.user?.year || "");
        setEditBio(res.user?.bio || "");
        setEditInterests(res.user?.interests || []);
        setEditLikes(res.user?.likes || "");
        setEditDislikes(res.user?.dislikes || "");
      } catch (err: any) {
        toast({
          variant: "destructive",
          title: "Could not load profile",
          description: err.message ?? "Please login again."
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [toast]);

  const onSaveProfile = async () => {
    try {
      setSavingProfile(true);
      const res = await api.updateProfile({
        name: editName,
        branch: editBranch,
        year: editYear,
        bio: editBio,
        interests: editInterests,
        likes: editLikes,
        dislikes: editDislikes
      });
      setUser(res.user);
      setIsEditing(false);
      toast({ title: "Profile updated" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Update failed", description: err.message ?? "Try again." });
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card overflow-hidden">
        {/* Cover */}
        <div className="h-40 relative overflow-hidden">
          {user?.coverPhoto ? (
            <img src={user.coverPhoto} alt="Cover" className="w-full h-full object-cover opacity-90" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-neon-pink/20 via-neon-purple/20 to-neon-blue/20" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/40" />

          <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            try {
              setSavingPhoto(true);
              const dataUrl = await toBase64(file);
              const res = await api.updateProfile({ coverPhoto: dataUrl });
              setUser(res.user);
              toast({ title: "Cover photo updated" });
            } catch (err: any) {
              toast({ variant: "destructive", title: "Cover update failed", description: err.message ?? "Try again." });
            } finally {
              setSavingPhoto(false);
            }
          }} />

          <button
            type="button"
            disabled={savingPhoto}
            onClick={() => coverInputRef.current?.click()}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-muted/80 flex items-center justify-center"
            title="Change cover photo"
          >
            <Camera className="w-4 h-4 text-foreground" />
          </button>
        </div>

        {/* Avatar */}
        <div className="px-6 -mt-16 relative">
          <div className="relative inline-block">
            <img
              src={user?.profilePhoto || ""}
              alt={user?.name || "Profile"}
              className="w-28 h-28 rounded-2xl object-cover border-4 border-card bg-muted"
            />

            <input ref={profileInputRef} type="file" accept="image/*" className="hidden" onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                setSavingPhoto(true);
                const dataUrl = await toBase64(file);
                const res = await api.updateProfile({ profilePhoto: dataUrl });
                setUser(res.user);
                toast({ title: "Profile photo updated" });
              } catch (err: any) {
                toast({ variant: "destructive", title: "Profile photo update failed", description: err.message ?? "Try again." });
              } finally {
                setSavingPhoto(false);
              }
            }} />

            <button
              type="button"
              disabled={savingPhoto}
              onClick={() => profileInputRef.current?.click()}
              className="absolute bottom-1 right-1 w-8 h-8 rounded-full gradient-bg flex items-center justify-center"
              title="Change profile photo"
            >
              <Camera className="w-4 h-4 text-primary-foreground" />
            </button>
          </div>
        </div>

        <div className="p-6 pt-4 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold">{loading ? "Loading..." : user?.name}</h1>
              <p className="text-muted-foreground text-sm">{user?.branch} • {user?.year}</p>
            </div>
            <button
              disabled={!canEdit}
              onClick={() => setIsEditing((v) => !v)}
              className="flex items-center gap-1.5 text-sm text-primary hover:underline disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Edit2 className="w-4 h-4" /> {isEditing ? "Close" : "Edit"}
            </button>
          </div>

          {isEditing && (
            <div className="glass-card p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Name</label>
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} className="input-glow w-full" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Branch</label>
                  <select value={editBranch} onChange={(e) => setEditBranch(e.target.value)} className="input-glow w-full">
                    <option value="">Select branch</option>
                    {BRANCHES.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Year</label>
                  <select value={editYear} onChange={(e) => setEditYear(e.target.value)} className="input-glow w-full">
                    <option value="">Select year</option>
                    {YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Likes</label>
                  <input value={editLikes} onChange={(e) => setEditLikes(e.target.value)} className="input-glow w-full" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Dislikes</label>
                <input value={editDislikes} onChange={(e) => setEditDislikes(e.target.value)} className="input-glow w-full" />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Bio</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="input-glow w-full h-24 resize-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Interests</label>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_INTERESTS.map((tag) => (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => toggleInterest(tag)}
                      className={`tag-chip ${editInterests.includes(tag) ? "active" : ""}`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <button disabled={savingProfile} onClick={onSaveProfile} className="btn-gradient w-full py-3 text-sm">
                {savingProfile ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Bio</h3>
            <p className="text-foreground">{user?.bio || ""}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {(user?.interests || []).map((t: string) => <span key={t} className="tag-chip active">{t}</span>)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Likes</h3>
              <p className="text-sm text-foreground">{user?.likes || ""}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Dislikes</h3>
              <p className="text-sm text-foreground">{user?.dislikes || ""}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
