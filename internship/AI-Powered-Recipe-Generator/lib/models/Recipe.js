import mongoose from "mongoose";

const recipeSchema = new mongoose.Schema(
  {
    recipeName: {
      type: String,
      required: true,
      trim: true,
    },
    prompt: {
      type: String,
      required: true,
      trim: true,
    },
    recipeContent: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: false,
      trim: true,
    },
    userEmail: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    source: {
      type: String,
      enum: ["n8n-gemini", "fallback", "error-fallback"],
      default: "n8n-gemini",
    },
    success: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance
recipeSchema.index({ userEmail: 1, createdAt: -1 });
recipeSchema.index({ recipeName: "text", prompt: "text" });

export default mongoose.models.Recipe || mongoose.model("Recipe", recipeSchema);
