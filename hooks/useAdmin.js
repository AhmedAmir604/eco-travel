"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    const checkAdminStatus = async () => {
      // Wait for auth to finish loading before checking admin status
      if (authLoading) {
        return;
      }

      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const supabase = createClient();
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error checking admin status:", error);
          if (
            error.code === "PGRST205" ||
            error.message?.includes("profiles")
          ) {
            console.warn(
              "Profiles table not found. Please run the database migration."
            );
          }
          setIsAdmin(false);
        } else {
          const adminStatus = profile?.role === "admin";
          setIsAdmin(adminStatus);
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user, authLoading]); // Add authLoading to dependencies

  return { isAdmin, loading: loading || authLoading }; // Keep loading true while auth is loading
}
