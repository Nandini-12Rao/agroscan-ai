import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut, Globe, User as UserIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/AuthProvider";
import { useT } from "@/lib/i18n";
import { Lang } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";

const langs: { code: Lang; label: string; native: string }[] = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
];

const Profile = () => {
  const { t, lang, setLang } = useT();
  const { user, isGuest, signOut } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");

  useEffect(() => {
    if (!user) return;
    if (isGuest) { setName(t("guestUser")); return; }
    supabase
      .from("profiles")
      .select("display_name, language")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setName(data?.display_name || user.email?.split("@")[0] || "User");
      });
  }, [user, isGuest, t]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const updateLang = async (l: Lang) => {
    setLang(l);
    if (user && !isGuest) {
      await supabase.from("profiles").update({ language: l }).eq("id", user.id);
    }
  };

  return (
    <div className="px-5 pt-8">
      <h1 className="font-display text-2xl font-bold">{t("profileTitle")}</h1>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-5 glass rounded-3xl p-6 flex items-center gap-4"
      >
        <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-display text-2xl font-bold">
          {(name || "?").slice(0, 1).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display font-semibold truncate">{name}</p>
          <p className="text-xs text-muted-foreground truncate">
            {isGuest ? (
              <span className="inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Guest session
              </span>
            ) : (
              user?.email
            )}
          </p>
        </div>
        <UserIcon className="w-5 h-5 text-muted-foreground" />
      </motion.div>

      <div className="mt-6">
        <div className="flex items-center gap-2 mb-3 px-1">
          <Globe className="w-4 h-4 text-primary" />
          <h2 className="font-display font-semibold text-sm">{t("language")}</h2>
        </div>
        <div className="space-y-2">
          {langs.map((l) => (
            <button
              key={l.code}
              onClick={() => updateLang(l.code)}
              className={`w-full glass rounded-2xl p-4 flex items-center justify-between transition-all ${
                lang === l.code ? "ring-2 ring-primary" : ""
              }`}
            >
              <div className="text-left">
                <p className="font-display font-semibold text-sm">{l.native}</p>
                <p className="text-xs text-muted-foreground">{l.label}</p>
              </div>
              <span
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  lang === l.code ? "border-primary bg-primary" : "border-muted-foreground/40"
                }`}
              >
                {lang === l.code && <span className="w-2 h-2 rounded-full bg-primary-foreground" />}
              </span>
            </button>
          ))}
        </div>
      </div>

      <Button
        onClick={handleSignOut}
        variant="outline"
        className="mt-8 w-full h-12 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/5"
      >
        <LogOut className="w-4 h-4 mr-2" /> {t("signOut")}
      </Button>
    </div>
  );
};

export default Profile;
