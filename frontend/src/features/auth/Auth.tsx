import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HeartPulse, Mail, Lock, User, Eye, EyeOff, Circle } from "lucide-react";
import { signIn, signUp } from "@/features/auth/authApi";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// --- SUB-COMPONENT: ELEGANT SHAPE (Refactored for Green Wellness) ---
function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = "from-emerald-200/20",
}: {
  className?: string;
  delay?: number;
  width?: number;
  height?: number;
  rotate?: number;
  gradient?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -150, rotate: rotate - 15 }}
      animate={{ opacity: 1, y: 0, rotate: rotate }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
        opacity: { duration: 1.2 },
      }}
      className={cn("absolute", className)}
    >
      <motion.div
        animate={{ y: [0, 25, 0] }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ width, height }}
        className="relative"
      >
        <div
          className={cn(
            "absolute inset-0 rounded-full",
            "bg-gradient-to-r to-transparent",
            gradient,
            "backdrop-blur-[2px] border-2 border-emerald-100/30",
            "shadow-[0_8px_32px_0_rgba(16,185,129,0.1)]"
          )}
        />
      </motion.div>
    </motion.div>
  );
}

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        await signUp(name, email, password);
        toast({ title: "Welcome!", description: "Account created successfully." });
        navigate("/");
      } else {
        const user = await signIn(email, password);
        if (!user) return toast({ title: "Error", description: "Invalid credentials", variant: "destructive" });
        navigate("/");
      }
    } catch (error) {
      toast({ title: "Error", description: "Authentication failed.", variant: "destructive" });
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#f0fdf4]">
      {/* --- BACKGROUND GRADIENTS --- */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/40 via-transparent to-teal-100/40 blur-3xl" />
      
      {/* --- FLOATING GEOMETRIC SHAPES --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <ElegantShape
          delay={0.3}
          width={600}
          height={140}
          rotate={12}
          gradient="from-emerald-500/[0.08]"
          className="left-[-10%] top-[15%]"
        />
        <ElegantShape
          delay={0.5}
          width={500}
          height={120}
          rotate={-15}
          gradient="from-teal-400/[0.08]"
          className="right-[-5%] top-[70%]"
        />
        <ElegantShape
          delay={0.4}
          width={300}
          height={80}
          rotate={-8}
          gradient="from-lime-400/[0.08]"
          className="left-[5%] bottom-[10%]"
        />
        <ElegantShape
          delay={0.6}
          width={200}
          height={60}
          rotate={20}
          gradient="from-emerald-300/[0.08]"
          className="right-[15%] top-[10%]"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
        className="relative z-10 w-full max-w-md px-4"
      >
        {/* Brand Badge */}
        <div className="flex flex-col items-center mb-8">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/[0.05] border border-emerald-500/10 mb-4"
          >
            <Circle className="h-2 w-2 fill-emerald-500" />
            <span className="text-xs font-medium text-emerald-700 tracking-wider uppercase">Care Collective</span>
          </motion.div>
          <div className="flex items-center gap-3">
            <HeartPulse className="w-10 h-10 text-emerald-600" />
            <span className="text-4xl font-bold tracking-tight text-slate-900">MediTriage</span>
          </div>
        </div>

        <Card className="bg-white/60 backdrop-blur-xl border-emerald-100 shadow-[0_20px_50px_rgba(16,185,129,0.1)]">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold text-slate-800">
              {isSignUp ? "Join Us" : "Welcome Back"}
            </CardTitle>
            <p className="text-slate-500 text-sm">
              {isSignUp ? "Start your health journey today" : "Sign in to your dashboard"}
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {isSignUp && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <Label className="text-slate-700">Full Name</Label>
                    <div className="relative group">
                      <User className="absolute left-3 top-3 h-4 w-4 text-emerald-400 transition-colors group-focus-within:text-emerald-600" />
                      <Input
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10 border-emerald-100 bg-white/40 focus:bg-white transition-all"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <Label className="text-slate-700">Email</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-emerald-400 transition-colors group-focus-within:text-emerald-600" />
                  <Input
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 border-emerald-100 bg-white/40 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700">Password</Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-emerald-400 transition-colors group-focus-within:text-emerald-600" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 border-emerald-100 bg-white/40 focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-emerald-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200" size="lg">
                {isSignUp ? "Create Account" : "Sign In"}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-emerald-100/50 text-center">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors"
              >
                {isSignUp ? (
                  <>Already have an account? <span className="text-emerald-600 underline underline-offset-4">Sign in</span></>
                ) : (
                  <>New to MediTriage? <span className="text-emerald-600 underline underline-offset-4">Sign up for free</span></>
                )}
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Auth;