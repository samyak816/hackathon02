import { useNavigate } from "react-router-dom";
import { Hero } from "@/components/ui/animated-hero";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  HeartPulse, Activity, Brain, ShieldCheck, MessageSquare,
  LogOut, ClipboardList, XCircle, AlertTriangle, CheckCircle,
  ChevronDown, ChevronUp, History, User, AlertCircle, Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getUser, signOut, type User as AuthUser } from "@/features/auth/authApi";
import { useEffect, useState } from "react";

// ─── Backend API base URL ────────────────────────────────────────────────────
const API_URL = ((import.meta as unknown) as { env: { VITE_API_URL: string } }).env.VITE_API_URL;

// ─── API helpers ─────────────────────────────────────────────────────────────

/** Fetch triage history for the logged-in user from Flask */
const fetchHistory = async (token: string): Promise<HistoryEntry[]> => {
  const res = await fetch(`${API_URL}/history`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch history");
  const data = await res.json();
  return data.history as HistoryEntry[];
};

/** Save a new triage result to Flask backend */
export const saveTriageResult = async (
  token: string,
  entry: Omit<HistoryEntry, "timestamp">
): Promise<void> => {
  const res = await fetch(`${API_URL}/history`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(entry),
  });
  if (!res.ok) throw new Error("Failed to save triage result");
};

