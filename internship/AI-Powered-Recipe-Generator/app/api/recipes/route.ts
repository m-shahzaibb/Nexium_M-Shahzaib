import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Recipe from '../../../lib/models/Recipe';
import { Types } from 'mongoose';

// Update interface to match actual MongoDB document structure
interface LeanRecipe {
  _id: Types.ObjectId;
  recipeName: string;
  prompt: string;
  createdAt: Date;
  source?: string;
  success: boolean;
  userEmail?: string;
}

export async function GET(request: NextRequest) {
  console.log("🚀 Starting /api/recipes GET request");
  
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail');

    console.log("🔍 API Request - userEmail:", userEmail);

    if (!userEmail) {
      console.log("❌ No userEmail provided");
      return NextResponse.json(
        { 
          success: false,
          error: 'User email is required',
          recipes: []
        },
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
        success: false,
        recipes: [],
        error: 'Database connection failed',
        details: dbError instanceof Error ? dbError.message : 'Unknown error'
      }, { status: 500 });
    }

    // Fetch user's recipes, sorted by most recent first
    try {
      console.log(`🔎 Searching for recipes with userEmail: "${userEmail}"`);
      
      const rawRecipes = await Recipe.find({ userEmail })
        .sort({ createdAt: -1 })
        .limit(20)
        .select('_id recipeName prompt createdAt source success userEmail')
        .lean();

      console.log(`✅ Found ${rawRecipes.length} recipes for user: ${userEmail}`);
      
      // Convert MongoDB ObjectId to string for JSON serialization with proper typing
      const serializedRecipes = rawRecipes.map((recipe: unknown) => {
        const typedRecipe = recipe as {
          _id: Types.ObjectId;
          recipeName?: string;
          prompt?: string;
          createdAt?: Date;
          source?: string;
          success?: boolean;
          userEmail?: string;
        };

        return {
          _id: typedRecipe._id.toString(),
          recipeName: typedRecipe.recipeName || 'Untitled Recipe',
          prompt: typedRecipe.prompt || '',
          createdAt: typedRecipe.createdAt,
          source: typedRecipe.source,
          success: typedRecipe.success || true,
          userEmail: typedRecipe.userEmail
        };
      });

      // Log first recipe for debugging using serialized data
      if (serializedRecipes.length > 0) {
        console.log("📄 Sample recipe:", {
          id: serializedRecipes[0]._id,
          name: serializedRecipes[0].recipeName,
          userEmail: serializedRecipes[0].userEmail
        });
      }

      return NextResponse.json({
        success: true,
        recipes: serializedRecipes,
        count: serializedRecipes.length
      });
      
    } catch (queryError) {
      console.error('❌ Database query failed:', queryError);
      return NextResponse.json({
        success: false,
        recipes: [],
        error: 'Failed to query recipes',
        details: queryError instanceof Error ? queryError.message : 'Unknown error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error("❌ Error fetching recipes:", error);
    return NextResponse.json(
      { 
        success: false,
        recipes: [],
        error: 'Failed to fetch recipes',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}