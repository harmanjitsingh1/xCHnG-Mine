import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Clock2,
  CheckCircle2,
  XCircle,
  LoaderCircle,
  ExternalLink,
} from "lucide-react";
import {
  fetchRequestByIdThunk,
  approveRequestThunk,
  rejectRequestThunk,
} from "@/store/thunks/request.thunk";
import { setOpenedFile } from "@/store/slices/file.slice.js";
import toast from "react-hot-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function RequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [rejectMessage, setRejectMessage] = useState("");
  const [showMessageModel, setShowMessageModel] = useState(false);

  const [itemPrice, setItemPrice] = useState("");
  const [serviceCost, setServiceCost] = useState("");
  const [shippingCost, setShippingCost] = useState("");
  const [itemRentalCost, setItemRentalCost] = useState("");
  const [offerType, setOfferType] = useState("");

  const { requestDetail, loading, approveLoading, rejectLoading } = useSelector(
    (state) => state.requests
  );

  useEffect(() => {
    const fetchReqDetails = async () => {
      await dispatch(fetchRequestByIdThunk(id));
    };

    if (!requestDetail || id !== requestDetail?._id) {
      fetchReqDetails();
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (requestDetail) {
      setItemPrice(requestDetail?.file?.itemPrice);
      setServiceCost(requestDetail?.file?.serviceCost);
      setShippingCost(requestDetail?.file?.shippingCost);
      setItemRentalCost(requestDetail?.file?.itemRentalCost);
      setOfferType(requestDetail?.file?.offerType);
    }
  }, [requestDetail]);

  const handleApprove = async () => {
    const response = await dispatch(
      approveRequestThunk({
        requestId: requestDetail?._id,
        type: requestDetail?.type,
        itemPrice,
        serviceCost,
        shippingCost,
        itemRentalCost,
        offerType,
      })
    );
    if (response?.payload?.data?.success) {
      toast.success(response?.payload?.data?.message || "Request Approved!");
    } else {
      toast.error(response?.payload?.data?.message || "Something went wrong!");
    }
  };

  const handleReject = async () => {
    const response = await dispatch(
      rejectRequestThunk({
        requestId: requestDetail?._id,
        type: requestDetail?.type,
        message: rejectMessage?.trim() || "Not specified",
        itemPrice,
        serviceCost,
        shippingCost,
        itemRentalCost,
        offerType,
      })
    );
    if (response?.payload?.data?.success) {
      toast.success(response?.payload?.data?.message || "Request Rejected!");
    } else {
      toast.error(response?.payload?.data?.message || "Something went wrong!");
    }
  };

  const getRequestTitle = () => {
    switch (requestDetail?.type) {
      case "upload":
        return "Upload Request";
      case "download":
        return "Download Request";
      default:
        return "Account Request";
    }
  };

  const goBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate("/admin");
    }
  };

  const handleFileOpen = (f) => {
    dispatch(setOpenedFile(f));
    navigate("/app/file-detail/" + f?._id);
  };

  const formatFileSize = (bytes, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        {/* Header Skeleton */}
        <header className="sticky top-0 z-10 bg-white shadow-sm border-b flex items-center gap-2 px-3 py-3">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-6 w-32" />
        </header>

        {/* Content Skeleton */}
        <main className="flex-1 overflow-y-auto px-2 md:px-4 py-4 pb-30 space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="rounded-xl bg-white px-6 py-4 shadow-md space-y-4"
            >
              <Skeleton className="h-6 w-40" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <Skeleton className="h-4 w-48" />
            </div>
          ))}
        </main>

        {/* Footer Skeleton */}
        <footer className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
          <div className="p-4 flex gap-3 max-w-2xl mx-auto">
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </footer>
      </div>
    );
  }

  if (!requestDetail) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">No request details found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white shadow-sm border-b flex items-center gap-2 px-3 py-3">
        <button
          onClick={goBack}
          className="flex items-center gap-1 p-2 text-sm font-medium transition cursor-pointer"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-semibold">{getRequestTitle()}</h1>
      </header>

      {/* Main */}
      <main className="flex-1 overflow-y-auto px-2 md:px-4 py-4 pb-30">
        <div className="space-y-3">
          {/* User Details */}
          {requestDetail?.user && (
            <section>
              <div className="rounded-xl bg-white px-6 py-4 shadow-md">
                <h2 className="mb-3 text-lg font-semibold text-gray-800">
                  Requesting User
                </h2>
                <div className="space-y-3 text-gray-700">
                  <div className="flex justify-between">
                    <span className="text-gray-600 mr-4">Full Name</span>
                    <span className="font-medium">
                      {requestDetail?.user?.username}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 mr-4">Email</span>
                    <span className="font-medium">
                      {requestDetail?.user?.email}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 mr-4">Phone</span>
                    <span className="font-medium">
                      {requestDetail?.user?.phone}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 mr-4">Locality</span>
                    <span className="font-medium">
                      {requestDetail?.user.locality}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 mr-4">Status</span>
                    <span className="font-medium">
                      {requestDetail?.status === "approved" && (
                        <div className="flex items-center gap-2 text-emerald-500">
                          <CheckCircle2 className="h-5 w-5" /> Approved
                        </div>
                      )}
                      {requestDetail?.status === "rejected" && (
                        <div className="flex items-center gap-2 text-red-500">
                          <XCircle className="h-5 w-5" /> Rejected
                        </div>
                      )}
                      {requestDetail?.status === "pending" && (
                        <div className="flex items-center gap-2 text-yellow-500">
                          <Clock2 className="h-5 w-5" /> Pending
                        </div>
                      )}
                    </span>
                  </div>
                  {requestDetail?.requestType && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 mr-4">Request Type</span>
                      <span className="font-semibold">
                        {requestDetail?.requestType === "rent"
                          ? "Rent"
                          : requestDetail?.requestType === "exchange"
                          ? "Exchange"
                          : requestDetail?.requestType === "buy"
                          ? "Buy"
                          : requestDetail?.requestType}
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-gray-500 text-sm mt-5">
                  Requested on{" "}
                  {new Date(requestDetail?.createdAt).toLocaleString([], {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </p>
              </div>
            </section>
          )}

          {/* File Details */}
          {requestDetail?.file && (
            <>
              <section>
                <div className="rounded-xl bg-white px-6 py-4 shadow-md">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-gray-800">
                      Item Details
                    </h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFileOpen(requestDetail?.file)}
                    >
                      <ExternalLink />
                      Open
                    </Button>
                  </div>
                  <div className="space-y-3 text-gray-700">
                    <div className="flex justify-between truncate">
                      <span className="text-gray-600 mr-4">Item Name</span>
                      <span className="font-medium truncate">
                        {requestDetail?.file?.originalName}
                      </span>
                    </div>
                    <div className="flex justify-between truncate">
                      <span className="text-gray-600 mr-4">Item Size</span>
                      <span className="font-medium truncate">
                        {formatFileSize(requestDetail?.file?.fileSize)}
                      </span>
                    </div>
                    <div className="flex justify-between truncate">
                      <span className="text-gray-600 mr-4">Tags</span>
                      <span className="font-medium truncate">
                        {requestDetail?.file?.tags[0] || "-"}
                      </span>
                    </div>
                    {!requestDetail || loading ? (
                      ""
                    ) : requestDetail?.status === "pending" &&
                      requestDetail?.type === "upload" ? (
                      <div className="flex flex-col gap-4 pb-4">
                        <div className="flex flex-col ">
                          <Label className="text-md text-gray-600 mb-1">
                            Item Price (In Rupees ₹)
                          </Label>
                          <Input
                            type="text"
                            placeholder="Enter item price"
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
                            // disabled={uploading}
                            className="w-full !px-3 !py-5 !text-lg rounded-lg border-2 focus:border-2 !focus-visible:outline-none focus-visible:ring-0"
                          />
                        </div>

                        <div className="flex flex-col">
                          <Label className="text-md text-gray-600 mb-1">
                            Item Rental Cost (In Rupees ₹)
                          </Label>
                          <Input
                            type="text"
                            placeholder="Item Rental cost"
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
                            // disabled={uploading}
                            className="w-full !px-3 !py-5 !text-lg rounded-lg border-2 focus:border-2 !focus-visible:outline-none focus-visible:ring-0"
                          />
                        </div>

                        <div className="flex flex-col ">
                          <Label className="text-md text-gray-600 mb-1">
                            Service Cost (In Rupees ₹)
                          </Label>
                          <Input
                            type="text"
                            placeholder="Enter service cost"
                            value={serviceCost}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === "") {
                                setServiceCost("");
                                return;
                              }
                              if (/^\d+$/.test(val)) {
                                setServiceCost(val);
                              }
                            }}
                            // disabled={uploading}
                            className="w-full !px-3 !py-5 !text-lg rounded-lg border-2 focus:border-2 !focus-visible:outline-none focus-visible:ring-0"
                          />
                        </div>

                        <div className="flex flex-col">
                          <Label className="text-md text-gray-600 mb-1">
                            Shipping Cost (In Rupees ₹)
                          </Label>
                          <Input
                            type="text"
                            placeholder="Enter shipping cost"
                            value={shippingCost}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === "") {
                                setShippingCost("");
                                return;
                              }
                              if (/^\d+$/.test(val)) {
                                setShippingCost(val);
                              }
                            }}
                            // disabled={uploading}
                            className="w-full !px-3 !py-5 !text-lg rounded-lg border-2 focus:border-2 !focus-visible:outline-none focus-visible:ring-0"
                          />
                        </div>

                        <div className="flex flex-col">
                          <Label className="text-sm text-gray-800 mb-1 px-2">
                            Item Offer Type
                          </Label>
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
                                <div className="flex items-center gap-2">
                                  Exchange
                                </div>
                              </SelectItem>
                              <SelectItem value="sale">
                                <div className="flex items-center gap-2">
                                  Sale
                                </div>
                              </SelectItem>
                              <SelectItem value="donate">
                                <div className="flex items-center gap-2">
                                  Donate
                                </div>
                              </SelectItem>
                              <SelectItem value="rent">
                                <div className="flex items-center gap-2">
                                  Rent
                                </div>
                              </SelectItem>
                              <SelectItem value="Exchange/Sale/Donate/Rent">
                                <div className="flex items-center gap-2">
                                  Exchange / Sale / Donate / Rent
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between truncate">
                          <span className="text-gray-600 mr-4">Item Price</span>
                          <span className="font-medium truncate">
                            {requestDetail?.file?.itemPrice
                              ? `₹ ${requestDetail?.file?.itemPrice}/-`
                              : "-"}
                          </span>
                        </div>
                        <div className="flex justify-between truncate">
                          <span className="text-gray-600 mr-4">
                            Shipping Cost
                          </span>
                          <span className="font-medium truncate">
                            {requestDetail?.file?.shippingCost
                              ? `₹ ${requestDetail?.file?.shippingCost}/-`
                              : "-"}
                          </span>
                        </div>
                        <div className="flex justify-between truncate">
                          <span className="text-gray-600 mr-4">
                            Service Cost
                          </span>
                          <span className="font-medium truncate">
                            {requestDetail?.file?.serviceCost
                              ? `₹ ${requestDetail?.file?.serviceCost}/-`
                              : "-"}
                          </span>
                        </div>
                        {/* {requestDetail?.requestType && ( */}
                        <div className="flex justify-between truncate">
                          <span className="text-gray-600 mr-4">
                            Item Offer Type
                          </span>
                          <span className="truncate font-semibold">
                            {requestDetail?.file?.offerType === "rent"
                              ? "Rent"
                              : requestDetail?.file?.offerType === "exchange"
                              ? "Exchange"
                              : requestDetail?.file?.offerType === "donate"
                              ? "Donate"
                              : requestDetail?.file?.offerType === "sale"
                              ? "Sale"
                              : requestDetail?.file?.offerType}
                          </span>
                        </div>
                        {/* )} */}
                      </>
                    )}
                  </div>
                </div>
              </section>

              {requestDetail?.type === "download" && (
                <section>
                  <div className="rounded-xl bg-white px-6 py-4 shadow-md">
                    <h2 className="mb-3 text-lg font-semibold text-gray-800">
                      Item Owner Details
                    </h2>

                    <div className="space-y-3 text-gray-700">
                      <div className="flex justify-between truncate">
                        <span className="text-gray-600 mr-4">Name</span>
                        <span className="font-medium truncate">
                          {requestDetail?.file?.uploadedBy?.username}
                        </span>
                      </div>
                      <div className="flex justify-between truncate">
                        <span className="text-gray-600 mr-4">Phone</span>
                        <span className="font-medium truncate">
                          {requestDetail?.file?.uploadedBy?.phone}
                        </span>
                      </div>
                      <div className="flex justify-between truncate">
                        <span className="text-gray-600 mr-4">Email</span>
                        <span className="font-medium truncate">
                          {requestDetail?.file?.uploadedBy?.email}
                        </span>
                      </div>
                      <div className="flex justify-between truncate">
                        <span className="text-gray-600 mr-4">Locality</span>
                        <span className="font-medium truncate">
                          {requestDetail?.file?.uploadedBy?.locality}
                        </span>
                      </div>
                    </div>
                  </div>
                </section>
              )}
            </>
          )}

          {/* admin details */}
          {requestDetail?.admin && (
            <section>
              <div className="rounded-xl bg-white px-6 py-4 shadow-md">
                <h2 className="mb-3 text-lg font-semibold text-gray-800">
                  {requestDetail?.status === "approved"
                    ? "Approved by"
                    : "Rejected by"}
                </h2>
                <div className="space-y-3 text-gray-700">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Admin</span>
                    <span className="font-medium">
                      {requestDetail?.admin?.username}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email</span>
                    <span className="font-medium">
                      {requestDetail?.admin?.email}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone</span>
                    <span className="font-medium">
                      {requestDetail?.admin?.phone}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Locality</span>
                    <span className="font-medium">
                      {requestDetail?.admin?.locality}
                    </span>
                  </div>

                  {requestDetail?.message && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reason</span>
                      <span className="font-medium">
                        {requestDetail?.message
                          ? requestDetail?.message
                          : "Not specified"}
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-gray-500 text-sm mt-5">
                  {requestDetail?.status === "approved"
                    ? "Approved on "
                    : "Rejected on "}
                  {new Date(requestDetail?.updatedAt).toLocaleString([], {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </p>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Footer */}
      {requestDetail?.status === "pending" && (
        <footer className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
          <div className="p-4 flex gap-3 max-w-3xl mx-auto">
            <Button
              variant="destructive"
              disabled={rejectLoading || approveLoading}
              onClick={() => setShowMessageModel(true)}
              className="flex-1 py-6 rounded-lg font-semibold shadow-md cursor-pointer"
            >
              {rejectLoading ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                "Reject"
              )}
            </Button>
            <Button
              onClick={handleApprove}
              disabled={rejectLoading || approveLoading}
              className="flex-1 py-6 rounded-lg font-semibold shadow-md bg-green-600 hover:bg-green-700 text-white cursor-pointer"
            >
              {approveLoading ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                "Approve"
              )}
            </Button>
          </div>
        </footer>
      )}

      <AlertDialog open={showMessageModel} onOpenChange={setShowMessageModel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to reject this request?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting this request. (Optional)
            </AlertDialogDescription>

            <textarea
              value={rejectMessage}
              onChange={(e) => setRejectMessage(e.target.value)}
              placeholder="Type your reason here..."
              rows={4}
              className="w-full p-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setShowMessageModel(false)}
              className="text-md h-10"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="text-md h-10 bg-red-600"
              onClick={() => {
                setShowMessageModel(false);
                handleReject();
                setRejectMessage("");
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* <div className="fixed inset-0 flex items-center justify-center bg-[#000000a1] bg-opacity-50 z-50">
        <div className="bg-white rounded-xl shadow-lg p-6 w-96">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            
          </h3>

          <div className="flex justify-end gap-3 mt-4">
            <button className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800">
              Cancel
            </button>
            <button
              disabled={rejectLoading}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reject
            </button>
          </div>
        </div>
      </div> */}
    </div>
  );
}
