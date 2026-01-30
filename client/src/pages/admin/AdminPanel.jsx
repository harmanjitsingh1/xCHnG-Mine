import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Clock2,
  Users,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchRequestsCountThunk } from "@/store/thunks/request.thunk";
import { useNavigate } from "react-router-dom";

export default function AdminPanel() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { reqCounts, loading } = useSelector((state) => state.requests);

  useEffect(() => {
    dispatch(fetchRequestsCountThunk());
  }, [dispatch]);

  const goBack = () => {
    navigate("/app/profile");
  };

  const SkeletonCard = () => (
    <Card>
      <CardContent className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-4 w-4 rounded" />
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-5 py-4 pb-20">
      <div className="flex items-center gap-2">
        <div
          className="h-10 w-10 flex items-center justify-center cursor-pointer"
          onClick={goBack}
        >
          <ChevronLeft size={26} />
        </div>
        <h2 className="text-xl font-bold">Admin Panel</h2>
      </div>
      {loading ? (
        <>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </>
      ) : (
        <>
          <Card onClick={() => navigate("/admin/requests/approved")}>
            <CardContent className="text-lg flex items-center justify-between !px-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                Approved Requests ({reqCounts.approved})
              </CardTitle>
              <ChevronRight />
            </CardContent>
          </Card>

          <Card onClick={() => navigate("/admin/requests/pending")}>
            <CardContent className="text-lg flex items-center justify-between !px-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock2 className="h-6 w-6 text-yellow-500" /> Pending Requests
                ({reqCounts.pending})
              </CardTitle>
              <ChevronRight />
            </CardContent>
          </Card>

          <Card onClick={() => navigate("/admin/requests/rejected")}>
            <CardContent className="text-lg flex items-center justify-between !px-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <XCircle className="h-6 w-6 text-red-500" /> Rejected Requests (
                {reqCounts.rejected})
              </CardTitle>
              <ChevronRight />
            </CardContent>
          </Card>
          <Card onClick={() => navigate("/admin/users")}>
            <CardContent className="text-lg flex items-center justify-between !px-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-6 w-6" />
                Search Users
              </CardTitle>
              <ChevronRight />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
