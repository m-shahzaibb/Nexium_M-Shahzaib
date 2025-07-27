import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Recipe from '../../../lib/models/Recipe';

// Helper function to extract recipe name from content
function extractRecipeName(content: string, fallbackPrompt: string): string {
  const headingMatch = content.match(/^#+\s*(.+?)$/m);
  if (headingMatch) {
    return headingMatch[1].replace(/[^\w\s]/g, '').trim();
  }
  return fallbackPrompt.charAt(0).toUpperCase() + fallbackPrompt.slice(1);
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, userEmail } = await request.json();
    
    console.log("API received prompt:", prompt);
    console.log("User email:", userEmail);

    let canSaveToDatabase = false;

    // Try to connect to MongoDB
    try {
      await connectDB();
      console.log("✅ Connected to MongoDB successfully");
      canSaveToDatabase = true;
    } catch (dbError) {
      console.error("❌ MongoDB connection failed:", dbError);
      console.log("⚠️ Continuing without database - recipe won't be saved");
    }

    // Call n8n webhook with the correct URL
    console.log("Calling n8n webhook with Gemini...");
    const res = await fetch(
      "http://localhost:5678/webhook-test/f6331d8d-3a04-4bee-9146-7d88abdfd548",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      }
    );

    console.log("n8n response status:", res.status);

    let recipeData = {
      recipeName: prompt,
      prompt: prompt,
      recipeContent: '',
      userEmail: userEmail || 'anonymous@example.com',
      userId: userEmail ? userEmail.split('@')[0] : 'anonymous',
      source: 'n8n-gemini',
      success: true
    };

    if (!res.ok) {
      console.log("n8n webhook failed with status:", res.status);
      const errorText = await res.text();
      console.log("n8n error response:", errorText);
      
      // Fallback response with proper formatting
      const fallbackRecipe = `
🍽️ **${prompt.charAt(0).toUpperCase() + prompt.slice(1)} Recipe** (Fallback)

📋 **Ingredients:**
• 2 cups ${prompt.includes('rice') ? 'basmati rice' : 'main ingredient'}
• 1 lb ${prompt.includes('chicken') ? 'chicken breast' : 'protein'}
• 2 tablespoons olive oil
• 1 medium onion, diced
• 3 cloves garlic, minced
• Salt and pepper to taste
• Fresh herbs (optional)

👨‍🍳 **Instructions:**
1. **Prep:** Wash and prepare all ingredients
2. **Heat:** Heat olive oil in a large pan over medium heat
3. **Aromatics:** Add diced onion, cook until translucent (3-4 minutes)
4. **Garlic:** Add minced garlic, cook for 1 minute until fragrant
5. **Main ingredient:** Add ${prompt} and cook thoroughly
6. **Season:** Add salt, pepper, and herbs to taste
7. **Finish:** Cook until everything is well combined and heated through
8. **Serve:** Plate and serve hot

⏱️ **Total Time:** 25-30 minutes | 👥 **Serves:** 3-4 people

⚠️ *Note: n8n webhook failed with status ${res.status}. This is a fallback response.*
      `;
      
      recipeData.recipeContent = fallbackRecipe;
      recipeData.source = 'fallback';
      recipeData.success = false;
      
      // Try to save fallback recipe if database is available
      if (canSaveToDatabase) {
        try {
          const savedRecipe = await Recipe.create(recipeData);
          console.log("✅ Fallback recipe saved to database:", savedRecipe._id);
        } catch (dbError) {
          console.error("❌ Failed to save fallback recipe to database:", dbError);
        }
      }
      
      return NextResponse.json({ 
        recipe: fallbackRecipe,
        success: true,
        source: "fallback",
        error: `n8n returned ${res.status}: ${errorText}`,
        saved: canSaveToDatabase
      });
    }

    // Parse n8n response properly
    const responseText = await res.text();
    console.log("n8n raw response:", responseText);
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.log("Failed to parse n8n response as JSON, using as text");
      data = { message: responseText };
    }
    
    console.log("n8n parsed response:", data);
    
    // Extract recipe from different possible fields in n8n response
    const recipe = data.recipe || 
                  data.message || 
                  data.text || 
                  data.content ||
                  data.output ||
                  data.response ||
                  responseText ||
                  JSON.stringify(data);
    
    // Update recipe data with successful response
    recipeData.recipeContent = recipe;
    recipeData.recipeName = extractRecipeName(recipe, prompt);

    // Try to save successful recipe if database is available
    if (canSaveToDatabase) {
      try {
        const savedRecipe = await Recipe.create(recipeData);
        console.log("✅ Recipe saved to database:", savedRecipe._id);
        
        return NextResponse.json({ 
          recipe: recipe,
          success: true,
          source: "n8n-gemini",
          saved: true,
          recipeId: savedRecipe._id
        });
      } catch (dbError) {
        console.error("❌ Failed to save recipe to database:", dbError);
        
        // Still return the recipe even if database save fails
        return NextResponse.json({ 
          recipe: recipe,
          success: true,
          source: "n8n-gemini",
          saved: false,
          error: "Failed to save to database"
        });
      }
    }

    // Return recipe without saving if database isn't available
    return NextResponse.json({ 
      recipe: recipe,
      success: true,
      source: "n8n-gemini",
      saved: false,
      error: "Database not available"
    });

  } catch (error) {
    console.error("API Error:", error);
    
    // Create error fallback recipe with proper formatting
    const errorFallback = `
🍽️ **Quick ${prompt || 'Recipe'} Recipe** (Error Fallback)

📋 **Ingredients:**
• ${prompt || 'Main ingredient'}
• Basic seasonings
• Cooking oil

👨‍🍳 **Instructions:**
1. Prepare your ${prompt || 'ingredients'}
2. Cook using your preferred method
3. Season to taste and serve

⏱️ **Total Time:** 15-20 minutes | 👥 **Serves:** 2-3 people

⚠️ **Error:** ${error.message}
    `;

    // Try to save error fallback to database
    if (canSaveToDatabase) {
      try {
        const errorRecipeData = {
          recipeName: prompt || 'Error Recipe',
          prompt: prompt || 'unknown',
          recipeContent: errorFallback,
          userEmail: userEmail || 'error@example.com',
          userId: 'error-user',
          source: 'error-fallback',
          success: false
        };
        
        const savedRecipe = await Recipe.create(errorRecipeData);
        console.log("✅ Error fallback recipe saved to database:", savedRecipe._id);
      } catch (dbError) {
        console.error("❌ Failed to save error recipe to database:", dbError);
      }
    }
    
    return NextResponse.json({ 
      recipe: errorFallback,
      success: false,
      error: error.message,
      source: "error-fallback",
      saved: canSaveToDatabase
    });
  }
}