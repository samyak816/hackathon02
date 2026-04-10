export interface SurveyData {
  age: number;
  gender: string;
  symptomDuration: string;
  symptoms: string;
  hasFever: boolean;
  hasCough: boolean;
  hasBreathingDifficulty: boolean;
  hasChestPain: boolean;
  painLevel: number;
  feverDuration?: string;
  feverSeverity?: string;
  painLocation?: string;
  painType?: string;
  breathingWhen?: string;
  coughType?: string;
}

export interface TriageResult {
  level: "critical" | "moderate" | "normal";
  score: number;
  factors: { label: string; value: number; max: number }[];
  recommendations: string[];
  distribution: { name: string; value: number }[];
}

export function calculateTriage(data: SurveyData): TriageResult {
  let score = 0;
  const factors: TriageResult["factors"] = [];

  const ageRisk = data.age > 65 ? 30 : data.age > 45 ? 15 : 5;
  score += ageRisk;
  factors.push({ label: "Age Factor", value: ageRisk, max: 30 });

  const painScore = data.painLevel * 3;
  score += painScore;
  factors.push({ label: "Pain Severity", value: painScore, max: 30 });

  let criticalScore = 0;
  if (data.hasBreathingDifficulty) criticalScore += 25;
  if (data.hasChestPain) criticalScore += 25;
  score += criticalScore;
  factors.push({ label: "Critical Symptoms", value: criticalScore, max: 50 });

  let generalScore = 0;
  if (data.hasFever) generalScore += 10;
  if (data.hasCough) generalScore += 5;
  score += generalScore;
  factors.push({ label: "General Symptoms", value: generalScore, max: 15 });

  const durationScore = data.symptomDuration === "more_than_week" ? 15 : data.symptomDuration === "few_days" ? 8 : 3;
  score += durationScore;
  factors.push({ label: "Duration", value: durationScore, max: 15 });

  let followUpScore = 0;
  if (data.feverSeverity === "high") followUpScore += 10;
  if (data.painType === "sharp") followUpScore += 8;
  if (data.breathingWhen === "rest") followUpScore += 12;
  score += followUpScore;
  factors.push({ label: "Severity Indicators", value: followUpScore, max: 30 });

  const totalMax = 170;
  const pct = Math.min((score / totalMax) * 100, 100);

  const level: TriageResult["level"] = pct >= 55 ? "critical" : pct >= 30 ? "moderate" : "normal";

  const normalPct = Math.max(0, 100 - pct);
  const moderatePct = level === "normal" ? 0 : level === "moderate" ? pct : pct * 0.3;
  const criticalPct = level === "critical" ? pct * 0.7 : 0;

  const distribution = [
    { name: "Normal", value: Math.round(normalPct) },
    { name: "Moderate", value: Math.round(moderatePct) },
    { name: "Critical", value: Math.round(criticalPct) },
  ];

  const recommendations =
    level === "critical"
      ? [
          "Seek immediate medical attention or call emergency services.",
          "Do not ignore chest pain or difficulty breathing at rest.",
          "Share these results with a healthcare professional.",
        ]
      : level === "moderate"
        ? [
            "Schedule a consultation with your doctor within 24-48 hours.",
            "Monitor your symptoms closely and note any changes.",
            "Stay hydrated and rest as much as possible.",
          ]
        : [
            "Continue monitoring your symptoms at home.",
            "Maintain good hygiene and healthy habits.",
            "Consult a doctor if symptoms worsen or persist beyond a week.",
          ];

  return { level, score: Math.round(pct), factors, recommendations, distribution };
}
