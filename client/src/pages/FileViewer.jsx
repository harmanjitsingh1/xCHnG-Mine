import { Document, Page, pdfjs } from "react-pdf";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDownloadUrlThunk,
  getFileByIdThunk,
} from "@/store/thunks/file.thunk.js";
import { fetchUserRequestsThunk } from "@/store/thunks/request.thunk";
import {
  requestDownload,
  handleDownload,
  requestUpload,
} from "@/services/file.services.js";
import {
  Loader2,
  X,
  Download,
  Clock2,
  CheckCircle2,
  XCircle,
  RotateCw,
  BadgeCheckIcon,
} from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const getFileExtension = (filename) => {
  return filename?.split(".").pop().toLowerCase();
};

const FileContent = ({ file, viewUrl }) => {
  const extension = getFileExtension(file?.originalName);
  const [iframeLoading, setIframeLoading] = useState(true);

  if (!viewUrl) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>Loading file preview...</p>
      </div>
    );
  }

  if (["png", "jpg", "jpeg", "gif", "webp"].includes(extension)) {
    return (
      <div className="flex justify-center items-center h-full">
        <img
          src={viewUrl}
          alt={file.originalName}
          className="max-w-full max-h-[80vh] object-contain"
        />
      </div>
    );
  }

  if (["txt"].includes(extension)) {
    return (
      <iframe
        src={viewUrl}
        title={file.originalName}
        className="w-full h-full bg-gray-50 p-4 font-mono text-sm overflow-auto"
        frameBorder="0"
      >
        <p>Your browser does not support iframes, please download the file.</p>
      </iframe>
    );
  }

  if (extension === "pdf") {
    const [numPages, setNumPages] = useState(null);
    const [containerWidth, setContainerWidth] = useState(0);
    const containerRef = useRef(null);

    useEffect(() => {
      const updateWidth = () => {
        if (containerRef.current)
          setContainerWidth(containerRef.current.offsetWidth);
      };
      updateWidth();
      window.addEventListener("resize", updateWidth);
      return () => window.removeEventListener("resize", updateWidth);
    }, []);

    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center bg-gray-50 overflow-hidden">
        {iframeLoading && (
          <div className="absolute inset-0 z-10 bg-white/70 flex flex-col justify-center items-center">
            <Loader2 size={36} className="animate-spin text-blue-500" />
            <span className="mt-2 text-gray-600">Loading preview...</span>
          </div>
        )}

        <div
          ref={containerRef}
          className="w-full h-full flex justify-center overflow-y-auto px-2"
          style={{ scrollbarWidth: "none" }}
        >
          <Document
            file={viewUrl}
            onLoadSuccess={({ numPages }) => {
              setNumPages(numPages);
              setIframeLoading(false);
            }}
            onLoadError={(err) => {
              console.error("PDF load error:", err);
              setIframeLoading(false);
            }}
            loading={null}
          >
            {Array.from(new Array(numPages), (_, i) => (
              <Page
                key={`page_${i + 1}`}
                pageNumber={i + 1}
                width={containerWidth > 900 ? 900 : containerWidth - 20}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            ))}
          </Document>
        </div>
      </div>
    );
  }

  const [textContent, setTextContent] = useState(null);
  const [contentLoading, setContentLoading] = useState(false);

  useEffect(() => {
    if (viewUrl && extension === "csv" && !textContent) {
      setContentLoading(true);
      fetch(viewUrl)
        .then((res) => res.text())
        .then((rawText) => {
          setTextContent(rawText);
        })
        .catch((error) => {
          console.error("Failed to fetch text content:", error);
        })
        .finally(() => {
          setContentLoading(false);
        });
    }
    return () => {
      setTextContent(null);
    };
  }, [viewUrl, extension]);

  if (extension === "csv") {
    if (contentLoading || !textContent) {
      return (
        <div className="p-8 text-center text-gray-500">Loading CSV data...</div>
      );
    }

    const parseCSV = (text) => {
      const lines = text.split("\n").filter((line) => line.trim() !== "");
      return lines.map((line) => line.split(","));
    };
    const data = parseCSV(textContent);

    return (
      <div className="p-4 overflow-auto max-h-full">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            {data[0] && (
              <tr>
                {data[0].map((header, index) => (
                  <th
                    key={index}
                    className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            )}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.slice(1).map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (["doc", "docx", "ppt", "pptx"].includes(extension)) {
    const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(
      viewUrl
    )}&embedded=true`;

    return (
      <div className="relative w-full h-full flex justify-center items-center">
        {iframeLoading && (
          <div className="absolute inset-0 z-10 bg-white/70 flex flex-col justify-center items-center">
            <Loader2 size={36} className="animate-spin text-blue-500" />
            <span className="mt-2 text-gray-600">Preparing preview...</span>
          </div>
        )}

        <iframe
          sandbox="allow-scripts allow-same-origin"
          src={viewerUrl}
          title={file.originalName}
          className="w-full h-full"
          frameBorder="0"
          allowFullScreen={true}
          style={{ visibility: iframeLoading ? "hidden" : "visible" }}
          onLoad={() => setIframeLoading(false)}
        >
          <p>Content preview is not available. Please download the file.</p>
        </iframe>
      </div>
    );
  }

  return (
    <div className="p-8 text-center">
      <p className="text-xl font-semibold">Preview Not Available</p>
      <p className="text-gray-500">
        This file type ({extension?.toUpperCase()}) cannot be displayed in the
        viewer.
      </p>
    </div>
  );
};

const FileViewer = () => {
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [requestType, setRequestType] = useState("");
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const type = searchParams.get("type");

  const { openedFile: file, buttonLoading } = useSelector(
    (state) => state.files
  );

  const { requestDetail } = useSelector(
      (state) => state.requests
    );
    
  const onClose = useCallback(() => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate("/app/home");
    }
  }, [navigate]);

  useEffect(() => {
    dispatch(fetchUserRequestsThunk());
  }, [dispatch]);

  useEffect(() => {
    if (file) return;
    const fetchFile = async () => {
      const res = await dispatch(getFileByIdThunk({ id, type }));
      if (!res?.payload?.data?.success) {
        toast.error(
          res?.payload?.data?.message ||
            res?.payload?.message ||
            "Failed to fetch file details."
        );
        onClose();
      }
    };
    if (id) fetchFile();
  }, [id, dispatch, onClose]);

  useEffect(() => {
    if (!file) return;
    const fetchDownloadUrl = async () => {
      setLoading(true);
      try {
        const data = await dispatch(fetchDownloadUrlThunk(file?.fileKey));
        if (data?.payload) {
          setDownloadUrl(data?.payload);
        } else {
          toast.error("Failed to retrieve file download link.");
          onClose();
        }
      } catch (error) {
        toast.error("Something went wrong. Please try again.");
        console.error("Failed to fetch file:", error);
        onClose();
      } finally {
        setLoading(false);
      }
    };

    if (file) {
      fetchDownloadUrl();
    }
  }, [file, dispatch, navigate, onClose]);

  const downloadFile = async (file) => {
    setLoading(true);
    try {
      if (downloadUrl) {
        handleDownload(downloadUrl, file);
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const GetButton = ({ status, type }) => {
    if (status === "pending" && type) {
      return (
        <Button
          disabled
          className="w-full py-6 rounded-lg font-semibold transition-transform shadow-lg cursor-pointer text-white disabled:opacity-50"
        >
          <Clock2 />
          Request Pending...
        </Button>
      );
    }
    if (status === "rejected" && type) {
      return (
        <Button
          onClick={() => {
            if (type === "download") {
              requestType("");
              setShowModal(true);
            }
            if (type === "upload") requestUpload(dispatch, file?._id);
          }}
          disabled={!downloadUrl || loading}
          className="w-full py-6 rounded-lg font-semibold transition-transform shadow-lg cursor-pointer text-white disabled:opacity-50"
        >
          <RotateCw />
          Request again to {type === "upload" ? "Upload" : requestDetail?.requestType}
        </Button>
      );
    }

    if (status === "approved" && type === "download") {
      return (
        <div className="flex gap-2 items-center justify-center py-2 w-full rounded-lg font-semibold transition-transform shadow-lg cursor-pointer text-white bg-blue-500  dark:bg-blue-600">
          <BadgeCheckIcon className="h-4 w-4" />
          Approved
        </div>
        // <Button
        //   className="w-full py-6 rounded-lg font-semibold transition-transform shadow-lg cursor-pointer text-white disabled:opacity-50"
        //   onClick={() => {
        //     setDownloadLoading(true);
        //     downloadFile(downloadUrl, file).finally(() =>
        //       setDownloadLoading(false)
        //     );
        //   }}
        //   disabled={!downloadUrl || loading}
        // >
        //   <Download />
        //   Download Item
        // </Button>
      );
    }

    if (status === "approved" && type === "upload") {
      return (
        <Button
          onClick={() => {
            setShowModal(true);
            setRequestType("");
          }}
          disabled={!downloadUrl || loading}
          className="w-full py-6 rounded-lg font-semibold transition-transform shadow-lg cursor-pointer text-white disabled:opacity-50"
        >
          <Download />
          Request Item
        </Button>
      );
    }
  };

  const confirmRequestDownload = () => {
    if (!requestType) {
      toast.error("Please select your request type first.");
      return;
    }
    if (file) {
      setDownloadLoading(true);
      requestDownload(dispatch, file?._id, requestType).finally(() =>
        setDownloadLoading(false)
      );
      setShowModal(false);
      setRequestType("");
    }
  };

  const formatFileSize = (bytes, decimals = 2) => {
    if (!bytes && bytes !== 0) return "—";
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  if (!file) {
    return (
      <div className="flex-1 flex justify-center items-center h-screen w-screen">
        <Loader2 size={36} className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex justify-center items-center">
      <div
        className="bg-white w-screen h-screen flex flex-col truncate"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b flex justify-between items-center gap-3">
          <div>
            {file?.meta?.reqStatus === "pending" && (
              <Clock2 size={24} className="text-yellow-500" />
            )}
            {file?.meta?.reqStatus === "approved" && (
              <CheckCircle2 size={24} className="text-emerald-500" />
            )}
            {file?.meta?.reqStatus === "rejected" && (
              <XCircle size={24} className="text-red-500" />
            )}
          </div>
          <h2 className="text-lg font-bold truncate">{file?.originalName}</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900"
          >
            <X />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex justify-center items-center">
            <Loader2 size={36} className="animate-spin" />
          </div>
        ) : (
          <div className="flex-1 overflow-auto">
            <FileContent file={file} viewUrl={downloadUrl} />
          </div>
        )}

        <div className="p-4 flex justify-end">
          {buttonLoading || downloadLoading ? (
            <Button
              disabled
              className="w-full py-6 rounded-lg font-semibold transition-transform shadow-lg cursor-pointer text-white disabled:opacity-50"
            >
              <Loader2 className="animate-spin h-4 w-4" />
            </Button>
          ) : (
            <GetButton
              status={file?.meta?.reqStatus}
              type={file?.meta?.reqType}
            />
          )}
        </div>
      </div>

      <Drawer open={showModal} onOpenChange={setShowModal}>
        <DrawerContent className="max-w-3xl !mx-auto">
          <DrawerHeader>
            <DrawerTitle className="!text-lg">
              Confirm Exchange/Buy/Rent{" "}
            </DrawerTitle>
            <DrawerDescription className="!text-md">
              This file requires admin approval before download. Do you want to
              proceed with submitting the request?
            </DrawerDescription>
            <div className="mt-5">
              <p className="font-semibold text-lg text-gray-900 truncate">
                {file?.originalName}
              </p>

              <p className="text-gray-500">
                Uploaded by <b>{file?.uploadedBy?.username || "user"}</b>
              </p>
              <p className="text-gray-600 mb-3">
                <b>Tags:</b> {file?.tags[0]?.split(" ").join(", ") || "-"}
              </p>

              <p className="text-gray-500">
                Size: <b>{formatFileSize(file?.fileSize)}</b>
              </p>

              <p className="text-gray-500">
                Item Price:{" "}
                <b>{file?.itemPrice ? `${file?.itemPrice}/-` : "-"}</b>
              </p>

              <p className="text-gray-500">
                Service Cost:{" "}
                <b>{file?.serviceCost ? `${file?.serviceCost}/-` : "-"}</b>
              </p>

              <p className="text-gray-500">
                Shipping Cost:{" "}
                <b>{file?.shippingCost ? `${file?.shippingCost}/-` : "-"}</b>
              </p>

              <p className="text-gray-500">
                Item Rental Cost:{" "}
                <b>
                  {file?.itemRentalCost ? `${file?.itemRentalCost}/-` : "-"}
                </b>
              </p>

              <p className="text-gray-500">
                Offer Type:{" "}
                <b>
                  {file?.offerType === "rent"
                    ? "Rent"
                    : file?.offerType === "exchange"
                    ? "Exchange"
                    : file?.offerType === "donate"
                    ? "Donate"
                    : file?.offerType}
                </b>
              </p>
            </div>

            <div className="flex flex-col mt-4 w-full max-w-md mx-auto">
              <Label className="text-sm text-gray-800 mb-1 px-2">
                Select Your Request Type
              </Label>
              <Select
                onValueChange={(value) => setRequestType(value)}
                value={requestType}
                defaultValue={requestType}
              >
                <SelectTrigger className="w-full !px-4 !py-5 !text-lg rounded-lg border-2 focus:border-2 !focus-visible:outline-none focus-visible:ring-0">
                  <SelectValue placeholder="Select offer type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="exchange">
                    <div className="flex items-center gap-2">Exchange</div>
                  </SelectItem>
                  <SelectItem value="rent">
                    <div className="flex items-center gap-2">Rent</div>
                  </SelectItem>
                  <SelectItem value="buy">
                    <div className="flex items-center gap-2">Buy</div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </DrawerHeader>
          <DrawerFooter className="sm:flex sm:flex-row-reverse sm:gap-4">
            <Button
              className="text-md h-10 sm:w-1/2 cursor-pointer disabled:cursor-not-allowed"
              onClick={confirmRequestDownload}
              disabled={!requestType}
            >
              Confirm
            </Button>
            <DrawerClose className="border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 text-md h-10 sm:w-1/2 px-4 py-2 has-[>svg]:px-3 rounded-md flex items-center justify-center">
              Cancel
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default FileViewer;
