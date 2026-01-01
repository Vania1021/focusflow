import { X, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OutputPreviewModalProps {
  content: string;
  onClose: () => void;
}

export const OutputPreviewModal = ({
  content,
  onClose,
}: OutputPreviewModalProps) => {
  return (
    <div className="fixed inset-0 flex justify-center items-center z-50">
      <div className="bg-white w-11/12 max-w-4xl h-5/6 p-6 rounded-xl flex flex-col">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Preview</h3>
          <button onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto text-sm whitespace-pre-wrap">
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>

        {/* FOOTER */}
        <div className="pt-4 flex justify-end">
          <Button onClick={onClose} size="sm">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
