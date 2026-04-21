import { motion } from "framer-motion";
import { Logo } from "./Logo";
import { useT } from "@/lib/i18n";

export const Splash = () => {
  const { t } = useT();
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gradient-hero"
    >
      <div className="relative">
        <span className="absolute inset-0 rounded-3xl bg-primary-glow/40 blur-3xl animate-pulse-ring" />
        <Logo size={96} className="relative" />
      </div>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="mt-8 font-display text-4xl font-bold text-primary-foreground tracking-tight"
      >
        {t("appName")}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="mt-2 text-primary-foreground/80 text-sm"
      >
        {t("tagline")}
      </motion.p>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: 120 }}
        transition={{ delay: 0.9, duration: 1.2 }}
        className="mt-10 h-1 rounded-full overflow-hidden bg-primary-foreground/20"
      >
        <div
          className="h-full bg-primary-foreground/80 animate-shimmer"
          style={{
            backgroundImage:
              "linear-gradient(90deg, transparent 0%, hsl(var(--primary-foreground)) 50%, transparent 100%)",
            backgroundSize: "200% 100%",
          }}
        />
      </motion.div>
    </motion.div>
  );
};
