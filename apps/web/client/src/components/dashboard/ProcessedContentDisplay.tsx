import { useEffect, useState } from "react";
import { Loader2, FileText, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useContentOutputStore } from "@/store/useContentOutput";
import { useUploadStore } from "@/store/useUploadStore";
import { useStudyStore } from "@/store/useStudyTemp";
import { contentToPlainText} from "@/store/previewAdapter";
import { OutputPreviewModal } from "./previewmodel";
import { detectOutputStyle } from "@/store/outputStyleDetector";
// Renderers
import { SummaryRenderer } from "./summaryrender";
import { VisualRenderer } from "./visualrender";
import { FlowchartRenderer } from "./flowchartrender";
import { FlashcardsRenderer } from "./flashcardrender";

type OutputStyle = "summary" | "visual" | "flowchart" | "flashcards";

export const ProcessedContentDisplay = () => {
  const { currentContentId } = useStudyStore();
  const { getContentOutputById } = useContentOutputStore();
  const { getBlobContent } = useUploadStore();

  const [status, setStatus] = useState<string>("IDLE");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [outputStyle, setOutputStyle] = useState<OutputStyle | null>(null);
  const [processedData, setProcessedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  /* ---------------- POLLING ---------------- */
  useEffect(() => {
    // 🔥 Reset state when contentId changes to avoid showing stale data
    console.log("[ProcessedContentDisplay] resetting state for new contentId:", currentContentId);
    setStatus("IDLE");
    setErrorMessage(null);
    setProcessedData(null);
    setOutputStyle(null);

    if (!currentContentId) return;

    let interval: NodeJS.Timeout;

    const poll = async () => {
      console.log("[ProcessedContentDisplay] Polling for", currentContentId); 
      try {
        const output = await getContentOutputById(currentContentId);
        if (!output) return;

        console.log("[ProcessedContentDisplay] Polling for", output);

        setStatus(output.status);

        if (output.status === "FAILED") {
          clearInterval(interval);
          setErrorMessage(output.error || "An unknown error occurred during processing.");
        }

        if (output.status === "READY") {
          clearInterval(interval);
          setErrorMessage(null);

          // ... rest of the logic
          let data: any=null;
          if (output.processed.blobName) {
            data = await getBlobContent("text", output.processed.blobName);
          } else if (output.processedData) {
            data=output.processedData;
          }
          
          if (data) {
            setProcessedData(data);
            const detectedStyle = detectOutputStyle(data);
            setOutputStyle(detectedStyle);
          }
        }
      } catch (err) {
        console.error("Polling failed:", err);
      }
    };

    poll();
    interval = setInterval(poll, 2000);
    return () => clearInterval(interval);
  }, [currentContentId]);

  const handleReset = () => {
    // Assuming we might have a reset function in the store, or we just notify user
    // For now, let's just clear local state. Ideally we'd reset the store's currentContentId.
    setStatus("IDLE");
    setErrorMessage(null);
    setProcessedData(null);
  };

  /* ---------------- GUARDS ---------------- */
  if (!currentContentId) return null;

  /* ---------------- UI ---------------- */
  return (
    <>
      <div className="glass-card p-6 space-y-4 border-l-4 border-primary/50">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg font-bold flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Processed Content
          </h3>

          <div className="text-xs font-bold px-3 py-1 rounded-full bg-muted">
            {status === "PROCESSING" && (
              <span className="flex items-center gap-1 text-blue-500">
                <Loader2 className="w-3 h-3 animate-spin" />
                Processing
              </span>
            )}
            {status === "READY" && (
              <span className="flex items-center gap-1 text-green-600">
                <CheckCircle2 className="w-3 h-3" />
                Ready
              </span>
            )}
            {status === "FAILED" && (
              <span className="flex items-center gap-1 text-red-600">
                <X className="w-3 h-3" />
                Failed
              </span>
            )}
          </div>
        </div>

        {/* FAILURE MESSAGE */}
        {status === "FAILED" && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-lg space-y-3 animate-in fade-in slide-in-from-top-1">
            <div className="text-sm text-red-700 font-medium">
              Processing encountered an issue:
            </div>
            <div className="text-xs text-red-600 bg-white/50 p-2 rounded border border-red-50 font-mono">
              {errorMessage}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleReset}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              Try Another content
            </Button>
          </div>
        )}

        {/* RENDER OUTPUT */}
        {processedData && outputStyle && status === "READY" && (
          <div className="max-h-72 overflow-y-auto p-4 bg-muted/30 rounded-lg">
            {outputStyle === "summary" && (
              <SummaryRenderer data={processedData} />
            )}
            {outputStyle === "visual" && (
              <VisualRenderer data={processedData} />
            )}
            {outputStyle === "flowchart" && (
              <FlowchartRenderer data={processedData} />
            )}
            {outputStyle === "flashcards" && (
              <FlashcardsRenderer data={processedData} />
            )}
          </div>
        )}

        {/* PREVIEW BUTTON */}
        {status === "READY" && processedData && (
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setShowPreview(true)}>
              Preview
            </Button>
          </div>
        )}
      </div>

      {/* PREVIEW MODAL */}
      {showPreview && processedData && outputStyle && (
        <OutputPreviewModal
          content={contentToPlainText(processedData,outputStyle)}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  );
};
