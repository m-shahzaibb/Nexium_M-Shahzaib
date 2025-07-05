"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { QuoteCard } from "@/components/QuoteCard";
import { quotes } from "@/lib/quotes";

export default function Home() {
  const [topic, setTopic] = useState("");
  const [selectedQuotes, setSelectedQuotes] = useState<typeof quotes>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim() === "") {
      setSelectedQuotes([]);
      return;
    }
    const filtered = quotes.filter(
      (quote) =>
        quote.text.toLowerCase().includes(topic.toLowerCase()) ||
        quote.author.toLowerCase().includes(topic.toLowerCase())
    );
    setSelectedQuotes(filtered);
  };

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center p-6 gap-6"
      style={{
        backgroundImage: "url('/bg-img.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        width: "100vw",
      }}
    >
      <h1 className="text-2xl font-bold text-white">
        Motivational Quote Generator
      </h1>

      <form
        className="w-full max-w-md p-6 rounded-2xl bg-white/30 backdrop-blur-xl border border-white/40 shadow-2xl flex flex-col gap-4"
        onSubmit={handleSubmit}
      >
        <Input
          placeholder="Enter a topic (e.g. success, courage)"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="rounded-2xl bg-white/5 backdrop-blur-2xl text-white font-semibold placeholder-white/60 border border-white/40 px-4 py-3 shadow-[inset_1px_1px_3px_rgba(255,255,255,0.2),inset_-1px_-1px_2px_rgba(0,0,0,0.2)]"
        />

        <Button type="submit" className="w-full">
          Get Quotes
        </Button>
      </form>

      <div className="grid gap-4 mt-6 w-full max-w-2xl">
        {selectedQuotes.length === 0 && topic.trim() !== "" ? (
          <div className="text-center text-white/80">No quotes found.</div>
        ) : (
          selectedQuotes.map((quote, index) => (
            <QuoteCard key={index} quote={quote} />
          ))
        )}
      </div>
    </main>
  );
}
