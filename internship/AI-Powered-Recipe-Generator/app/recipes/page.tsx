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
        fetchPreviousRecipes(data.user.email);
      } else {
        router.push("/login");
      }
      setUserLoading(false);
    };
    getUser();
  }, [router]);

  const fetchPreviousRecipes = async (userEmail) => {
    if (!userEmail) {
      console.log("❌ No userEmail provided");
      return;
    }

    setLoadingRecipes(true);
    try {
      console.log("🔍 Fetching recipes for:", userEmail);
      const res = await fetch(
        `/api/recipes?userEmail=${encodeURIComponent(userEmail)}`
      );

      console.log("📡 Response status:", res.status);

      if (res.ok) {
        const data = await res.json();
        console.log("📦 API Response:", data);

        // Handle the response structure from your API
        if (data.success && data.recipes) {
          console.log(`✅ Found ${data.recipes.length} recipes`);
          setPreviousRecipes(data.recipes);
        } else {
          console.log("⚠️ No recipes in response or API error:", data.error);
          setPreviousRecipes([]);
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error("❌ API Error:", res.status, res.statusText, errorData);
        setPreviousRecipes([]);
      }
    } catch (error) {
      console.error("❌ Network Error fetching recipes:", error);
      setPreviousRecipes([]);
    } finally {
      setLoadingRecipes(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setSelectedRecipe(null);
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

      if (data.saved) {
        console.log("✅ Recipe saved to database for user:", user?.email);
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
        setPrompt(data.recipe.prompt);
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
        fetchPreviousRecipes(user?.email);

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

  const Sparkles = () => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true);
    }, []);

    if (!mounted) {
      return null; // Don't render on server
    }

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

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Sparkles />
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-xl text-gray-200 animate-pulse">
            Loading your culinary journey...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <Sparkles />

      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col items-center px-4 py-16 sm:py-24">
        {/* Recipe Generator Main Card */}
        <div className="bg-white/10 backdrop-blur-xl shadow-2xl rounded-3xl px-6 py-10 sm:px-10 sm:py-12 max-w-5xl w-full border border-white/20 relative overflow-hidden mb-16">
          {/* Glowing border effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 via-pink-400/20 to-blue-400/20 rounded-3xl blur-xl"></div>

          <div className="relative z-10">
            <h1 className="text-4xl sm:text-5xl font-bold text-center bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-6 drop-shadow-lg">
              ✨ AI Recipe Generator ✨
            </h1>

            <p className="text-center text-gray-200 mb-8 text-lg sm:text-xl">
              Welcome,{" "}
              <span className="font-semibold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                {user?.email}
              </span>
            </p>

            {/* Input Section */}
            <div className="relative mb-8">
              <input
                type="text"
                placeholder="✨ What culinary magic shall we create today?"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full p-4 sm:p-6 bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 text-lg"
                onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl blur-lg -z-10"></div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white py-4 sm:py-5 rounded-2xl font-bold text-lg sm:text-xl hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mb-8 relative overflow-hidden group shadow-lg"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/30 to-pink-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10">
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-white mr-3"></div>
                    Crafting your recipe...
                  </span>
                ) : (
                  "🪄 Generate Amazing Recipe"
                )}
              </span>
            </button>

            {/* Previous Recipes Section */}
            {previousRecipes.length > 0 && (
              <div className="mb-8 bg-white/5 backdrop-blur-lg p-6 sm:p-8 rounded-2xl border border-white/20 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl"></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center">
                      📚 Your Recipe Collection ({previousRecipes.length})
                    </h3>
                    <button
                      onClick={() =>
                        setShowPreviousRecipes(!showPreviousRecipes)
                      }
                      className="text-sm text-purple-300 hover:text-purple-100 hover:bg-purple-500/20 px-4 py-2 rounded-lg font-medium transition-all duration-200"
                    >
                      {showPreviousRecipes ? "Hide" : "Show"}
                    </button>
                  </div>

                  {showPreviousRecipes && (
                    <div className="space-y-4 max-h-80 overflow-y-auto custom-scrollbar">
                      {loadingRecipes ? (
                        <p className="text-white text-center py-8 font-medium text-lg">
                          Loading your recipes...
                        </p>
                      ) : (
                        previousRecipes.map((recipe) => (
                          <div
                            key={recipe._id}
                            className="flex justify-between items-center p-5 sm:p-6 bg-slate-800/70 backdrop-blur-md rounded-xl border border-slate-600/50 hover:border-purple-400/70 hover:bg-slate-700/80 transition-all duration-300 group shadow-lg"
                          >
                            <div className="flex-1">
                              <h4 className="font-bold text-white text-lg group-hover:text-purple-200 transition-colors duration-200">
                                {recipe.recipeName}
                              </h4>
                              <p className="text-base text-gray-300 group-hover:text-gray-100 mt-2 font-medium">
                                {formatDate(recipe.createdAt)}{" "}
                                {recipe.source !== "n8n-gemini" && (
                                  <span className="ml-2 px-3 py-1 bg-yellow-500/40 text-yellow-100 rounded-full text-sm border border-yellow-400/60 font-semibold">
                                    {recipe.source}
                                  </span>
                                )}
                              </p>
                            </div>
                            <div className="flex space-x-3">
                              <button
                                onClick={() => handleViewRecipe(recipe._id)}
                                className="px-5 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm rounded-lg hover:from-purple-500 hover:to-blue-500 hover:shadow-lg hover:shadow-purple-400/40 transition-all duration-200 font-bold"
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
                                className="px-5 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white text-sm rounded-lg hover:from-red-500 hover:to-pink-500 hover:shadow-lg hover:shadow-red-400/40 transition-all duration-200 font-bold"
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
              <div className="bg-white/5 backdrop-blur-lg p-6 sm:p-8 rounded-2xl border border-white/20 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-600/10 via-yellow-600/10 to-red-600/10 rounded-2xl"></div>
                <div className="relative z-10">
                  {selectedRecipe ? (
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
                      <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
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
                          className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-200 shadow-lg font-medium"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRecipe(null);
                            setRecipe("");
                            setPrompt("");
                          }}
                          className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all duration-200 font-medium"
                        >
                          ✕ Close
                        </button>
                      </div>
                    </div>
                  ) : (
                    <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent mb-6">
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
          </div>
        </div>

        {/* Informational Sections */}
        <section className="relative z-10 max-w-5xl w-full px-4 text-center text-gray-100 space-y-16">
          {/* How It Works Section */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 sm:p-12 border border-white/20 shadow-xl">
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-8">
              🧙‍♂️ How Our AI Recipe Magic Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white/5 p-6 sm:p-8 rounded-xl border border-white/10">
                <div className="text-5xl mb-6">1️⃣</div>
                <h3 className="text-xl font-bold text-white mb-4">
                  Describe Your Ingredients
                </h3>
                <p className="text-gray-200 leading-relaxed">
                  Tell us what you have in your pantry or fridge. Our AI
                  understands natural language - no special formatting needed!
                </p>
              </div>
              <div className="bg-white/5 p-6 sm:p-8 rounded-xl border border-white/10">
                <div className="text-5xl mb-6">2️⃣</div>
                <h3 className="text-xl font-bold text-white mb-4">
                  AI Culinary Alchemy
                </h3>
                <p className="text-gray-200 leading-relaxed">
                  Our advanced algorithms analyze thousands of recipes to create
                  something perfectly tailored to your ingredients.
                </p>
              </div>
              <div className="bg-white/5 p-6 sm:p-8 rounded-xl border border-white/10">
                <div className="text-5xl mb-6">3️⃣</div>
                <h3 className="text-xl font-bold text-white mb-4">
                  Enjoy Your Creation
                </h3>
                <p className="text-gray-200 leading-relaxed">
                  Get step-by-step instructions, cooking tips, and even
                  substitution suggestions for missing ingredients.
                </p>
              </div>
            </div>
          </div>

          {/* Recipe Ideas Section */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 sm:p-12 border border-white/20 shadow-xl">
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent mb-8">
              🍳 Inspiration For Your Next Meal
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Recipe category cards with better spacing */}
              <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 p-6 sm:p-8 rounded-xl border border-white/10">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <span className="mr-3">🌱</span> Vegetarian Delights
                </h3>
                <ul className="text-gray-200 space-y-3 text-left">
                  <li className="flex items-start">
                    <span className="text-emerald-400 mr-3 mt-1">•</span>
                    "Chickpea and spinach curry with coconut milk"
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-400 mr-3 mt-1">•</span>
                    "Roasted vegetable quinoa bowl with tahini dressing"
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-400 mr-3 mt-1">•</span>
                    "Mushroom and lentil shepherd's pie"
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-red-500/20 to-pink-500/20 p-6 sm:p-8 rounded-xl border border-white/10">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <span className="mr-3">🍗</span> Protein-Packed Meals
                </h3>
                <ul className="text-gray-200 space-y-3 text-left">
                  <li className="flex items-start">
                    <span className="text-orange-400 mr-3 mt-1">•</span>
                    "Honey garlic chicken with roasted sweet potatoes"
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-400 mr-3 mt-1">•</span>
                    "Asian-inspired salmon with sesame green beans"
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-400 mr-3 mt-1">•</span>
                    "Beef and broccoli stir-fry with jasmine rice"
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-green-500/20 to-teal-500/20 p-6 sm:p-8 rounded-xl border border-white/10">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <span className="mr-3">⏱️</span> Quick & Easy
                </h3>
                <ul className="text-gray-200 space-y-3 text-left">
                  <li className="flex items-start">
                    <span className="text-teal-400 mr-3 mt-1">•</span>
                    "15-minute garlic shrimp pasta"
                  </li>
                  <li className="flex items-start">
                    <span className="text-teal-400 mr-3 mt-1">•</span>
                    "One-pan chicken fajita bowl"
                  </li>
                  <li className="flex items-start">
                    <span className="text-teal-400 mr-3 mt-1">•</span>
                    "Avocado toast with poached eggs and chili flakes"
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-yellow-500/20 to-amber-500/20 p-6 sm:p-8 rounded-xl border border-white/10">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <span className="mr-3">🍰</span> Sweet Treats
                </h3>
                <ul className="text-gray-200 space-y-3 text-left">
                  <li className="flex items-start">
                    <span className="text-yellow-400 mr-3 mt-1">•</span>
                    "3-ingredient banana oat cookies"
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-400 mr-3 mt-1">•</span>
                    "Microwave chocolate mug cake"
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-400 mr-3 mt-1">•</span>
                    "Berry yogurt parfait with granola"
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 sm:p-12 border border-white/20 shadow-xl">
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-8">
              ✨ Why You'll Love Cooking With AI
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex items-start space-x-4 text-left">
                <div className="text-3xl flex-shrink-0">🍎</div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    Reduce Food Waste
                  </h3>
                  <p className="text-gray-200 leading-relaxed">
                    Use up ingredients before they go bad. Our AI helps you
                    create delicious meals from what you already have.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4 text-left">
                <div className="text-3xl flex-shrink-0">⏱️</div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    Save Time
                  </h3>
                  <p className="text-gray-200 leading-relaxed">
                    No more endless scrolling through recipes. Get personalized
                    suggestions instantly.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4 text-left">
                <div className="text-3xl flex-shrink-0">🌍</div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    Global Flavors
                  </h3>
                  <p className="text-gray-200 leading-relaxed">
                    Discover authentic dishes from around the world, adapted to
                    your available ingredients.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4 text-left">
                <div className="text-3xl flex-shrink-0">👨‍🍳</div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    Skill Building
                  </h3>
                  <p className="text-gray-200 leading-relaxed">
                    Learn new techniques and flavor combinations with each
                    generated recipe.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4 text-left">
                <div className="text-3xl flex-shrink-0">💰</div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    Budget Friendly
                  </h3>
                  <p className="text-gray-200 leading-relaxed">
                    Cook amazing meals without expensive specialty ingredients.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4 text-left">
                <div className="text-3xl flex-shrink-0">❤️</div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    Dietary Needs
                  </h3>
                  <p className="text-gray-200 leading-relaxed">
                    Easily adapt recipes for gluten-free, vegan, low-carb, or
                    other dietary preferences.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer Navigation */}
        <div className="w-full max-w-5xl flex flex-col sm:flex-row sm:justify-between items-center mt-16 mb-12 space-y-4 sm:space-y-0 px-4">
          <Link
            href="/"
            className="text-purple-300 hover:text-purple-100 hover:bg-purple-500/20 px-6 py-3 rounded-lg hover:underline font-medium transition-all duration-200 flex items-center"
          >
            ← Back to Home
          </Link>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push("/login");
            }}
            className="text-red-400 hover:text-red-200 hover:bg-red-500/20 px-6 py-3 rounded-lg hover:underline font-medium transition-all duration-200"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Global Styles */}
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
