"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SummaryForm() {
  const [url, setUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [urdu, setUrdu] = useState("");
  const [loading, setLoading] = useState(false);

  // Use useEffect to log state changes
  useEffect(() => {
    console.log("State updated:", { summary, urdu, loading });
  }, [summary, urdu, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      alert("Please enter a URL");
      return;
    }

    setLoading(true);
    // Clear previous results
    setSummary("");
    setUrdu("");

    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();
      console.log("API Response:", data);

      if (data.success) {
        // Use setTimeout to ensure state updates properly
        setTimeout(() => {
          setSummary(data.summary);
          setUrdu(data.translated);
          setLoading(false);
        }, 100);
      } else {
        console.error("Error:", data.error);
        alert(`Error: ${data.error}`);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error processing blog:", error);
      alert("Network error occurred");
      setLoading(false);
    }
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
      <Button type="submit" disabled={loading}>
        {loading ? "Processing..." : "Summarize"}
      </Button>

      {/* Results area with better visibility */}
      {(summary || urdu) && (
        <div className="mt-4 p-4 bg-gray-900/90 rounded-xl text-gray-100 border border-gray-700">
          <p className="mb-3">
            <strong className="text-blue-300">Summary:</strong>
            <span className="text-gray-100 ml-2">{summary}</span>
          </p>
          <p>
            <strong className="text-green-300">Urdu:</strong>
            <span className="text-gray-100 ml-2">{urdu}</span>
          </p>
        </div>
      )}

      {/* Debug info */}
      <div className="text-gray-400 text-xs opacity-75">
        Debug: summary length: {summary.length}, urdu length: {urdu.length}
      </div>
    </form>
  );
}
