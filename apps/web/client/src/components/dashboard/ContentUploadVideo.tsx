import {
  PlayCircle,
  Upload,
  Loader2,
} from "lucide-react";
import { useState, useRef } from "react";
import { useStudyStore } from "@/store/useStudyTemp";
import { useToast } from "@/hooks/use-toast";
import { useUploadStore } from "@/store/useUploadStore";
import { useContentOutputStore } from "@/store/useContentOutput";

interface ContentUploadVideoProps {
  onUploadComplete?: () => void;
}

export const ContentUploadVideo = ({
  onUploadComplete,
}: ContentUploadVideoProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { addContent, setCurrentContent } = useStudyStore();
  const { toast } = useToast();
  const { uploadFile } = useUploadStore();
  const { createContentOutput } = useContentOutputStore();

  /* -------------------------------------------------- */
  /* VIDEO FILE UPLOAD                                  */
  /* -------------------------------------------------- */
  const handleVideoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate that it's a video file
    if (!file.type.startsWith("video/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload a video file",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const storageInputType = "video"; // unified storage

      const uploadResult = await uploadFile(file, storageInputType);
      const contentId = await createContentOutput(
        storageInputType,
        uploadResult.storageRef
      );

      if (!contentId) throw new Error("Content creation failed");

      addContent({
        contentId,
        inputType: "video",
        title: file.name,
        storageRef: uploadResult.storageRef,
        blobName: uploadResult.blobName,
        status: "uploaded",
        uploadedAt: new Date().toISOString(),
      });

      // Set current content for processing
      setCurrentContent(contentId, "video");

      toast({
        title: "Video uploaded successfully",
        description: "Select an output style to continue",
      });

      // Reset the file input to allow uploading another video
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      onUploadComplete?.();
    } catch (error) {
      console.error(error);
      toast({
        title: "Upload failed",
        description: "Could not upload video file",
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
        <PlayCircle className="w-5 h-5" />
        <h3 className="font-bold">Video Focus Lab</h3>
      </div>

      <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-xl cursor-pointer hover:border-primary transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          className="sr-only"
          accept="video/*"
          onChange={handleVideoUpload}
          disabled={isUploading}
        />
        {isUploading ? (
          <Loader2 className="animate-spin w-8 h-8 text-primary" />
        ) : (
          <Upload className="w-8 h-8 text-muted-foreground" />
        )}
        <p className="text-xs mt-2 text-muted-foreground">
          {isUploading ? "Uploading video..." : "Upload video file"}
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          Supported formats: MP4, AVI, MOV, WebM
        </p>
      </label>
    </div>
  );
};
