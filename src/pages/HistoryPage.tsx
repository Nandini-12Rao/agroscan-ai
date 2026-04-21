import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Leaf, ChevronRight, Loader2, ScanLine } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useT } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

interface Row {
  id: string;
  plant_name: string | null;
  disease_name: string | null;
  is_healthy: boolean | null;
  image_url: string | null;
  confidence: number | null;
  created_at: string;
}

const HistoryPage = () => {
  const { t } = useT();
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    supabase
      .from("scan_history")
      .select("id, plant_name, disease_name, is_healthy, image_url, confidence, created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => setRows((data ?? []) as Row[]));
  }, []);

  return (
    <div className="px-5 pt-8">
      <h1 className="font-display text-2xl font-bold">{t("history")}</h1>
      <p className="text-sm text-muted-foreground mt-1">All your past scans</p>

      <div className="mt-6">
        {rows === null ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : rows.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center">
            <Leaf className="w-10 h-10 text-primary/60 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">{t("noScans")}</p>
            <Link to="/scan">
              <Button className="mt-4 gradient-primary text-primary-foreground">
                <ScanLine className="w-4 h-4 mr-2" /> {t("scan")}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {rows.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link to={`/result/${r.id}`} className="flex items-center gap-3 glass rounded-2xl p-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted shrink-0">
                    {r.image_url ? (
                      <img src={r.image_url} alt={r.plant_name ?? ""} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Leaf className="w-5 h-5 text-muted-foreground" /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold text-sm truncate">{r.plant_name}</p>
                    <p className={`text-xs truncate ${r.is_healthy ? "text-success" : "text-destructive"}`}>
                      {r.disease_name}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {new Date(r.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-primary">{Math.round(Number(r.confidence ?? 0))}%</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground mt-1 ml-auto" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
