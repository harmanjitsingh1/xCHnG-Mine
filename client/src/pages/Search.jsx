"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { fetchUserRequestsThunk } from "@/store/thunks/request.thunk";
import { resetSearch, setOpenedFile } from "@/store/slices/file.slice.js";
// import { handleDownload, requestDownload } from "@/services/file.services.js";
import { requestDownload } from "@/services/file.services.js";
import {
  getAllFilesThunk,
  searchFilesThunk,
  fetchDownloadUrlThunk,
  toggleAvailabilityThunk,
} from "@/store/thunks/file.thunk.js";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Clock2,
  Loader2,
  Download,
  XCircle,
  RefreshCw,
  ExternalLink,
  BadgeCheckIcon,
} from "lucide-react";
import { Label } from "@/components/ui/label";

const FileSkeleton = () => (
  <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm animate-pulse">
    <div className="h-4 w-3/4 bg-gray-200 rounded mb-2"></div>
    <div className="h-3 w-1/3 bg-gray-200 rounded mb-2"></div>
    <div className="h-3 w-1/2 bg-gray-200 rounded mb-3"></div>
    <div className="h-3 w-1/4 bg-gray-200 rounded mb-2"></div>
    <div className="h-3 w-1/3 bg-gray-200 rounded mb-2"></div>
    <div className="h-3 w-1/3 bg-gray-200 rounded mb-2"></div>
    <div className="h-3 w-1-2 bg-gray-200 rounded mb-2"></div>

    <div className="flex gap-2 mt-2">
      <div className="h-8 w-1/2 bg-gray-300 rounded"></div>
      <div className="h-8 w-1/2 bg-gray-300 rounded"></div>
    </div>
  </div>
);

