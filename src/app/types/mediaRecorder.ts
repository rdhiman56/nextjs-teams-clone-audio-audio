export type RecorderStatus = 'idle' | 'recording' | 'stopped' | 'acquiring_media' | 'failed';

export interface TranscriptionResponse {
  success: boolean;
  transcription: string;
  metadata?: {
    fileName: string;
    fileSize: number;
    fileType: string;
    duration?: string;
  };
}