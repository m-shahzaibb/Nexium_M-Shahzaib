import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Recipe from '../../../../lib/models/Recipe';
import mongoose from 'mongoose';

// Fix: Define proper interface for params
interface RouteParams {
  params: Promise<{ id: string }>;
}

// Define the recipe type for lean queries
interface LeanRecipeType {
  _id: mongoose.Types.ObjectId;
  recipeName?: string;
  prompt?: string;
  recipeContent?: string;
  createdAt?: Date;
  source?: string;
  success?: boolean;
  userEmail?: string;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Fix: Await the params since they're now a Promise
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid recipe ID' },
        { status: 400 }
      );
    }

    await connectDB();

    const recipe = await Recipe.findById(id).lean() as LeanRecipeType | null;

    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }

    // Serialize the recipe for JSON response
    const serializedRecipe = {
      _id: recipe._id.toString(),
      recipeName: recipe.recipeName || 'Untitled Recipe',
      prompt: recipe.prompt || '',
      recipeContent: recipe.recipeContent || '',
      createdAt: recipe.createdAt,
      source: recipe.source,
      success: recipe.success || true,
      userEmail: recipe.userEmail
    };

    return NextResponse.json({
      success: true,
      recipe: serializedRecipe
    });

  } catch (error) {
    console.error("Error fetching recipe:", error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch recipe',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Fix: Await the params since they're now a Promise
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid recipe ID' },
        { status: 400 }
      );
    }

    await connectDB();

    const deletedRecipe = await Recipe.findByIdAndDelete(id) as LeanRecipeType | null;

    if (!deletedRecipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }

    // Serialize the deleted recipe for JSON response
    const serializedDeletedRecipe = {
      _id: deletedRecipe._id.toString(),
      recipeName: deletedRecipe.recipeName || 'Untitled Recipe',
      prompt: deletedRecipe.prompt || '',
      recipeContent: deletedRecipe.recipeContent || '',
      createdAt: deletedRecipe.createdAt,
      source: deletedRecipe.source,
      success: deletedRecipe.success || true,
      userEmail: deletedRecipe.userEmail
    };

    return NextResponse.json({
      success: true,
      message: 'Recipe deleted successfully',
      deletedRecipe: serializedDeletedRecipe
    });

  } catch (error) {
    console.error("Error deleting recipe:", error);
    return NextResponse.json(
      { 
        error: 'Failed to delete recipe',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}