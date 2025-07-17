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
import { useToast } from "@/hooks/use-toast";
import {
  Sparkles,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Github,
  Chrome,
  ArrowLeft,
  Zap,
  Shield,
  Star,
} from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    toast({
      title: "Welcome back! ✨",
      description: "You've successfully logged into your premium account.",
    });

    setIsLoading(false);
    navigate("/");
  };

  const handleSocialLogin = (provider: string) => {
    toast({
      title: `${provider} Login`,
      description: `Redirecting to ${provider} authentication...`,
    });
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden relative flex items-center justify-center p-2 sm:p-4">
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
        className="absolute top-4 left-4 sm:top-6 sm:left-6 text-gray-300 hover:text-white border-white/20 hover:border-white/40 z-20"
      >
        <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
        <span className="hidden xs:inline">Back to Home</span>
        <span className="xs:hidden">Back</span>
      </Button>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md mx-auto px-2 sm:px-0">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl glow-gradient border border-purple-500/30 shadow-2xl">
              <Sparkles className="h-8 w-8 text-white animate-pulse-glow" />
            </div>
            <div>
              <h1 className="text-2xl font-bold glow-gradient bg-clip-text text-transparent">
                AI Code Builder
              </h1>
              <p className="text-xs text-gray-300">Premium AI Platform</p>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
            <p className="text-gray-300">
              Sign in to your premium account and continue building
              extraordinary applications
            </p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="expensive-gradient border border-purple-500/30 shadow-2xl backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl text-white flex items-center justify-center gap-2">
              <Shield className="h-5 w-5 text-purple-300" />
              Secure Login
            </CardTitle>
            <CardDescription className="text-purple-200">
              Access your premium AI-powered development environment
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Social Login */}
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialLogin("Google")}
                className="w-full h-12 luxury-gradient text-white border-purple-400/30 hover:border-purple-300/50 transition-all"
              >
                <Chrome className="h-5 w-5 mr-3" />
                Continue with Google
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialLogin("GitHub")}
                className="w-full h-12 premium-dark-gradient text-white border-purple-400/30 hover:border-purple-300/50 transition-all"
              >
                <Github className="h-5 w-5 mr-3" />
                Continue with GitHub
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full bg-purple-500/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-4 text-purple-300 font-medium">
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-5">
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
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="h-12 pl-12 luxury-gradient border-purple-400/30 focus:border-purple-300/60 text-white placeholder:text-purple-300/70"
                    required
                  />
                </div>
              </div>

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
                    placeholder="Enter your password"
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
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) =>
                      setRememberMe(checked as boolean)
                    }
                    className="border-purple-400/30 data-[state=checked]:bg-purple-500"
                  />
                  <Label
                    htmlFor="remember"
                    className="text-sm text-purple-200 font-medium cursor-pointer"
                  >
                    Remember me
                  </Label>
                </div>
                <Link
                  to="/forgot-password"
                  className="text-sm text-purple-300 hover:text-white transition-colors font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                disabled={isLoading || !formData.email || !formData.password}
                className="w-full h-12 glow-gradient hover:opacity-90 shadow-xl text-white border-0 font-semibold text-base"
              >
                {isLoading ? (
                  <>
                    <Zap className="h-5 w-5 mr-2 animate-spin" />
                    Signing you in...
                  </>
                ) : (
                  <>
                    <Star className="h-5 w-5 mr-2" />
                    Sign In to Premium
                  </>
                )}
              </Button>
            </form>

            {/* Sign Up Link */}
            <div className="text-center pt-4 border-t border-purple-500/20">
              <p className="text-purple-200">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-purple-300 hover:text-white transition-colors font-semibold"
                >
                  Create Premium Account
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full luxury-gradient border border-purple-400/30 shadow-xl">
            <Sparkles className="h-4 w-4 text-purple-300" />
            <span className="text-sm font-medium text-purple-100">
              Premium features • AI-powered • Enterprise security
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
