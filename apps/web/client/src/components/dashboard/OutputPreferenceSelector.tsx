import { useStudyStore } from "@/store/useStudyTemp";
import { useContentOutputStore } from "@/store/useContentOutput";
import { useToast } from "@/hooks/use-toast";

type OutputStyle = "summary" | "visual" | "flowchart" | "flashcards";

export const OutputPreferenceSelector = () => {
  const {
    currentContentId,
    currentInputType,
    setProcessingStarted, // ✅ ADD THIS
  } = useStudyStore();

  const {
    triggerProcessingPDF,
    triggerProcessingText,
    triggerProcessingLink,
  } = useContentOutputStore();

  const { toast } = useToast();

  const handleSelect = async (outputStyle: OutputStyle) => {
    if (!currentContentId || !currentInputType) {
      toast({
        title: "No content selected",
        description: "Upload content before choosing an output style.",
        variant: "destructive",
      });
      return;
    }

    try {
      // 🔥 TRIGGER BACKEND
      console.log("[OutputPreferenceSelector] Triggering processing for", currentContentId);
      if (currentInputType === "pdf") {
        await triggerProcessingPDF(currentContentId, outputStyle);
      } else if (currentInputType === "link") {
        await triggerProcessingLink(currentContentId, outputStyle);
      } else {
        await triggerProcessingText(currentContentId, outputStyle);
      }

      // ✅ THIS IS THE MISSING LINE
      setProcessingStarted(true);

      toast({
        title: "Processing started",
        description: "Sit back — we’re generating your content ✨",
      });
    } catch (error) {
      console.error("Output processing failed:", error);
      toast({
        title: "Processing failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="glass-card p-6 space-y-4 animate-fade-in">
      <h4 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">
        Select Output Style
      </h4>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { id: "summary", label: "Text Summary" },
          { id: "visual", label: "Visual Diagram" },
          { id: "flowchart", label: "Flowchart" },
          { id: "flashcards", label: "Flashcards" },
        ].map((o) => (
          <button
            key={o.id}
            onClick={() => handleSelect(o.id as OutputStyle)}
            className="p-3 border rounded-lg text-xs font-bold transition-all
                       hover:bg-primary hover:text-white"
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
};
