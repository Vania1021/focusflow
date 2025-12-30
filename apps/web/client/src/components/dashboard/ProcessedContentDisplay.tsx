import { useEffect, useState } from "react";
import { useContentOutputStore } from "@/store/useContentOutput";
import { useUploadStore } from "@/store/useUploadStore";
import { Loader2, FileText, CheckCircle2 } from "lucide-react";
import axios from "axios";

export const ProcessedContentDisplay = () => {
  const { contentId, getContentOutputById } = useContentOutputStore();
  const { getBlobContent } = useUploadStore();
  
  const [status, setStatus] = useState<string>("IDLE");
  const [processedText, setProcessedText] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const checkStatus = async () => {
      if (!contentId) return;
      
      try {
        const output = await getContentOutputById(contentId);
        setStatus(output.status);

        if (output.status === "READY" && output.processed) {
          clearInterval(intervalId);
          setIsLoading(true);
          
          try {
            // Fetch content via backend proxy to avoid CORS
            const text = await getBlobContent("text", output.processed.blobName);
            setProcessedText(text);
          } catch (err) {
            console.error("Failed to fetch processed content", err);
          } finally {
            setIsLoading(false);
          }

        } else if (output.status === "FAILED") {
          clearInterval(intervalId);
        }
      } catch (error) {
        console.error("Error checking status:", error);
      }
    };

    if (contentId) {
      // Check immediately then poll
      checkStatus();
      intervalId = setInterval(checkStatus, 2000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [contentId, getContentOutputById, getBlobContent]);

  if (!contentId || status === "IDLE") return null;

  return (
    <div className="glass-card p-6 animate-fade-in space-y-4 border-l-4 border-primary/50">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg font-bold flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Processed Content
        </h3>
        <div className="text-xs font-bold px-3 py-1 rounded-full bg-muted">
            {status === "UPLOADED" && <span className="flex items-center gap-1 text-blue-500"><Loader2 className="w-3 h-3 animate-spin"/> Processing...</span>}
            {status === "READY" && <span className="flex items-center gap-1 text-green-600"><CheckCircle2 className="w-3 h-3"/> Ready</span>}
            {status === "FAILED" && <span className="text-destructive">Failed</span>}
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          Fetching content...
        </div>
      )}

      {processedText && (
        <div className="max-h-60 overflow-y-auto p-4 bg-muted/30 rounded-lg text-sm leading-relaxed whitespace-pre-wrap font-mono">
          {processedText}
        </div>
      )}
    </div>
  );
};
