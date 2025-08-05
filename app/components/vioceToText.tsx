"use client";
import React, { useState, useRef, useEffect } from "react";
import useVoiceAssistance from "./useVoiceAssistant";
import { SlMicrophone } from "react-icons/sl";
import { SlTrash } from "react-icons/sl";
import { SlCursor } from "react-icons/sl";

const VoiceToTextWithApi = () => {
  const {
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
    setTranscript,
    formData,
  } = useVoiceAssistance();
  console.log(formData);
  return (
    <div className="p-4 rounded-xl border border-gray-400 shadow w-full  mx-auto mt-8">
      <h3 className="text-lg mb-4 text-center text-blue-950">
        در صورتی که فرصت یا امکان تکمیل فرم را ندارید، می‌توانید با ضبط صدای
        خود، اطلاعات موردنیاز را بیان کنید تا به‌صورت خودکار در فرم ثبت شوند.
      </h3>

      <div className="flex items-center justify-center gap-4 mb-4">
        <button
          onClick={startRecording}
          disabled={isRecording || loading}
          className="px-4 py-2 bg-blue-500 text-white rounded-xl disabled:opacity-50 cursor-pointer"
        >
          <SlMicrophone className="text-xl" />
        </button>

        <button
          onClick={stopRecording}
          disabled={!isRecording || loading}
          className="px-4 py-2 bg-blue-500 flex items-center text-white rounded-xl disabled:opacity-50 cursor-pointer"
        >
          <SlCursor className="ml-2"/>
          توقف و ارسال
        </button>
        <button
          disabled={isRecording || loading}
          onClick={() => {
            setAudioBlob(null);
            setAudioURL(null);
            setError(null);
              setTranscript("")

          }}
          className="px-4 py-2 bg-orange-500 text-white rounded-xl disabled:opacity-50 cursor-pointer"
        >
          <SlTrash className="text-xl text-white-500" />
        </button>
      </div>

      {loading && (
        <p className="text-center text-blue-600 mb-3">
          در حال ارسال و پردازش...
        </p>
      )}

      {audioUrl && (
        <div className="">
          <h3 className="mb-2 flex items-center">پخش فایل ضبط‌شده:</h3>
          <audio controls src={audioUrl} />
        </div>
      )}

      <textarea
        value={transcript ? transcript : error ? error : ""}
        readOnly
        rows={6}
        className={`${
          error && error !== null ? "text-red-500" : "text-black"
        } w-full p-3 border border-gray-300 rounded-lg mt-4`}
        placeholder="محتوای فایل صوتی در قالب متن، در این بخش نشان داده میشود."
      />
    </div>
  );
};

export default VoiceToTextWithApi;
