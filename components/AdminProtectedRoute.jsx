"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import { useToast } from "@/hooks/useToast";

export default function AdminProtectedRoute({ children }) {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const router = useRouter();
  const { toast } = useToast();
  const [hasShownError, setHasShownError] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Add a small delay to ensure all auth state is properly loaded
    const checkAccess = async () => {
      if (authLoading || adminLoading) {
        return;
      }

      // Wait a moment for any final state updates
      if (!user) {
        if (!hasShownError) {
          toast.error("Please sign in to access the admin panel");
          setHasShownError(true);
        }
        router.push("/login");
        return;
      }

      if (user && !isAdmin) {
        if (!hasShownError) {
          toast.error("Admin access required");
          setHasShownError(true);
        }
        router.push("/");
        return;
      }

      // If we get here, user is authenticated and admin
      setIsChecking(false);
    };

    checkAccess();
  }, [user, isAdmin, authLoading, adminLoading, router, toast, hasShownError]);

  // Show loading while checking authentication and admin status
  if (authLoading || adminLoading || isChecking) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Show setup instructions if user is logged in but not admin
  if (user && !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600">
            You do not have admin access. Please contact the site administrator
            to gain access.
          </p>
        </div>
      </div>
    );
  }

  // Show nothing while redirecting for unauthenticated users
  if (!user) {
    return null;
  }

  return children;
}
