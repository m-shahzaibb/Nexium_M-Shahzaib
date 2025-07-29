import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Recipe from '../../../lib/models/Recipe';
import { Types } from 'mongoose';

// Add interface for lean recipe document
interface LeanRecipe {
  _id: Types.ObjectId;
  recipeName: string;
  prompt: string;
  createdAt: Date;
  source?: string;
  success: boolean;
}

// Helper function to extract recipe name from content
function extractRecipeName(content: string, fallbackPrompt: string): string {
  // Clean the content first
  const cleanContent = content.replace(/[#*_`]/g, '').trim();

  const patterns = [
    /(?:Recipe(?:\s+for)?:?\s*)([^\n\r]+)/i,
    /^([^\n\r]{10,80})(?:\n|\r|$)/,
    /(?:dish|meal|recipe)\s+(?:is|called|named)\s+([^\n\r.,]{5,50})/i,
    /(?:make|prepare|cook)\s+(?:a|an|some)?\s*([^\n\r.,]{5,50})/i
  ];
  
  for (const pattern of patterns) {
    const match = cleanContent.match(pattern);
    if (match && match[1]) {
      let name = match[1].trim();
      
      // Clean up the extracted name
      name = name.replace(/[.,!?;:]$/, ''); // Remove trailing punctuation
      name = name.replace(/\s+/g, ' '); // Normalize whitespace
      
      if (name.length >= 5 && name.length <= 80 && !/^\d+$/.test(name)) {
        return name;
      }
    }
  }

  const fallbackName = fallbackPrompt.length > 50 ? fallbackPrompt.slice(0, 47) + '...' : fallbackPrompt;
  return `Recipe for ${fallbackName}`;
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, userEmail, recipeName } = await request.json();
    
    // Validate inputs
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Valid prompt is required' },
        { status: 400 }
      );
    }
    
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || "http://localhost:5678/webhook/f6331d8d-3a04-4bee-9146-7d88abdfd548";
    
    console.log("Using n8n webhook URL:", n8nWebhookUrl);
    
    const res = await fetch(n8nWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: prompt.trim() }),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Unknown error');
      console.error(`N8N webhook error: ${res.status} - ${errorText}`);
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    
    if (!data || !data.recipe) {
      throw new Error("Invalid response format from recipe generator");
    }
    
    const recipeContent = data.recipe;

    // Use the provided recipe name, or extract from content as fallback
    const finalRecipeName = recipeName && recipeName.trim() 
      ? recipeName.trim() 
      : extractRecipeName(recipeContent, prompt);
    
    console.log("Using recipe name:", finalRecipeName);

    // Save to MongoDB
    try {
      await connectDB();
      
      const recipe = new Recipe({
        recipeName: finalRecipeName,
        prompt: prompt.trim(),
        recipeContent: recipeContent,
        userEmail: userEmail || 'anonymous@example.com',
        source: 'n8n-gemini',
        success: true,
        createdAt: new Date()
      });

      await recipe.save();
      console.log('✅ Recipe saved to database with name:', finalRecipeName);

      return NextResponse.json({ 
        recipe: recipeContent,
        saved: true,
        recipeName: finalRecipeName
      });
    } catch (dbError) {
      console.error('❌ Failed to save recipe:', dbError);
      // Return the recipe even if saving fails
      return NextResponse.json({ 
        recipe: recipeContent,
        saved: false,
        error: 'Failed to save recipe'
      });
    }

  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { 
        error: "Failed to generate recipe",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
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
    const recipes = await Recipe.find({ userEmail })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('_id recipeName prompt createdAt source success')
      .lean() as unknown as LeanRecipe[]; // Fix: Double type assertion

    console.log(`✅ Found ${recipes.length} recipes for user: ${userEmail}`);
    
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