'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { CloudArrowUpIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import type { TranscriptionResponse } from '@/app/types/mediaRecorder';

export default function UploadPage() {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      toast.error('Please upload an audio file');
      return;
    }

    const transcribePromise = async () => {
      setIsTranscribing(true);
      setError(null);
      try {
        const formData = new FormData();
        formData.append('audio', file);

        const response = await fetch('/api/transcribe', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to transcribe audio');
        }

        const data: TranscriptionResponse = await response.json();
        setTranscription(data.transcription);
        return data;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to process audio';
        setError(message);
        throw new Error(message);
      } finally {
        setIsTranscribing(false);
      }
    };

    toast.promise(transcribePromise(), {
      loading: 'Transcribing audio...',
      success: 'Transcription completed!',
      error: (err) => err.message,
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a', '.ogg']
    },
    maxFiles: 1
  });

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Upload Audio</h1>

      <div className="bg-slate-800 rounded-lg p-6 space-y-6">
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-slate-600 hover:border-slate-500'}
          `}
        >
          <input {...getInputProps()} />
          <CloudArrowUpIcon className="w-12 h-12 mx-auto mb-4 text-slate-400" />
          {isDragActive ? (
            <p className="text-blue-400">Drop the audio file here</p>
          ) : (
            <div>
              <p className="text-slate-300">Drag and drop an audio file here, or click to select</p>
              <p className="text-sm text-slate-500 mt-2">Supported formats: MP3, WAV, M4A, OGG</p>
            </div>
          )}
        </div>

        {isTranscribing && (
          <div className="text-center">
            <LoadingSpinner size="md" text="Processing audio..." />
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {transcription && (
          <div className="p-4 bg-slate-700 rounded-lg">
            <h3 className="text-sm font-semibold mb-2">Transcription Result:</h3>
            <p className="text-slate-300">{transcription}</p>
          </div>
        )}
      </div>
    </div>
  );
}