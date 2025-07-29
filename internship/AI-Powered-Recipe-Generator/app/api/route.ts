import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();
    
    // Use environment variable instead of hardcoded localhost
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || "http://localhost:5678/webhook/generate-recipe";
    
    console.log("Using n8n webhook URL:", n8nWebhookUrl); // Debug log
    
    const res = await fetch(n8nWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json({ recipe: data.recipe });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to generate recipe" },
      { status: 500 }
    );
  }
}
