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
      accommodationId, 
      accommodationName, 
      accommodationLocation, 
      accommodationImageUrl, 
      accommodationPrice, 
      accommodationRating,
      accommodationEcoRating,
      accommodationDescription,
      accommodationChainCode,
      accommodationFeatures,
      accommodationAmenities,
      accommodationCoordinates,
      accommodationSource = 'amadeus'
    } = body;

    if (!accommodationId || !accommodationName) {
      return NextResponse.json({
        success: false,
        error: 'Accommodation ID and name are required'
      }, { status: 400 });
    }

    // Check if already liked
    const { data: existingLike, error: checkError } = await supabase
      .from('user_accommodation_likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('accommodation_id', accommodationId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error checking existing accommodation like:', checkError);
      return NextResponse.json({
        success: false,
        error: 'Database error'
      }, { status: 500 });
    }

    if (existingLike) {
      // If already liked, remove it (toggle behavior)
      console.log(`[ACCOMMODATION LIKES API] Removing existing like for accommodation ${accommodationId}`);
      
      const { error: deleteError } = await supabase
        .from('user_accommodation_likes')
        .delete()
        .eq('user_id', user.id)
        .eq('accommodation_id', accommodationId);

      if (deleteError) {
        console.error('Error removing accommodation like during toggle:', deleteError);
        return NextResponse.json({
          success: false,
          error: 'Failed to toggle accommodation like'
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'Accommodation unliked successfully',
        isLiked: false,
        action: 'unliked'
      });
    }

    // Add the like
    const { data: newLike, error: insertError } = await supabase
      .from('user_accommodation_likes')
      .insert({
        user_id: user.id,
        accommodation_id: accommodationId,
        accommodation_name: accommodationName,
        accommodation_location: accommodationLocation,
        accommodation_image_url: accommodationImageUrl,
        accommodation_price: accommodationPrice,
        accommodation_rating: accommodationRating,
        accommodation_eco_rating: accommodationEcoRating,
        accommodation_description: accommodationDescription,
        accommodation_chain_code: accommodationChainCode,
        accommodation_features: accommodationFeatures,
        accommodation_amenities: accommodationAmenities,
        accommodation_coordinates: accommodationCoordinates,
        accommodation_source: accommodationSource
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error adding accommodation like:', insertError);
      return NextResponse.json({
        success: false,
        error: 'Failed to add accommodation like'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Accommodation liked successfully',
      data: newLike,
      isLiked: true,
      action: 'liked'
    });

  } catch (error) {
    console.error('Accommodation Likes API error:', error);
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
    const accommodationId = searchParams.get('accommodationId');

    if (!accommodationId) {
      return NextResponse.json({
        success: false,
        error: 'Accommodation ID is required'
      }, { status: 400 });
    }

    // Remove the like
    const { error: deleteError } = await supabase
      .from('user_accommodation_likes')
      .delete()
      .eq('user_id', user.id)
      .eq('accommodation_id', accommodationId);

    if (deleteError) {
      console.error('Error removing accommodation like:', deleteError);
      return NextResponse.json({
        success: false,
        error: 'Failed to remove accommodation like'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Accommodation unliked successfully',
      isLiked: false,
      action: 'unliked'
    });

  } catch (error) {
    console.error('Accommodation Likes DELETE API error:', error);
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
    const accommodationId = searchParams.get('accommodationId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    if (accommodationId) {
      // Check if specific accommodation is liked
      const { data: like, error: checkError } = await supabase
        .from('user_accommodation_likes')
        .select('id, created_at')
        .eq('user_id', user.id)
        .eq('accommodation_id', accommodationId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking accommodation like status:', checkError);
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
      // Get all user's accommodation likes with pagination
      const { data: likes, error: fetchError, count } = await supabase
        .from('user_accommodation_likes')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (fetchError) {
        console.error('Error fetching accommodation likes:', fetchError);
        return NextResponse.json({
          success: false,
          error: 'Failed to fetch accommodation likes'
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
    console.error('Accommodation Likes GET API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}