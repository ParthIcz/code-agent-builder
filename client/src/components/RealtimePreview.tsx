import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Eye,
  EyeOff,
  Smartphone,
  Tablet,
  Monitor,
} from "lucide-react";
import { io, Socket } from "socket.io-client";

interface RealtimePreviewProps {
  projectId?: string;
  previewUrl?: string;
}

export function RealtimePreview({ projectId, previewUrl }: RealtimePreviewProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [viewportSize, setViewportSize] = useState<
    "mobile" | "tablet" | "desktop"
  >("desktop");
  const [refreshKey, setRefreshKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const socketRef = useRef<Socket | null>(null);

  // Initialize Socket.IO connection
  useEffect(() => {
    if (!projectId) return;

    const socket = io("http://localhost:8081");
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to server for real-time updates");
    });

    socket.on("file-updated", ({ projectId: updatedProjectId }) => {
      if (updatedProjectId === projectId) {
        console.log("File updated, refreshing preview...");
        setRefreshKey(prev => prev + 1);
      }
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    return () => {
      socket.disconnect();
    };
  }, [projectId]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    setHasError(false);
    setIsLoading(true);
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
    setErrorMessage("Failed to load preview. Please check your code for errors.");
  };

  const getViewportDimensions = () => {
    switch (viewportSize) {
      case "mobile":
        return { width: "375px", height: "667px" };
      case "tablet":
        return { width: "768px", height: "1024px" };
      default:
        return { width: "100%", height: "100%" };
    }
  };

  const getViewportIcon = () => {
    switch (viewportSize) {
      case "mobile":
        return <Smartphone className="w-4 h-4" />;
      case "tablet":
        return <Tablet className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  if (!projectId && !previewUrl) {
    return (
      <Card className="flex-1 h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Live Preview</CardTitle>
          <Badge variant="secondary" className="text-xs">
            No Project
          </Badge>
        </CardHeader>
        <CardContent className="flex-1 p-6">
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Eye className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">No Project Selected</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Generate a project to see the live preview
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentPreviewUrl = previewUrl || `http://localhost:3001/user-projects/${projectId}/index.html`;

  return (
    <Card className="flex-1 h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <CardTitle className="text-sm font-medium">Live Preview</CardTitle>
          {projectId && (
            <Badge variant="secondary" className="text-xs">
              Real-time
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Select
            value={viewportSize}
            onValueChange={(value: "mobile" | "tablet" | "desktop") =>
              setViewportSize(value)
            }
          >
            <SelectTrigger className="w-[140px] h-8">
              <SelectValue>
                <div className="flex items-center space-x-2">
                  {getViewportIcon()}
                  <span className="capitalize">{viewportSize}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mobile">
                <div className="flex items-center space-x-2">
                  <Smartphone className="w-4 h-4" />
                  <span>Mobile</span>
                </div>
              </SelectItem>
              <SelectItem value="tablet">
                <div className="flex items-center space-x-2">
                  <Tablet className="w-4 h-4" />
                  <span>Tablet</span>
                </div>
              </SelectItem>
              <SelectItem value="desktop">
                <div className="flex items-center space-x-2">
                  <Monitor className="w-4 h-4" />
                  <span>Desktop</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(!isVisible)}
            className="h-8 w-8 p-0"
          >
            {isVisible ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(currentPreviewUrl, "_blank")}
            className="h-8 w-8 p-0"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      {isVisible && (
        <CardContent className="flex-1 p-0 relative">
          {hasError ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <AlertCircle className="w-12 h-12 text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">Preview Error</h3>
              <p className="text-sm text-muted-foreground mb-4">{errorMessage}</p>
              <Button onClick={handleRefresh} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          ) : (
            <div className="h-full relative">
              {isLoading && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Loading preview...</span>
                  </div>
                </div>
              )}
              
              <div 
                className="h-full flex items-center justify-center bg-gray-100 dark:bg-gray-900"
                style={{
                  padding: viewportSize !== "desktop" ? "20px" : "0"
                }}
              >
                <iframe
                  key={refreshKey}
                  ref={iframeRef}
                  src={currentPreviewUrl}
                  onLoad={handleIframeLoad}
                  onError={handleIframeError}
                  className="border-0 bg-white dark:bg-gray-800"
                  style={{
                    ...getViewportDimensions(),
                    maxWidth: "100%",
                    maxHeight: "100%",
                    borderRadius: viewportSize !== "desktop" ? "8px" : "0",
                    boxShadow: viewportSize !== "desktop" ? "0 4px 20px rgba(0,0,0,0.1)" : "none"
                  }}
                  title="Live Preview"
                />
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