/** Run triage scoring logic on Flask backend */
export const runTriage = async (
  token: string,
  answers: HistoryEntry["answers"]
): Promise<{ score: number; level: HistoryEntry["level"]; recommendations: string[]; factors: HistoryEntry["factors"] }> => {
  const res = await fetch(`${API_URL}/triage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(answers),
  });
  if (!res.ok) throw new Error("Triage scoring failed");
  return res.json();
};

// ─── Types ────────────────────────────────────────────────────────────────────
type HistoryEntry = {
  score: number;
  level: "normal" | "moderate" | "critical";
  recommendations: string[];
  timestamp: string;
  factors: { label: string; value: number; max: number }[];
  answers?: {
    age?: number;
    gender?: string;
    symptomDuration?: string;
    symptoms?: string;
    hasFever?: boolean;
    hasCough?: boolean;
    hasBreathingDifficulty?: boolean;
    hasChestPain?: boolean;
    painLevel?: number;
    feverDuration?: string;
    feverSeverity?: string;
    painLocation?: string;
    painType?: string;
    breathingWhen?: string;
    coughType?: string;
  };
};

const durationLabel: Record<string, string> = {
  today: "Just today", few_days: "A few days", more_than_week: "More than a week",
  week_plus: "Over a week",
};

const features = [
  { icon: Activity, title: "Symptom-Based Triage", description: "Answer questions about your symptoms and receive an instant risk assessment." },
  { icon: Brain, title: "Dynamic Question Flow", description: "Intelligent follow-up questions that adapt based on your responses." },
  { icon: ShieldCheck, title: "Anonymized and Safe", description: "Your data stays private. No personal health records are stored." },
  { icon: MessageSquare, title: "Feedback Learning", description: "Help improve the system by sharing your experience after each assessment." },
];

const MedicalBackground = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
    <svg className="absolute -top-8 -left-8 opacity-[0.04] dark:opacity-[0.06]" width="220" height="220" viewBox="0 0 220 220" fill="none">
      <rect x="80" y="0" width="60" height="220" rx="12" fill="currentColor"/>
      <rect x="0" y="80" width="220" height="60" rx="12" fill="currentColor"/>
    </svg>
    <svg className="absolute top-16 right-0 opacity-[0.05] dark:opacity-[0.07]" width="340" height="80" viewBox="0 0 340 80" fill="none">
      <polyline points="0,40 50,40 70,10 90,70 110,20 130,60 150,40 340,40" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
    <svg className="absolute top-1/3 -left-12 opacity-[0.03] dark:opacity-[0.05]" width="160" height="160" viewBox="0 0 160 160" fill="none">
      <rect x="60" y="0" width="40" height="160" rx="8" fill="currentColor"/>
      <rect x="0" y="60" width="160" height="40" rx="8" fill="currentColor"/>
    </svg>
    <svg className="absolute top-1/4 right-10 opacity-[0.04] dark:opacity-[0.06]" width="60" height="360" viewBox="0 0 60 360" fill="none">
      <path d="M10,0 Q50,30 10,60 Q-30,90 10,120 Q50,150 10,180 Q-30,210 10,240 Q50,270 10,300 Q-30,330 10,360" stroke="currentColor" strokeWidth="4" fill="none"/>
      <path d="M50,0 Q10,30 50,60 Q90,90 50,120 Q10,150 50,180 Q90,210 50,240 Q10,270 50,300 Q90,330 50,360" stroke="currentColor" strokeWidth="4" fill="none"/>
      {[0,60,120,180,240,300].map(y => (
        <line key={y} x1="10" y1={y+30} x2="50" y2={y+30} stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.6"/>
      ))}
    </svg>
    <svg className="absolute bottom-32 left-16 opacity-[0.04] dark:opacity-[0.06]" width="120" height="48" viewBox="0 0 120 48" fill="none">
      <rect x="0" y="4" width="120" height="40" rx="20" fill="currentColor"/>
      <line x1="60" y1="4" x2="60" y2="44" stroke="white" strokeWidth="3"/>
    </svg>
    <svg className="absolute bottom-10 left-0 right-0 opacity-[0.04] dark:opacity-[0.05] w-full" height="100" viewBox="0 0 800 100" preserveAspectRatio="none" fill="none">
      <polyline points="0,50 120,50 160,15 200,85 240,25 280,75 320,50 800,50" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
    <svg className="absolute bottom-20 right-20 opacity-[0.04] dark:opacity-[0.06]" width="80" height="80" viewBox="0 0 80 80" fill="none">
      <rect x="30" y="0" width="20" height="80" rx="4" fill="currentColor"/>
      <rect x="0" y="30" width="80" height="20" rx="4" fill="currentColor"/>
    </svg>
    <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.025] dark:opacity-[0.04]" width="500" height="500" viewBox="0 0 500 500" fill="none">
      <circle cx="250" cy="250" r="220" stroke="currentColor" strokeWidth="6" fill="none"/>
      <circle cx="250" cy="250" r="150" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="20 12"/>
    </svg>
  </div>
);

const levelColors = {
  critical: { badge: "bg-destructive text-destructive-foreground", Icon: XCircle, iconColor: "text-destructive" },
  moderate: { badge: "bg-warning text-foreground", Icon: AlertTriangle, iconColor: "text-orange-500" },
  normal:   { badge: "bg-success text-primary-foreground", Icon: CheckCircle, iconColor: "text-green-600" },
};

const AnswerRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-start gap-4 py-1.5 border-b border-border/30 last:border-0">
    <span className="text-xs text-muted-foreground shrink-0">{label}</span>
    <span className="text-xs font-medium text-foreground text-right">{value}</span>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [entryCount, setEntryCount] = useState<number | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getUser();
      setUser(currentUser);
    };

    loadUser();
  }, []);

  useEffect(() => {
    // ── Fetch history from Flask backend ──────────────────────────────────────
    // Gets the auth token stored by your authApi after login,
    // then calls GET /history on your Flask backend.
    const loadHistory = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get token saved during login (adjust key name to match your authApi)
        const token = localStorage.getItem("auth_token");

        if (!token) {
          // Not logged in — redirect to auth
          navigate("/auth");
          return;
        }

        const data = await fetchHistory(token);
        const reversed = [...data].reverse();
        setHistory(reversed);
        setEntryCount(data.length);
      } catch (err) {
        console.error("History fetch failed:", err);
        setError("Could not load your history. Please try again.");
        // Fallback: try localStorage in case backend is down
        const raw = localStorage.getItem("triage_history");
        if (raw) {
          const parsed: HistoryEntry[] = JSON.parse(raw);
          setHistory([...parsed].reverse());
          setEntryCount(parsed.length);
        } else {
          setEntryCount(0);
        }
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [navigate]);

  const handleSignOut = () => {
    // ── Sign out: clear token + call your authApi ─────────────────────────────
    localStorage.removeItem("auth_token");
    signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background relative">
      <MedicalBackground />

      <nav className="fixed top-0 w-full z-50 glass border-b border-border/50">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg text-foreground">MediTriage</span>
          </div>
          <div className="flex items-center gap-3">
            {entryCount !== null && entryCount > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="hidden sm:flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-3 py-1"
              >
                <ClipboardList className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-semibold text-primary">
                  {entryCount.toLocaleString()} assessments
                </span>
              </motion.div>
            )}
            {user && (
              <span className="text-sm text-muted-foreground hidden sm:block">Hi, {user.name}</span>
            )}
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-1" /> Sign Out
            </Button>
          </div>
        </div>
      </nav>

      <Hero />

      {/* ── Loading / error state ───────────────────────────────────────────── */}
      {loading && (
        <div className="flex justify-center py-8 relative z-10">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}

      {error && !loading && (
        <div className="flex justify-center pb-4 px-4 relative z-10">
          <p className="text-sm text-destructive">{error} (showing cached data if available)</p>
        </div>
      )}

      {entryCount !== null && entryCount > 0 && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex justify-center pb-4 px-4 relative z-10"
        >
          <div className="flex items-center gap-3 glass-card px-6 py-3 rounded-full border border-border/50">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-muted-foreground">Total assessments completed</span>
            <span className="text-2xl font-bold text-primary">{entryCount.toLocaleString()}</span>
          </div>
        </motion.div>
      )}

      <section className="py-20 px-4 relative z-10">
        <div className="container mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground"
          >
            How It Works
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 hover:shadow-2xl transition-shadow"
              >
                <feature.icon className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <ContainerScroll
        titleComponent={
          <div className="text-center">
            <p className="text-primary font-semibold mb-2">Interactive Assessment</p>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground">Smart Assessment Experience</h2>
          </div>
        }
      >
        <div className="h-full w-full bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            <HeartPulse className="w-16 h-16 text-primary mx-auto" />
            <h3 className="text-2xl font-bold text-foreground">Step-by-Step Health Assessment</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Our guided wizard walks you through symptom assessment with intelligent follow-up questions tailored to your responses.
            </p>
          </div>
        </div>
      </ContainerScroll>

      {history.length > 0 && !loading && (
        <section className="py-16 px-4 relative z-10">
          <div className="container mx-auto max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 mb-8"
            >
              <History className="w-6 h-6 text-primary" />
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">Previous Assessments</h2>
              <Badge variant="secondary" className="ml-auto">{history.length} total</Badge>
            </motion.div>

            <div className="space-y-3">
              {history.map((entry, i) => {
                const isExpanded = expandedIdx === i;
                const cfg = levelColors[entry.level];
                const date = new Date(entry.timestamp);
                const dateStr = date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
                const timeStr = date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
                const a = entry.answers || {};

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Card className="glass-card overflow-hidden">
                      <button className="w-full text-left" onClick={() => setExpandedIdx(isExpanded ? null : i)}>
                        <CardContent className="flex items-center gap-4 py-4 px-5">
                          <cfg.Icon className={`w-8 h-8 shrink-0 ${cfg.iconColor}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge className={`${cfg.badge} text-xs px-2 py-0.5`}>
                                {entry.level.charAt(0).toUpperCase() + entry.level.slice(1)}
                              </Badge>
                              <span className="text-lg font-bold text-foreground">{entry.score}%</span>
                              <span className="text-xs text-muted-foreground">risk score</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{dateStr} · {timeStr}</p>
                          </div>
                          {isExpanded
                            ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                            : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                          }
                        </CardContent>
                      </button>

                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            key="detail"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                          >
                            <div className="px-5 pb-5 border-t border-border/50 pt-4 space-y-5">
                              <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
                                  <User className="w-3.5 h-3.5" /> What you answered
                                </p>
                                <div className="bg-secondary/40 rounded-xl px-4 py-2 space-y-0">
                                  {a.age && <AnswerRow label="Age" value={String(a.age)} />}
                                  {a.gender && <AnswerRow label="Gender" value={a.gender.charAt(0).toUpperCase() + a.gender.slice(1)} />}
                                  {a.symptomDuration && <AnswerRow label="Symptom duration" value={durationLabel[a.symptomDuration] || a.symptomDuration} />}
                                  {a.symptoms && <AnswerRow label="Symptoms described" value={a.symptoms} />}
                                  <AnswerRow label="Pain level" value={`${a.painLevel ?? 0}/10`} />
                                  <AnswerRow label="Fever" value={a.hasFever ? "Yes" : "No"} />
                                  <AnswerRow label="Cough" value={a.hasCough ? "Yes" : "No"} />
                                  <AnswerRow label="Breathing difficulty" value={a.hasBreathingDifficulty ? "Yes" : "No"} />
                                  <AnswerRow label="Chest pain" value={a.hasChestPain ? "Yes" : "No"} />
                                  {a.feverDuration && <AnswerRow label="Fever duration" value={durationLabel[a.feverDuration] || a.feverDuration} />}
                                  {a.feverSeverity && <AnswerRow label="Fever severity" value={a.feverSeverity.charAt(0).toUpperCase() + a.feverSeverity.slice(1)} />}
                                  {a.painLocation && <AnswerRow label="Pain location" value={a.painLocation} />}
                                  {a.painType && <AnswerRow label="Pain type" value={a.painType.charAt(0).toUpperCase() + a.painType.slice(1)} />}
                                  {a.breathingWhen && <AnswerRow label="Breathing difficulty when" value={a.breathingWhen.charAt(0).toUpperCase() + a.breathingWhen.slice(1)} />}
                                  {a.coughType && <AnswerRow label="Cough type" value={a.coughType.charAt(0).toUpperCase() + a.coughType.slice(1)} />}
                                </div>
                              </div>

                              {entry.factors && entry.factors.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                                    <AlertCircle className="w-3.5 h-3.5" /> Risk factors
                                  </p>
                                  <div className="space-y-2">
                                    {entry.factors.map((f) => (
                                      <div key={f.label}>
                                        <div className="flex justify-between text-xs mb-1">
                                          <span className="text-muted-foreground">{f.label}</span>
                                          <span className="font-medium text-foreground">{f.value}/{f.max}</span>
                                        </div>
                                        <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                                          <div className="h-full rounded-full bg-primary" style={{ width: `${Math.round((f.value / f.max) * 100)}%` }} />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {entry.recommendations && entry.recommendations.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                                    <CheckCircle className="w-3.5 h-3.5" /> Recommendations
                                  </p>
                                  <ul className="space-y-1.5">
                                    {entry.recommendations.map((r, j) => (
                                      <li key={j} className="flex items-start gap-2 text-xs text-foreground">
                                        <CheckCircle className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                                        {r}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <footer className="py-8 border-t border-border text-center text-sm text-muted-foreground relative z-10">
        {entryCount !== null && entryCount > 0 && (
          <p className="mb-1 font-medium text-foreground/60">
            {entryCount.toLocaleString()} assessments completed
          </p>
        )}
        <p>This is a demo. Not a substitute for professional medical advice.</p>
      </footer>
    </div>
  );
};

export default Dashboard;