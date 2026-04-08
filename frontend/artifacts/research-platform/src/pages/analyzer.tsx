import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { UploadCloud, FileText, CheckCircle, Loader2, ArrowRight } from "lucide-react";
import { getAnalyzeStatus, uploadAnalyzeDocument } from "@workspace/api-client-react";

export function AnalyzerPage() {
  const [, setLocation] = useLocation();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [sessionState, setSessionState] = useState<{
    id: string;
    status: string;
    progress: number;
    logs: string[];
  } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) setFile(droppedFile);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setIsUploading(true);

    try {
      const idemKey = `analyze-upload-${crypto.randomUUID()}`;
      const data = await uploadAnalyzeDocument(
        { file },
        { headers: { "Idempotency-Key": idemKey } }
      );
      setSessionState({
        id: data.session_id,
        status: "extracting",
        progress: 10,
        logs: ["Document submitted successfully. Starting analysis..."]
      });
      
      pollStatus(data.session_id);
    } catch (err) {
      alert("Error analyzing file: " + err);
      setIsUploading(false);
    }
  };

  const pollStatus = async (sessionId: string) => {
    const interval = setInterval(async () => {
      try {
          const data = await getAnalyzeStatus(sessionId);
        
        setSessionState(prev => ({
          ...prev!,
          status: data.status,
          progress: data.progress_percentage || prev!.progress,
          logs: data.logs || prev!.logs
        }));

        if (data.status === "completed") {
          clearInterval(interval);
          setTimeout(() => setLocation(`/competetor-analysis/report/${sessionId}`), 1500);
        }
      } catch (e) {
        console.error("Poll error", e);
      }
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full bg-background relative overflow-y-auto">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 py-16 flex flex-col flex-1 items-center justify-center min-h-[80vh]">
        <div className="text-center mb-10 w-full">
          <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-foreground mb-4">
            Competetor <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">Analysis</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Upload your product brochure, spec sheet, or business plan. Our AI will automatically extract your profile, discover real-world competitors, and generate a comparative intelligence report.
          </p>
        </div>

        {!sessionState ? (
          <div className="w-full max-w-xl">
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border/60 hover:border-primary/50 transition-colors bg-card/30 backdrop-blur-sm rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer shadow-sm group"
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".pdf,.txt,.md" 
                onChange={handleFileSelect} 
              />
              
              {file ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-medium mb-1">{file.name}</h3>
                  <p className="text-sm text-muted-foreground mb-6">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors flex items-center justify-center mb-4">
                    <UploadCloud className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="text-xl font-medium mb-1">Upload Document</h3>
                  <p className="text-sm text-muted-foreground text-center">Drag and drop a PDF or text file here, or click to browse</p>
                </>
              )}
            </div>

            <button
              onClick={handleAnalyze}
              disabled={!file || isUploading}
              className={`w-full mt-6 py-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
                !file 
                  ? "bg-muted text-muted-foreground cursor-not-allowed" 
                  : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30"
              }`}
            >
              {isUploading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
              ) : (
                <>Generate Analysis <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </div>
        ) : (
          <div className="w-full max-w-2xl bg-card border border-border/50 rounded-2xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-medium flex items-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                Analyzing Product Profile...
              </h3>
              <span className="text-primary font-mono text-lg">{sessionState.progress}%</span>
            </div>
            
            <div className="w-full h-3 bg-muted rounded-full overflow-hidden mb-8">
              <div 
                className="h-full bg-primary transition-all duration-500 ease-out"
                style={{ width: `${sessionState.progress}%` }}
              />
            </div>

            <div className="space-y-4 max-h-[250px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-border">
              {sessionState.logs.map((log, i) => (
                <div key={i} className="flex gap-3 text-sm animate-in fade-in slide-in-from-bottom-2">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-muted-foreground">{log}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
