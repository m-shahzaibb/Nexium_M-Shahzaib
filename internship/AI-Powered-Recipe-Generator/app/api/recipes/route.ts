import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Recipe from '../../../lib/models/Recipe';
import { Types } from 'mongoose'; // Add this import

// Add interface for lean recipe document
interface LeanRecipe {
  _id: Types.ObjectId;
  recipeName: string;
  prompt: string;
  createdAt: Date;
  source?: string;
  success: boolean;
  userEmail?: string; // Add this for debugging
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
        details: dbError instanceof Error ? dbError.message : 'Unknown error' // Fix: Type check
      }, { status: 500 });
    }

    // Fetch user's recipes, sorted by most recent first
    try {
      console.log(`🔎 Searching for recipes with userEmail: "${userEmail}"`);
      
      const recipes = await Recipe.find({ userEmail })
        .sort({ createdAt: -1 })
        .limit(20)
        .select('_id recipeName prompt createdAt source success userEmail') // Add userEmail for debugging
        .lean() as LeanRecipe[]; // Fix: Add type assertion

      console.log(`✅ Found ${recipes.length} recipes for user: ${userEmail}`);
      
      // Log first recipe for debugging
      if (recipes.length > 0) {
        console.log("📄 Sample recipe:", {
          id: recipes[0]._id.toString(), // Fix: Convert ObjectId to string
          name: recipes[0].recipeName,
          userEmail: recipes[0].userEmail
        });
      }
      
      // Convert MongoDB ObjectId to string for JSON serialization
      const serializedRecipes = recipes.map(recipe => ({
        ...recipe,
        _id: recipe._id.toString() // Now TypeScript knows _id is ObjectId
      }));

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
        details: queryError instanceof Error ? queryError.message : 'Unknown error' // Fix: Type check
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