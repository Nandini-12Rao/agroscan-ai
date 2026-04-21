import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Camera, Upload, RefreshCw, Sparkles, Loader2, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { createRecognition } from "@/lib/speech";

const Scan = () => {
  const { t, lang } = useT();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [params] = useSearchParams();
  const initialMode = (params.get("mode") as "camera" | "upload" | null) ?? null;

  const [stage, setStage] = useState<"choose" | "camera" | "preview" | "analyzing">(
    initialMode === "camera" ? "camera" : "choose"
  );
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [voiceListening, setVoiceListening] = useState(false);

  // auto-trigger upload picker
  useEffect(() => {
    if (initialMode === "upload") fileInputRef.current?.click();
  }, [initialMode]);

  // camera lifecycle
  useEffect(() => {
    if (stage !== "camera") return;
    let active = true;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (e) {
        toast.error("Camera unavailable. Please upload an image instead.");
        setStage("choose");
      }
    })();
    return () => {
      active = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [stage]);

  const capture = () => {
    const v = videoRef.current;
    if (!v) return;
    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(v, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        setImageBlob(blob);
        setImageDataUrl(URL.createObjectURL(blob));
        setStage("preview");
      },
      "image/jpeg",
      0.9
    );
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image too large (max 10MB)");
      return;
    }
    setImageBlob(file);
    setImageDataUrl(URL.createObjectURL(file));
    setStage("preview");
  };

  const analyze = async () => {
    if (!imageBlob || !user) return;
    setStage("analyzing");
    try {
      // Upload to storage
      const ext = imageBlob.type.split("/")[1] || "jpg";
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("scans").upload(path, imageBlob, {
        contentType: imageBlob.type || "image/jpeg",
        upsert: false,
      });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("scans").getPublicUrl(path);
      const imageUrl = pub.publicUrl;

      // Predict
      const { data, error } = await supabase.functions.invoke("predict-disease", {
        body: { imageUrl, language: lang },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);

      const d = data as {
        plant_name: string;
        disease_name: string;
        is_healthy: boolean;
        confidence: number;
        description: string;
        remedies: string[];
        prevention: string[];
      };

      // Save to history
      const { data: inserted, error: insErr } = await supabase
        .from("scan_history")
        .insert({
          user_id: user.id,
          image_url: imageUrl,
          plant_name: d.plant_name,
          disease_name: d.disease_name,
          confidence: d.confidence,
          is_healthy: d.is_healthy,
          description: d.description,
          remedies: d.remedies,
          prevention: d.prevention,
        })
        .select("id")
        .single();
      if (insErr) throw insErr;
      navigate(`/result/${inserted.id}`, { replace: true });
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || t("error"));
      setStage("preview");
    }
  };

  const startVoice = () => {
    const r = createRecognition(lang);
    if (!r) { toast.error("Speech recognition not supported in this browser"); return; }
    setVoiceListening(true);
    r.onresult = (ev: any) => {
      const text = ev.results[0][0].transcript.toLowerCase();
      toast.message(`"${text}"`);
      if (text.includes("upload") || text.includes("gallery") || text.includes("अपलोड") || text.includes("అప్‌లోడ్")) {
        fileInputRef.current?.click();
      } else {
        setStage("camera");
      }
    };
    r.onerror = () => setVoiceListening(false);
    r.onend = () => setVoiceListening(false);
    r.start();
  };

  return (
    <div className="px-5 pt-8">
      <div className="flex items-center justify-between">
        <button
          onClick={() => (stage === "choose" ? navigate("/") : setStage("choose"))}
          className="w-10 h-10 rounded-full glass flex items-center justify-center"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-display font-semibold">{t("scanTitle")}</h1>
        <button
          onClick={startVoice}
          className={`w-10 h-10 rounded-full glass flex items-center justify-center ${voiceListening ? "ring-2 ring-primary animate-pulse" : ""}`}
          aria-label={t("voiceAssistant")}
        >
          <Mic className="w-5 h-5" />
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />

      <AnimatePresence mode="wait">
        {stage === "choose" && (
          <motion.div
            key="choose"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-10 space-y-4"
          >
            <p className="text-center text-muted-foreground text-sm">{t("chooseImage")}</p>
            <button
              onClick={() => setStage("camera")}
              className="w-full glass rounded-2xl p-6 flex items-center gap-4 hover:scale-[1.01] transition-transform"
            >
              <div className="w-14 h-14 rounded-2xl gradient-primary text-primary-foreground flex items-center justify-center">
                <Camera className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="font-display font-semibold">{t("fromCamera")}</p>
                <p className="text-xs text-muted-foreground">{t("scanDesc")}</p>
              </div>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full glass rounded-2xl p-6 flex items-center gap-4 hover:scale-[1.01] transition-transform"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-400 text-white flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="font-display font-semibold">{t("fromGallery")}</p>
                <p className="text-xs text-muted-foreground">{t("uploadDesc")}</p>
              </div>
            </button>
          </motion.div>
        )}

        {stage === "camera" && (
          <motion.div
            key="camera"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-6"
          >
            <div className="relative rounded-3xl overflow-hidden bg-black aspect-[3/4] glass">
              <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
              {/* Focus frame overlay */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="relative w-3/4 aspect-square rounded-3xl border-2 border-white/70">
                  <span className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-primary-glow rounded-tl-2xl" />
                  <span className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-primary-glow rounded-tr-2xl" />
                  <span className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-primary-glow rounded-bl-2xl" />
                  <span className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-primary-glow rounded-br-2xl" />
                </div>
              </div>
              <p className="absolute top-4 inset-x-0 text-center text-white text-xs bg-black/30 backdrop-blur-sm py-1 mx-8 rounded-full">
                {t("scanInstruction")}
              </p>
            </div>
            <div className="mt-5 flex items-center justify-center">
              <button
                onClick={capture}
                aria-label={t("capture")}
                className="w-20 h-20 rounded-full bg-white/90 border-4 border-primary flex items-center justify-center hover:scale-105 transition-transform"
              >
                <span className="w-14 h-14 rounded-full gradient-primary" />
              </button>
            </div>
          </motion.div>
        )}

        {stage === "preview" && imageDataUrl && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="mt-6"
          >
            <div className="rounded-3xl overflow-hidden glass">
              <img src={imageDataUrl} alt="Selected leaf" className="w-full aspect-[3/4] object-cover" />
            </div>
            <div className="mt-5 flex gap-3">
              <Button
                variant="outline"
                onClick={() => { setImageDataUrl(null); setImageBlob(null); setStage("choose"); }}
                className="flex-1 h-12 rounded-xl"
              >
                <RefreshCw className="w-4 h-4 mr-2" /> {t("retake")}
              </Button>
              <Button
                onClick={analyze}
                className="flex-1 h-12 rounded-xl gradient-primary text-primary-foreground hover:opacity-95"
              >
                <Sparkles className="w-4 h-4 mr-2" /> {t("analyze")}
              </Button>
            </div>
          </motion.div>
        )}

        {stage === "analyzing" && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-12 flex flex-col items-center"
          >
            <div className="relative">
              <span className="absolute inset-0 rounded-full bg-primary/30 blur-2xl animate-pulse-ring" />
              <div className="relative w-24 h-24 rounded-full gradient-primary flex items-center justify-center text-primary-foreground">
                <Loader2 className="w-10 h-10 animate-spin" />
              </div>
            </div>
            <p className="mt-6 font-display font-semibold">{t("analyzing")}</p>
            <p className="text-sm text-muted-foreground mt-1">AI is examining your leaf</p>
            {imageDataUrl && (
              <img src={imageDataUrl} alt="" className="mt-6 w-32 h-32 rounded-2xl object-cover opacity-60" />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Scan;
