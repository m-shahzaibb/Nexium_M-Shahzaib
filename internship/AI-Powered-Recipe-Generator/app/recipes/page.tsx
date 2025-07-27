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

  const handleDeleteRecipe = async (recipeId, recipeName) => {
    if (!confirm(`Are you sure you want to delete "${recipeName}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/recipes/${recipeId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        console.log("✅ Recipe deleted successfully");
        // Refresh the previous recipes list
        fetchPreviousRecipes(user?.email);

        // Clear selected recipe if it was the one deleted
        if (selectedRecipe && selectedRecipe._id === recipeId) {
          setSelectedRecipe(null);
          setRecipe("");
          setPrompt("");
        }
      } else {
        throw new Error("Failed to delete recipe");
      }
    } catch (error) {
      console.error("Error deleting recipe:", error);
      alert("Failed to delete recipe. Please try again.");
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

  // Sparkle component for animation
  const Sparkles = () => {
    const sparkles = Array.from({ length: 50 }, (_, i) => (
      <div
        key={i}
        className="absolute animate-pulse opacity-70"
        style={{
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 3}s`,
          animationDuration: `${2 + Math.random() * 3}s`,
        }}
      >
        <div
          className="w-1 h-1 bg-gradient-to-r from-yellow-400 to-pink-400 rounded-full animate-bounce"
          style={{
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${1 + Math.random() * 2}s`,
          }}
        />
      </div>
    ));

    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {sparkles}
        {Array.from({ length: 30 }, (_, i) => (
          <div
            key={`fall-${i}`}
            className="absolute w-2 h-2 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 rounded-full animate-fall opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-10px`,
              animationDuration: `${3 + Math.random() * 4}s`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>
    );
  };

  // Show loading while checking authentication
  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Sparkles />
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-xl text-gray-300 animate-pulse">
            Loading your culinary journey...
          </p>
        </div>
      </div>
    );
  }

  return (
    // CHANGE 1: Outer container is now relative, not fixing height or overflow.
    <div className="relative">
      {/* CHANGE 2: Fixed background gradient covering the entire viewport. */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 -z-10" />

      {/* Sparkles component is fixed over the background */}
      <Sparkles />

      {/* CHANGE 3: Main content wrapper. Removed min-h-screen.
          This div will now expand naturally with content, and the browser will handle scrolling.
          It retains flex centering for content within the viewport initially.
      */}
      <div className="relative z-10 flex flex-col items-center px-4 py-8">
        <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-5xl border border-white/20 relative overflow-hidden">
          {/* Glowing border effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 via-pink-400/20 to-blue-400/20 rounded-3xl blur-xl"></div>

          <div className="relative z-10">
            <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-3">
              ✨ AI Recipe Generator ✨
            </h1>

            <p className="text-center text-gray-300 mb-8 text-lg">
              Welcome,{" "}
              <span className="font-semibold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                {user?.email}
              </span>
            </p>

            {/* Input Section */}
            <div className="relative mb-6">
              <input
                type="text"
                placeholder="✨ What culinary magic shall we create today?"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full p-4 bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 text-lg"
                onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl blur-lg -z-10"></div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mb-8 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/30 to-pink-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10">
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-white mr-3"></div>
                    Crafting your recipe...
                  </span>
                ) : (
                  "Generate Amazing Recipe"
                )}
              </span>
            </button>

            {/* Previous Recipes Section */}
            {previousRecipes.length > 0 && (
              <div className="mb-8 bg-white/5 backdrop-blur-lg p-6 rounded-2xl border border-white/20 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl"></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white flex items-center">
                      📚 Your Recipe Collection ({previousRecipes.length})
                    </h3>
                    {/* Update the Show/Hide button */}
                    <button
                      onClick={() =>
                        setShowPreviousRecipes(!showPreviousRecipes)
                      }
                      className="text-sm text-purple-300 hover:text-purple-100 hover:bg-purple-500/20 px-3 py-1 rounded-lg font-medium transition-all duration-200"
                    >
                      {showPreviousRecipes ? "Hide" : "Show"}
                    </button>
                  </div>

                  {showPreviousRecipes && (
                    <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                      {loadingRecipes ? (
                        <p className="text-gray-300 text-center py-4">
                          Loading your recipes...
                        </p>
                      ) : (
                        previousRecipes.map((recipe) => (
                          <div
                            key={recipe._id}
                            className="flex justify-between items-center p-4 bg-white/15 backdrop-blur-md rounded-xl border border-white/30 hover:border-purple-400/60 hover:bg-white/20 transition-all duration-300 group"
                          >
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-100 text-base group-hover:text-white transition-colors duration-200">
                                {recipe.recipeName}
                              </h4>
                              <p className="text-sm text-gray-300 group-hover:text-gray-200 mt-1">
                                {formatDate(recipe.createdAt)}{" "}
                                {recipe.source !== "n8n-gemini" && (
                                  <span className="ml-2 px-2 py-1 bg-yellow-500/30 text-yellow-200 rounded-full text-xs border border-yellow-400/40">
                                    {recipe.source}
                                  </span>
                                )}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleViewRecipe(recipe._id)}
                                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs rounded-lg hover:from-purple-400 hover:to-blue-400 hover:shadow-lg hover:shadow-purple-400/30 transition-all duration-200 font-medium"
                              >
                                View
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteRecipe(
                                    recipe._id,
                                    recipe.recipeName
                                  )
                                }
                                className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-lg hover:from-red-400 hover:to-pink-400 hover:shadow-lg hover:shadow-red-400/30 transition-all duration-200 font-medium"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Recipe Display Section */}
            {recipe && (
              <div className="bg-white/5 backdrop-blur-lg p-6 rounded-2xl border border-white/20 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-600/10 via-yellow-600/10 to-red-600/10 rounded-2xl"></div>
                <div className="relative z-10">
                  {selectedRecipe ? (
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
                        🍽️ Saved Recipe
                      </h3>
                      <div className="flex space-x-3">
                        <button
                          onClick={() =>
                            handleDeleteRecipe(
                              selectedRecipe._id,
                              selectedRecipe.recipeName
                            )
                          }
                          className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-200 shadow-lg"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRecipe(null);
                            setRecipe("");
                            setPrompt("");
                          }}
                          className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all duration-200"
                        >
                          ✕ Close
                        </button>
                      </div>
                    </div>
                  ) : (
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent mb-6">
                      🍽️ Fresh Recipe
                    </h3>
                  )}

                  <div className="prose prose-invert max-w-none max-h-96 overflow-y-auto custom-scrollbar">
                    <ReactMarkdown
                      components={{
                        h1: ({ children }) => (
                          <h1 className="text-3xl font-bold text-white mt-6 mb-4 border-b-2 border-orange-400/50 pb-2">
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-2xl font-bold text-purple-300 mt-6 mb-3 flex items-center">
                            <span className="mr-2">🔸</span>
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-xl font-bold text-blue-300 mt-5 mb-3 flex items-center">
                            <span className="mr-2">📋</span>
                            {children}
                          </h3>
                        ),
                        h4: ({ children }) => (
                          <h4 className="text-lg font-bold text-yellow-300 mt-4 mb-2 border-l-4 border-orange-400 pl-3">
                            {children}
                          </h4>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-bold text-orange-300 bg-orange-400/20 px-1 rounded">
                            {children}
                          </strong>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-none mb-4 space-y-2">
                            {children}
                          </ul>
                        ),
                        li: ({ children }) => (
                          <li className="mb-2 flex items-start text-gray-200">
                            <span className="text-orange-400 mr-3 mt-1 text-lg">
                              •
                            </span>
                            <span>{children}</span>
                          </li>
                        ),
                        p: ({ children }) => (
                          <p className="mb-4 leading-relaxed text-gray-200 text-base">
                            {children}
                          </p>
                        ),
                        hr: () => (
                          <hr className="my-8 border-t-2 border-orange-400/30" />
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-purple-400 pl-4 italic text-purple-200 my-6 bg-purple-400/10 p-4 rounded-r-lg">
                            {children}
                          </blockquote>
                        ),
                      }}
                    >
                      {recipe}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8">
              <Link
                href="/"
                className="text-purple-300 hover:text-purple-100 hover:bg-purple-500/20 px-3 py-2 rounded-lg hover:underline font-medium transition-all duration-200 flex items-center"
              >
                ← Back to Home
              </Link>

              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.push("/login");
                }}
                className="text-red-400 hover:text-red-200 hover:bg-red-500/20 px-3 py-2 rounded-lg hover:underline font-medium transition-all duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for scrollbar - (Moved from Sparkles component as it's global) */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(147, 51, 234, 0.6);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(147, 51, 234, 0.8);
        }

        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
          }
        }
        .animate-fall {
          animation: fall linear infinite;
        }
      `}</style>
    </div>
  );
}
