import { FileText, Video, Upload, Link, Loader2, Mic, PlayCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStudyStore } from "@/store/useStudyTemp";
import { useToast } from "@/hooks/use-toast";

interface ContentUploadProps {
  activeTab: string; 
  onUploadComplete?: () => void;
}

export const ContentUpload = ({ activeTab, onUploadComplete }: ContentUploadProps) => {
  const [inputMethod, setInputMethod] = useState<'file' | 'link'>('file');
  const [linkValue, setLinkValue] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const { addContent } = useStudyStore();
  const { toast } = useToast();

  // If we are on the Overview, we don't show the uploader to keep the UI clean
  if (activeTab === 'overview') return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    
    // this would hit your /api/storage/upload endpoint
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    addContent({
      id: Math.random().toString(36).substr(2, 9),
      type: activeTab, // Correctly assigns text, video, or audio
      title: file.name,
      source: URL.createObjectURL(file),
      status: 'ready',
      uploadedAt: new Date().toISOString()
    });
    
    toast({ title: `${activeTab.toUpperCase()} synced`, description: "Processing complete." });
    setIsUploading(false);
    onUploadComplete?.();
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
      </div>

      {inputMethod === 'file' ? (
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-sage-50/50">
          <input type="file" className="sr-only" onChange={handleFileUpload} disabled={isUploading} />
          {isUploading ? <Loader2 className="w-6 h-6 animate-spin text-primary" /> : <Upload className="w-6 h-6 text-muted-foreground" />}
          <p className="text-xs mt-2 text-muted-foreground">Click to upload {activeTab} content</p>
        </label>
      ) : (
        <div className="flex gap-2">
          <Input placeholder={`Paste ${activeTab} URL...`} value={linkValue} onChange={(e) => setLinkValue(e.target.value)} />
          <Button size="sm" onClick={() => { /* Link logic */ }}>Add</Button>
        </div>
      )}
    </div>
  );
};