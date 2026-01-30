import React, { useState, useRef } from "react";
import { Loader2, Upload, X, Image as ImageIcon, Send } from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom"; // Assuming react-router-dom
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    message: "",
  });
  const [screenshots, setScreenshots] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      // Validate: Max 2 files total
      if (screenshots.length + newFiles.length > 2) {
        alert("You can only upload a maximum of 2 screenshots.");
        return;
      }
      setScreenshots((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index) => {
    setScreenshots((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      console.log("Form Data:", formData);
      console.log("Files:", screenshots);
      setLoading(false);
      toast.success("Ticket submitted successfully!");
    }, 2000);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-6 bg-white">
      {/* Increased max-width slightly to max-w-md for better textarea/upload UX, 
          but kept the vibe identical */}
      <div className="w-full max-w-md flex flex-col items-center space-y-8">
        {/* Title + Subtext */}
        <div className="text-center space-y-1">
          <h2 className="text-3xl font-bold text-gray-900">Contact Support</h2>
          <p className="text-gray-500">
            Having trouble exchanging? Let us know how we can help.
          </p>
        </div>

        {/* Form */}
        <form
          className="flex w-full flex-col space-y-4"
          autoComplete="off"
          onSubmit={handleSubmit}
        >
          {/* Username */}
          <div className="flex flex-col">
            <Label className="text-sm text-gray-800 mb-1 px-2">Username</Label>
            <Input
              type="text"
              placeholder="Enter your username"
              name="username"
              autoComplete="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full !px-4 !py-6 !text-lg rounded-lg border-2 focus:border-2 !focus-visible:outline-none focus-visible:ring-0"
              required
            />
          </div>

          {/* Email */}
          <div className="flex flex-col">
            <Label className="text-sm text-gray-800 mb-1 px-2">
              Email Address
            </Label>
            <Input
              type="email"
              placeholder="Enter your email"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full !px-4 !py-6 !text-lg rounded-lg border-2 focus:border-2 !focus-visible:outline-none focus-visible:ring-0"
              required
            />
          </div>

          {/* Problem Description */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-800 mb-1 px-2 font-medium">
              Describe your problem
            </label>
            <textarea
              placeholder="Tell us what went wrong..."
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={4}
              className="w-full !px-4 !py-2 !text-lg rounded-lg border-2 border-gray-200 focus:border-black !focus-visible:outline-none focus-visible:ring-0 resize-none transition-colors"
              required
            />
          </div>

          {/* Screenshot Upload (Max 2) */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-800 mb-1 px-2 font-medium flex justify-between">
              <span>Screenshots (Optional)</span>
              <span className="text-gray-400 text-xs mt-0.5">
                {screenshots.length}/2
              </span>
            </label>

            {/* Upload Area */}
            {screenshots.length < 2 && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-gray-400 transition-all group mb-3"
              >
                <Upload
                  className="text-gray-400 group-hover:text-gray-600 mb-2"
                  size={24}
                />
                <p className="text-sm text-gray-500 font-medium">
                  Click to upload image
                </p>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
              </div>
            )}

            {/* File Previews */}
            {screenshots.length > 0 && (
              <div className="space-y-2">
                {screenshots.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <div className="bg-white p-1 rounded border border-gray-200">
                        <ImageIcon size={16} className="text-gray-500" />
                      </div>
                      <span className="text-sm text-gray-700 truncate max-w-[150px]">
                        {file.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}

          <Button
            type="submit"
            disabled={loading}
            className="text-lg w-full py-6 rounded-lg font-semibold transition-transform shadow-lg cursor-pointer text-white"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <span className="flex items-center gap-2">
                Submit Ticket <Send size={18} />
              </span>
            )}
          </Button>
        </form>

        {/* Footer */}
        <p className="text-sm text-gray-600">
          Want to try solving it yourself?{" "}
          <Link to="/faq" className="font-medium text-black hover:underline">
            Visit FAQ
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ContactUs;
