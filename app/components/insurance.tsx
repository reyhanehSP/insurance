"use client";

import React from "react";
import VoiceToTextWithApi from "./vioceToText";
import useVoiceAssistance from "./useVoiceAssistant";

export default function InsuranceForm() {
  const { formData } = useVoiceAssistance();
  return (
    <div className="max-w-4xl mx-auto border border-gray-400 p-6 bg-white shadow-lg rounded-2xl my-5">
      <h1 className="text-2xl font-bold mb-6 text-center text-blue-950">فرم درخواست بیمه</h1>
      <VoiceToTextWithApi />
      <SectionHeader title="اطلاعات شخصی" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Input label="نام" value={formData.firstName} />
        <Input label="نام خانوادگی" />
        <Input label="کد ملی" />
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
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <h2 className="text-xl font-semibold border-r-4 dark:text-black border-blue-600 pr-3 mb-4 mt-6">
      {title}
    </h2>
  );
}

function Input({
  label,
  value,
  type = "text",
}: {
  label: string;
  type?: string;
  value?: string
}) {
  return (
    <div className="flex flex-col">
      <label className="mb-1 text-sm font-medium dark:text-black">{label}</label>
      <input
        type={type}
        className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

function FileInput({ label }: { label: string }) {
  return (
    <div className="flex flex-col">
      <label className="mb-1 text-sm font-medium dark:text-black">
        {label}
      </label>
      <input
        type="file"
        className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
