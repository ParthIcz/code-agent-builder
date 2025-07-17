import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Shield,
  Lock,
  Calendar,
  Sparkles,
  Eye,
  Database,
  UserCheck,
} from "lucide-react";

const Privacy = () => {
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
              <Lock className="h-5 w-5 text-purple-300" />
              <span className="text-sm font-medium text-purple-100">
                Privacy & Security
              </span>
            </div>

            <h1 className="text-4xl font-bold text-white mb-4">
              Privacy Policy
            </h1>
            <p className="text-gray-300 max-w-2xl mx-auto">
              We are committed to protecting your privacy and ensuring the
              security of your personal information.
            </p>
          </div>

          {/* Privacy Content */}
          <Card className="expensive-gradient border border-purple-500/30 shadow-2xl backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-300" />
                Privacy Policy
              </CardTitle>
              <div className="flex items-center gap-2 text-purple-200 text-sm">
                <Calendar className="h-4 w-4" />
                Last updated: {new Date().toLocaleDateString()}
              </div>
            </CardHeader>

            <CardContent className="space-y-8 text-purple-100">
              <section>
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Eye className="h-5 w-5 text-purple-300" />
                  1. Information We Collect
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-white mb-2">
                      Personal Information
                    </h3>
                    <p className="text-purple-200 leading-relaxed mb-2">
                      When you create an account, we collect:
                    </p>
                    <ul className="list-disc list-inside text-purple-200 space-y-1 ml-4">
                      <li>Name and email address</li>
                      <li>Account credentials (securely hashed)</li>
                      <li>Profile preferences and settings</li>
                      <li>Subscription and billing information</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-white mb-2">
                      Usage Information
                    </h3>
                    <p className="text-purple-200 leading-relaxed mb-2">
                      We automatically collect:
                    </p>
                    <ul className="list-disc list-inside text-purple-200 space-y-1 ml-4">
                      <li>Device and browser information</li>
                      <li>IP address and location data</li>
                      <li>Usage patterns and feature interactions</li>
                      <li>Performance and error logs</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Database className="h-5 w-5 text-purple-300" />
                  2. How We Use Your Information
                </h2>
                <p className="text-purple-200 leading-relaxed mb-4">
                  We use your information to:
                </p>
                <ul className="list-disc list-inside text-purple-200 space-y-2 ml-4">
                  <li>Provide and improve our AI development services</li>
                  <li>Personalize your experience and recommendations</li>
                  <li>Process payments and manage subscriptions</li>
                  <li>Send important updates and security notifications</li>
                  <li>Analyze usage patterns to enhance performance</li>
                  <li>Provide customer support and technical assistance</li>
                  <li>Comply with legal obligations and prevent abuse</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  3. Code and Project Data
                </h2>
                <div className="space-y-4">
                  <div className="p-4 luxury-gradient rounded-lg border border-purple-500/20">
                    <h3 className="text-lg font-medium text-white mb-2">
                      Your Code Ownership
                    </h3>
                    <p className="text-purple-200 leading-relaxed">
                      You retain full ownership of all code and projects you
                      create. We do not claim any rights to your intellectual
                      property.
                    </p>
                  </div>

                  <div className="p-4 premium-dark-gradient rounded-lg border border-purple-500/20">
                    <h3 className="text-lg font-medium text-white mb-2">
                      AI Training
                    </h3>
                    <p className="text-purple-200 leading-relaxed">
                      Your code may be used in aggregate and anonymized form to
                      improve our AI models, but never in a way that exposes
                      your specific projects or intellectual property.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  4. Information Sharing
                </h2>
                <p className="text-purple-200 leading-relaxed mb-4">
                  We do not sell your personal information. We may share
                  information only in these limited circumstances:
                </p>
                <ul className="list-disc list-inside text-purple-200 space-y-2 ml-4">
                  <li>
                    <strong>Service Providers:</strong> Trusted partners who
                    help us operate our platform
                  </li>
                  <li>
                    <strong>Legal Requirements:</strong> When required by law or
                    to protect our rights
                  </li>
                  <li>
                    <strong>Business Transfers:</strong> In case of merger or
                    acquisition (with notice)
                  </li>
                  <li>
                    <strong>Consent:</strong> When you explicitly authorize
                    sharing
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Lock className="h-5 w-5 text-purple-300" />
                  5. Data Security
                </h2>
                <p className="text-purple-200 leading-relaxed mb-4">
                  We implement industry-standard security measures:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 luxury-gradient rounded-lg border border-purple-500/20">
                    <h3 className="text-white font-medium mb-2">Encryption</h3>
                    <p className="text-purple-200 text-sm">
                      All data is encrypted in transit and at rest using AES-256
                      encryption.
                    </p>
                  </div>
                  <div className="p-4 luxury-gradient rounded-lg border border-purple-500/20">
                    <h3 className="text-white font-medium mb-2">
                      Access Controls
                    </h3>
                    <p className="text-purple-200 text-sm">
                      Strict access controls and authentication for all systems.
                    </p>
                  </div>
                  <div className="p-4 luxury-gradient rounded-lg border border-purple-500/20">
                    <h3 className="text-white font-medium mb-2">Monitoring</h3>
                    <p className="text-purple-200 text-sm">
                      24/7 security monitoring and incident response procedures.
                    </p>
                  </div>
                  <div className="p-4 luxury-gradient rounded-lg border border-purple-500/20">
                    <h3 className="text-white font-medium mb-2">Compliance</h3>
                    <p className="text-purple-200 text-sm">
                      GDPR and CCPA compliant data handling practices.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-purple-300" />
                  6. Your Rights
                </h2>
                <p className="text-purple-200 leading-relaxed mb-4">
                  You have the right to:
                </p>
                <ul className="list-disc list-inside text-purple-200 space-y-2 ml-4">
                  <li>Access and download your personal data</li>
                  <li>Correct inaccurate or incomplete information</li>
                  <li>Delete your account and associated data</li>
                  <li>Object to certain data processing activities</li>
                  <li>Data portability to other services</li>
                  <li>Withdraw consent for optional data processing</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  7. Cookies and Tracking
                </h2>
                <p className="text-purple-200 leading-relaxed mb-4">
                  We use cookies and similar technologies to:
                </p>
                <ul className="list-disc list-inside text-purple-200 space-y-2 ml-4">
                  <li>Maintain your login session</li>
                  <li>Remember your preferences</li>
                  <li>Analyze usage patterns</li>
                  <li>Improve platform performance</li>
                </ul>
                <p className="text-purple-200 leading-relaxed mt-4">
                  You can control cookie settings through your browser
                  preferences.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  8. Data Retention
                </h2>
                <p className="text-purple-200 leading-relaxed">
                  We retain your information only as long as necessary to
                  provide our services and comply with legal obligations.
                  Account data is deleted within 30 days of account closure,
                  except where longer retention is required by law.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  9. International Transfers
                </h2>
                <p className="text-purple-200 leading-relaxed">
                  Your data may be processed in countries other than your own.
                  We ensure appropriate safeguards are in place for
                  international transfers, including standard contractual
                  clauses and adequacy decisions.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  10. Contact Us
                </h2>
                <p className="text-purple-200 leading-relaxed">
                  If you have questions about this Privacy Policy or want to
                  exercise your rights, contact us at:
                </p>
                <div className="mt-4 p-4 luxury-gradient rounded-lg border border-purple-500/20">
                  <p className="text-purple-200">
                    <strong>Email:</strong> privacy@aicodebuilder.com
                    <br />
                    <strong>Address:</strong> Data Protection Officer, AI Code
                    Builder
                    <br />
                    <strong>Response Time:</strong> We respond to privacy
                    requests within 30 days
                  </p>
                </div>
              </section>

              <div className="mt-8 p-6 glow-gradient rounded-xl border border-purple-500/20">
                <p className="text-sm text-white text-center font-medium">
                  🔒 Your privacy is our priority. We are committed to
                  transparency and protecting your data.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Privacy;
