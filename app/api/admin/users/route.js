import { createClient } from "@/lib/supabase/server";
import { createAdminClient, verifyAdminAccess } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const supabase = createClient();

    // Check if user is authenticated and is admin (original simple method)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      return NextResponse.json(
        { error: "Failed to verify admin status" },
        { status: 500 }
      );
    }

    if (profile?.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";

    const offset = (page - 1) * limit;

    // Build query using regular client (original working method)
    let query = supabase
      .from("profiles")
      .select(
        `
        id,
        email,
        full_name,
        role,
        created_at
      `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    if (role) {
      query = query.eq("role", role);
    }

    const { data: users, error, count } = await query;

    if (error) {
      console.error("Error fetching users:", error);
      return NextResponse.json(
        { error: "Failed to fetch users" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error in users API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const supabase = createClient();
    const supabaseAdmin = createAdminClient();

    // Verify admin access
    const adminCheck = await verifyAdminAccess(supabase);
    if (adminCheck.error) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    const { email, password, full_name, role = "user" } = await request.json();

    // Create user using Supabase Admin API with service role
    const { data: newUser, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        user_metadata: {
          full_name,
          role, // Also add role to metadata for consistency
        },
        email_confirm: true,
      });

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    // Update profile with role using admin client (bypasses RLS)
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({ role, full_name })
      .eq("id", newUser.user.id);

    if (profileError) {
      console.error("Error updating profile:", profileError);
      return NextResponse.json(
        { error: "Failed to update user profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: newUser.user.id,
        email: newUser.user.email,
        full_name,
        role,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
