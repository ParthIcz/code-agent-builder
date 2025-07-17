import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, FileText, Calendar, Sparkles } from "lucide-react";

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      {/* Premium Background */}
      <div className="absolute inset-0 hero-gradient opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />

      {/* Animated gradient orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 premium-gradient rounded-full opacity-10 blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 premium-gradient rounded-full opacity-8 blur-3xl animate-pulse delay-1000" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl glow-gradient border border-purple-500/30 shadow-2xl">
                <Sparkles className="h-6 w-6 text-white animate-pulse-glow" />
              </div>
              <div>
                <h1 className="text-xl font-bold glow-gradient bg-clip-text text-transparent">
                  AI Code Builder
                </h1>
                <p className="text-xs text-gray-300">Premium AI Platform</p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="text-gray-300 hover:text-white border-white/20 hover:border-white/40"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full luxury-gradient border border-purple-400/30 mb-6 shadow-xl">
              <FileText className="h-5 w-5 text-purple-300" />
              <span className="text-sm font-medium text-purple-100">
                Legal Documentation
              </span>
            </div>

            <h1 className="text-4xl font-bold text-white mb-4">
              Terms of Service
            </h1>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Please read these terms carefully before using our premium AI
              development platform.
            </p>
          </div>

          {/* Terms Content */}
          <Card className="expensive-gradient border border-purple-500/30 shadow-2xl backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-300" />
                Terms of Service Agreement
              </CardTitle>
              <div className="flex items-center gap-2 text-purple-200 text-sm">
                <Calendar className="h-4 w-4" />
                Last updated: {new Date().toLocaleDateString()}
              </div>
            </CardHeader>

            <CardContent className="space-y-8 text-purple-100">
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  1. Acceptance of Terms
                </h2>
                <p className="text-purple-200 leading-relaxed">
                  By accessing and using AI Code Builder ("Service"), you accept
                  and agree to be bound by the terms and provision of this
                  agreement. If you do not agree to abide by the above, please
                  do not use this service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  2. Service Description
                </h2>
                <p className="text-purple-200 leading-relaxed mb-4">
                  AI Code Builder is a premium AI-powered development platform
                  that provides:
                </p>
                <ul className="list-disc list-inside text-purple-200 space-y-2 ml-4">
                  <li>AI-generated code and applications</li>
                  <li>Premium development tools and features</li>
                  <li>Real-time collaboration capabilities</li>
                  <li>Advanced code editing and preview functionality</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  3. User Accounts
                </h2>
                <p className="text-purple-200 leading-relaxed mb-4">
                  To access premium features, you must create an account. You
                  are responsible for:
                </p>
                <ul className="list-disc list-inside text-purple-200 space-y-2 ml-4">
                  <li>
                    Maintaining the confidentiality of your account credentials
                  </li>
                  <li>All activities that occur under your account</li>
                  <li>Providing accurate and complete information</li>
                  <li>Notifying us immediately of any unauthorized use</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  4. Acceptable Use
                </h2>
                <p className="text-purple-200 leading-relaxed mb-4">
                  You agree not to use the Service to:
                </p>
                <ul className="list-disc list-inside text-purple-200 space-y-2 ml-4">
                  <li>Generate malicious, harmful, or illegal code</li>
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe on intellectual property rights</li>
                  <li>Attempt to reverse engineer or compromise our systems</li>
                  <li>Share your account credentials with others</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  5. Intellectual Property
                </h2>
                <p className="text-purple-200 leading-relaxed">
                  You retain ownership of code you create using our Service. We
                  retain ownership of our platform, AI models, and underlying
                  technology. Generated code is provided "as is" and you are
                  responsible for reviewing and validating all generated
                  content.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  6. Privacy and Data
                </h2>
                <p className="text-purple-200 leading-relaxed">
                  Your privacy is important to us. Please review our Privacy
                  Policy to understand how we collect, use, and protect your
                  information. By using our Service, you consent to our data
                  practices as described in our Privacy Policy.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  7. Service Availability
                </h2>
                <p className="text-purple-200 leading-relaxed">
                  We strive to maintain high service availability but cannot
                  guarantee uninterrupted access. We reserve the right to
                  modify, suspend, or discontinue the Service at any time with
                  reasonable notice.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  8. Limitation of Liability
                </h2>
                <p className="text-purple-200 leading-relaxed">
                  The Service is provided "as is" without warranties of any
                  kind. We shall not be liable for any indirect, incidental,
                  special, or consequential damages resulting from your use of
                  the Service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  9. Changes to Terms
                </h2>
                <p className="text-purple-200 leading-relaxed">
                  We reserve the right to modify these terms at any time. We
                  will notify users of significant changes via email or through
                  the Service. Continued use after changes constitutes
                  acceptance of the new terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  10. Contact Information
                </h2>
                <p className="text-purple-200 leading-relaxed">
                  If you have questions about these Terms of Service, please
                  contact us through our support channels or at
                  legal@aicodebuilder.com.
                </p>
              </section>

              <div className="mt-8 p-6 luxury-gradient rounded-xl border border-purple-500/20">
                <p className="text-sm text-purple-200 text-center">
                  By using AI Code Builder, you acknowledge that you have read,
                  understood, and agree to be bound by these Terms of Service.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Terms;
