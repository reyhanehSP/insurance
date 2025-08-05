"use client";
import React, { useState, useRef, useEffect } from "react";

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
  const stopRecording = () => {
    if (!mediaRecorder.current) {
      setError("ضبط شروع نشده بود");
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

      formData.append("file", wavBlob, "./assets/recording.wav");
      try {
        const res = await fetch(
          "https://api.alobegoo.com/ai-noauth/transcribe",
          {
            method: "POST",
            body: formData,
          }
        );
        if (!res.ok) throw new Error(`خطا در ارسال به سرور: ${res.statusText}`);
        const data = await res.json();
        setTranscript(data.text);
        if (data?.text) {
          sendStructuredPromptToMetis(data.text);
        } else {
          setError("خطا در دریافت فایل صوتی");
        }
      } catch (err: any) {
        setError(err.message || "خطا در تبدیل صدا به متن");
      } finally {
        setLoading(false);
      }
    };

    mediaRecorder.current.stop();

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };
  const sendStructuredPromptToMetis = async (text: string) => {
    if (!text.trim()) {
      setResult("لطفا یک پیام وارد کنید.");
      return;
    }
    try {
      // 1️⃣ ساخت Session
      const sessionRes = await fetch(urlAi, {
        method: "POST",
        headers: headersAi,
        body: JSON.stringify({
          botId: "c65e5439-0f1d-46c3-b8bf-75d286a9d3f8",
          user: null,
          initialMessages: null,
        }),
      });

      if (!sessionRes.ok) {
        throw new Error("خطا در ایجاد سشن");
      }
      const sessionData = await sessionRes.json();
      const sessionId = sessionData.id;

      const chatUrl = `https://api.metisai.ir/api/v1/chat/session/${sessionId}/message`;
      const chatRes = await fetch(chatUrl, {
        method: "POST",
        headers: headersAi,
        body: JSON.stringify({
          message: {
            content: text,
            type: "USER",
          },
        }),
      });


      if (!chatRes.ok) {
        throw new Error("خطا در ارسال پیام به ربات");
      }
      setLoading(true)
      const chatData = await chatRes.json();
      if (chatData.id !== "") {
        setLoading(false);
        const cleaned = chatData.content.replace(/```json|```/g, "").trim();
        console.log(cleaned);
        const parsed = JSON.parse(cleaned);
        console.log(parsed);
        setFormData(parsed);
        setResult(JSON.stringify(chatData, null, 2));
      }
      
    } catch (err: any) {
      setResult("❌ خطا: " + err.message);
    } finally {
      setLoading(false);
    }
  };
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
