import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Sparkles,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Github,
  Chrome,
  ArrowLeft,
  Zap,
  Shield,
  Star,
  Crown,
  Check,
  AlertCircle,
} from "lucide-react";

const SignUp = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(true);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Password strength calculator
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };

    strength = Object.values(checks).filter(Boolean).length;
    return { strength, checks };
  };

  const passwordAnalysis = getPasswordStrength(formData.password);
  const passwordStrengthPercentage = (passwordAnalysis.strength / 5) * 100;

  const getPasswordStrengthLabel = () => {
    if (passwordAnalysis.strength === 0) return "";
    if (passwordAnalysis.strength <= 2) return "Weak";
    if (passwordAnalysis.strength <= 3) return "Fair";
    if (passwordAnalysis.strength <= 4) return "Good";
    return "Excellent";
  };

  const getPasswordStrengthColor = () => {
    if (passwordAnalysis.strength <= 2) return "bg-red-500";
    if (passwordAnalysis.strength <= 3) return "bg-yellow-500";
    if (passwordAnalysis.strength <= 4) return "bg-blue-500";
    return "bg-green-500";
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Password Mismatch",
        description: "Please ensure both passwords match.",
      });
      return;
    }

    if (!acceptTerms) {
      toast({
        variant: "destructive",
        title: "Terms & Conditions",
        description: "Please accept the terms and conditions to continue.",
      });
      return;
    }

    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 3000));

    toast({
      title: "Welcome to Premium! 🎉",
      description:
        "Your account has been created successfully. Welcome to the future of development!",
    });

    setIsLoading(false);
    navigate("/login");
  };

  const handleSocialSignUp = (provider: string) => {
    toast({
      title: `${provider} Sign Up`,
      description: `Redirecting to ${provider} authentication...`,
    });
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden relative flex items-center justify-center p-4">
      {/* Premium Background */}
      <div className="absolute inset-0 hero-gradient opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />

      {/* Animated gradient orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 premium-gradient rounded-full opacity-10 blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 premium-gradient rounded-full opacity-8 blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 glow-gradient rounded-full opacity-5 blur-3xl animate-pulse delay-500" />

      {/* Back to Home Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 text-gray-300 hover:text-white border-white/20 hover:border-white/40 z-20"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Home
      </Button>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl glow-gradient border border-purple-500/30 shadow-2xl">
              <Crown className="h-8 w-8 text-white animate-pulse-glow" />
            </div>
            <div>
              <h1 className="text-2xl font-bold glow-gradient bg-clip-text text-transparent">
                AI Code Builder
              </h1>
              <p className="text-xs text-gray-300">Premium AI Platform</p>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-white">Join the Elite</h2>
            <p className="text-gray-300">
              Create your premium account and unlock unlimited AI-powered
              development
            </p>
          </div>
        </div>

        {/* Sign Up Card */}
        <Card className="expensive-gradient border border-purple-500/30 shadow-2xl backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl text-white flex items-center justify-center gap-2">
              <Star className="h-5 w-5 text-purple-300" />
              Premium Account
            </CardTitle>
            <CardDescription className="text-purple-200">
              Join thousands of developers building the future
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Premium Features Banner */}
            <div className="luxury-gradient rounded-xl p-4 border border-purple-500/20">
              <div className="flex items-center gap-2 mb-3">
                <Crown className="h-5 w-5 text-purple-300" />
                <span className="text-sm font-semibold text-purple-100">
                  Premium Benefits
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1 text-purple-200">
                  <Check className="h-3 w-3 text-green-400" />
                  Unlimited AI generations
                </div>
                <div className="flex items-center gap-1 text-purple-200">
                  <Check className="h-3 w-3 text-green-400" />
                  Premium components
                </div>
                <div className="flex items-center gap-1 text-purple-200">
                  <Check className="h-3 w-3 text-green-400" />
                  Priority support
                </div>
                <div className="flex items-center gap-1 text-purple-200">
                  <Check className="h-3 w-3 text-green-400" />
                  Advanced features
                </div>
              </div>
            </div>

            {/* Social Sign Up */}
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialSignUp("Google")}
                className="w-full h-12 luxury-gradient text-white border-purple-400/30 hover:border-purple-300/50 transition-all"
              >
                <Chrome className="h-5 w-5 mr-3" />
                Sign up with Google
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialSignUp("GitHub")}
                className="w-full h-12 premium-dark-gradient text-white border-purple-400/30 hover:border-purple-300/50 transition-all"
              >
                <Github className="h-5 w-5 mr-3" />
                Sign up with GitHub
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full bg-purple-500/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-4 text-purple-300 font-medium">
                  Or create account
                </span>
              </div>
            </div>

            {/* Sign Up Form */}
            <form onSubmit={handleSignUp} className="space-y-5">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="firstName"
                    className="text-purple-200 font-medium"
                  >
                    First Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-purple-300" />
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="h-12 pl-12 luxury-gradient border-purple-400/30 focus:border-purple-300/60 text-white placeholder:text-purple-300/70"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="lastName"
                    className="text-purple-200 font-medium"
                  >
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="h-12 luxury-gradient border-purple-400/30 focus:border-purple-300/60 text-white placeholder:text-purple-300/70"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-purple-200 font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-purple-300" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="h-12 pl-12 luxury-gradient border-purple-400/30 focus:border-purple-300/60 text-white placeholder:text-purple-300/70"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-purple-200 font-medium"
                >
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-purple-300" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create strong password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="h-12 pl-12 pr-12 luxury-gradient border-purple-400/30 focus:border-purple-300/60 text-white placeholder:text-purple-300/70"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-1 top-1 h-10 w-10 text-purple-300 hover:text-white"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Password Strength */}
                {formData.password && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-purple-300">
                        Password strength
                      </span>
                      <span className="text-xs text-purple-200">
                        {getPasswordStrengthLabel()}
                      </span>
                    </div>
                    <Progress
                      value={passwordStrengthPercentage}
                      className="h-2"
                    />
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div
                        className={`flex items-center gap-1 ${passwordAnalysis.checks.length ? "text-green-400" : "text-purple-400"}`}
                      >
                        {passwordAnalysis.checks.length ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <AlertCircle className="h-3 w-3" />
                        )}
                        8+ characters
                      </div>
                      <div
                        className={`flex items-center gap-1 ${passwordAnalysis.checks.uppercase ? "text-green-400" : "text-purple-400"}`}
                      >
                        {passwordAnalysis.checks.uppercase ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <AlertCircle className="h-3 w-3" />
                        )}
                        Uppercase
                      </div>
                      <div
                        className={`flex items-center gap-1 ${passwordAnalysis.checks.number ? "text-green-400" : "text-purple-400"}`}
                      >
                        {passwordAnalysis.checks.number ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <AlertCircle className="h-3 w-3" />
                        )}
                        Number
                      </div>
                      <div
                        className={`flex items-center gap-1 ${passwordAnalysis.checks.special ? "text-green-400" : "text-purple-400"}`}
                      >
                        {passwordAnalysis.checks.special ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <AlertCircle className="h-3 w-3" />
                        )}
                        Special char
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-purple-200 font-medium"
                >
                  Confirm Password
                </Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-3 h-5 w-5 text-purple-300" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="h-12 pl-12 pr-12 luxury-gradient border-purple-400/30 focus:border-purple-300/60 text-white placeholder:text-purple-300/70"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-1 top-1 h-10 w-10 text-purple-300 hover:text-white"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {formData.confirmPassword &&
                  formData.password !== formData.confirmPassword && (
                    <p className="text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Passwords do not match
                    </p>
                  )}
              </div>

              {/* Terms and Newsletter */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="terms"
                    checked={acceptTerms}
                    onCheckedChange={(checked) =>
                      setAcceptTerms(checked as boolean)
                    }
                    className="border-purple-400/30 data-[state=checked]:bg-purple-500 mt-1"
                  />
                  <Label
                    htmlFor="terms"
                    className="text-sm text-purple-200 font-medium cursor-pointer leading-relaxed"
                  >
                    I agree to the{" "}
                    <Link
                      to="/terms"
                      className="text-purple-300 hover:text-white underline"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      to="/privacy"
                      className="text-purple-300 hover:text-white underline"
                    >
                      Privacy Policy
                    </Link>
                  </Label>
                </div>

                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="newsletter"
                    checked={subscribeNewsletter}
                    onCheckedChange={(checked) =>
                      setSubscribeNewsletter(checked as boolean)
                    }
                    className="border-purple-400/30 data-[state=checked]:bg-purple-500"
                  />
                  <Label
                    htmlFor="newsletter"
                    className="text-sm text-purple-200 font-medium cursor-pointer"
                  >
                    Subscribe to premium updates and exclusive features
                  </Label>
                </div>
              </div>

              {/* Sign Up Button */}
              <Button
                type="submit"
                disabled={
                  isLoading ||
                  !acceptTerms ||
                  !formData.email ||
                  !formData.password ||
                  formData.password !== formData.confirmPassword
                }
                className="w-full h-12 glow-gradient hover:opacity-90 shadow-xl text-white border-0 font-semibold text-base"
              >
                {isLoading ? (
                  <>
                    <Zap className="h-5 w-5 mr-2 animate-spin" />
                    Creating your premium account...
                  </>
                ) : (
                  <>
                    <Crown className="h-5 w-5 mr-2" />
                    Create Premium Account
                  </>
                )}
              </Button>
            </form>

            {/* Login Link */}
            <div className="text-center pt-4 border-t border-purple-500/20">
              <p className="text-purple-200">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-purple-300 hover:text-white transition-colors font-semibold"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Trust Badges */}
        <div className="mt-8 flex justify-center gap-4">
          <Badge
            variant="secondary"
            className="luxury-gradient text-white border-0"
          >
            <Shield className="h-3 w-3 mr-1" />
            Secure
          </Badge>
          <Badge
            variant="secondary"
            className="expensive-gradient text-white border-0"
          >
            <Star className="h-3 w-3 mr-1" />
            Trusted
          </Badge>
          <Badge
            variant="secondary"
            className="glow-gradient text-white border-0"
          >
            <Crown className="h-3 w-3 mr-1" />
            Premium
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
