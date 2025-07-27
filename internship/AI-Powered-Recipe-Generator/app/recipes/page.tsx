"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function RecipeGeneratorPage() {
  const [prompt, setPrompt] = useState("");
  const [recipe, setRecipe] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [previousRecipes, setPreviousRecipes] = useState([]);
  const [loadingRecipes, setLoadingRecipes] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showPreviousRecipes, setShowPreviousRecipes] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
        // Fetch user's previous recipes
        fetchPreviousRecipes(data.user.email);
      } else {
        router.push("/login");
      }
      setUserLoading(false);
    };
    getUser();
  }, [router]);

  const fetchPreviousRecipes = async (userEmail) => {
    setLoadingRecipes(true);
    try {
      const res = await fetch(
        `/api/recipes?userEmail=${encodeURIComponent(userEmail)}`
      );
      if (res.ok) {
        const data = await res.json();
        setPreviousRecipes(data.recipes || []);
      }
    } catch (error) {
      console.error("Error fetching previous recipes:", error);
    } finally {
      setLoadingRecipes(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setSelectedRecipe(null); // Clear any selected recipe
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          userEmail: user?.email || "anonymous@example.com",
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setRecipe(data.recipe || JSON.stringify(data));

      // Show success message if saved
      if (data.saved) {
        console.log("✅ Recipe saved to database for user:", user?.email);
        // Refresh the previous recipes list
        fetchPreviousRecipes(user?.email);
      }
    } catch (error) {
      console.error("Error:", error);
      setRecipe("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewRecipe = async (recipeId) => {
    try {
      const res = await fetch(`/api/recipes/${recipeId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedRecipe(data.recipe);
        setRecipe(data.recipe.recipeContent);
        setPrompt(data.recipe.prompt); // Set the prompt to show what was searched
      }
    } catch (error) {
      console.error("Error fetching recipe:", error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Show loading while checking authentication
  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-100 via-yellow-100 to-pink-100">
        <p className="text-lg text-gray-700 animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-yellow-100 to-pink-100 flex flex-col items-center justify-center px-4 py-8">
      <div className="bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-xl w-full max-w-4xl border border-gray-200">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          AI Recipe Generator
        </h1>

        {/* Show logged-in user info */}
        <p className="text-center text-sm text-gray-600 mb-6">
          Welcome,{" "}
          <span className="font-semibold text-purple-600">{user?.email}</span>
        </p>

        <input
          type="text"
          placeholder="e.g. chicken and rice"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800 placeholder-gray-500"
          onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
        />

        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-md font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 mb-6"
        >
          {loading ? "Generating Recipe..." : "Generate Recipe"}
        </button>

        {/* Previous Recipes Section */}
        {previousRecipes.length > 0 && (
          <div className="mb-6 bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-200">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-bold text-gray-800">
                📖 Your Previous Recipes ({previousRecipes.length})
              </h3>
              <button
                onClick={() => setShowPreviousRecipes(!showPreviousRecipes)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                {showPreviousRecipes ? "Hide" : "Show"}
              </button>
            </div>

            {showPreviousRecipes && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {loadingRecipes ? (
                  <p className="text-gray-500 text-sm">Loading recipes...</p>
                ) : (
                  previousRecipes.map((recipe) => (
                    <div
                      key={recipe._id}
                      className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200 hover:border-purple-300 transition-colors"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800 text-sm">
                          {recipe.recipeName}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {formatDate(recipe.createdAt)}{" "}
                          {recipe.source !== "n8n-gemini" && (
                            <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                              {recipe.source}
                            </span>
                          )}
                        </p>
                      </div>
                      <button
                        onClick={() => handleViewRecipe(recipe._id)}
                        className="ml-3 px-3 py-1 bg-purple-500 text-white text-xs rounded-md hover:bg-purple-600 transition-colors"
                      >
                        View
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Recipe Display Section */}
        {recipe && (
          <div className="mt-6 bg-gradient-to-br from-orange-50 to-yellow-50 p-6 rounded-xl shadow-lg border border-orange-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 text-xl border-b-2 border-orange-300 pb-2">
                🍽️ {selectedRecipe ? "Saved Recipe" : "Generated Recipe"}
              </h3>
              {selectedRecipe && (
                <button
                  onClick={() => {
                    setSelectedRecipe(null);
                    setRecipe("");
                    setPrompt("");
                  }}
                  className="text-sm text-gray-600 hover:text-gray-800 font-medium"
                >
                  ✕ Close
                </button>
              )}
            </div>

            <div className="prose prose-sm max-w-none text-sm max-h-96 overflow-y-auto">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-3 border-b-2 border-orange-200 pb-2">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-xl font-bold text-gray-800 mt-5 mb-3 flex items-center">
                      <span className="mr-2">🔸</span>
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-lg font-bold text-gray-800 mt-4 mb-2 flex items-center">
                      <span className="mr-2">📋</span>
                      {children}
                    </h3>
                  ),
                  h4: ({ children }) => (
                    <h4 className="text-base font-bold text-gray-900 mt-3 mb-2 border-l-4 border-orange-300 pl-3">
                      {children}
                    </h4>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-bold text-gray-900 bg-orange-100 px-1 rounded">
                      {children}
                    </strong>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-none mb-4 space-y-1">{children}</ul>
                  ),
                  li: ({ children }) => (
                    <li className="mb-2 flex items-start text-gray-800">
                      <span className="text-orange-500 mr-2 mt-1">•</span>
                      <span>{children}</span>
                    </li>
                  ),
                  p: ({ children }) => (
                    <p className="mb-3 leading-relaxed text-gray-800">
                      {children}
                    </p>
                  ),
                  hr: () => (
                    <hr className="my-6 border-t-2 border-orange-200" />
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-orange-300 pl-4 italic text-gray-700 my-4">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {recipe}
              </ReactMarkdown>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mt-6">
          <Link
            href="/dashboard"
            className="text-purple-700 hover:text-purple-900 hover:underline font-medium"
          >
            ← Back to Dashboard
          </Link>

          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push("/login");
            }}
            className="text-red-600 hover:text-red-800 hover:underline font-medium text-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
