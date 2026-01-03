import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Eye, Loader2, FileDown, X } from "lucide-react";
import { jsPDF } from "jspdf";

import { useContentOutputStore } from "@/store/useContentOutput";
import { useUploadStore } from "@/store/useUploadStore";
import { htmlToPlainText, urlToFileName } from "@/lib/utils";
import { contentToPlainText } from "@/store/contentforlearninghistory";
import { useStudyStore } from "@/store/useStudyTemp";


export const MyLearningHistory = () => {
  const { startSession, endSession } = useStudyStore();
  const { contentOutputs, getMyContentOutputs } = useContentOutputStore();
  const { getBlobContent } = useUploadStore();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [previewText, setPreviewText] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    getMyContentOutputs();
  }, [getMyContentOutputs]);

  // ---------------- VIEW ----------------
  const handleView = async (output: any) => {
    if (output.status !== "READY" || !output.processedBlobName) return;

    console.log("[Learning History] Starting session for history item");
    await startSession(output.contentId); // Start session in backend

    setActiveId(output.contentId);
    setLoadingId(output.contentId);
    setPreviewText("");
    setIsPreviewOpen(true);

    try {
      const response = await getBlobContent("text", output.processedBlobName);

      // const text = response.paragraphs
      //   .flatMap((p: any) => p.sentences.map((s: any) => s.text))
      //   .join("\n\n");

      
    const text = contentToPlainText(response);


      setPreviewText(text);
    } catch (err) {
      console.error("Preview failed", err);
    } finally {
      setLoadingId(null);
    }
  };

  // ---------------- EXPORT PDF ----------------
  const handleDownload = () => {
    if (!previewText || !activeId) return;

    const pdf = new jsPDF();
    pdf.setFontSize(12);
    const lines = pdf.splitTextToSize(htmlToPlainText(previewText), 180);
    pdf.text(lines, 15, 20);
    pdf.save(`processed-${activeId}.pdf`);
  };

  // ---------------- CLOSE PREVIEW ----------------
  const closePreview = async () => {
    console.log("[Learning History] Closing history preview");
    await endSession(); // End session in backend
    setIsPreviewOpen(false);
  };

  return (
    <div className="bg-white dark:bg-stone-900 p-6 rounded-xl border space-y-6">
      <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100">
        Recent Activity
      </h2>

      {/* TABLE */}
      <table className="w-full text-sm">
        <thead className="text-xs text-stone-500 border-b">
          <tr>
            <th className="py-2">Type</th>
            <th className="py-2">Processed</th>
            <th className="py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {contentOutputs.map((o: any) => {
            const isActive = o.contentId === activeId;

            return (
              <tr
                key={o.contentId}
                className="border-b hover:bg-stone-50 dark:hover:bg-stone-800 text-center align-middle"
              >
                <td className="py-2 text-stone-800 dark:text-stone-100">
                  {urlToFileName(o.rawStorageRef)}
                </td>
                <td className="py-2 text-stone-500">
                  {o.processedAt
                    ? formatDistanceToNow(new Date(o.processedAt), { addSuffix: true })
                    : "-"}
                </td>
                <td className="py-2">
                  {o.status !== "READY" && (
                    <span className="text-xs text-stone-400 flex justify-center items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Processing
                    </span>
                  )}

                  {o.status === "READY" && !isActive && (
                    <button
                      onClick={() => handleView(o)}
                      className="flex justify-center items-center gap-1 text-primary text-xs mx-auto"
                    >
                      <Eye className="w-3 h-3" />
                      View
                    </button>
                  )}

                  {isActive && loadingId === o.contentId && (
                    <span className="text-xs text-primary flex justify-center items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Loading
                    </span>
                  )}

                  {isActive && !loadingId && (
                    <button
                      onClick={handleDownload}
                      className="flex justify-center items-center gap-1 text-xs text-green-600 mx-auto"
                    >
                      <FileDown className="w-3 h-3" />
                      Download
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* FULL-PAGE MODAL PREVIEW */}
      {isPreviewOpen && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-stone-900 w-11/12 max-w-4xl h-5/6 p-6 rounded-xl flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100">
                Preview
              </h3>
              <button
                onClick={closePreview}
                className="text-stone-500 hover:text-stone-800 dark:hover:text-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingId ? (
              <div className="flex items-center justify-center gap-2 text-sm text-stone-500 h-full">
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading preview…
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto whitespace-pre-wrap text-sm text-stone-800 dark:text-stone-100">
                <div className="whitespace-pre-wrap">
                  {previewText}
                </div>
              </div>
            )}

            {!loadingId && previewText && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-3 py-1 text-xs font-semibold bg-primary text-white rounded-lg"
                >
                  <FileDown className="w-4 h-4" />
                  Download PDF
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyLearningHistory;
