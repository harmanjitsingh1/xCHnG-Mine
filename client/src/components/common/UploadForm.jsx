import { useState, useRef } from "react";
import { UploadCloud, Upload, X } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  fetchUploadUrlThunk,
  saveFileMetadataThunk,
} from "@/store/thunks/file.thunk.js";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import { v4 as uuidv4 } from "uuid";

export default function UploadForm({ onUploaded }) {
  const [msg, setMsg] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const uploadCancelToken = useRef(null);
  const dispatch = useDispatch();

  // Item/file data
  const [file, setFile] = useState(null);
  const [tags, setTags] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemRentalCost, setItemRentalCost] = useState("");
  const [offerType, setOfferType] = useState("Exchange/Sale/Donate/Rent");

  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    "text/csv",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/heif",
    "image/heic",
  ];

  function validateFile(selectedFile) {
    if (!allowedTypes.includes(selectedFile.type)) {
      setMsg("Invalid file type. Only documents & images allowed.");
      return false;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setMsg("File too large. Max size is 10MB.");
      return false;
    }
    return true;
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) {
      setMsg("Please select a file first.");
      return;
    }

    try {
      setMsg("Uploading Item...");
      setUploading(true);

      const res = await dispatch(
        fetchUploadUrlThunk({ fileName: file.name, fileType: file.type }),
      );

      uploadCancelToken.current = axios.CancelToken.source();

      const { uploadUrl, fileKey } = res.payload;

      await axios.put(uploadUrl, file, {
        headers: {
          "Content-Type": file.type,
        },
        onUploadProgress: (progressEvent) => {
          const prog = (progressEvent.loaded / progressEvent.total) * 100;
          setProgress(prog);
        },
        cancelToken: uploadCancelToken.current.token,
      });

      await dispatch(
        saveFileMetadataThunk({
          originalName: file.name,
          fileKey,
          fileType: file.type,
          fileSize: file.size,
          tags,
          itemPrice,
          itemRentalCost,
          offerType,
        }),
      );

      setFile(null);
      setTags("");
      setItemPrice("");
      setItemRentalCost("");
      setOfferType("Exchange/Sale/Donate/Rent");
      setProgress(0);
      setMsg("Upload successful. Wait for admin approval.");
      toast.success("Upload successful. Wait for admin approval.");

      if (onUploaded) {
        onUploaded({ fileKey, tags });
      }
    } catch (err) {
      if (axios.isCancel(err)) {
        setMsg("Upload canceled");
        toast.error("Upload canceled");
      } else {
        console.error(err);
        setMsg("Upload failed");
        toast.error("Upload failed");
      }
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setMsg("");
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      if (validateFile(selectedFile)) setFile(selectedFile);
    }
  }

  function handleFileChange(e) {
    setMsg("");
    const selectedFile = e.target.files[0];
    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile);
    }
  }

  function cancelUpload() {
    setMsg("");
    if (uploadCancelToken.current) {
      uploadCancelToken.current.cancel("Upload canceled by user");
    }
  }

  return (
    <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 mb-30 sm:p-8 shadow-md">
      <div className="text-center mb-5">
        <UploadCloud className="mx-auto h-12 w-12 text-indigo-600" />
        <h1 className="mt-3 text-xl sm:text-2xl font-bold text-gray-800">
          Upload Your Item Image (Exchange/Sale/Donate/Rent)
        </h1>
        <p className="mt-1 text-gray-500">
          Choose a document or image and upload securely
        </p>
      </div>

      <form onSubmit={handleUpload} className="space-y-5">
        {/* File Upload Zone */}
        <div
          className={`flex flex-col items-center justify-center w-full rounded-xl border-2 border-dashed p-6 sm:p-8 text-center cursor-pointer transition ${
            dragActive
              ? "border-primary bg-primary/5"
              : "border-gray-300 bg-gray-50"
          }`}
          onClick={() => document.getElementById("fileInput").click()}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setDragActive(false);
          }}
        >
          {file ? (
            <div className="flex items-center gap-3">
              <p className="text-gray-700 font-medium truncate max-w-[220px]">
                {file.name}
              </p>
              <button
                type="button"
                className="text-gray-400 hover:text-red-500"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
                disabled={uploading}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <>
              <Upload className="h-9 w-9 text-gray-400 mb-2" />
              <p className="text-gray-600 font-medium">
                Drag & drop or click to select a item
              </p>
              <p className="text-xs text-gray-400 mt-1">
                PDF, DOCX, PPT, TXT, JPG, PNG up to 10MB
              </p>
            </>
          )}
          <input
            id="fileInput"
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Tags */}
        <div className="flex flex-col">
          <Label className="text-sm text-gray-800 mb-1 px-2">
            Item Tags (Optional)
          </Label>
          <Input
            type="text"
            placeholder="Enter tags (comma separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            disabled={uploading}
            className="w-full !px-4 !py-5 !text-lg rounded-lg border-2 focus:border-2 !focus-visible:outline-none focus-visible:ring-0"
          />
        </div>

        <div className="flex flex-col">
          <Label className="text-sm text-gray-800 mb-1 px-2">
            Item Price (Optional)
          </Label>
          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Enter Item Price (In Rupees ₹)"
            value={itemPrice}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "") {
                setItemPrice("");
                return;
              }
              if (/^\d+$/.test(val)) {
                setItemPrice(val);
              }
            }}
            disabled={uploading}
            className="w-full !px-4 !py-5 !text-lg rounded-lg border-2 focus:border-2 !focus-visible:outline-none focus-visible:ring-0"
          />
        </div>

        <div className="flex flex-col">
          <Label className="text-sm text-gray-800 mb-1 px-2">
            Item Rental Cost (Optional)
          </Label>
          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Enter Item Rental Cost (In Rupees ₹)"
            value={itemRentalCost}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "") {
                setItemRentalCost("");
                return;
              }
              if (/^\d+$/.test(val)) {
                setItemRentalCost(val);
              }
            }}
            disabled={uploading}
            className="w-full !px-4 !py-5 !text-lg rounded-lg border-2 focus:border-2 !focus-visible:outline-none focus-visible:ring-0"
          />
        </div>

        <div className="flex flex-col">
          <Label className="text-sm text-gray-800 mb-1 px-2">Offer Type</Label>
          <Select
            onValueChange={(value) => setOfferType(value)}
            value={offerType}
            defaultValue={offerType}
          >
            <SelectTrigger className="w-full !px-4 !py-5 !text-lg rounded-lg border-2 focus:border-2 !focus-visible:outline-none focus-visible:ring-0">
              <SelectValue placeholder="Select offer type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="exchange">
                <div className="flex items-center gap-2">Exchange</div>
              </SelectItem>
              <SelectItem value="sale">
                <div className="flex items-center gap-2">Sale</div>
              </SelectItem>
              <SelectItem value="donate">
                <div className="flex items-center gap-2">Donate</div>
              </SelectItem>
              <SelectItem value="rent">
                <div className="flex items-center gap-2">Rent</div>
              </SelectItem>
              <SelectItem value="Exchange/Sale/Donate/Rent">
                <div className="flex items-center gap-2">
                  Exchange/Sale/Donate/Rent
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Progress Bar */}
        {progress > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={uploading}
            className={`w-full flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 sm:py-3 font-semibold text-white shadow-md transition ${
              uploading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-primary hover:opacity-90 cursor-pointer"
            }`}
          >
            {uploading ? (
              `Uploading... ${Math.round(progress)}%`
            ) : (
              <>
                <Upload className="h-5 w-5" /> Upload Item Image
              </>
            )}
          </button>

          {uploading && (
            <Button
              type="button"
              onClick={cancelUpload}
              className="rounded-xl bg-red-500 px-4 py-2.5 sm:py-3 font-semibold text-white shadow-md transition hover:opacity-90"
            >
              Cancel
            </Button>
          )}
        </div>

        {/* Message */}
        {msg && (
          <p className="text-center text-sm font-medium text-gray-600">{msg}</p>
        )}
      </form>
    </div>
  );
}
