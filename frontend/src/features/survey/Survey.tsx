import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, HeartPulse, Send, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast"; // Ensure this import exists
import { type SurveyData } from "@/features/triage/triage";

const Survey = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<Partial<SurveyData>>({
    age: 30,
    gender: "",
    symptomDuration: "",
    symptoms: "",
    hasFever: false,
    hasCough: false,
    hasBreathingDifficulty: false,
    hasChestPain: false,
    painLevel: 0,
  });

  // --- LOGIC HELPER ---
  const needsFeverFollowUp = data.hasFever;
  const needsPainFollowUp = (data.painLevel ?? 0) >= 4;
  const needsBreathingFollowUp = data.hasBreathingDifficulty;
  const needsCoughFollowUp = data.hasCough;
  const hasFollowUps = needsFeverFollowUp || needsPainFollowUp || needsBreathingFollowUp || needsCoughFollowUp;

  const totalSteps = hasFollowUps ? 4 : 3;
  const progressValue = ((step + 1) / totalSteps) * 100;

  const update = (field: string, value: any) => setData((prev) => ({ ...prev, [field]: value }));

  // --- BACKEND INTEGRATION (STEP 3) ---
  const handleSubmit = async () => {
    setIsSubmitting(true);

    // Combine manual text and checkboxes into a single string for the ML model
    const checkboxSymptomList = [
      data.hasFever ? "fever" : "",
      data.hasCough ? "cough" : "",
      data.hasBreathingDifficulty ? "difficulty breathing" : "",
      data.hasChestPain ? "chest pain" : "",
    ].filter(Boolean).join(", ");

    const formattedSymptoms = `${data.symptoms}. Specific signs: ${checkboxSymptomList}. Pain: ${data.painLevel}/10.`;

    try {
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms: formattedSymptoms }),
      });

      const result = await response.json();

      if (response.ok) {
        // Save the AI result and the survey answers to localStorage
        localStorage.setItem("triage_result", JSON.stringify(result));
        localStorage.setItem("triage_answers", JSON.stringify(data));

        toast({
          title: `Triage Result: ${result.status}`,
          description: `Assessment complete with ${result.confidence}% confidence.`,
          variant: result.status === "Critical" ? "destructive" : "default",
        });

        navigate("/results");
      } else {
        throw new Error(result.error || "Model prediction failed");
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Could not reach the AI backend. Is app.py running?",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- NAVIGATION LOGIC ---
  const canNext = () => {
    if (step === 0) return data.gender && data.symptomDuration;
    if (step === 1) return data.symptoms && data.symptoms.length > 5;
    return true;
  };

  const [direction, setDirection] = useState(1);
  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  };

  const goNext = () => {
    if (step === 1 && !hasFollowUps) {
      setDirection(1);
      setStep(totalSteps - 1);
      return;
    }
    setDirection(1);
    setStep((s) => Math.min(s + 1, totalSteps - 1));
  };

  const goBack = () => {
    if (step === totalSteps - 1 && !hasFollowUps) {
      setDirection(-1);
      setStep(1);
      return;
    }
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  };

  return (
    <div className="min-h-screen bg-[#f0fdf4] p-4 relative overflow-hidden">
      {/* Healing Green background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/30 via-transparent to-teal-100/30 blur-3xl" />
      
      <div className="container mx-auto max-w-2xl pt-8 relative z-10">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="hover:bg-emerald-100">
            <ArrowLeft className="w-5 h-5 text-emerald-700" />
          </Button>
          <HeartPulse className="w-6 h-6 text-emerald-600" />
          <span className="font-bold text-lg text-emerald-900">MediTriage Assessment</span>
        </div>

        <div className="mb-8">
          <div className="flex justify-between text-sm text-emerald-700/60 mb-2">
            <span>Step {step + 1} of {totalSteps}</span>
            <span>{Math.round(progressValue)}%</span>
          </div>
          <Progress value={progressValue} className="h-2 bg-emerald-100" />
        </div>

        <AnimatePresence mode="wait" custom={direction}>
          {/* STEP 0: BASIC INFO */}
          {step === 0 && (
            <motion.div key="step0" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
              <Card className="bg-white/70 backdrop-blur-xl border-emerald-100">
                <CardHeader><CardTitle className="text-emerald-900">Basic Information</CardTitle></CardHeader>
                <CardContent className="space-y-6 text-emerald-800">
                  <div className="space-y-2">
                    <Label>Age: {data.age}</Label>
                    <Slider value={[data.age || 30]} onValueChange={([v]) => update("age", v)} min={1} max={100} step={1} className="py-4" />
                  </div>
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <RadioGroup value={data.gender} onValueChange={(v) => update("gender", v)} className="grid grid-cols-3 gap-4">
                      {["Male", "Female", "Other"].map((g) => (
                        <div key={g} className="flex items-center space-x-2 bg-white/50 p-2 rounded-lg border border-emerald-50 border-transparent transition-all">
                          <RadioGroupItem value={g.toLowerCase()} id={g} className="text-emerald-600 border-emerald-300" />
                          <Label htmlFor={g} className="cursor-pointer">{g}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                  <div className="space-y-2">
                    <Label>How long have you had symptoms?</Label>
                    <Select value={data.symptomDuration} onValueChange={(v) => update("symptomDuration", v)}>
                      <SelectTrigger className="bg-white/50 border-emerald-100"><SelectValue placeholder="Select duration" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="today">Just today</SelectItem>
                        <SelectItem value="few_days">A few days</SelectItem>
                        <SelectItem value="more_than_week">More than a week</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* STEP 1: SYMPTOMS */}
          {step === 1 && (
            <motion.div key="step1" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
              <Card className="bg-white/70 backdrop-blur-xl border-emerald-100">
                <CardHeader><CardTitle className="text-emerald-900">Describe Your Symptoms</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-emerald-800">What are you feeling? (AI will analyze this text)</Label>
                    <Textarea 
                      placeholder="E.g., I've had chest pain and a wet cough for two days..." 
                      value={data.symptoms} 
                      onChange={(e) => update("symptoms", e.target.value)} 
                      className="min-h-[120px] bg-white/50 border-emerald-100 focus:ring-emerald-500" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { key: "hasFever", label: "Fever" },
                      { key: "hasCough", label: "Cough" },
                      { key: "hasBreathingDifficulty", label: "Shortness of Breath" },
                      { key: "hasChestPain", label: "Chest Pain" },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center space-x-3 p-3 rounded-lg bg-emerald-50/50 border border-emerald-100/50">
                        <Checkbox checked={(data as any)[item.key]} onCheckedChange={(v) => update(item.key, !!v)} className="border-emerald-300 data-[state=checked]:bg-emerald-600" />
                        <Label className="text-emerald-900 cursor-pointer">{item.label}</Label>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-emerald-800">Pain Level: {data.painLevel}/10</Label>
                    <Slider value={[data.painLevel || 0]} onValueChange={([v]) => update("painLevel", v)} min={0} max={10} step={1} />
                    <div className="flex justify-between text-xs text-emerald-600/70">
                      <span>Mild</span><span>Severe</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* STEP 2: FOLLOW-UP (CONDITIONAL) */}
          {step === 2 && hasFollowUps && (
            <motion.div key="step2" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
              <Card className="bg-white/70 backdrop-blur-xl border-emerald-100 max-h-[60vh] overflow-y-auto">
                <CardHeader><CardTitle className="text-emerald-900">Follow-Up Details</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  {needsFeverFollowUp && (
                    <div className="space-y-4 p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
                      <Label className="text-emerald-900 font-bold">Fever Details</Label>
                      <Select value={data.feverSeverity} onValueChange={(v) => update("feverSeverity", v)}>
                        <SelectTrigger className="bg-white/50 border-emerald-100"><SelectValue placeholder="Severity" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low-grade</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {needsPainFollowUp && (
                    <div className="space-y-4 p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
                      <Label className="text-emerald-900 font-bold">Pain Location</Label>
                      <Input placeholder="E.g., chest, lower back" value={data.painLocation || ""} onChange={(e) => update("painLocation", e.target.value)} className="bg-white/50 border-emerald-100" />
                    </div>
                  )}
                  {/* ... Keep other follow-ups with the emerald style ... */}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* FINAL STEP: REVIEW */}
          {step === totalSteps - 1 && (
            <motion.div key="review" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
              <Card className="bg-white/70 backdrop-blur-xl border-emerald-100">
                <CardHeader><CardTitle className="text-emerald-900">AI Triage Summary</CardTitle></CardHeader>
                <CardContent className="space-y-4 text-emerald-800">
                  <p className="text-sm">Ready for AI analysis. We will compare your symptoms against our medical triage model.</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-3 rounded-lg bg-emerald-50/50"><span className="text-emerald-600 block text-xs">Age</span><p className="font-semibold">{data.age}</p></div>
                    <div className="p-3 rounded-lg bg-emerald-50/50"><span className="text-emerald-600 block text-xs">Pain</span><p className="font-semibold">{data.painLevel}/10</p></div>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-50/50 text-sm">
                    <span className="text-emerald-600 block text-xs mb-1">Key Symptoms</span>
                    <p>{data.symptoms || "No description provided."}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-between mt-8 pb-8">
          <Button variant="outline" onClick={goBack} disabled={step === 0} className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
            <ArrowLeft className="w-4 h-4 mr-2" /> Previous
          </Button>
          
          {step < totalSteps - 1 ? (
            <Button onClick={goNext} disabled={!canNext()} className="bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200 shadow-lg">
              Next <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200 shadow-lg gap-2">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Analyze Symptoms
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Survey;