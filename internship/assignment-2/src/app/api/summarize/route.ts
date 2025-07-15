import { NextRequest, NextResponse } from "next/server";
import { translateToUrdu } from "@/lib/translate";
import { supabase } from "@/utils/supabase";
import { getDB } from "@/utils/mongodb";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ success: false, error: "URL is required" });
    }

    // Simulate fetching and processing blog content
    const fullText = `This is a sample blog post from ${url}. It contains detailed information about various topics and provides comprehensive coverage of the subject matter. The blog discusses important concepts and includes relevant examples to help readers understand the content better.`;
    
    const summary = `This is a sample blog post from blog. It contains information about topics.`;
    const translated = translateToUrdu(summary);

    // Save full text to MongoDB
    try {
      const db = await getDB();
      const fullTextResult = await db.collection('blog_posts').insertOne({
        url,
        fullText,
        summary,
        translated,
        createdAt: new Date(),
      });
      console.log('Saved to MongoDB:', fullTextResult.insertedId);
    } catch (mongoError) {
      console.error('MongoDB save error:', mongoError);
    }

    // Save only summary to Supabase
    try {
      const { data, error } = await supabase
        .from('summaries')
        .insert([
          {
            url,
            summary,
            created_at: new Date().toISOString(),
          }
        ]);

      if (error) {
        console.error('Supabase save error:', error);
      } else {
        console.log('Saved to Supabase:', data);
      }
    } catch (supabaseError) {
      console.error('Supabase save error:', supabaseError);
    }

    return NextResponse.json({
      success: true,
      summary,
      fullText,
      translated,
    });
  } catch (error) {
    console.error("Error in API:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to process blog post",
    });
  }
}