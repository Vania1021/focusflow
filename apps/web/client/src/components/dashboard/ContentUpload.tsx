import { FileText, Video, Upload, Link, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/store/useAppStore";
import { useToast } from "@/hooks/use-toast";

interface ContentUploadProps {
  onUploadComplete?: () => void;
}

export const ContentUpload = ({ onUploadComplete }: ContentUploadProps) => {
  const [activeTab, setActiveTab] = useState<'text' | 'video'>('text');
  const [inputMethod, setInputMethod] = useState<'file' | 'link'>('file');
  const [linkValue, setLinkValue] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const { addContent } = useAppStore();
  const { toast } = useToast();
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    
    // Simulate upload
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    addContent({
      type: activeTab,
      title: file.name,
      source: URL.createObjectURL(file),
    });
    
    toast({
      title: "Content uploaded",
      description: "Your content is being processed...",
    });
    
    setIsUploading(false);
    onUploadComplete?.();
  };
  
  const handleLinkSubmit = async () => {
    if (!linkValue.trim()) return;
    
    setIsUploading(true);
    
    // Simulate processing
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    addContent({
      type: activeTab,
      title: `${activeTab === 'text' ? 'Document' : 'Video'} from link`,
      source: linkValue,
    });
    
    toast({
      title: "Link added",
      description: "Your content is being processed...",
    });
    
    setLinkValue('');
    setIsUploading(false);
    onUploadComplete?.();
  };
  
  return (
    <div className="glass-card p-6 space-y-6">
      <h3 className="font-serif text-xl font-semibold text-foreground">Upload Content</h3>
      
      {/* Content Type Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('text')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
            activeTab === 'text'
              ? 'bg-sage-100 text-sage-700 border border-sage-200'
              : 'bg-background text-muted-foreground hover:bg-sage-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          Text / PDF
        </button>
        <button
          onClick={() => setActiveTab('video')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
            activeTab === 'video'
              ? 'bg-teal-100 text-teal-700 border border-teal-200'
              : 'bg-background text-muted-foreground hover:bg-teal-50'
          }`}
        >
          <Video className="w-4 h-4" />
          Video
        </button>
      </div>
      
      {/* Input Method Toggle */}
      <div className="flex gap-2 p-1 bg-muted rounded-lg">
        <button
          onClick={() => setInputMethod('file')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
            inputMethod === 'file'
              ? 'bg-background shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Upload className="w-4 h-4" />
          Upload File
        </button>
        <button
          onClick={() => setInputMethod('link')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
            inputMethod === 'link'
              ? 'bg-background shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Link className="w-4 h-4" />
          Paste Link
        </button>
      </div>
      
      {/* Upload Area */}
      {inputMethod === 'file' ? (
        <label className="relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-sage-50/50 transition-all duration-200">
          <input
            type="file"
            className="sr-only"
            accept={activeTab === 'text' ? '.pdf,.txt,.doc,.docx' : '.mp4,.mov,.avi,.webm'}
            onChange={handleFileUpload}
            disabled={isUploading}
          />
          {isUploading ? (
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          ) : (
            <>
              <Upload className="w-10 h-10 text-muted-foreground mb-3" />
              <p className="text-sm font-medium text-foreground">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {activeTab === 'text' ? 'PDF, TXT, DOC up to 50MB' : 'MP4, MOV, AVI up to 500MB'}
              </p>
            </>
          )}
        </label>
      ) : (
        <div className="space-y-3">
          <Input
            placeholder={activeTab === 'text' ? 'Paste document URL...' : 'Paste video URL (YouTube, Vimeo, etc.)'}
            value={linkValue}
            onChange={(e) => setLinkValue(e.target.value)}
            disabled={isUploading}
          />
          <Button 
            onClick={handleLinkSubmit}
            disabled={!linkValue.trim() || isUploading}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Add Content'
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
