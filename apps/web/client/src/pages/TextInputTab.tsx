import { useContentOutputStore } from "@/store/useContentOutput";
import { useStudyStore } from "@/store/useStudyTemp";
import { useToast } from "@/hooks/use-toast";
import { OUTPUTS, OutputStyle } from "./Dashboard";


const TextInputTab = () => {
  const {
    currentContentId,
    currentInputType,
    processingStarted,
    setProcessingStarted,
  } = useStudyStore();

  const {
    triggerProcessingPDF,
    triggerProcessingText,
    triggerProcessingLink,
  } = useContentOutputStore();

  const { toast } = useToast();

  const handleSelect = async (style: OutputStyle) => {
    if (!currentContentId || !currentInputType) {
      toast({ title: "Upload content first", variant: "destructive" });
      return;
    }

    if (processingStarted) return;

    if (currentInputType === "pdf")
      await triggerProcessingPDF(currentContentId, style);
    else if (currentInputType === "link")
      await triggerProcessingLink(currentContentId, style);
    else await triggerProcessingText(currentContentId, style);

    setProcessingStarted(true);
  };

  return (
    <div className="glass-card p-6 space-y-4">
      <h4 className="text-xs uppercase font-bold text-muted-foreground">
        Select Output Style
      </h4>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {OUTPUTS.map((o) => (
          <button
            key={o.id}
            onClick={() => handleSelect(o.id)}
            disabled={!currentContentId || processingStarted}
            className="p-3 border rounded-lg text-xs font-bold hover:bg-primary hover:text-white disabled:opacity-50"
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TextInputTab;