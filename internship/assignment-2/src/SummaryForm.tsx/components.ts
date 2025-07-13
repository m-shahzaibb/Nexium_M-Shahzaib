"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { scrapeBlog } from "@/lib/scrape";
import { translateToUrdu } from "@/lib/translate";
import { supabase } from "@/utils/supabase";
import { db } from "@/utils/mongodb";

export default function SummaryForm() {
  const [url, setUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [urdu, setUrdu] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullText = await scrapeBlog(url);
    const summary = fullText.slice(0, 50); // static "summary"
    const translated = translateToUrdu(summary);
    setSummary(summary);
    setUrdu(translated);

    await supabase.from("summaries").insert([{ url, summary: translated }]);
    await db.collection("fulltexts").insertOne({ url, content: fullText });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-w-xl mx-auto p-6 bg-white/10 backdrop-blur-xl rounded-xl border border-white/30"
    >
      <Input
        placeholder="Enter blog URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <Button type="submit">Summarize</Button>

      {summary && (
        <div className="mt-4 p-4 bg-white/20 rounded-xl text-white">
          <p>
            <strong>Summary:</strong> {summary}
          </p>
          <p>
            <strong>Urdu:</strong> {urdu}
          </p>
        </div>
      )}
    </form>
  );
}
