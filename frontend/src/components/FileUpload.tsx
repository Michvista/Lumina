import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Image, X, CheckCircle2 } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
}

const ACCEPT = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/heic': ['.heic'],
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileUpload({ onFileSelect, selectedFile, onClear }: FileUploadProps) {
  const [dragError, setDragError] = useState<string | null>(null);

  const onDrop = useCallback(
    (accepted: File[], rejected: any[]) => {
      setDragError(null);
      if (rejected.length > 0) {
        const firstError = rejected[0]?.errors?.[0]?.message;
        setDragError(firstError ?? 'File type not supported. Please upload a PDF or image.');
        return;
      }
      if (accepted[0]) onFileSelect(accepted[0]);
    },
    [onFileSelect],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPT,
    maxSize: 20 * 1024 * 1024,
    maxFiles: 1,
    disabled: !!selectedFile,
  });

  if (selectedFile) {
    const isPdf = selectedFile.type === 'application/pdf';
    return (
      <div className="flex items-center gap-4 bg-[#8FA998]/10 border border-[#8FA998]/25 rounded-2xl p-4">
        <div className="w-12 h-12 rounded-xl bg-[#8FA998]/20 flex items-center justify-center text-[#586E5E] shrink-0">
          {isPdf ? <FileText size={24} /> : <Image size={24} />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-[#5D3754] truncate">{selectedFile.name}</p>
          <p className="text-xs text-[#5D3754]/70 mt-0.5">
            {isPdf ? 'PDF Document' : 'Image'} · {formatBytes(selectedFile.size)}
          </p>
        </div>
        <CheckCircle2 size={20} className="text-[#8FA998] shrink-0" />
        <button
          onClick={onClear}
          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-50 text-[#5D3754]/60 hover:text-red-500 transition-colors"
          title="Remove file"
        >
          <X size={15} />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        {...getRootProps()}
        className={`flex flex-col items-center justify-center gap-3 text-center py-12 px-6 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
          isDragActive
            ? 'border-[#5D3754] bg-[#5D3754]/5 scale-[1.01]'
            : dragError
            ? 'border-red-300 bg-red-50/30'
            : 'border-[#F4DFD7] hover:border-[#5D3754]/40 hover:bg-[#FAF6F2]/50'
        }`}
      >
        <input {...getInputProps()} id="file-upload-input" />

        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
          isDragActive ? 'bg-[#5D3754]/10 text-[#5D3754]' : 'bg-[#F4DFD7]/40 text-[#5D3754]/60'
        }`}>
          <Upload size={26} />
        </div>

        <div className="space-y-1">
          <p className="font-serif text-lg font-semibold text-[#5D3754]">
            {isDragActive ? 'Drop your report here…' : 'Drag & drop your lab report'}
          </p>
          <p className="text-xs text-[#5D3754]/75">
            or <span className="font-bold text-[#5D3754] underline underline-offset-2 cursor-pointer">click to browse</span>
          </p>
          <p className="text-[10px] text-[#5D3754]/55 pt-1">PDF, JPEG, PNG, WEBP, HEIC · Max 20 MB</p>
        </div>
      </div>

      {dragError && (
        <p className="text-xs text-red-500 text-center">{dragError}</p>
      )}
    </div>
  );
}
