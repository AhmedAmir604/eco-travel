import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function PUT(request) {
  try {
    const supabase = createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { full_name, email, phone, bio } = await request.json();

    if (!full_name?.trim()) {
      return NextResponse.json({ error: "Full name is required" }, { status: 400 });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
    }

    // 1) Update ONLY metadata fields here (do NOT include email)
    const { error: metadataError } = await supabase.auth.updateUser({
      data: {
        full_name: full_name.trim(),
        phone: phone?.trim() || null,
        bio: bio?.trim() || null,
      },
    });
    if (metadataError) {
      return NextResponse.json({ error: metadataError.message }, { status: 400 });
    }

    // 2) If email changed, use admin client to update email
    let emailChanged = false;
    if (email && email !== user.email) {
      const adminSupabase = createAdminClient();
      const { error: emailError } = await adminSupabase.auth.admin.updateUserById(
        user.id,
        { email }
      );
      if (emailError) {
        return NextResponse.json({ error: emailError.message }, { status: 400 });
      }
      emailChanged = true;
    }

    // 3) Update your profiles row (avoid duplicating email to prevent drift)
    const { data: updatedProfile, error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        full_name: full_name.trim(),
        // remove email here to avoid mismatch while change is pending
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' })
      .select()
      .single();

    if (profileError) {
      return NextResponse.json({ error: "Failed to update user profile in database" }, { status: 500 });
    }

    // 4) Get fresh user snapshot (still may show old email until confirmed)
    const fresh = await supabase.auth.getUser();

    return NextResponse.json({
      success: true,
      message: emailChanged
        ? "Profile updated. Please check your inbox to confirm the new email. It will appear after confirmation."
        : "Profile updated successfully.",
      data: {
        user: fresh.data.user, // may show old email until confirmed
        profile: updatedProfile,
        emailChanged,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const supabase = createClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get additional profile data from profiles table
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    return NextResponse.json({
      success: true,
      data: {
        user,
        profile,
      },
    });

  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}