import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { HeartPulse, AlertTriangle, CheckCircle, XCircle, MessageSquare, Home } from "lucide-react";
import { TriageResult } from "@/features/triage/triage";

const COLORS: Record<string, string> = {
  Normal: "hsl(142, 76%, 36%)",
  Moderate: "hsl(32, 95%, 44%)",
  Critical: "hsl(0, 84%, 60%)",
};

const levelConfig = {
  critical: { label: "Critical", color: "bg-destructive text-destructive-foreground", icon: XCircle, borderColor: "border-destructive" },
  moderate: { label: "Moderate", color: "bg-warning text-foreground", icon: AlertTriangle, borderColor: "border-warning" },
  normal: { label: "Normal", color: "bg-success text-primary-foreground", icon: CheckCircle, borderColor: "border-success" },
};

const saveToHistory = (result: TriageResult, answers: Record<string, any>) => {
  const raw = localStorage.getItem("triage_history");
  const history: any[] = raw ? JSON.parse(raw) : [];
  const entry = { ...result, answers, timestamp: new Date().toISOString() };
  history.push(entry);
  localStorage.setItem("triage_history", JSON.stringify(history));
  localStorage.setItem("medi_triage_assessment_count", String(history.length));
};

const Results = () => {
  const navigate = useNavigate();
  const [result, setResult] = useState<TriageResult | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("triage_result");
    if (!raw) { navigate("/survey"); return; }
    const parsed: TriageResult = JSON.parse(raw);
    setResult(parsed);
    const alreadySaved = sessionStorage.getItem("triage_saved_at");
    const answersRaw = localStorage.getItem("triage_answers");
    const answers = answersRaw ? JSON.parse(answersRaw) : {};
    if (alreadySaved !== raw) {
      saveToHistory(parsed, answers);
      sessionStorage.setItem("triage_saved_at", raw);
    }
  }, [navigate]);

  if (!result) return null;
  const config = levelConfig[result.level];
  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background p-4">
      <div className="container mx-auto max-w-3xl pt-8">
        <div className="flex items-center gap-2 mb-8">
          <HeartPulse className="w-6 h-6 text-primary" />
          <span className="font-bold text-lg text-foreground">Triage Results</span>
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <Card className={`glass-card border-2 ${config.borderColor} mb-8`}>
            <CardContent className="flex flex-col items-center py-8">
              <Icon className="w-16 h-16 mb-4" style={{ color: COLORS[config.label] }} />
              <Badge className={`${config.color} text-lg px-6 py-2 mb-4`}>{config.label} Risk</Badge>
              <p className="text-4xl font-bold text-foreground">{result.score}%</p>
              <p className="text-muted-foreground mt-2">Overall Risk Score</p>
            </CardContent>
          </Card>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <Card className="glass-card">
              <CardHeader><CardTitle className="text-lg">Risk Distribution</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={result.distribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                      {result.distribution.map((entry) => (<Cell key={entry.name} fill={COLORS[entry.name]} />))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-2">
                  {result.distribution.map((d) => (
                    <div key={d.name} className="flex items-center gap-1 text-xs">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[d.name] }} />
                      <span className="text-muted-foreground">{d.name}: {d.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <Card className="glass-card">
              <CardHeader><CardTitle className="text-lg">Risk Factors</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {result.factors.map((f) => (
                  <div key={f.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">{f.label}</span>
                      <span className="font-medium text-foreground">{f.value}/{f.max}</span>
                    </div>
                    <Progress value={(f.value / f.max) * 100} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="glass-card mb-8">
            <CardHeader><CardTitle className="text-lg">Recommendations</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {result.recommendations.map((r, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm text-foreground">{r}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground mt-4 p-3 rounded-lg bg-secondary/50">
                Disclaimer: This assessment is non-diagnostic and for demonstration purposes only. Always consult a healthcare professional for medical advice.
              </p>
            </CardContent>
          </Card>
        </motion.div>
        <div className="flex flex-col sm:flex-row gap-3 pb-8">
          <Button onClick={() => navigate("/feedback")} className="flex-1 gap-2"><MessageSquare className="w-4 h-4" /> Give Feedback</Button>
          <Button variant="outline" onClick={() => navigate("/")} className="flex-1 gap-2"><Home className="w-4 h-4" /> Back to Dashboard</Button>
        </div>
      </div>
    </div>
  );
};

export default Results;
