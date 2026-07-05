import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Trash2, Volume2 } from 'lucide-react';

interface AudioRecorderProps {
  onAudioSaved: (blob: Blob | null) => void;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({ onAudioSaved }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  
  // Canvas animation refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Clean up timers and audio contexts on unmount
  useEffect(() => {
    return () => {
      stopTimer();
      stopVisualizer();
    };
  }, []);

  const startTimer = () => {
    setRecordingTime(0);
    timerRef.current = window.setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startVisualizer = (stream: MediaStream) => {
    if (!canvasRef.current) return;
    
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = audioCtx.createAnalyser();
    const source = audioCtx.createMediaStreamSource(stream);
    
    source.connect(analyser);
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    audioCtxRef.current = audioCtx;
    analyserRef.current = analyser;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const draw = () => {
      if (!canvasRef.current) return;
      animationFrameRef.current = requestAnimationFrame(draw);
      
      analyser.getByteFrequencyData(dataArray);
      
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);
      
      const barWidth = (width / bufferLength) * 1.5;
      let x = 0;
      
      // Mirror the bars for a premium visualizer effect
      for (let i = 0; i < bufferLength; i++) {
        const value = dataArray[i];
        const percent = value / 255;
        const barHeight = percent * height * 0.8;
        
        const r = 37 + (percent * 50);
        const g = 99 + (percent * 85);
        const b = 235 + (percent * 20);
        
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        
        // Draw centered bars
        ctx.fillRect(x, (height - barHeight) / 2, barWidth - 1, barHeight);
        x += barWidth;
      }
    };
    
    draw();
  };

  const stopVisualizer = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const startRecording = async () => {
    audioChunksRef.current = [];
    setAudioUrl(null);
    onAudioSaved(null);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        onAudioSaved(audioBlob);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      startTimer();
      startVisualizer(stream);
    } catch (error) {
      console.error('Error starting audio recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      stopTimer();
      stopVisualizer();
    }
  };

  const deleteRecording = () => {
    setAudioUrl(null);
    onAudioSaved(null);
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center p-5 rounded-2xl glass-input w-full">
      {!isRecording && !audioUrl && (
        <button
          type="button"
          onClick={startRecording}
          className="flex flex-col items-center justify-center p-6 bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20 dark:text-blue-300 dark:hover:bg-primary/30 rounded-full cursor-pointer transition-all duration-300 shadow-sm"
        >
          <Mic size={32} className="animate-pulse" />
          <span className="text-xs font-semibold mt-2">Record Voice Complaint</span>
        </button>
      )}

      {isRecording && (
        <div className="flex flex-col items-center w-full">
          <canvas 
            ref={canvasRef} 
            className="w-full h-16 rounded-lg mb-3"
            width={320}
            height={64}
          />
          <div className="flex items-center gap-4">
            <span className="text-red-500 font-mono text-sm animate-pulse flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500 inline-block"></span>
              REC {formatTime(recordingTime)}
            </span>
            
            <button
              type="button"
              onClick={stopRecording}
              className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors cursor-pointer"
            >
              <Square size={16} />
            </button>
          </div>
        </div>
      )}

      {audioUrl && (
        <div className="flex items-center justify-between w-full p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <div className="flex items-center gap-2">
            <Volume2 size={16} className="text-slate-500" />
            <audio src={audioUrl} controls className="h-8 max-w-[200px] sm:max-w-xs md:max-w-md scale-95" />
          </div>
          
          <button
            type="button"
            onClick={deleteRecording}
            className="p-2 text-red-500 hover:bg-red-500/10 rounded-full transition-colors cursor-pointer"
            title="Delete recording"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}
    </div>
  );
};
