'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { ArrowUp, Loader2, Sparkles, Paperclip, Mic, X } from 'lucide-react';
import {
  buildMessageWithAttachment,
  readAttachmentText,
} from '../../lib/attachment-text';

export type ChatAttachment = {
  name: string;
  type: string;
  size: number;
  text: string;
};

type BottomCommandBarProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: (message: string) => void;
  placeholder?: string;
  isSending?: boolean;
  className?: string;
  inputRef?: React.RefObject<HTMLTextAreaElement | null>;
};

function extractTranscript(data: Record<string, unknown>): string {
  const raw = data.text ?? data.transcript ?? data.result ?? data.message;
  return typeof raw === 'string' ? raw.trim() : '';
}

export function BottomCommandBar({
  value,
  onChange,
  onSend,
  placeholder = 'Задайте вопрос AI консультанту...',
  isSending = false,
  className = '',
  inputRef: externalInputRef,
}: BottomCommandBarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const internalTextareaRef = useRef<HTMLTextAreaElement>(null);
  const textareaRef = externalInputRef ?? internalTextareaRef;
  const valueRef = useRef(value);
  valueRef.current = value;
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const [attachment, setAttachment] = useState<ChatAttachment | null>(null);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const inputLocked = isSending || isRecording || isTranscribing || isReadingFile;
  const canSend = Boolean(value.trim() || attachment) && !inputLocked;

  const stopStreamTracks = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current?.state !== 'inactive') {
        try {
          mediaRecorderRef.current?.stop();
        } catch {
          /* ignore */
        }
      }
      stopStreamTracks();
    };
  }, [stopStreamTracks]);

  const resizeTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, []);

  useEffect(() => {
    resizeTextarea();
  }, [value, resizeTextarea]);

  const clearAttachment = () => {
    setAttachment(null);
    setAttachmentError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAttachmentError(null);
    setIsReadingFile(true);
    try {
      const text = await readAttachmentText(file);
      setAttachment({
        name: file.name,
        type: file.type,
        size: file.size,
        text,
      });
    } catch (err) {
      setAttachment(null);
      setAttachmentError(err instanceof Error ? err.message : 'Failed to read file.');
    } finally {
      setIsReadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const transcribeBlob = async (blob: Blob) => {
    setIsTranscribing(true);
    try {
      const fd = new FormData();
      fd.append('file', blob, 'audio.webm');
      const res = await fetch('/api/transcribe', { method: 'POST', body: fd });
      const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
      if (!res.ok) {
        throw new Error(
          typeof data.error === 'string' ? data.error : 'Transcription failed',
        );
      }
      const transcript = extractTranscript(data);
      if (transcript) {
        const prev = valueRef.current;
        onChange(prev ? `${prev} ${transcript}` : transcript);
      }
    } catch (err) {
      setAttachmentError(
        err instanceof Error ? err.message : 'Transcription failed',
      );
    } finally {
      setIsTranscribing(false);
    }
  };

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
    }
    setIsRecording(false);
  }, []);

  const startRecording = async () => {
    setAttachmentError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) chunksRef.current.push(ev.data);
      };

      recorder.onstop = async () => {
        stopStreamTracks();
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        chunksRef.current = [];
        if (blob.size > 0) await transcribeBlob(blob);
      };

      recorder.start();
      setIsRecording(true);
    } catch {
      stopStreamTracks();
      setAttachmentError('Microphone access denied or unavailable.');
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) stopRecording();
    else void startRecording();
  };

  const handleSend = () => {
    if (!canSend) return;
    const message = buildMessageWithAttachment(value, attachment);
    onSend(message);
    onChange('');
    clearAttachment();
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(e) => void handleFileChange(e)}
      />

      {attachment && (
        <div className="mb-2 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 max-w-full px-3 py-1 rounded-full bg-slate-100 text-xs text-slate-700 truncate">
            <Paperclip size={12} className="shrink-0 text-slate-400" />
            <span className="truncate">{attachment.name}</span>
            <button
              type="button"
              onClick={clearAttachment}
              disabled={inputLocked}
              className="shrink-0 p-0.5 rounded-full hover:bg-slate-200 text-slate-500 disabled:opacity-40"
              aria-label="Удалить вложение"
            >
              <X size={12} />
            </button>
          </span>
        </div>
      )}

      {attachmentError && (
        <p className="mb-2 text-xs text-red-500">{attachmentError}</p>
      )}

      <div
        className={`flex items-end gap-2 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border bg-white pl-2 pr-2 py-2 transition-colors ${
          inputLocked ? 'border-slate-200 opacity-90' : 'border-slate-200 focus-within:border-proji-primary/40'
        }`}
      >
        <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mb-0.5">
          <Sparkles size={18} className="text-proji-primary" />
        </div>

        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          disabled={inputLocked}
          className="flex-1 min-w-0 resize-none bg-transparent text-sm text-proji-dark placeholder:text-slate-400 focus:outline-none py-1.5 disabled:opacity-60"
          style={{ minHeight: 24 }}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={inputLocked}
          className="p-1 shrink-0 mb-0.5 disabled:opacity-40"
          aria-label="Прикрепить файл"
        >
          {isReadingFile ? (
            <Loader2 size={18} className="text-slate-400 animate-spin" />
          ) : (
            <Paperclip size={18} className="text-slate-400" />
          )}
        </button>

        <button
          type="button"
          onClick={toggleRecording}
          disabled={isSending || isTranscribing || isReadingFile}
          className={`p-1 shrink-0 mb-0.5 hidden sm:block disabled:opacity-40 ${
            isRecording ? 'text-red-500' : ''
          }`}
          aria-label={isRecording ? 'Остановить запись' : 'Голосовой ввод'}
        >
          {isTranscribing ? (
            <Loader2 size={18} className="text-slate-400 animate-spin" />
          ) : (
            <Mic size={18} className={isRecording ? 'text-red-500' : 'text-slate-400'} />
          )}
        </button>

        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 text-white flex items-center justify-center disabled:opacity-40 transition-all hover:opacity-90 mb-0.5"
        >
          {isSending ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <ArrowUp size={15} />
          )}
        </button>
      </div>
    </div>
  );
}
