import { useEffect, useState, useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import { 
  Eye, 
  Loader2, 
  FileDown, 
  X, 
  Search, 
  Clock, 
  FileText, 
  Link as LinkIcon, 
  PlayCircle,
  Hash,
  ArrowLeft
} from "lucide-react";
import { jsPDF } from "jspdf";

import { useContentOutputStore } from "@/store/useContentOutput";
import { useUploadStore } from "@/store/useUploadStore";
import { htmlToPlainText, urlToFileName } from "@/lib/utils";
import { contentToPlainText } from "@/store/contentforlearninghistory";
import { Button } from "@/components/ui/button";
import { useStudyStore } from "@/store/useStudyTemp";
import { useFocusTracker } from "@/hooks/useFocusTracker";

type ViewMode = "grid" | "detail";

export const MyLearningHistory = () => {
  const { contentOutputs = [], getMyContentOutputs } = useContentOutputStore();
  const { startSession, endSession } = useStudyStore();
  const { getBlobContent } = useUploadStore();

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [previewText, setPreviewText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDownloadingId, setIsDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    getMyContentOutputs();
  }, [getMyContentOutputs]);

  /* BEHAVIORAL TRACKING */
  //Tracking now activates exactly when the user is in the detail view
  useFocusTracker(viewMode === "detail");

  const filteredOutputs = useMemo(() => {
    if (!Array.isArray(contentOutputs)) return [];
    return contentOutputs
      .filter((o: any) => 
        urlToFileName(o.rawStorageRef || "").toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a: any, b: any) => {
        const dateA = a.processedAt ? new Date(a.processedAt).getTime() : 0;
        const dateB = b.processedAt ? new Date(b.processedAt).getTime() : 0;
        return dateB - dateA;
      });
  }, [contentOutputs, searchQuery]);

  const fetchContent = async (output: any) => {
    if (output.status !== "READY" || !output.processedBlobName) return "";
    try {
      const response = await getBlobContent("text", output.processedBlobName);
      return contentToPlainText(response);
    } catch (err) {
      console.error("[Learning History] Fetch failed:", err);
      return "";
    }
  };

  const handleView = async (output: any) => {
    if (output.status !== "READY" || !output.processedBlobName) return;

    console.log("[Learning History] Starting session for history item");
    await startSession(output.contentId); // Notify backend session started

    setActiveId(output.contentId);
    setLoadingId(output.contentId);
    setPreviewText("");
    setViewMode("detail");

    const text = await fetchContent(output);
    setPreviewText(text);
    setLoadingId(null);
  };

  const generatePDF = (text: string, filename: string) => {
    if (!text) return;
    const pdf = new jsPDF();
    pdf.setFontSize(12);
    const lines = pdf.splitTextToSize(htmlToPlainText(text), 180);
    pdf.text(lines, 15, 20);
    pdf.save(`${filename}.pdf`);
  };

  const handleDownload = async (output: any) => {
    const filename = `focusflow-${urlToFileName(output.rawStorageRef || output.contentId)}`;
    
    if (activeId === output.contentId && previewText) {
      generatePDF(previewText, filename);
      return;
    }

    setIsDownloadingId(output.contentId);
    const text = await fetchContent(output);
    if (text) {
      generatePDF(text, filename);
    }
    setIsDownloadingId(null);
  };

  /**
   *  Now correctly ends the session and saves the Focus Score 
   * to Cosmos DB when returning to the grid.
   */
  const handleBack = async () => {
    console.log("[Learning History] Ending session and returning to grid");
    await endSession(); // Persist focus score to backend
    
    setViewMode("grid");
    setPreviewText("");
    setActiveId(null);
    setLoadingId(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "READY": return "bg-green-100 text-green-700 border-green-200";
      case "PROCESSING": return "bg-blue-100 text-blue-700 border-blue-200";
      default: return "bg-stone-100 text-stone-600 border-stone-200";
    }
  };

  const getTypeIcon = (ref: string) => {
    const lower = (ref || "").toLowerCase();
    if (lower.includes('.pdf')) return <FileText className="w-4 h-4 text-orange-500" />;
    if (lower.startsWith('http')) return <LinkIcon className="w-4 h-4 text-blue-500" />;
    if (lower.includes('video')) return <PlayCircle className="w-4 h-4 text-red-500" />;
    return <FileText className="w-4 h-4 text-stone-500" />;
  };

  if (viewMode === "detail") {
    const activeItem = contentOutputs.find(o => o.contentId === activeId);
    const filename = activeItem ? urlToFileName(activeItem.rawStorageRef || "") : "Summary";

    return (
      <div className="flex flex-col h-[calc(100vh-180px)] glass-card overflow-hidden animate-fade-in">
        {/* Detail Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/50 bg-background/50 backdrop-blur-sm z-10 shrink-0">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleBack}
              className="rounded-full hover:bg-muted"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h3 className="text-xl font-bold truncate max-w-[300px]" title={filename}>
                {filename}
              </h3>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Focus Session Active</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownload(activeItem)}
              className="gap-2 text-xs font-bold"
              disabled={loadingId !== null || !previewText}
            >
              <FileDown className="w-4 h-4" />
              Export PDF
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="text-muted-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 leading-relaxed custom-scrollbar bg-white/30">
          {loadingId ? (
            <div className="flex flex-col items-center justify-center gap-4 h-full text-muted-foreground">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-sm font-medium animate-pulse">Analyzing history insights...</p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto py-4">
              <div className="prose prose-stone dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap font-sans text-foreground/90 text-lg">
                  {previewText}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif font-bold text-gradient">Learning History</h2>
          <p className="text-sm text-muted-foreground mt-1">Review your cognitive transformations</p>
        </div>

        <div className="relative group max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search your library..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
          />
        </div>
      </div>

      {filteredOutputs.length === 0 ? (
        <div className="glass-card p-12 text-center border-dashed border-2">
          <Hash className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
          <h3 className="font-bold">No records found</h3>
          <p className="text-muted-foreground text-sm">Processed content will appear here automatically.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOutputs.map((o: any) => (
            <div 
              key={o.contentId} 
              className="glass-card p-6 flex flex-col justify-between hover:shadow-xl transition-all duration-300 group cursor-default"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="p-2 rounded-lg bg-background border border-border">
                    {getTypeIcon(o.rawStorageRef)}
                  </div>
                  <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(o.status)}`}>
                    {o.status}
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-sm truncate" title={urlToFileName(o.rawStorageRef || "")}>
                    {urlToFileName(o.rawStorageRef || "")}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {o.processedAt ? formatDistanceToNow(new Date(o.processedAt), { addSuffix: true }) : "N/A"}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2">
                {o.status === "READY" ? (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex-1 gap-2 text-xs font-bold hover:bg-primary/5"
                    onClick={() => handleView(o)}
                    disabled={isDownloadingId === o.contentId}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Open Summary
                  </Button>
                ) : (
                  <div className="flex-1 text-center py-2 text-[10px] font-bold text-muted-foreground bg-muted/30 rounded-lg">
                    PROCESSING...
                  </div>
                )}
                
                {o.status === "READY" && (
                   <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 text-muted-foreground hover:text-green-600"
                    onClick={() => handleDownload(o)}
                    disabled={isDownloadingId === o.contentId}
                  >
                    {isDownloadingId === o.contentId ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <FileDown className="w-4 h-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyLearningHistory;