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

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const dataArray = useRef<Uint8Array | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const [recordingTime, setRecordingTime] = useState<number>(60);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    nationalCode: "",
    payload: false,
    message: "",
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
          extractUserInfoFromText(data.text);
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
    const messages = [
      {
        content: `
        Respond only in JSON format. Extract and structure the input into these fields:
        - 'firstName': the name of user.

        All responses must be in Persian (Farsi).
      `,
        role: "sytem",
      },
      {
        content: text,
        role: "user",
      },
    ];

    const payload = {
      model: "gpt-4o",
      messages: messages,
      temperature: 1,
      max_tokens: 4096,
      top_p: 1,
    };

    try {
      const response = await fetch(
        "https://api.metisai.ir/api/v1/chat/session",
        {
          method: "POST",
          headers: {
            Authorization: "Bearer tpsg-fZjznCMESRkQnVIrylqg8zZA4QvUVWn",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("⛔ خطای سرور:", errorText);
        throw new Error("پاسخ نامعتبر  ");
      }

      const data = await response.json();

      const result = data?.choices?.[0]?.message?.content;
      console.log("✅ پاسخ :", result);

      return result;
    } catch (err: any) {
      console.error("❌ خطا:", err.message);
      throw err;
    }
  };
  const extractUserInfoFromText = (
    text: string
  ) => {
    const result = {
      firstName: "",
      lastName: "",
      nationalCode: "",
      payload: false,
      message: "",
    };

   
    const nationalCodeMatch = text.match(/\b\d{10}\b/);
    if (nationalCodeMatch) {
      result.nationalCode = nationalCodeMatch[0];
    }

    const nameMatch =
      text.match(/من\s+([آ-ی]+)\s+([آ-ی]+)\s+هستم/) ||
      text.match(/اسم\s+من\s+([آ-ی]+)\s+([آ-ی]+)\s+است/) ||
      text.match(/من\s+([آ-ی]+)\s+([آ-ی]+)\s+ام/);

    if (nameMatch) {
      result.firstName = nameMatch[1];
      result.lastName = nameMatch[2];

      setFormData((prev: any) => ({
        ...prev,
        firstName: result.firstName,
        lastName: result.lastName,
        nationalCode: result.nationalCode || prev.nationalCode,
      }));
    }

    if (result.firstName && result.nationalCode) {
      result.payload = true;
    } else {
      result.message = "نام یا کد ملی به درستی تشخیص داده نشد.";
    }

    return result;
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
