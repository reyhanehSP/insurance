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
    setFormData
  } = useVoiceAssistance();
function SectionHeader({ title }: { title: string }) {
  return (
    <h2 className="text-xl font-semibold border-r-4 dark:text-black border-blue-600 pr-3 mb-4 mt-6">
      {title}
    </h2>
  );
}

function Input({
  name,
  label,
  value,
  type = "text",
  onChange,
}: {
  name ?:string;
  label: string;
  type?: string;
  value?: string;
   onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="flex flex-col">
      <label className="mb-1 text-sm font-medium dark:text-black">
        {label}
      </label>
      <input
       name={name}
        value={value}
       onChange={onChange}
        type={type}
        className={`${value ? "bg-blue-100" : ""} border border-gray-300 text-black rounded-lg px-4 py-2  focus:ring-blue-500`}
      />
    </div>
  );
}

function FileInput({ label , value }: { label: string; value?: string
}) {
  return (
    <div className="flex flex-col">
      <label className="mb-1 text-sm font-medium dark:text-black">
        {label}
      </label>
      <input
        value={value}
       
        onChange={(e) => e.target.value}
        type="file"
        className="border border-gray-300 text-black rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
  return (
    <>
    
    <div className="max-w-4xl mx-auto border border-gray-400 p-6 bg-white shadow-lg rounded-2xl my-5">
          <h1 className="text-2xl font-bold mb-6 text-center text-blue-950">
            فرم درخواست بیمه
          </h1>
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
              setTranscript("");
              setFormData({
                 firstName: "",
    nationalCode: "",
              })

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
          <h3 className="mb-2 flex items-center dark:text-black">پخش فایل ضبط‌شده:</h3>
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
          <SectionHeader title="اطلاعات شخصی" />
          <p className={`${loading ? "text-red-500" : "text-black"} `}>
            {loading ? "در حال دریافت اطلاعات" : ""}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Input label="نام" value={formData?.firstName || ""} name="firstName"  onChange={(e) =>
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }/>
            <Input label="نام خانوادگی" />
            <Input label="کد ملی" value={formData?.nationalCode || ""} name="nationalCode"  onChange={(e) =>
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }/>
            <Input label="تاریخ تولد" type="date" />
            <Input label="شماره تماس" />
            <Input label="ایمیل" />
            <Input label="آدرس محل سکونت" />
          </div>
    
          <SectionHeader title="اطلاعات بیمه‌ای" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Input label="نوع بیمه (شخص ثالث، بدنه، درمان، عمر و...)" />
            <Input label="تاریخ شروع بیمه" type="date" />
            <Input label="تاریخ پایان بیمه" type="date" />
            <Input label="شماره بیمه‌نامه (در صورت تمدید)" />
            <Input label="نام شرکت بیمه‌گر قبلی (در صورت وجود)" />
          </div>
    
          <SectionHeader title="اطلاعات خودرو " />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Input label="شماره پلاک خودرو" />
            <Input label="مدل خودرو" />
            <Input label="سال ساخت" />
            <Input label="شماره شاسی" />
            <Input label="شماره موتور" />
          </div>
    
          <SectionHeader title="اطلاعات درمانی " />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Input label="وضعیت سلامت کلی" />
            <Input label="سابقه بیماری خاص" />
            <Input label="سابقه بستری یا جراحی در ۵ سال اخیر" />
          </div>
    
          <SectionHeader title="بارگذاری مدارک" />
          <div className="grid grid-cols-1 gap-4 mb-8">
            <FileInput label="بارگذاری تصویر کارت ملی" />
            <FileInput label="بارگذاری تصویر سند خودرو (در صورت بیمه خودرو)" />
            <FileInput label="بارگذاری نسخه‌های پزشکی (در صورت بیمه درمانی)" />
          </div>
    
          <button className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-all font-semibold">
            ارسال فرم
          </button>
        </div>
    </>
   
  );
};

export default VoiceToTextWithApi;
