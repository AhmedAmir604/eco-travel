import { createClient } from "@/lib/supabase/server";
import { createAdminClient, verifyAdminAccess } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function PUT(request, { params }) {
  try {
    const supabase = createClient();
    const supabaseAdmin = createAdminClient();
    const { id } = params;

    // Verify admin access
    const adminCheck = await verifyAdminAccess(supabase);
    if (adminCheck.error) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    const { full_name, role, email } = await request.json();

    // Update user email if provided using admin client
    if (email) {
      const { error: emailError } =
        await supabaseAdmin.auth.admin.updateUserById(id, {
          email,
          user_metadata: { full_name, role },
        });

      if (emailError) {
        return NextResponse.json(
          { error: emailError.message },
          { status: 400 }
        );
      }
    } else if (full_name || role) {
      // Update user metadata if name or role changed
      const { error: metadataError } =
        await supabaseAdmin.auth.admin.updateUserById(id, {
          user_metadata: { full_name, role },
        });

      if (metadataError) {
        console.warn("Failed to update user metadata:", metadataError);
      }
    }

    // Update profile using admin client (bypasses RLS)
    const { data: updatedProfile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({ full_name, role })
      .eq("id", id)
      .select()
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedProfile,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const supabase = createClient();
    const supabaseAdmin = createAdminClient();
    const { id } = params;

    // Verify admin access
    const adminCheck = await verifyAdminAccess(supabase);
    if (adminCheck.error) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    // Prevent admin from deleting themselves
    if (id === adminCheck.user.id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Delete user using Supabase Admin API with service role
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
      id
    );

    if (deleteError) {
      console.log("deleteError", deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const supabase = createClient();
    const supabaseAdmin = createAdminClient();
    const { id } = params;
    const { action } = await request.json();

    // Verify admin access
    const adminCheck = await verifyAdminAccess(supabase);
    if (adminCheck.error) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    let result;

    switch (action) {
      case "reset_password":
        // Generate a secure random password
        const newPassword = Math.random().toString(36).slice(-12) + "A1!";

        result = await supabaseAdmin.auth.admin.updateUserById(id, {
          password: newPassword,
        });

        if (result.error) {
          return NextResponse.json(
            { error: result.error.message },
            { status: 400 }
          );
        }

        return NextResponse.json({
          success: true,
          message: "Password reset successfully",
          newPassword, // In production, you might want to send this via email instead
        });

      case "send_reset_email":
        // Get user email first using admin client
        const { data: userData } = await supabaseAdmin.auth.admin.getUserById(
          id
        );

        if (!userData.user) {
          return NextResponse.json(
            { error: "User not found" },
            { status: 404 }
          );
        }

        result = await supabaseAdmin.auth.resetPasswordForEmail(
          userData.user.email
        );

        if (result.error) {
          return NextResponse.json(
            { error: result.error.message },
            { status: 400 }
          );
        }

        return NextResponse.json({
          success: true,
          message: "Password reset email sent",
        });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error in user action:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
