import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Recipe from '../../../lib/models/Recipe';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail');

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    try {
      await connectDB();
      console.log('✅ Connected to MongoDB for fetching recipes');
    } catch (dbError) {
      console.error('❌ MongoDB connection failed:', dbError);
      return NextResponse.json({
        success: true,
        recipes: [],
        error: 'Database connection failed'
      });
    }

    // Fetch user's recipes, sorted by most recent first
    const recipes = await Recipe.find({ userEmail })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('_id recipeName prompt createdAt source success')
      .lean();

    console.log(`✅ Found ${recipes.length} recipes for user: ${userEmail}`);

    return NextResponse.json({
      success: true,
      recipes: recipes
    });

  } catch (error) {
    console.error("Error fetching recipes:", error);
    return NextResponse.json(
      { 
        success: false,
        recipes: [],
        error: 'Failed to fetch recipes' 
      },
      { status: 500 }
    );
  }
}