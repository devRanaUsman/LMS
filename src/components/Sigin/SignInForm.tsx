import { useState } from "react";
// import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
// import { signIn, signUp } from "../../services/authService";
import { cn } from "../../lib/utils";
import { AnimatePresence, motion } from "framer-motion";

export default function SignInForm() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorBanner, setErrorBanner] = useState("");

  // Mutations
  //   const signInMutation = useMutation({
  //     mutationFn: signIn,
  //     onSuccess: () => {
  //       navigate("/home");
  //     },
  //     onError: () => {
  //       setErrorBanner("Invalid phone number or password");
  //     },
  //   });

  //   const signUpMutation = useMutation({
  //     mutationFn: signUp,
  //     onSuccess: () => {
  //       navigate("/home");
  //     },
  //     onError: () => {
  //       setErrorBanner("Signup failed. Try again.");
  //     },
  //   });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorBanner("");
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^\d-]/g, "");
    setFormData((prev) => ({ ...prev, phone: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // MOck Auth Logic
    if (mode === "signin") {
      // Simulate API call
      setTimeout(() => {
        if (formData.phone && formData.password) {
          localStorage.setItem("user", JSON.stringify({
            name: "Admin User",
            phone: formData.phone,
            role: "MAIN_AUTHORITY" // Default to Super Admin for testing
          }));
          navigate("/");
        } else {
          setErrorBanner("Invalid credentials");
          setIsLoading(false);
        }
      }, 500);

    } else {
      if (formData.password !== formData.confirmPassword) {
        setErrorBanner("Passwords do not match");
        setIsLoading(false);
        return;
      }
      // Simulate Signup
      setTimeout(() => {
        localStorage.setItem("user", JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          role: "TICKETLY_ADMIN"
        }));
        navigate("/");
      }, 500);
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground overflow-hidden">
      {/* Left Decoration Panel */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-slate-900 to-blue-900 relative flex-col justify-center p-16 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(0,0,0,0.5),transparent_40%)] pointer-events-none" />

        <div className="mb-6 bg-black/60 w-20 h-20 rounded-2xl grid place-items-center backdrop-blur-md border border-white/5 shadow-2xl">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2l8.5 4.8v10.4L12 22l-8.5-4.8V6.8L12 2z"
              stroke="white"
              strokeWidth="1.5"
            />
            <path
              d="M12 7.2v9.6M7.8 9.3l8.4 5.4"
              stroke="white"
              strokeWidth="1.5"
              opacity="0.85"
            />
          </svg>
        </div>

        <div className="relative z-10">
          <h1 className="text-5xl font-extrabold mb-4 tracking-tight leading-tight">Ticketly.</h1>
          <p className="text-lg opacity-80 max-w-md leading-relaxed">Secure access to your admin dashboard.</p>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center p-10 bg-background relative overflow-hidden">
        <motion.div
          className="w-full max-w-md space-y-8"
          layout
          transition={{ type: "spring", stiffness: 150, damping: 10 }}
        >
          <div className="mb-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-3xl font-bold tracking-tight text-foreground">{mode === "signin" ? "Welcome Back" : "Create Account"}</h2>
                <p className="mt-2 text-muted-foreground text-sm">
                  {mode === "signin"
                    ? "Please sign in to continue"
                    : "Enter your details to get started"}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="inline-flex bg-muted p-1 rounded-xl mb-8 relative">
            {/* Moving background pill */}
            <motion.div
              className="absolute inset-y-1 rounded-lg bg-background shadow-sm"
              layoutId="tab-pill"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              style={{
                left: mode === "signin" ? '4px' : '50%',
                width: 'calc(50% - 4px)',
              }}
            />
            <button
              onClick={() => setMode("signin")}
              className={cn(
                "relative z-10 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 w-1/2 text-center",
                mode === "signin"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode("signup")}
              className={cn(
                "relative z-10 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 w-50 text-center",
                mode === "signup"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Sign Up
            </button>
          </div>

          {errorBanner && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-6 overflow-hidden"
            >
              {errorBanner}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="popLayout">
              {mode === "signup" && (
                <motion.div
                  initial={{ opacity: 0, y: -20, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -20, height: 0 }}
                  className="space-y-2 overflow-hidden p-1"
                  key="name-field"
                >
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </motion.div>
              )}

              <motion.div key="phone-field" layout className="space-y-2 p-1">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  inputMode="numeric"
                  placeholder="03XXXXXXXXX"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  required
                />
              </motion.div>

              <motion.div key="password-field" layout className="space-y-2 p-1">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </motion.div>

              {mode === "signup" && (
                <motion.div
                  initial={{ opacity: 0, y: -20, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -20, height: 0 }}
                  className="space-y-2 overflow-hidden p-1"
                  key="confirm-password-field"
                >
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      placeholder="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground hover:text-foreground"
                      onClick={() => setShowConfirm(!showConfirm)}
                    >
                      {showConfirm ? "Hide" : "Show"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between text-sm pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                <input type="checkbox" className="w-4 h-4 rounded border-input text-primary focus:ring-primary/20 accent-primary" defaultChecked />
                Remember me
              </label>
              <a href="#" onClick={e => e.preventDefault()} className="text-primary hover:underline font-medium hover:text-primary/80 transition-colors">Forgot Password?</a>
            </div>

            <Button
              type="submit"
              className="w-full relative overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:-translate-y-0.5 active:translate-y-0"
              size="lg"
              disabled={isLoading}
              isLoading={isLoading}
            >
              <div className="absolute inset-0 bg-black/10 opacity-0 hover:opacity-100 transition-opacity" />
              {mode === "signin" ? "Sign In" : "Create Account"}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
