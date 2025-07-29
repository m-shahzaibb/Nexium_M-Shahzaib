import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Add proper validation for request body
    const body = await request.json();
    const { prompt } = body;
    
    // Validate required fields
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Valid prompt is required' },
        { status: 400 }
      );
    }
    
    // Use environment variable instead of hardcoded localhost
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || "http://localhost:5678/webhook/generate-recipe";
    
    console.log("Using n8n webhook URL:", n8nWebhookUrl); // Debug log
    
    const res = await fetch(n8nWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: prompt.trim() }), // Trim whitespace
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Unknown error');
      console.error(`N8N webhook error: ${res.status} - ${errorText}`);
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    
    // Validate response from N8N
    if (!data || !data.recipe) {
      console.error("Invalid response from N8N:", data);
      throw new Error("Invalid response format from recipe generator");
    }

    return NextResponse.json({ 
      recipe: data.recipe,
      success: true 
    });
    
  } catch (error) {
    console.error("Error generating recipe:", error);
    
    // Return more specific error messages
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          error: "Failed to generate recipe",
          details: error.message,
          success: false
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        error: "Failed to generate recipe",
        success: false
      },
      { status: 500 }
    );
  }
}

// Add a GET method for health check (optional)
export async function GET() {
  return NextResponse.json({ 
    message: "Recipe API is running",
    timestamp: new Date().toISOString()
  });
}
