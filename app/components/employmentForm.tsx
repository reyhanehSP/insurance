"use client";
import { useState, useEffect } from "react";

const EmploymentForm = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    position: "",
    availability: "",
    salary: "",
    recentEmployer: "",
    jobTitle: "",
    experience: "",
    comments: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      alert("Thank you for your application! We will contact you soon.");
    }, 1000);
  };

  useEffect(() => {
    const total = Object.keys(formData).length;
    const filled = Object.values(formData).filter(
      (val) => val.trim() !== ""
    ).length;
    const percent = (filled / total) * 100;
    setProgress(percent);
  }, [formData]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-400 via-blue-400 to-green-300 animate-[gradient_15s_ease_infinite] p-8">
      <div className="w-full max-w-3xl bg-white bg-opacity-90 backdrop-blur-md p-8 rounded-3xl shadow-2xl">
        <div className="w-full h-1 bg-gray-300 rounded mb-6 overflow-hidden">
          <div
            className="h-full bg-cyan-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Employment Application
        </h1>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Info */}
          <Section title="Personal Information">
            <div className="grid md:grid-cols-2 gap-4">
              <InputField
                label="First Name"
                id="firstName"
                value={formData.firstName}
                onChange={handleChange}
              />
              <InputField
                label="Last Name"
                id="lastName"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
            <InputField
              label="Email"
              id="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
            <InputField
              label="Phone"
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
            />
          </Section>

          {/* Employment Details */}
          <Section title="Employment Details">
            <InputField
              label="Position Applied For"
              id="position"
              value={formData.position}
              onChange={handleChange}
            />
            <InputField
              label="Available Start Date"
              id="availability"
              type="date"
              value={formData.availability}
              onChange={handleChange}
            />
            <InputField
              label="Expected Salary"
              id="salary"
              type="number"
              value={formData.salary}
              onChange={handleChange}
              placeholder="$"
            />
          </Section>

          {/* Experience */}
          <Section title="Experience">
            <InputField
              label="Most Recent Employer"
              id="recentEmployer"
              value={formData.recentEmployer}
              onChange={handleChange}
            />
            <InputField
              label="Job Title"
              id="jobTitle"
              value={formData.jobTitle}
              onChange={handleChange}
            />
            <div className="mb-4">
              <label htmlFor="experience" className="block text-gray-600 mb-1">
                Work Experience (Years)
              </label>
              <select
                id="experience"
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                value={formData.experience}
                onChange={handleChange}
                required
              >
                <option value="">Select experience</option>
                <option value="0-1">0-1 years</option>
                <option value="1-3">1-3 years</option>
                <option value="3-5">3-5 years</option>
                <option value="5+">5+ years</option>
              </select>
            </div>
          </Section>

          {/* Additional Info */}
          <Section title="Additional Information">
            <div className="mb-4">
              <label htmlFor="comments" className="block text-gray-600 mb-1">
                Why would you like to work with us?
              </label>
              <textarea
                id="comments"
                rows={4}
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                value={formData.comments}
                onChange={handleChange}
              ></textarea>
            </div>
          </Section>

          <button
            type="submit"
            className={`w-full py-3 text-white rounded-lg transition-all duration-300 text-lg font-medium ${
              submitted ? "bg-green-600" : "bg-cyan-500 hover:bg-cyan-600"
            }`}
          >
            {submitted ? "Application Submitted!" : "Submit Application"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmploymentForm;

// InputField component
const InputField = ({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder = "",
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: any;
  placeholder?: string;
}) => (
  <div className="mb-4">
    <label htmlFor={id} className="block text-gray-600 mb-1">
      {label}
    </label>
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-400"
      required
    />
  </div>
);

// Section component
const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div>
    <h2 className="text-xl font-semibold text-gray-700 border-b-2 border-cyan-400 mb-4">
      {title}
    </h2>
    {children}
  </div>
);
