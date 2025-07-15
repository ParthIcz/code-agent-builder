import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Code, Sparkles, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <Sparkles className="h-16 w-16 mx-auto mb-4 text-primary animate-pulse-glow" />
          <h1 className="text-6xl font-bold mb-4 premium-gradient bg-clip-text text-transparent">
            AI Code Builder
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Build beautiful web applications with AI-powered code generation
          </p>
        </div>
        
        <Card className="card-gradient shadow-premium mb-8">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <Code className="h-12 w-12 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-2">Live Code Editor</h3>
                <p className="text-sm text-muted-foreground">
                  Edit code with syntax highlighting and real-time preview
                </p>
              </div>
              <div className="text-center">
                <Sparkles className="h-12 w-12 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-2">AI Assistant</h3>
                <p className="text-sm text-muted-foreground">
                  Chat with AI to generate and modify your code
                </p>
              </div>
              <div className="text-center">
                <Zap className="h-12 w-12 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-2">Instant Preview</h3>
                <p className="text-sm text-muted-foreground">
                  See changes instantly with live preview
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Button 
          size="lg" 
          className="premium-gradient shadow-glow"
          onClick={() => navigate('/editor')}
        >
          Start Building
        </Button>
      </div>
    </div>
  );
};

export default Index;
