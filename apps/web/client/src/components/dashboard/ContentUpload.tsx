import {
  FileText,
  Upload,
  Link,
  Loader2,
  Mic,
  PlayCircle,
  Type,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useStudyStore } from "@/store/useStudyTemp";
import { useToast } from "@/hooks/use-toast";
import { useUploadStore } from "@/store/useUploadStore";
import { useContentOutputStore } from "@/store/useContentOutput";

interface ContentUploadProps {
  activeTab: string;
  onUploadComplete?: () => void;
}

export const ContentUpload = ({
  activeTab,
  onUploadComplete,
}: ContentUploadProps) => {
  const [inputMethod, setInputMethod] = useState<"file" | "link" | "text">(
    "file"
  );
  const [linkValue, setLinkValue] = useState("");
  const [textValue, setTextValue] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const { addContent, setCurrentContent } = useStudyStore();
  const { toast } = useToast();
  const { uploadFile } = useUploadStore();
  const { createContentOutput } = useContentOutputStore();

  if (activeTab === "overview") return null;

  /* -------------------------------------------------- */
  /* FILE UPLOAD                                        */
  /* -------------------------------------------------- */
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const storageInputType = "text"; // unified storage

      const uploadResult = await uploadFile(file, storageInputType);
      const contentId = await createContentOutput(
        storageInputType,
        uploadResult.storageRef
      );

      if (!contentId) throw new Error("Content creation failed");

      const inputType =
        file.type === "application/pdf" ? "pdf" : "text";

      addContent({
        contentId,
        inputType,
        title: file.name,
        storageRef: uploadResult.storageRef,
        blobName: uploadResult.blobName,
        status: "uploaded",
        uploadedAt: new Date().toISOString(),
      });

      // 🔥 CRITICAL LINE
      setCurrentContent(contentId, inputType);

      toast({
        title: "Upload successful",
        description: "Select an output style to continue",
      });

      onUploadComplete?.();
    } catch (error) {
      console.error(error);
      toast({
        title: "Upload failed",
        description: "Could not upload file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  /* -------------------------------------------------- */
  /* LINK UPLOAD                                        */
  /* -------------------------------------------------- */
  const handleLinkUpload = async () => {
    if (!linkValue) return;
    setIsUploading(true);

    try {
      const contentId = await createContentOutput(
        "link",
        linkValue
      );

      if (!contentId) throw new Error("Content creation failed");

      addContent({
        contentId,
        inputType: "link",
        title: linkValue,
        storageRef: linkValue,
        blobName: "link",
        status: "uploaded",
        uploadedAt: new Date().toISOString(),
      });

      // 🔥 CRITICAL LINE
      setCurrentContent(contentId, "link");

      toast({
        title: "Link added",
        description: "Select output style to continue",
      });

      setLinkValue("");
      onUploadComplete?.();
    } catch (error) {
      console.error(error);
      toast({
        title: "Link failed",
        description: "Could not process link",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  /* -------------------------------------------------- */
  /* TEXT UPLOAD                                        */
  /* -------------------------------------------------- */
  const handleTextUpload = async () => {
    if (!textValue) return;
    setIsUploading(true);

    try {
      const contentId = await createContentOutput(
        "text",
        textValue
      );

      if (!contentId) throw new Error("Content creation failed");

      addContent({
        contentId,
        inputType: "text",
        title: "Text Input",
        storageRef: textValue,
        blobName: "raw_text",
        status: "uploaded",
        uploadedAt: new Date().toISOString(),
      });

      // 🔥 CRITICAL LINE
      setCurrentContent(contentId, "text");

      toast({
        title: "Text saved",
        description: "Select output style to continue",
      });

      setTextValue("");
      onUploadComplete?.();
    } catch (error) {
      console.error(error);
      toast({
        title: "Text failed",
        description: "Could not process text",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  /* -------------------------------------------------- */
  /* UI                                                 */
  /* -------------------------------------------------- */
  return (
    <div className="glass-card p-6 space-y-4 animate-fade-in">
      <div className="flex items-center gap-2">
        {activeTab === "text" && <FileText className="w-5 h-5" />}
        {activeTab === "video" && <PlayCircle className="w-5 h-5" />}
        {activeTab === "audio" && <Mic className="w-5 h-5" />}
        <h3 className="font-bold capitalize">{activeTab} Focus Lab</h3>
      </div>

      <div className="flex gap-2 bg-muted p-1 rounded-lg">
        <Button
          size="sm"
          variant={inputMethod === "file" ? "secondary" : "ghost"}
          onClick={() => setInputMethod("file")}
        >
          <Upload className="w-3 h-3 mr-1" /> File
        </Button>
        <Button
          size="sm"
          variant={inputMethod === "link" ? "secondary" : "ghost"}
          onClick={() => setInputMethod("link")}
        >
          <Link className="w-3 h-3 mr-1" /> Link
        </Button>
        <Button
          size="sm"
          variant={inputMethod === "text" ? "secondary" : "ghost"}
          onClick={() => setInputMethod("text")}
        >
          <Type className="w-3 h-3 mr-1" /> Text
        </Button>
      </div>

      {inputMethod === "file" && (
        <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-xl cursor-pointer">
          <input
            type="file"
            className="sr-only"
            onChange={handleFileUpload}
            disabled={isUploading}
          />
          {isUploading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Upload />
          )}
          <p className="text-xs mt-2">Upload PDF or text file</p>
        </label>
      )}

      {inputMethod === "link" && (
        <div className="flex gap-2">
          <Input
            placeholder="Paste URL"
            value={linkValue}
            onChange={(e) => setLinkValue(e.target.value)}
          />
          <Button onClick={handleLinkUpload} disabled={isUploading}>
            Add
          </Button>
        </div>
      )}

      {inputMethod === "text" && (
        <div className="space-y-2">
          <Textarea
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            placeholder="Paste your text here..."
          />
          <Button onClick={handleTextUpload} disabled={isUploading}>
            Process Text
          </Button>
        </div>
      )}
    </div>
  );
};
