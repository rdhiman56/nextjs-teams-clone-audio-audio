'use client';

import React, { useState, useEffect } from 'react';
import { useReactMediaRecorder } from 'react-media-recorder';
import { MicrophoneIcon, StopIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import type { RecorderStatus, TranscriptionResponse } from '@/app/types/mediaRecorder';

export default function RecordPage() {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    status,
    startRecording,
    stopRecording,
    mediaBlobUrl,
    clearBlobUrl
  } = useReactMediaRecorder({ 
    audio: true,
    onStop: () => {
      if (mediaBlobUrl) {
        toast.success('Recording completed');
      }
    }
  });

  useEffect(() => {
    const currentStatus = status as RecorderStatus;
    switch (currentStatus) {
      case 'acquiring_media':
        toast.loading('Accessing microphone...');
        break;
      case 'recording':
        toast.success('Recording started');
        break;
      case 'failed':
        setError('Microphone access denied or not available');
        toast.error('Microphone access denied or not available');
        break;
    }
  }, [status]);

  const handleSendAudio = async () => {
    if (!mediaBlobUrl) return;
    
    const transcribePromise = async () => {
      setIsTranscribing(true);
      setError(null);
      try {
        const audioBlob = await fetch(mediaBlobUrl).then(r => r.blob());
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.wav');

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
      success: (data) => `Transcription completed!`,
      error: (err) => err.message,
    });
  };

  const handleReset = () => {
    clearBlobUrl();
    setTranscription(null);
    setError(null);
  };

  const getStatusMessage = () => {
    if (error) return error;
    if (status === 'recording') return 'Recording in progress...';
    if (status === 'idle') return 'Click the microphone to start recording';
    if (isTranscribing) return 'Transcribing your audio...';
    if (transcription) return 'Transcription complete';
    return 'Ready to record';
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Record Audio</h1>
      
      <div className="bg-slate-800 rounded-lg p-6 space-y-6">
        <div className="flex justify-center items-center space-x-4">
          {!mediaBlobUrl ? (
            <button
              onClick={startRecording}
              disabled={status === 'recording'}
              className={`record-button ${status === 'recording' ? 'opacity-50' : ''}`}
              aria-label="Start recording"
            >
              <MicrophoneIcon className="h-6 w-6 text-white" />
            </button>
          ) : (
            <button
              onClick={handleReset}
              className="record-button bg-slate-600 hover:bg-slate-700"
              aria-label="Reset recording"
            >
              <ArrowPathIcon className="h-6 w-6 text-white" />
            </button>
          )}

          {status === 'recording' && (
            <button
              onClick={stopRecording}
              className="record-button bg-yellow-500 hover:bg-yellow-600"
              aria-label="Stop recording"
            >
              <StopIcon className="h-6 w-6 text-white" />
            </button>
          )}
        </div>

        <div className="text-center">
          {isTranscribing ? (
            <LoadingSpinner size="sm" text="Processing audio..." />
          ) : (
            <p className={`text-sm ${error ? 'text-red-400' : 'text-slate-400'}`}>
              {getStatusMessage()}
            </p>
          )}
        </div>

        {mediaBlobUrl && (
          <div className="space-y-4">
            <audio src={mediaBlobUrl} controls className="w-full" />
            <button
              onClick={handleSendAudio}
              disabled={isTranscribing}
              className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isTranscribing ? (
                <span className="flex items-center justify-center">
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Transcribing...</span>
                </span>
              ) : (
                'Send for Transcription'
              )}
            </button>
          </div>
        )}

        {transcription && (
          <div className="mt-4 p-4 bg-slate-700 rounded-lg">
            <h3 className="text-sm font-semibold mb-2">Transcription Result:</h3>
            <p className="text-slate-300">{transcription}</p>
          </div>
        )}
      </div>
    </div>
  );
}