import { NavLink, useLocation } from "react-router-dom";
import { Home, ScanLine, History as HistoryIcon, BookOpen, User } from "lucide-react";
import { useT } from "@/lib/i18n";
import { motion } from "framer-motion";

const items = [
  { to: "/", icon: Home, key: "home" as const },
  { to: "/scan", icon: ScanLine, key: "scan" as const },
  { to: "/history", icon: HistoryIcon, key: "history" as const },
  { to: "/library", icon: BookOpen, key: "library" as const },
  { to: "/profile", icon: User, key: "profile" as const },
];

export const BottomNav = () => {
  const { t } = useT();
  const location = useLocation();
  const hide = location.pathname.startsWith("/auth");
  if (hide) return null;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 px-4 pb-4 pt-2">
      <div className="mx-auto max-w-md glass rounded-2xl px-2 py-2 flex items-center justify-between">
        {items.map(({ to, icon: Icon, key }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `relative flex-1 flex flex-col items-center gap-0.5 py-2 px-1 rounded-xl text-xs transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="navIndicator"
                    className="absolute inset-0 rounded-xl bg-primary/10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className="w-5 h-5 relative" strokeWidth={isActive ? 2.4 : 2} />
                <span className="relative font-medium">{t(key)}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
