import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Leaf, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useT } from "@/lib/i18n";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

interface Disease {
  id: string;
  name: string;
  plant: string;
  description: string;
  symptoms: string[];
  treatment: string[];
}

const Library = () => {
  const { t } = useT();
  const [data, setData] = useState<Disease[] | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    supabase
      .from("diseases")
      .select("id, name, plant, description, symptoms, treatment")
      .order("name")
      .then(({ data }) => setData((data ?? []) as Disease[]));
  }, []);

  const filtered = useMemo(() => {
    if (!data) return [];
    const term = q.trim().toLowerCase();
    if (!term) return data;
    return data.filter(
      (d) =>
        d.name.toLowerCase().includes(term) ||
        d.plant.toLowerCase().includes(term) ||
        d.description.toLowerCase().includes(term)
    );
  }, [data, q]);

  return (
    <div className="px-5 pt-8">
      <h1 className="font-display text-2xl font-bold">{t("libraryTitle")}</h1>
      <p className="text-sm text-muted-foreground mt-1">{t("librarySub")}</p>

      <div className="mt-5 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("search")}
          className="pl-9 h-12 rounded-xl glass border-transparent"
          maxLength={80}
        />
      </div>

      <div className="mt-5">
        {data === null ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center">
            <Leaf className="w-10 h-10 text-primary/60 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No diseases found</p>
          </div>
        ) : (
          <Accordion type="single" collapsible className="space-y-3">
            {filtered.map((d, i) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <AccordionItem value={d.id} className="glass rounded-2xl border-0 overflow-hidden">
                  <AccordionTrigger className="px-4 py-4 hover:no-underline">
                    <div className="flex items-center gap-3 text-left">
                      <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground shrink-0">
                        <Leaf className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-display font-semibold text-sm">{d.name}</p>
                        <p className="text-xs text-muted-foreground">{d.plant}</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 space-y-4 text-sm">
                    <p className="text-foreground/85 leading-relaxed">{d.description}</p>
                    {d.symptoms.length > 0 && (
                      <div>
                        <p className="font-display font-semibold text-xs uppercase tracking-wide text-muted-foreground mb-2">
                          {t("symptoms")}
                        </p>
                        <ul className="space-y-1.5">
                          {d.symptoms.map((s, idx) => (
                            <li key={idx} className="flex gap-2 text-sm">
                              <span className="text-warning">•</span>
                              <span className="text-foreground/85">{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {d.treatment.length > 0 && (
                      <div>
                        <p className="font-display font-semibold text-xs uppercase tracking-wide text-muted-foreground mb-2">
                          {t("treatment")}
                        </p>
                        <ul className="space-y-1.5">
                          {d.treatment.map((s, idx) => (
                            <li key={idx} className="flex gap-2 text-sm">
                              <span className="text-success">✓</span>
                              <span className="text-foreground/85">{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        )}
      </div>
    </div>
  );
};

export default Library;
