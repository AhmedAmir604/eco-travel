import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    const body = await request.json();
    const { 
      activityId, 
      activityName, 
      activityLocation, 
      activityImageUrl, 
      activityPrice, 
      activityRating, 
      activityDescription,
      activitySource = 'amadeus'
    } = body;

    if (!activityId || !activityName) {
      return NextResponse.json({
        success: false,
        error: 'Activity ID and name are required'
      }, { status: 400 });
    }

    // Check if already liked
    const { data: existingLike, error: checkError } = await supabase
      .from('user_activity_likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('activity_id', activityId)
      .single();


    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error checking existing like:', checkError);
      return NextResponse.json({
        success: false,
        error: 'Database error'
      }, { status: 500 });
    }

    if (existingLike) {
      // If already liked, remove it (toggle behavior)
      //(`[LIKES API] Removing existing like for activity ${activityId}`);
      
      const { error: deleteError } = await supabase
        .from('user_activity_likes')
        .delete()
        .eq('user_id', user.id)
        .eq('activity_id', activityId);

      if (deleteError) {
        console.error('Error removing like during toggle:', deleteError);
        return NextResponse.json({
          success: false,
          error: 'Failed to toggle like'
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'Activity unliked successfully',
        isLiked: false,
        action: 'unliked'
      });
    }

    // Add the like
    
    const { data: newLike, error: insertError } = await supabase
      .from('user_activity_likes')
      .insert({
        user_id: user.id,
        activity_id: activityId,
        activity_name: activityName,
        activity_location: activityLocation,
        activity_image_url: activityImageUrl,
        activity_price: activityPrice,
        activity_rating: activityRating,
        activity_description: activityDescription,
        activity_source: activitySource
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error adding like:', insertError);
      return NextResponse.json({
        success: false,
        error: 'Failed to add like'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Activity liked successfully',
      data: newLike,
      isLiked: true,
      action: 'liked'
    });

  } catch (error) {
    console.error('Likes API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const activityId = searchParams.get('activityId');

    if (!activityId) {
      return NextResponse.json({
        success: false,
        error: 'Activity ID is required'
      }, { status: 400 });
    }

    // Remove the like
    const { error: deleteError } = await supabase
      .from('user_activity_likes')
      .delete()
      .eq('user_id', user.id)
      .eq('activity_id', activityId);

    if (deleteError) {
      console.error('Error removing like:', deleteError);
      return NextResponse.json({
        success: false,
        error: 'Failed to remove like'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Activity unliked successfully',
      isLiked: false,
      action: 'unliked'
    });

  } catch (error) {
    console.error('Likes DELETE API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const activityId = searchParams.get('activityId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    if (activityId) {
      // Check if specific activity is liked
      const { data: like, error: checkError } = await supabase
        .from('user_activity_likes')
        .select('id, created_at')
        .eq('user_id', user.id)
        .eq('activity_id', activityId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking like status:', checkError);
        return NextResponse.json({
          success: false,
          error: 'Database error'
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        isLiked: !!like,
        likedAt: like?.created_at || null
      });
    } else {
      // Get all user's likes with pagination
      const { data: likes, error: fetchError, count } = await supabase
        .from('user_activity_likes')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (fetchError) {
        console.error('Error fetching likes:', fetchError);
        return NextResponse.json({
          success: false,
          error: 'Failed to fetch likes'
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        data: likes,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      });
    }

  } catch (error) {
    console.error('Likes GET API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}