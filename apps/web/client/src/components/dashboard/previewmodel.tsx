import { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useStudyStore } from "@/store/useStudyTemp";
import { useFocusTracker } from "@/hooks/useFocusTracker";
import { useFocusStore } from "@/store/useFocusStore";

type OutputStyle = "summary" | "visual" | "flowchart" | "flashcards";

interface OutputPreviewModalProps {
  content: string;
  onClose: () => void;
  contentId?: string; // Optional: to ensure we track the specific content
}

export const OutputPreviewModal = ({
  content,
  onClose,
  contentId,
}: OutputPreviewModalProps) => {
  const { startSession, endSession, currentContentId } = useStudyStore();
  const { resetFocus } = useFocusStore();

  /* ---------------- SESSION LIFECYCLE ---------------- */
  useEffect(() => {
    const initSession = async () => {
      const idToTrack = contentId || currentContentId;
      if (idToTrack) {
        console.log(`[Preview Modal] Initializing session for content: ${idToTrack}`);
        resetFocus(); // Reset focus buddy to 100%
        await startSession(idToTrack); // Notify backend session started
      }
    };

    initSession();
  }, [contentId, currentContentId, startSession, resetFocus]);

  /* ---------------- BEHAVIORAL TRACKING ---------------- */
  // This hook monitors tab visibility, window blur, and 45s idle time
  useFocusTracker(true);

  const handleClose = async () => {
    console.log("[Preview Modal] Closing session and saving focus score");
    try {
      await endSession(); // Sends the final Focus Score to session.controller.ts
    } catch (error) {
      console.error("[Preview Modal] Error during session termination:", error);
    } finally {
      onClose(); // Triggers the parent's close logic
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-11/12 max-w-4xl h-5/6 p-8 rounded-[2rem] border border-[#E8E1D5] shadow-2xl flex flex-col relative animate-in zoom-in-95 duration-300">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-serif font-bold text-[#3E2A26]">Focus Preview</h3>
            <p className="text-[10px] uppercase font-black tracking-widest text-[#5D4037]/40">
              Active Focus Monitoring Enabled
            </p>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-stone-100 transition-colors"
          >
            <X className="w-6 h-6 text-[#5D4037]" />
          </button>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
          <div 
            className="text-lg leading-relaxed text-[#2D1B18] font-medium selection:bg-[#4A6741]/20"
            dangerouslySetInnerHTML={{ __html: content }} 
          />
        </div>

        {/* FOOTER */}
        <div className="pt-6 mt-6 border-t border-[#E8E1D5] flex justify-between items-center">
          <p className="text-xs italic text-[#5D4037]/60">
            Close the preview to save your focus streak and progress.
          </p>
          <Button 
            onClick={handleClose} 
            size="lg"
            className="bg-[#4A6741] hover:bg-[#3D5635] text-white px-10 rounded-full shadow-lg"
          >
            Finish Reading
          </Button>
        </div>
      </div>
    </div>
  );
};