import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User as UserIcon, ArrowRight, Loader2 } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/providers/AuthProvider";
import { useT } from "@/lib/i18n";
import { toast } from "sonner";

const Auth = () => {
  const { t } = useT();
  const navigate = useNavigate();
  const { signIn, signUp, signInGuest } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    const result = mode === "signin"
      ? await signIn(email, password)
      : await signUp(email, password, name || email.split("@")[0]);
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      navigate("/");
    }
  };

  const handleGuest = async () => {
    setGuestLoading(true);
    const { error } = await signInGuest();
    setGuestLoading(false);
    if (error) toast.error(error);
    else navigate("/");
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center px-6 py-10 gradient-hero overflow-hidden">
      <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-primary-glow/30 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-accent/20 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-6">
          <Logo size={64} withGlow />
          <h1 className="mt-4 font-display text-2xl font-bold text-primary-foreground">{t("appName")}</h1>
          <p className="text-primary-foreground/70 text-xs mt-1">{t("tagline")}</p>
        </div>

        <div className="glass-dark rounded-3xl p-6 sm:p-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="font-display text-xl font-semibold text-primary-foreground">
                {mode === "signin" ? t("welcome") : t("signupTitle")}
              </h2>
              <p className="text-primary-foreground/70 text-sm mt-1">
                {mode === "signin" ? t("welcomeSub") : t("signupSub")}
              </p>

              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                {mode === "signup" && (
                  <div>
                    <Label htmlFor="name" className="text-primary-foreground/90 text-xs">
                      {t("displayName")}
                    </Label>
                    <div className="relative mt-1.5">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-foreground/60" />
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-9 bg-white/10 border-white/20 text-primary-foreground placeholder:text-primary-foreground/40 focus-visible:ring-primary-glow"
                        placeholder="Jane Doe"
                        maxLength={60}
                      />
                    </div>
                  </div>
                )}
                <div>
                  <Label htmlFor="email" className="text-primary-foreground/90 text-xs">{t("email")}</Label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-foreground/60" />
                    <Input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9 bg-white/10 border-white/20 text-primary-foreground placeholder:text-primary-foreground/40 focus-visible:ring-primary-glow"
                      placeholder="you@example.com"
                      maxLength={120}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="password" className="text-primary-foreground/90 text-xs">{t("password")}</Label>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-foreground/60" />
                    <Input
                      id="password"
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9 bg-white/10 border-white/20 text-primary-foreground placeholder:text-primary-foreground/40 focus-visible:ring-primary-glow"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl gradient-primary text-primary-foreground font-semibold border border-white/20 hover:opacity-95 hover:scale-[1.01] transition-all"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      {mode === "signin" ? t("signIn") : t("signUp")}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>

              <div className="flex items-center gap-3 my-5">
                <div className="h-px bg-white/15 flex-1" />
                <span className="text-primary-foreground/60 text-xs">or</span>
                <div className="h-px bg-white/15 flex-1" />
              </div>

              <Button
                onClick={handleGuest}
                disabled={guestLoading}
                variant="outline"
                className="w-full h-12 rounded-xl bg-white/5 border-white/25 text-primary-foreground hover:bg-white/15 hover:text-primary-foreground"
              >
                {guestLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t("continueGuest")}
              </Button>

              <p className="text-center text-primary-foreground/70 text-sm mt-5">
                {mode === "signin" ? t("noAccount") : t("haveAccount")}{" "}
                <button
                  type="button"
                  onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                  className="text-primary-glow font-semibold underline-offset-2 hover:underline"
                >
                  {mode === "signin" ? t("signUp") : t("signIn")}
                </button>
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
