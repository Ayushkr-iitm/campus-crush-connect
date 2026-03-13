import { motion } from "framer-motion";
import { Heart, Shield, MessageCircle, Users, Search, Sparkles, ArrowRight, Star } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import heroBg from "@/assets/hero-bg.jpg";
import profile1 from "@/assets/profile-1.jpg";
import profile2 from "@/assets/profile-2.jpg";
import profile3 from "@/assets/profile-3.jpg";
import profile4 from "@/assets/profile-4.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

const features = [
  { icon: Shield, title: "Campus Verified", desc: "Only RGIPT students with verified campus emails can join." },
  { icon: Heart, title: "Mutual Matching", desc: "Both must crush each other to unlock the connection." },
  { icon: MessageCircle, title: "Private Chat", desc: "Chat securely with your matches, no sharing to outsiders." },
  { icon: Search, title: "Discover Students", desc: "Browse profiles from every branch and year on campus." },
];

const steps = [
  { step: "01", title: "Login with Campus Email", desc: "Verify your identity with your RGIPT email address." },
  { step: "02", title: "Create Your Profile", desc: "Add your photo, bio, and interests to stand out." },
  { step: "03", title: "Crush Someone", desc: "Like profiles you're interested in — it's completely private." },
  { step: "04", title: "It's a Match!", desc: "If they crush you back, start chatting instantly!" },
];

const testimonials = [
  { name: "Priya S.", branch: "Petroleum Eng.", text: "I found my best friend (and maybe more 😉) on Campus Crush. The mutual matching makes it so much less awkward!", image: profile1 },
  { name: "Arjun K.", branch: "Chemical Eng.", text: "Finally a dating app just for us RGIPTians! No more swiping through random people from other cities.", image: profile2 },
  { name: "Neha M.", branch: "Computer Science", text: "The UI is gorgeous and I love that it's private. Nobody knows you crushed unless they crush back! 💖", image: profile3 },
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
        </div>

        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-neon-pink/10 rounded-full blur-[100px] animate-blob" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-purple/10 rounded-full blur-[120px] animate-blob" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-neon-blue/10 rounded-full blur-[80px] animate-blob" style={{ animationDelay: "4s" }} />

        <div className="relative z-10 text-center px-6 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="mb-6"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              Exclusively for RGIPT Students
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-display font-bold mb-6 leading-tight"
          >
            Find Your{" "}
            <span className="gradient-text">Campus Crush</span>
            {" "}💖
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto"
          >
            Connect with students from RGIPT and discover who secretly likes you. Your crush stays private until it's mutual.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/login" className="btn-gradient text-base px-8 py-3.5 flex items-center justify-center gap-2">
              Login with RGIPT Email
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>

          {/* Floating preview cards */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-16 flex justify-center gap-4"
          >
            {[profile1, profile2, profile3, profile4].map((img, i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, delay: i * 0.3, repeat: Infinity }}
                className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden border-2 border-border/30 shadow-lg"
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-card/20 to-background" />
        <div className="relative max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl md:text-5xl font-display font-bold mb-4">
              Why <span className="gradient-text">Campus Crush</span>?
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-muted-foreground max-w-md mx-auto">
              Built specifically for the RGIPT community, with privacy and fun at its core.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                custom={i}
                className="glass-card-hover p-6 text-center"
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl gradient-bg flex items-center justify-center">
                  <f.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl md:text-5xl font-display font-bold mb-4">
              How It <span className="gradient-text">Works</span>
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-8"
          >
            {steps.map((s, i) => (
              <motion.div
                key={s.step}
                variants={fadeUp}
                custom={i}
                className="glass-card-hover flex items-start gap-6 p-6"
              >
                <div className="text-3xl font-display font-bold gradient-text shrink-0">{s.step}</div>
                <div>
                  <h3 className="font-display font-semibold text-lg text-foreground mb-1">{s.title}</h3>
                  <p className="text-muted-foreground text-sm">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-card/20 to-background" />
        <div className="relative max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl md:text-5xl font-display font-bold mb-4">
              What Students <span className="gradient-text">Say</span>
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {testimonials.map((t, i) => (
              <motion.div key={t.name} variants={fadeUp} custom={i} className="glass-card-hover p-6">
                <div className="flex items-center gap-3 mb-4">
                  <img src={t.image} alt={t.name} className="w-12 h-12 rounded-full object-cover border-2 border-primary/30" />
                  <div>
                    <p className="font-display font-semibold text-foreground text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.branch}</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-primary fill-primary" />
                  ))}
                </div>
                <p className="text-sm text-foreground/80">{t.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto glass-card p-12 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1 gradient-bg" />
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Ready to find your <span className="gradient-text">Campus Crush</span>?
          </h2>
          <p className="text-muted-foreground mb-8">Join hundreds of RGIPT students already on the platform.</p>
          <Link to="/login" className="btn-gradient text-base px-8 py-3.5 inline-flex items-center gap-2">
            Get Started Now
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary fill-primary" />
            <span className="font-display font-bold gradient-text">Campus Crush</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 Campus Crush. Made with 💖 for RGIPT.</p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
