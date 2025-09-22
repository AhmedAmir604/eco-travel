import { createClient } from "@supabase/supabase-js";

// Create admin client with service role key for bypassing RLS
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

// Helper function to verify admin access using regular client
export async function verifyAdminAccess(supabase) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Unauthorized", status: 401 };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("Error fetching profile:", profileError);
    return { error: "Failed to verify admin status", status: 500 };
  }

  if (profile?.role !== "admin") {
    return { error: "Admin access required", status: 403 };
  }

  return { user, profile };
}
