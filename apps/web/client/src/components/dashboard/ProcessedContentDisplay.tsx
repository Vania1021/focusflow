import { useEffect, useState } from "react";
import { Loader2, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useContentOutputStore } from "@/store/useContentOutput";
import { useUploadStore } from "@/store/useUploadStore";
import { useStudyStore } from "@/store/useStudyTemp";

import { OutputPreviewModal } from "./previewmodel";

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
  const [outputStyle, setOutputStyle] = useState<OutputStyle | null>(null);
  const [processedData, setProcessedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  /* ---------------- POLLING ---------------- */
  useEffect(() => {
    if (!currentContentId) return;

    let interval: NodeJS.Timeout;

    const poll = async () => {
      console.log("[ProcessedContentDisplay] Triggered")
      console.log("[ProcessedContentDisplay] Polling for", currentContentId); 
      try {
        const output = await getContentOutputById(currentContentId);
        console.log("[ProcessedContentDisplay] Output: ", output);
        if (!output) return;

        setStatus(output.status);

        if (output.status === "READY") {
          clearInterval(interval);

          setOutputStyle(output.outputStyle);
          
          // SUMMARY → fetch from blob
          if (output.processed.blobName) {
            const blob = await getBlobContent(
              "text",
              output.processed.blobName
            );
            console.log("[ProcessedContentDisplay] Blob: ", blob);
            setProcessedData(blob.summary);
          }
          // VISUAL / FLOW / FLASHCARDS → JSON
          else if (output.processedData) {
            setProcessedData(output.processedData);
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
          </div>
        </div>

        {/* RENDER OUTPUT */}
        {processedData && outputStyle && (
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
      {showPreview && processedData && (
        <OutputPreviewModal
          content={
            outputStyle === "summary"
              ? processedData.paragraphs
                  .map((p: any) =>
                    p.sentences.map((s: any) => s.text).join(" ")
                  )
                  .join("<br/><br/>")
              : JSON.stringify(processedData, null, 2)
          }
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  );
};
