import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Star, HeartPulse, ArrowLeft, Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Feedback = () => {
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast({ title: "Please select a rating", variant: "destructive" });
      return;
    }

    const feedback = { rating, comment, timestamp: new Date().toISOString() };
    const existing = JSON.parse(localStorage.getItem("triage_feedback") || "[]");
    existing.push(feedback);
    localStorage.setItem("triage_feedback", JSON.stringify(existing));

    toast({ title: "Thank you!", description: "Your feedback has been submitted." });
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background p-4">
      <div className="container mx-auto max-w-lg pt-8">
        <div className="flex items-center gap-2 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/results")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <HeartPulse className="w-6 h-6 text-primary" />
          <span className="font-bold text-lg text-foreground">Feedback</span>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Rate Your Experience</CardTitle>
              <CardDescription>Help us improve this triage system</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label>Rating</Label>
                  <div className="flex gap-2 justify-center py-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoveredStar(star)}
                        onMouseLeave={() => setHoveredStar(0)}
                        onClick={() => setRating(star)}
                        className="transition-transform hover:scale-125"
                      >
                        <Star
                          className="w-10 h-10"
                          fill={star <= (hoveredStar || rating) ? "hsl(var(--primary))" : "transparent"}
                          stroke="hsl(var(--primary))"
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Comments (optional)</Label>
                  <Textarea placeholder="Tell us about your experience..." value={comment} onChange={(e) => setComment(e.target.value)} className="min-h-[120px]" />
                </div>
                <Button type="submit" className="w-full gap-2" size="lg">
                  <Send className="w-4 h-4" /> Submit Feedback
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Feedback;
