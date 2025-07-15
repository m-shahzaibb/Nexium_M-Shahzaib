"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SummaryForm() {
  const [url, setUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [fullText, setFullText] = useState("");
  const [urdu, setUrdu] = useState("");
  const [loading, setLoading] = useState(false);

  // Use useEffect to log state changes
  useEffect(() => {
    console.log("State updated:", { summary, fullText, urdu, loading });
  }, [summary, fullText, urdu, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      alert("Please enter a URL");
      return;
    }

    setLoading(true);
    // Clear previous results
    setSummary("");
    setFullText("");
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
        setSummary(data.summary);
        setFullText(data.fullText);
        setUrdu(data.translated);
        setLoading(false);
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
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header Bar */}
      <header className="w-full bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  AI Summary
                </h1>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <div className="text-sm text-gray-300">
                Powered by AI • Instant Translation
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 min-h-screen flex items-center w-full">
        <div className="container mx-auto px-4 text-center w-full">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Transform Any Blog into{" "}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Smart Summaries
              </span>
            </h2>
            <p className="text-gray-300 text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed">
              Get instant AI-powered summaries and Urdu translations of any blog
              post. Simply paste a URL and let our advanced AI do the work in
              seconds.
            </p>

            {/* Main Form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-6 max-w-2xl mx-auto p-8 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/30 shadow-2xl"
            >
              <div className="space-y-4">
                <Input
                  placeholder="https://example.com/blog-post"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="h-14 text-lg bg-white/10 border-white/20 text-white placeholder-gray-400"
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    "Generate Summary"
                  )}
                </Button>
              </div>

              {/* Results area */}
              {(summary || fullText || urdu) && (
                <div className="mt-8 space-y-4">
                  {fullText && (
                    <div className="p-6 bg-gray-900/90 rounded-xl text-gray-100 border border-gray-700">
                      <h3 className="text-xl font-semibold text-purple-300 mb-3">
                        📖 Full Text
                      </h3>
                      <p className="text-gray-100 leading-relaxed">
                        {fullText}
                      </p>
                    </div>
                  )}

                  {summary && (
                    <div className="p-6 bg-gray-900/90 rounded-xl text-gray-100 border border-gray-700">
                      <h3 className="text-xl font-semibold text-blue-300 mb-3">
                        📄 Summary
                      </h3>
                      <p className="text-gray-100 leading-relaxed">{summary}</p>
                    </div>
                  )}

                  {urdu && (
                    <div className="p-6 bg-gray-900/90 rounded-xl text-gray-100 border border-gray-700">
                      <h3 className="text-xl font-semibold text-green-300 mb-3">
                        🌐 Urdu Translation
                      </h3>
                      <p className="text-gray-100 leading-relaxed" dir="rtl">
                        {urdu}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-black/20 w-full">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-white mb-4">
              Why Choose AI Summary?
            </h3>
            <p className="text-gray-300 text-xl max-w-2xl mx-auto">
              Experience the power of advanced AI technology for content
              summarization
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center p-8 bg-white/5 backdrop-blur rounded-xl border border-white/10">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-white mb-3">
                Lightning Fast
              </h4>
              <p className="text-gray-300">
                Get summaries in seconds with our optimized AI processing
              </p>
            </div>

            <div className="text-center p-8 bg-white/5 backdrop-blur rounded-xl border border-white/10">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                  />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-white mb-3">
                Multi-Language
              </h4>
              <p className="text-gray-300">
                Instant translation to Urdu with cultural context
              </p>
            </div>

            <div className="text-center p-8 bg-white/5 backdrop-blur rounded-xl border border-white/10">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-white mb-3">
                High Accuracy
              </h4>
              <p className="text-gray-300">
                Advanced AI ensures precise and meaningful summaries
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 w-full">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-white mb-4">How It Works</h3>
            <p className="text-gray-300 text-xl max-w-2xl mx-auto">
              Three simple steps to get your AI-powered summary
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                  1
                </div>
                <h4 className="text-xl font-semibold text-white mb-3">
                  Paste URL
                </h4>
                <p className="text-gray-300">
                  Copy and paste any blog post URL into our input field
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                  2
                </div>
                <h4 className="text-xl font-semibold text-white mb-3">
                  AI Processing
                </h4>
                <p className="text-gray-300">
                  Our AI analyzes and extracts key information from the content
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                  3
                </div>
                <h4 className="text-xl font-semibold text-white mb-3">
                  Get Results
                </h4>
                <p className="text-gray-300">
                  Receive your summary and Urdu translation instantly
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Features Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900/20 to-purple-900/20 w-full">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-white mb-4">
              Advanced Features
            </h3>
            <p className="text-gray-300 text-xl max-w-2xl mx-auto">
              Cutting-edge technology for superior content processing
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="p-8 bg-white/5 backdrop-blur rounded-xl border border-white/10">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mr-4">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                    />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold text-white">
                  Smart Storage
                </h4>
              </div>
              <p className="text-gray-300">
                Intelligent data management with MongoDB and Supabase
                integration for fast retrieval and secure storage.
              </p>
            </div>

            <div className="p-8 bg-white/5 backdrop-blur rounded-xl border border-white/10">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mr-4">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold text-white">
                  Analytics Ready
                </h4>
              </div>
              <p className="text-gray-300">
                Built-in analytics and insights to track your summarization
                history and optimize your content consumption.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-black/30 border-t border-white/10 w-full">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              AI Summary
            </h1>
          </div>
          <p className="text-gray-400 mb-4">
            Transforming content consumption with AI-powered intelligence
          </p>

          <div className="text-sm text-gray-500">
            © 2024 AI Summary. Built with Next.js, MongoDB & Supabase.
            <br />
            Developed by{" "}
            <a
              href="https://github.com/m-shahzaibb"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              Muhammad Shahzaib
            </a>
          </div>
        </div>
      </footer>

      {/* Debug info - only show when results exist */}
      {(summary || fullText || urdu) && (
        <div className="fixed bottom-4 right-4 bg-black/80 text-gray-400 text-xs p-2 rounded opacity-50">
          Debug: fullText({fullText.length}), summary({summary.length}), urdu(
          {urdu.length})
        </div>
      )}
    </div>
  );
}
