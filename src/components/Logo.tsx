import { Leaf } from "lucide-react";
import { motion } from "framer-motion";

interface LogoProps {
  size?: number;
  withGlow?: boolean;
  className?: string;
}

export const Logo = ({ size = 56, withGlow = false, className = "" }: LogoProps) => {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
      className={`relative inline-flex items-center justify-center rounded-2xl gradient-primary ${
        withGlow ? "glow" : ""
      } ${className}`}
      style={{ width: size, height: size }}
    >
      <Leaf className="text-primary-foreground" style={{ width: size * 0.55, height: size * 0.55 }} strokeWidth={2.2} />
      {withGlow && (
        <span className="absolute inset-0 rounded-2xl gradient-primary opacity-50 blur-xl -z-10" />
      )}
    </motion.div>
  );
};
