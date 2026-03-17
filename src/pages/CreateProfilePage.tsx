import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Camera, Plus, X, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import profile1 from "@/assets/profile-1.jpg";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

const BRANCHES = ["Petroleum Eng.", "Chemical Eng.", "Computer Science", "CSD", "IT", "Mathematics and Computing", "Mechanical Eng.", "Electrical Eng."];
const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
const GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" }
];
const SUGGESTED_INTERESTS = ["Music", "Sports", "Coding", "Photography", "Travel", "Food", "Movies", "Reading", "Gaming", "Art", "Dance", "Fitness"];

const CreateProfilePage = () => {
  const navigate = useNavigate();
  const profileInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other" | "">("");
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [likes, setLikes] = useState("");
  const [dislikes, setDislikes] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<string>("");
  const [coverPhoto, setCoverPhoto] = useState<string>("");
  const [step, setStep] = useState<"form" | "otp">("form");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const toggleInterest = (tag: string) => {
    setInterests((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  };

  const toBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });

  const onPickProfile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await toBase64(file);
      setProfilePhoto(dataUrl);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Photo error", description: err.message ?? "Failed to load image." });
    }
  };

  const onPickCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await toBase64(file);
      setCoverPhoto(dataUrl);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Photo error", description: err.message ?? "Failed to load image." });
    }
  };

  const handleCreate = async () => {
    try {
      setLoading(true);
      if (!email.endsWith("@rgipt.ac.in")) {
        throw new Error("Only RGIPT emails are allowed (must end with @rgipt.ac.in).");
      }
      if (!gender) {
        throw new Error("Please select your gender.");
      }
      const res = await api.register({
        email,
        password,
        name,
        branch,
        year,
        gender,
        bio,
        interests,
        likes,
        dislikes,
        profilePhoto: profilePhoto || undefined,
        coverPhoto: coverPhoto || undefined
      });
      if (res.needsVerification) {
        setStep("otp");
        toast({ title: "OTP sent", description: "Check your email and enter the OTP to verify." });
        return;
      }
      toast({ title: "Account created", description: "Please login." });
      navigate("/login");
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Could not create account",
        description: err.message ?? "Something went wrong."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      setLoading(true);
      const res = await api.verifyOtp(email, otp);
      localStorage.setItem("token", res.token);
      navigate("/explore");
    } catch (err: any) {
      toast({ variant: "destructive", title: "OTP verification failed", description: err.message ?? "Try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setLoading(true);
      await api.resendOtp(email);
      toast({ title: "OTP resent", description: "Please check your email." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Could not resend OTP", description: err.message ?? "Try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-display font-bold">
            Create Your <span className="gradient-text">Profile</span>
          </h1>
          <p className="text-muted-foreground mt-2">Let others know who you are!</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3 glass-card p-6 space-y-6"
          >
            {step === "otp" ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Enter OTP</label>
                  <input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="6-digit OTP"
                    className="input-glow w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-2">We sent an OTP to `{email}` (valid for 10 minutes).</p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  onClick={handleVerifyOtp}
                  className="btn-gradient w-full py-3.5 text-base"
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </motion.button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={handleResendOtp}
                  className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Resend OTP
                </button>
              </div>
            ) : (
              <>
                {/* Photos */}
            <div>
              <label className="text-sm font-medium text-foreground mb-3 block">Photos</label>
              <div className="flex gap-4">
                <input ref={profileInputRef} type="file" accept="image/*" className="hidden" onChange={onPickProfile} />
                <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={onPickCover} />

                <button
                  type="button"
                  onClick={() => profileInputRef.current?.click()}
                  className="w-28 h-28 rounded-2xl border-2 border-dashed border-border/60 flex items-center justify-center cursor-pointer hover:border-primary/40 transition-colors bg-muted/30 overflow-hidden"
                >
                  {profilePhoto ? (
                    <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-8 h-8 text-muted-foreground" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  className="w-28 h-28 rounded-2xl border-2 border-dashed border-border/60 flex items-center justify-center cursor-pointer hover:border-primary/40 transition-colors bg-muted/30 overflow-hidden"
                >
                  {coverPhoto ? (
                    <img src={coverPhoto} alt="Cover" className="w-full h-full object-cover" />
                  ) : (
                    <Plus className="w-6 h-6 text-muted-foreground" />
                  )}
                </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Campus Email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="123456@rgipt.ac.in"
                  className="input-glow w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className="input-glow w-full"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="input-glow w-full" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Branch</label>
                <select value={branch} onChange={(e) => setBranch(e.target.value)} className="input-glow w-full">
                  <option value="">Select branch</option>
                  {BRANCHES.map((b) => (<option key={b} value={b}>{b}</option>))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Year</label>
                <select value={year} onChange={(e) => setYear(e.target.value)} className="input-glow w-full">
                  <option value="">Select year</option>
                  {YEARS.map((y) => (<option key={y} value={y}>{y}</option>))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Gender</label>
              <select value={gender} onChange={(e) => setGender(e.target.value as any)} className="input-glow w-full">
                <option value="">Select gender</option>
                {GENDERS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Bio</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell something about yourself..." className="input-glow w-full h-24 resize-none" />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-3 block">Interests</label>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_INTERESTS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleInterest(tag)}
                    className={`tag-chip ${interests.includes(tag) ? "active" : ""}`}
                  >
                    {tag}
                    {interests.includes(tag) && <X className="w-3 h-3 ml-1" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Likes</label>
                <input value={likes} onChange={(e) => setLikes(e.target.value)} placeholder="Things you like..." className="input-glow w-full" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Dislikes</label>
                <input value={dislikes} onChange={(e) => setDislikes(e.target.value)} placeholder="Things you dislike..." className="input-glow w-full" />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              onClick={handleCreate}
              className="btn-gradient w-full py-3.5 text-base"
            >
              {loading ? "Saving..." : "Create Profile"}
            </motion.button>
              </>
            )}
          </motion.div>

          {/* Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <p className="text-sm font-medium text-muted-foreground mb-3">Preview</p>
            <div className="glass-card overflow-hidden sticky top-24">
              <div className="h-56 overflow-hidden">
                <img src={coverPhoto || profilePhoto || profile1} alt="Preview" className="w-full h-full object-cover" />
              </div>
              <div className="p-5">
                <h3 className="text-xl font-display font-bold text-foreground">{name || "Your Name"}</h3>
                <p className="text-sm text-muted-foreground">{branch || "Branch"} • {year || "Year"}</p>
                <p className="text-sm text-foreground/80 mt-3">{bio || "Your bio will appear here..."}</p>
                {interests.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {interests.map((tag) => (<span key={tag} className="tag-chip active">{tag}</span>))}
                  </div>
                )}
                <div className="flex items-center justify-center gap-4 mt-5">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center border border-border/50">
                    <X className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center neon-glow">
                    <Heart className="w-5 h-5 text-primary-foreground" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CreateProfilePage;
