import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ScanLine, Upload, History as HistoryIcon, BookOpen, Mic,
  Plus, Leaf, ChevronRight, Sparkles
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/providers/AuthProvider";
import { useT } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";

interface RecentScan {
  id: string;
  plant_name: string | null;
  disease_name: string | null;
  is_healthy: boolean | null;
  image_url: string | null;
  created_at: string;
}

const Dashboard = () => {
  const { t, lang } = useT();
  const { user, isGuest } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState<string>("");
  const [recent, setRecent] = useState<RecentScan[]>([]);

  useEffect(() => {
    if (!user) return;
    if (isGuest) {
      setName(t("guestUser"));
    } else {
      supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .maybeSingle()
        .then(({ data }) => setName(data?.display_name || user.email?.split("@")[0] || "Friend"));
    }
    supabase
      .from("scan_history")
      .select("id, plant_name, disease_name, is_healthy, image_url, created_at")
      .order("created_at", { ascending: false })
      .limit(3)
      .then(({ data }) => setRecent((data ?? []) as RecentScan[]));
  }, [user, isGuest, t, lang]);

  const tiles = [
    { icon: ScanLine, key: "scanImage" as const, desc: "scanDesc" as const, to: "/scan?mode=camera", from: "from-primary", to2: "to-primary-glow" },
    { icon: Upload, key: "uploadImage" as const, desc: "uploadDesc" as const, to: "/scan?mode=upload", from: "from-emerald-600", to2: "to-emerald-400" },
    { icon: HistoryIcon, key: "history" as const, desc: "historyDesc" as const, to: "/history", from: "from-teal-600", to2: "to-teal-400" },
    { icon: BookOpen, key: "library" as const, desc: "libraryDesc" as const, to: "/library", from: "from-lime-600", to2: "to-lime-400" },
  ];

  return (
    <div className="px-5 pt-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <Logo size={44} />
          <div>
            <p className="text-xs text-muted-foreground">{t("greeting")}</p>
            <p className="font-display font-semibold leading-tight">{name || "—"}</p>
          </div>
        </div>
        <Link to="/profile" className="w-10 h-10 rounded-full glass flex items-center justify-center">
          <span className="font-display text-sm font-semibold text-primary">
            {(name || "?").slice(0, 1).toUpperCase()}
          </span>
        </Link>
      </motion.div>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative mt-6 rounded-3xl p-6 gradient-hero text-primary-foreground overflow-hidden"
      >
        <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-primary-glow/40 blur-2xl" />
        <div className="absolute right-3 top-3 inline-flex items-center gap-1 text-[10px] font-semibold bg-white/15 backdrop-blur px-2 py-1 rounded-full">
          <Sparkles className="w-3 h-3" /> AI
        </div>
        <h2 className="font-display text-2xl font-bold leading-tight">{t("appName")}</h2>
        <p className="text-primary-foreground/80 text-sm mt-1 max-w-[80%]">{t("homeSub")}</p>
        <button
          onClick={() => navigate("/scan")}
          className="mt-5 inline-flex items-center gap-2 bg-white text-primary font-semibold rounded-full px-5 py-2.5 text-sm hover:scale-[1.02] transition-transform"
        >
          <ScanLine className="w-4 h-4" /> {t("quickScan")}
        </button>
      </motion.div>

      {/* Quick actions */}
      <div className="mt-7">
        <h3 className="font-display font-semibold text-sm text-foreground/80 mb-3 px-1">{t("quickActions")}</h3>
        <div className="grid grid-cols-2 gap-3">
          {tiles.map((tile, i) => (
            <motion.div
              key={tile.to}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.05 }}
            >
              <Link
                to={tile.to}
                className="group block glass rounded-2xl p-4 hover:scale-[1.02] transition-transform"
              >
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${tile.from} ${tile.to2} flex items-center justify-center text-white shadow-md`}>
                  <tile.icon className="w-5 h-5" />
                </div>
                <p className="mt-3 font-display font-semibold text-sm">{t(tile.key)}</p>
                <p className="text-xs text-muted-foreground">{t(tile.desc)}</p>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Voice assistant card */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <Link
            to="/scan"
            className="mt-3 flex items-center gap-3 glass rounded-2xl p-4 hover:scale-[1.01] transition-transform"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-400 flex items-center justify-center text-white shadow-md">
              <Mic className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="font-display font-semibold text-sm">{t("voiceAssistant")}</p>
              <p className="text-xs text-muted-foreground">{t("voiceDesc")}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>
        </motion.div>
      </div>

      {/* Recent scans */}
      <div className="mt-7">
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="font-display font-semibold text-sm text-foreground/80">{t("recentScans")}</h3>
          <Link to="/history" className="text-xs text-primary font-semibold">{t("seeAll")}</Link>
        </div>
        {recent.length === 0 ? (
          <div className="glass rounded-2xl p-6 text-center text-sm text-muted-foreground">
            <Leaf className="w-8 h-8 mx-auto mb-2 text-primary/60" />
            {t("noScans")}
          </div>
        ) : (
          <div className="space-y-2">
            {recent.map((s) => (
              <Link
                key={s.id}
                to="/history"
                className="flex items-center gap-3 glass rounded-2xl p-3"
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted shrink-0">
                  {s.image_url ? (
                    <img src={s.image_url} alt={s.plant_name ?? ""} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Leaf className="w-5 h-5 text-muted-foreground" /></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-sm truncate">{s.plant_name}</p>
                  <p className={`text-xs truncate ${s.is_healthy ? "text-success" : "text-destructive"}`}>
                    {s.disease_name}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Floating action button */}
      <button
        onClick={() => navigate("/scan")}
        aria-label={t("quickScan")}
        className="fixed bottom-24 right-5 w-14 h-14 rounded-full gradient-primary text-primary-foreground shadow-lg glow flex items-center justify-center hover:scale-110 transition-transform z-30"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
};

export default Dashboard;
