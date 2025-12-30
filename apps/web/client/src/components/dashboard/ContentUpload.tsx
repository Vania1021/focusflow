import { FileText, Video, Upload, Link, Loader2, Mic, PlayCircle, Type } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useStudyStore } from "@/store/useStudyTemp";
import { useToast } from "@/hooks/use-toast";
import { useUploadStore } from "../../store/useUploadStore";
import { useContentOutputStore } from "../../store/useContentOutput";

interface ContentUploadProps {
  activeTab: string; 
  onUploadComplete?: () => void;
}

export const ContentUpload = ({ activeTab, onUploadComplete }: ContentUploadProps) => {
  const [inputMethod, setInputMethod] = useState<'file' | 'link' | 'text'>('file');
  const [linkValue, setLinkValue] = useState('');
  const [textValue, setTextValue] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const { addContent } = useStudyStore();
  const { toast } = useToast();
  const { uploadFile, getDownloadUrl } = useUploadStore();
  const { createContentOutput, triggerProcessingPDF, triggerProcessingLink, triggerProcessingText } = useContentOutputStore();

  // If we are on the Overview, we don't show the uploader to keep the UI clean
  if (activeTab === 'overview') return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    
    try {
      console.log("active Tab: ", activeTab);
      // ALWAYS use "text" as inputType for storage as per requirement
      const storageInputType = "text";
      
      const uploadResult = await uploadFile(file, storageInputType);
      
      // Create Content Output Record
      const contentId = await createContentOutput(storageInputType, uploadResult.storageRef);
      
      if (contentId) {
        // Trigger specific processing based on file type or context
        // Assuming PDF upload implies PDF processing if it's a PDF file
        if (file.type === "application/pdf") {
           await triggerProcessingPDF(contentId);
        } else {
           // Default fallback or if specifically text file
           await triggerProcessingText(contentId);
        }
      }

      const downloadResult = await getDownloadUrl(storageInputType);
      
      addContent({
        id: contentId || Math.random().toString(36).substr(2, 9),
        type: activeTab,
        title: file.name,
        source: downloadResult.downloadUrl,
        storageRef: uploadResult.storageRef,
        blobName: uploadResult.blobName,
        status: 'processing', // Set to processing initially
        uploadedAt: new Date().toISOString()
      });
      
      toast({ title: "File Uploaded", description: "Processing started." });
      onUploadComplete?.();
    } catch (error) {
      console.error("Upload error:", error);
      toast({ 
        title: "Upload failed", 
        description: "There was an error uploading your file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleLinkUpload = async () => {
    if (!linkValue) return;
    setIsUploading(true);
    try {
      // Create a small blob with the link for the upload API
      const blob = new Blob([linkValue], { type: 'text/plain' });
      const file = new File([blob], "link-content.txt", { type: 'text/plain' });
      
      const storageInputType = "text";
      
      const uploadResult = await uploadFile(file, storageInputType);
      
      const contentId = await createContentOutput(storageInputType, uploadResult.storageRef);
      
      if (contentId) {
        await triggerProcessingLink(contentId);
      }

      const downloadResult = await getDownloadUrl(storageInputType);
      
      addContent({
        id: contentId || Math.random().toString(36).substr(2, 9),
        type: activeTab,
        title: linkValue,
        source: downloadResult.downloadUrl,
        storageRef: uploadResult.storageRef,
        blobName: uploadResult.blobName,
        status: 'processing',
        uploadedAt: new Date().toISOString()
      });
      
      toast({ title: "Link Uploaded", description: "Link processing started." });
      setLinkValue('');
      onUploadComplete?.();
    } catch (error) {
      console.error("Link upload error:", error);
      toast({ 
        title: "Link process failed", 
        description: "Failed to process the link. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleTextUpload = async () => {
    if (!textValue) return;
    setIsUploading(true);
    try {
      const blob = new Blob([textValue], { type: 'text/plain' });
      const file = new File([blob], "raw-text-content.txt", { type: 'text/plain' });
      
      const storageInputType = "text";
      
      const uploadResult = await uploadFile(file, storageInputType);
      
      const contentId = await createContentOutput(storageInputType, uploadResult.storageRef);
      
      let content = "";

      if (contentId) {
        const res = await triggerProcessingText(contentId);
        content = res.content;
      }

      const downloadResult = await getDownloadUrl(storageInputType);
      
      addContent({
        id: contentId || Math.random().toString(36).substr(2, 9),
        type: activeTab,
        title: "Raw Text Upload",
        source: downloadResult.downloadUrl,
        storageRef: uploadResult.storageRef,
        blobName: uploadResult.blobName,
        status: 'processing',
        uploadedAt: new Date().toISOString()
      });
      
      toast({ title: "Text Uploaded", description: "Text processing started." });
      setTextValue('');
      onUploadComplete?.();
    } catch (error) {
      console.error("Text upload error:", error);
      toast({ 
        title: "Text process failed", 
        description: "Failed to process the text. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="glass-card p-6 space-y-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-2">
        {activeTab === 'text' && <FileText className="w-5 h-5 text-sage-600" />}
        {activeTab === 'video' && <PlayCircle className="w-5 h-5 text-teal-600" />}
        {activeTab === 'audio' && <Mic className="w-5 h-5 text-accent" />}
        <h3 className="font-bold text-lg capitalize">{activeTab} Focus Lab</h3>
      </div>
      
      <div className="flex gap-2 p-1 bg-muted rounded-lg">
        <Button 
          variant={inputMethod === 'file' ? "secondary" : "ghost"} 
          className="flex-1 text-xs" 
          onClick={() => setInputMethod('file')}
        >
          <Upload className="w-3 h-3 mr-2" /> Local File
        </Button>
        <Button 
          variant={inputMethod === 'link' ? "secondary" : "ghost"} 
          className="flex-1 text-xs" 
          onClick={() => setInputMethod('link')}
        >
          <Link className="w-3 h-3 mr-2" /> Web Link
        </Button>
        <Button 
          variant={inputMethod === 'text' ? "secondary" : "ghost"} 
          className="flex-1 text-xs" 
          onClick={() => setInputMethod('text')}
        >
          <Type className="w-3 h-3 mr-2" /> Paste Text
        </Button>
      </div>

      {inputMethod === 'file' && (
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-sage-50/50">
          <input type="file" className="sr-only" onChange={handleFileUpload} disabled={isUploading} />
          {isUploading ? <Loader2 className="w-6 h-6 animate-spin text-primary" /> : <Upload className="w-6 h-6 text-muted-foreground" />}
          <p className="text-xs mt-2 text-muted-foreground">Click to upload PDF or Text file</p>
        </label>
      )}

      {inputMethod === 'link' && (
        <div className="flex gap-2">
          <Input placeholder={`Paste ${activeTab} URL...`} value={linkValue} onChange={(e) => setLinkValue(e.target.value)} />
          <Button size="sm" onClick={handleLinkUpload} disabled={isUploading || !linkValue}>
            {isUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Add"}
          </Button>
        </div>
      )}

      {inputMethod === 'text' && (
        <div className="space-y-2">
          <Textarea 
            placeholder="Paste or type your text content here..." 
            value={textValue} 
            onChange={(e) => setTextValue(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="flex justify-end">
            <Button size="sm" onClick={handleTextUpload} disabled={isUploading || !textValue}>
              {isUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Process Text"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};