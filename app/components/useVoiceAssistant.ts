"use client";
import { useMutation } from "@tanstack/react-query";
import React, { useState, useRef, useEffect } from "react";
import { transcribeAudio } from "./api";
import { sendTextToMetis } from "./metis";

const useVoiceAssistance = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [audioUrl, setAudioURL] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const audioContext = useRef<AudioContext | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const [result, setResult] = useState("");
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const dataArray = useRef<Uint8Array | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const [recordingTime, setRecordingTime] = useState<number>(60);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const urlAi = "https://api.metisai.ir/api/v1/chat/session";
  const headersAi = {
    "Content-Type": "application/json",
    Authorization: "Bearer tpsg-fZjznCMESRkQnVIrylqg8zZA4QvUVWn",
  };

  const [formData, setFormData] = useState({
    firstName: "",
    nationalCode: "",
  });
  useEffect(() => {
    if (typeof window === "undefined") return;
    audioContextRef.current = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      audioContext.current = new AudioContext();
      const source = audioContext.current.createMediaStreamSource(stream);
      analyser.current = audioContext.current.createAnalyser();
      source.connect(analyser.current);
      analyser.current.fftSize = 128;

      const bufferLength = analyser.current.frequencyBinCount;
      dataArray.current = new Uint8Array(bufferLength);

      mediaRecorder.current.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/wav" });
        setAudioBlob(audioBlob);
        setAudioURL(URL.createObjectURL(audioBlob));
        cancelAnimationFrame(animationFrameId.current!);
        clearInterval(timerRef.current!);
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      let time = 60;
      timerRef.current = setInterval(() => {
        time -= 1;
        setRecordingTime(time);
        if (time === 0) {
          stopRecording();
        }
      }, 1000);
    } catch (error) {
      throw new Error("خطا در دسترسی به میکروفون در دستیار صوتی");
    }
  };

  const convertToWav = async (audioBlob: Blob): Promise<Blob> => {
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioContext = new AudioContext();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const numOfChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const length = audioBuffer.length * numOfChannels * 2 + 44;
    const buffer = new ArrayBuffer(length);
    const view = new DataView(buffer);
    let offset = 0;

    const writeString = (str: string) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset++, str.charCodeAt(i));
      }
    };

    const writeInt16 = (value: number) => {
      view.setInt16(offset, value, true);
      offset += 2;
    };

    // WAV Header
    writeString("RIFF");
    view.setUint32(offset, length - 8, true);
    offset += 4;
    writeString("WAVE");
    writeString("fmt ");
    view.setUint32(offset, 16, true);
    offset += 4;
    view.setUint16(offset, 1, true);
    offset += 2;
    view.setUint16(offset, numOfChannels, true);
    offset += 2;
    view.setUint32(offset, sampleRate, true);
    offset += 4;
    view.setUint32(offset, sampleRate * numOfChannels * 2, true);
    offset += 4;
    view.setUint16(offset, numOfChannels * 2, true);
    offset += 2;
    view.setUint16(offset, 16, true);
    offset += 2;
    writeString("data");
    view.setUint32(offset, length - offset - 4, true);
    offset += 4;

    // Write PCM data
    for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
      const channelData = audioBuffer.getChannelData(i);
      for (let j = 0; j < channelData.length; j++) {
        writeInt16(channelData[j] * 0x7fff);
      }
    }

    return new Blob([buffer], { type: "audio/wav" });
  };
  const transMutation = useMutation({
    mutationFn: transcribeAudio,
    onSuccess: (data) => {
      if (data?.text) {
        setTranscript(data.text);
        sendTextToMetisMutation.mutate(data.text);
      } else {
        setError("خطا در دریافت فایل صوتی");
        setLoading(false);
      }
    },
    onError: (err: any) => {
      setError(err?.message || "خطا در تبدیل صدا به متن");
      setLoading(false);
    },
  });
  const stopRecording = () => {
    if (!mediaRecorder.current) {
      setError("ضبط شروع نشده بود");
      setLoading(false);
      return;
    }
    setIsRecording(false);
    setLoading(true);
    setError(null);

    mediaRecorder.current.onstop = async () => {
      const audioBlob = new Blob(audioChunks.current, { type: "audio/wav" });
      setAudioBlob(audioBlob);
      setAudioURL(URL.createObjectURL(audioBlob));

      // ارسال به API
      const formData = new FormData();
      const wavBlob = await convertToWav(audioBlob);

      formData.append("file", wavBlob, "recording.wav");

      transMutation.mutate(formData);
    };

    mediaRecorder.current.stop();

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };
  const sendTextToMetisMutation = useMutation({
    mutationFn: sendTextToMetis,
    onSuccess: ({ parsed, raw }) => {
      console.log(parsed);
      setFormData(parsed);
      setResult(JSON.stringify(raw, null, 2));
    },
    onError: (err: any) => {
      setResult("❌ خطا: " + err.message);
    },
  });
  return {
    startRecording,
    isRecording,
    loading,
    stopRecording,
    error,
    transcript,
    audioUrl,
    setAudioBlob,
    setAudioURL,
    setError,
    formData,
    setTranscript,
  };
};

export default useVoiceAssistance;
