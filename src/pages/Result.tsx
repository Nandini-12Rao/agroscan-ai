import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Volume2, VolumeX, CheckCircle2, AlertTriangle,
  Pill, ShieldCheck, ScanLine, Loader2, Leaf
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useT } from "@/lib/i18n";
import { speak, stopSpeaking } from "@/lib/speech";

interface ScanRow {
  id: string;
  image_url: string | null;
  plant_name: string | null;
  disease_name: string | null;
  confidence: number | null;
  is_healthy: boolean | null;
  description: string | null;
  remedies: string[] | null;
  prevention: string[] | null;
  created_at: string;
}

const Result = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useT();
  const [scan, setScan] = useState<ScanRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (!id) return;
    supabase
      .from("scan_history")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => {
        setScan(data as ScanRow | null);
        setLoading(false);
      });
    return () => stopSpeaking();
  }, [id]);

  const toggleSpeak = () => {
    if (!scan) return;
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    const text = [
      `${scan.plant_name}. ${scan.disease_name}.`,
      scan.description ?? "",
      (scan.remedies ?? []).length ? `${t("remedies")}: ${(scan.remedies ?? []).join(". ")}` : "",
      (scan.prevention ?? []).length ? `${t("prevention")}: ${(scan.prevention ?? []).join(". ")}` : "",
    ].join(" ");
    speak(text, lang);
    setSpeaking(true);
    // Auto-reset speaking flag when done
    const interval = setInterval(() => {
      if (!window.speechSynthesis.speaking) { setSpeaking(false); clearInterval(interval); }
    }, 500);
  };

  if (loading) {
    return (
      <div className="px-5 pt-20 flex flex-col items-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-3 text-sm text-muted-foreground">{t("loading")}</p>
      </div>
    );
  }

  if (!scan) {
    return (
      <div className="px-5 pt-20 text-center">
        <Leaf className="w-12 h-12 text-muted-foreground mx-auto" />
        <p className="mt-3 font-display">{t("error")}</p>
        <Link to="/" className="mt-4 inline-block text-primary font-semibold">← {t("home")}</Link>
      </div>
    );
  }

  const confidence = Math.round(Number(scan.confidence ?? 0));
  const healthy = !!scan.is_healthy;

  return (
    <div className="px-5 pt-8">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/")}
          className="w-10 h-10 rounded-full glass flex items-center justify-center"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-display font-semibold">{t("result")}</h1>
        <button
          onClick={toggleSpeak}
          className="w-10 h-10 rounded-full glass flex items-center justify-center"
          aria-label={speaking ? t("stop") : t("listen")}
        >
          {speaking ? <VolumeX className="w-5 h-5 text-primary" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-5 rounded-3xl overflow-hidden glass"
      >
        {scan.image_url && (
          <img src={scan.image_url} alt={scan.plant_name ?? ""} className="w-full aspect-[4/3] object-cover" />
        )}
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">{scan.plant_name}</p>
              <h2 className="font-display text-2xl font-bold mt-0.5">{scan.disease_name}</h2>
            </div>
            <span
              className={`shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${
                healthy ? "bg-success/15 text-success" : "bg-destructive/10 text-destructive"
              }`}
            >
              {healthy ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
              {healthy ? t("healthy") : t("diseased")}
            </span>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{t("confidence")}</span>
              <span className="font-semibold text-primary">{confidence}%</span>
            </div>
            <div className="mt-1.5 h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${confidence}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full gradient-primary"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {scan.description && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-4 glass rounded-2xl p-5"
        >
          <h3 className="font-display font-semibold mb-2">{t("description")}</h3>
          <p className="text-sm text-foreground/80 leading-relaxed">{scan.description}</p>
        </motion.div>
      )}

      {(scan.remedies ?? []).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-4 glass rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-400 flex items-center justify-center text-white">
              <Pill className="w-4 h-4" />
            </div>
            <h3 className="font-display font-semibold">{t("remedies")}</h3>
          </div>
          <ul className="space-y-2">
            {(scan.remedies ?? []).map((r, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <span className="text-foreground/85 leading-relaxed">{r}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {(scan.prevention ?? []).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 glass rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-600 to-teal-400 flex items-center justify-center text-white">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-display font-semibold">{t("prevention")}</h3>
          </div>
          <ul className="space-y-2">
            {(scan.prevention ?? []).map((p, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <CheckCircle2 className="shrink-0 w-4 h-4 text-success mt-0.5" />
                <span className="text-foreground/85 leading-relaxed">{p}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      <Button
        onClick={() => navigate("/scan")}
        className="mt-6 w-full h-12 rounded-xl gradient-primary text-primary-foreground hover:opacity-95"
      >
        <ScanLine className="w-4 h-4 mr-2" /> {t("scanAnother")}
      </Button>
    </div>
  );
};

export default Result;