function SearchPage() {
  const [query, setQuery] = useState("");
  const [loadingFileId, setLoadingFileId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [requestType, setRequestType] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    files,
    filesLoading,
    filesPage,
    filesHasMore,
    searchFiles,
    searchLoading,
    searchPage,
    searchHasMore,
    loadingMore,
    buttonLoading,
  } = useSelector((state) => state.files);

  const { role } = useSelector((state) => state.auth.userProfile);

  const { userRequests } = useSelector((state) => state.requests);

  const isSearchMode = query.trim().length > 0;

  const listSentinelRef = useRef(null);
  const searchSentinelRef = useRef(null);
  const listObserverRef = useRef(null);
  const searchObserverRef = useRef(null);
  const debounceTimerRef = useRef(null);

  useEffect(() => {
    if (!files || files.length === 0) {
      dispatch(getAllFilesThunk({ page: 1 }));
      dispatch(fetchUserRequestsThunk());
    }

    dispatch(resetSearch());

    return () => {
      dispatch(resetSearch());
    };
  }, [dispatch]);

  useEffect(() => {
    clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      if (isSearchMode) {
        dispatch(searchFilesThunk({ query, page: 1 }));
      } else {
        dispatch(resetSearch());
      }
    }, 300);

    return () => clearTimeout(debounceTimerRef.current);
  }, [query, isSearchMode, dispatch]);

  useEffect(() => {
    const el = listSentinelRef.current;
    if (!el) return;

    if (listObserverRef.current) listObserverRef.current.disconnect();

    listObserverRef.current = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && !filesLoading && filesHasMore) {
          dispatch(getAllFilesThunk({ page: filesPage + 1 }));
        }
      },
      { root: null, rootMargin: "200px", threshold: 0.1 }
    );

    listObserverRef.current.observe(el);
    return () =>
      listObserverRef.current && listObserverRef.current.disconnect();
  }, [dispatch, isSearchMode, filesLoading, filesHasMore, filesPage]);

  useEffect(() => {
    const el = searchSentinelRef.current;
    if (!el) return;

    if (searchObserverRef.current) searchObserverRef.current.disconnect();

    searchObserverRef.current = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (
          first.isIntersecting &&
          isSearchMode &&
          !searchLoading &&
          searchHasMore
        ) {
          dispatch(searchFilesThunk({ query, page: searchPage + 1 }));
        }
      },
      { root: null, rootMargin: "200px", threshold: 0.1 }
    );

    searchObserverRef.current.observe(el);
    return () =>
      searchObserverRef.current && searchObserverRef.current.disconnect();
  }, [dispatch, isSearchMode, query, searchLoading, searchHasMore, searchPage]);

  const list = isSearchMode ? searchFiles : files;

  const isInitialLoading = isSearchMode
    ? searchLoading && searchPage === 1
    : filesLoading && filesPage === 1;

  const formatFileSize = (bytes, decimals = 2) => {
    if (!bytes && bytes !== 0) return "—";
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const handleFileOpen = useCallback(
    (f) => {
      const req = userRequests.find(
        (r) => r?.file?._id === f?._id && r?.type === "download"
      );
      const fileData = {
        ...f,
        meta: req
          ? { reqStatus: req.status, reqType: req.type }
          : { reqStatus: "approved", reqType: "upload" },
      };
      dispatch(setOpenedFile(fileData));
      navigate(`/app/file-detail/${f?._id}?type=download`);
    },
    [dispatch, userRequests, navigate]
  );

  const fetchDownloadUrl = useCallback(
    async (file) => {
      try {
        const data = await dispatch(fetchDownloadUrlThunk(file.fileKey));
        if (data && data.payload) return data.payload;
        toast.error("Failed to retrieve file download link.");
        return null;
      } catch (err) {
        console.error("fetchDownloadUrl error:", err);
        toast.error("Failed to retrieve file download link.");
        return null;
      }
    },
    [dispatch]
  );

  // const downloadFile = async (file) => {
  //   setLoadingFileId(file._id);
  //   try {
  //     const url = await fetchDownloadUrl(file);
  //     if (url) {
  //       handleDownload(url, file);
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     toast.error("Something went wrong. Please try again.");
  //   } finally {
  //     setLoadingFileId(null);
  //   }
  // };

  const handleRequestDownload = (f) => {
    setSelectedFile(f);
    setShowModal(true);
    setRequestType("");
  };

  const confirmRequestDownload = () => {
    if (!requestType) {
      toast.error("Please select your request type first.");
      return;
    }
    if (selectedFile && requestType) {
      setLoadingFileId(selectedFile?._id);
      requestDownload(dispatch, selectedFile?._id, requestType).finally(() =>
        setLoadingFileId(null)
      );
      setShowModal(false);
      setRequestType("");
    }
  };

  const setAvailability = async (fileId, availability) => {
    if (role === "admin" && fileId) {
      const res = await dispatch(
        toggleAvailabilityThunk({ fileId, availability })
      );
      if (res?.payload?.data?.success) {
        toast.success(res?.payload?.data?.message || res?.payload?.message);
      } else {
        toast.error(res?.payload?.data?.message || res?.payload?.message);
      }
    }
  };

  return (
    <main className="flex-1 overflow-y-auto py-4 sm:px-3 pb-20">
      <section className="mb-4 sticky top-0 bg-white pb-2">
        <h2 className="mb-3 text-lg font-semibold text-gray-800">
          Search Items
        </h2>
        <div className="flex flex-row gap-2">
          <div className="flex items-center rounded-xl overflow-hidden border border-gray-300 text-gray-700 w-full">
            <input
              type="text"
              placeholder="Search by name, type or tag"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="px-4 py-3 w-full focus:border-primary focus:outline-none"
            />
            {query && (
              <XCircle
                className="h-6 w-6 text-gray-400 m-3 cursor-pointer"
                onClick={() => setQuery("")}
              />
            )}
          </div>
        </div>
      </section>

      <div className="mb-4 px-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">
          {isSearchMode ? "Search Results" : "Recent Items"}
        </h2>

        <RefreshCw
          size={24}
          onClick={() => {
            dispatch(getAllFilesThunk({ page: 1 }));
            dispatch(fetchUserRequestsThunk());
          }}
          className={`cursor-pointer ${
            filesLoading || searchLoading ? "animate-spin" : ""
          }`}
        />
      </div>

      {isInitialLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <FileSkeleton key={i} />
          ))}
        </div>
      ) : list.length === 0 ? (
        <p className="text-center text-gray-500 mt-8">No files available.</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {list.map((f) => (
              <div
                key={f?._id}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition truncate"
              >
                <div className="mb-1">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-gray-900 truncate">
                      {f.originalName}
                    </p>

                    {role === "admin" ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger className="focus:outline-0 cursor-pointer">
                          <Badge
                            variant="outline"
                            className={`capitalize text-xs font-medium ${
                              f.availability
                                ? "bg-blue-100 text-blue-800 border-blue-300"
                                : "bg-red-100 text-red-800 border-red-300"
                            }`}
                          >
                            {buttonLoading === f._id ? (
                              <Loader2 className="animate-spin h-4 w-4" />
                            ) : f.availability ? (
                              "Available"
                            ) : (
                              "Not available"
                            )}
                          </Badge>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="text-xl" align="end">
                          <DropdownMenuCheckboxItem
                            className="text-sm"
                            checked={f.availability}
                            onCheckedChange={() => {
                              if (!f.availability) setAvailability(f._id, true);
                            }}
                          >
                            Available
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuCheckboxItem
                            className="text-sm"
                            checked={!f.availability}
                            onCheckedChange={() => {
                              if (f.availability) setAvailability(f._id, false);
                            }}
                          >
                            Not Available
                          </DropdownMenuCheckboxItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <Badge
                        variant="outline"
                        className={`capitalize text-xs font-medium ${
                          f.availability
                            ? "bg-blue-100 text-blue-800 border-blue-300"
                            : "bg-red-100 text-red-800 border-red-300"
                        }`}
                      >
                        {f.availability ? "Available" : "Not available"}
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-gray-500">
                    Uploaded by <b>{f?.uploadedBy?.username || "user"}</b>
                  </p>
                  <p className="text-sm text-gray-600 mb-3">
                    <b>Tags:</b> {f?.tags[0]?.split(" ").join(", ") || "—"}
                  </p>

                  <p className="text-sm text-gray-500">
                    Size: <b>{formatFileSize(f?.fileSize)}</b>
                  </p>

                  <p className="text-sm text-gray-500">
                    Item Price:{" "}
                    <b>{f?.itemPrice ? `${f?.itemPrice}/-` : "-"}</b>
                  </p>

                  <p className="text-sm text-gray-500">
                    Service Cost:{" "}
                    <b>{f?.serviceCost ? `${f?.serviceCost}/-` : "-"}</b>
                  </p>

                  <p className="text-sm text-gray-500">
                    Shipping Cost:{" "}
                    <b>{f?.shippingCost ? `${f?.shippingCost}/-` : "-"}</b>
                  </p>

                  <p className="text-sm text-gray-500">
                    Item Rental Cost:{" "}
                    <b>{f?.itemRentalCost ? `${f?.itemRentalCost}/-` : "-"}</b>
                  </p>

                  <p className="text-sm text-gray-500">
                    Offer Type:{" "}
                    <b>
                      {f?.offerType === "rent"
                        ? "Rent"
                        : f?.offerType === "exchange"
                        ? "Exchange"
                        : f?.offerType === "donate"
                        ? "Donate"
                        : f?.offerType === "sale"
                        ? "Sale"
                        : f?.offerType}
                    </b>
                  </p>
                </div>

                <div className="flex gap-2 mt-2 truncate">
                  <Button
                    onClick={() => handleFileOpen(f)}
                    className="flex-1 py-4 rounded-lg font-semibold shadow-md text-white cursor-pointer"
                  >
                    <ExternalLink />
                    Open
                  </Button>

                  {userRequests.some(
                    (req) =>
                      req?.file?._id === f?._id &&
                      req?.type === "download" &&
                      req?.status === "pending"
                  ) ? (
                    <Button
                      disabled
                      className="flex-1 py-4 rounded-lg font-semibold shadow-md text-white cursor-pointer truncate"
                    >
                      <Clock2 />
                      Request Pending...
                    </Button>
                  ) : userRequests.some(
                      (req) =>
                        req?.file?._id === f?._id &&
                        req?.type === "download" &&
                        req?.status === "approved"
                    ) ? (
                    <div
                      className="flex flex-1 gap-2 items-center justify-center rounded-lg text-sm font-semibold shadow-md bg-blue-500 text-white dark:bg-blue-600"
                    >
                      <BadgeCheckIcon className="h-4 w-4" />
                      Approved
                    </div>
                  ) : (
                    <Button
                      onClick={() => {
                        handleRequestDownload(f);
                      }}
                      disabled={loadingFileId === f?._id}
                      className="flex-1 py-4 rounded-lg font-semibold shadow-md text-white cursor-pointer"
                    >
                      {loadingFileId === f?._id ? (
                        <Loader2 className="animate-spin h-4 w-4" />
                      ) : (
                        <>
                          <Download />
                          Request Item
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col items-center">
            {loadingMore && (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="animate-spin h-4 w-4" />
                <span>Loading more…</span>
              </div>
            )}

            <div
              ref={isSearchMode ? searchSentinelRef : listSentinelRef}
              className="h-6 w-full"
            />
          </div>

          <Drawer open={showModal} onOpenChange={setShowModal}>
            <DrawerContent className="max-w-3xl !mx-auto">
              <DrawerHeader>
                <DrawerTitle className="!text-lg">
                  Confirm Exchange/Buy/Rent{" "}
                </DrawerTitle>
                <DrawerDescription className="!text-md">
                  This file requires admin approval before download. Do you want
                  to proceed with submitting the request?
                </DrawerDescription>
                <div className="mt-5">
                  <p className="font-semibold text-lg text-gray-900 truncate">
                    {selectedFile?.originalName}
                  </p>

                  <p className="text-gray-500">
                    Uploaded by{" "}
                    <b>{selectedFile?.uploadedBy?.username || "user"}</b>
                  </p>
                  <p className="text-gray-600 mb-3">
                    <b>Tags:</b>{" "}
                    {selectedFile?.tags[0]?.split(" ").join(", ") || "-"}
                  </p>

                  <p className="text-gray-500">
                    Size: <b>{formatFileSize(selectedFile?.fileSize)}</b>
                  </p>

                  <p className="text-gray-500">
                    Item Price:{" "}
                    <b>
                      {selectedFile?.itemPrice
                        ? `${selectedFile?.itemPrice}/-`
                        : "-"}
                    </b>
                  </p>

                  <p className="text-gray-500">
                    Service Cost:{" "}
                    <b>
                      {selectedFile?.serviceCost
                        ? `${selectedFile?.serviceCost}/-`
                        : "-"}
                    </b>
                  </p>

                  <p className="text-gray-500">
                    Shipping Cost:{" "}
                    <b>
                      {selectedFile?.shippingCost
                        ? `${selectedFile?.shippingCost}/-`
                        : "-"}
                    </b>
                  </p>

                  <p className="text-gray-500">
                    Item Rental Cost:{" "}
                    <b>
                      {selectedFile?.itemRentalCost
                        ? `${selectedFile?.itemRentalCost}/-`
                        : "-"}
                    </b>
                  </p>

                  <p className="text-gray-500">
                    Offer Type:{" "}
                    <b>
                      {selectedFile?.offerType === "rent"
                        ? "Rent"
                        : selectedFile?.offerType === "exchange"
                        ? "Exchange"
                        : selectedFile?.offerType === "donate"
                        ? "Donate"
                        : selectedFile?.offerType}
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
        </>
      )}
    </main>
  );
}

export default SearchPage;
