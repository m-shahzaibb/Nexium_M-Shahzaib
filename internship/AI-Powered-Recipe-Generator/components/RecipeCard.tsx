ship / AI - Powered - Recipe - Generator / components / RecipeCard.tsx;
interface RecipeCardProps {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
}

export default function RecipeCard({
  title,
  description,
  ingredients,
  instructions,
}: RecipeCardProps) {
  return (
    <div className="bg-white/90 backdrop-blur-md p-6 rounded-xl shadow-lg border border-purple-200">
      <h3 className="text-xl font-bold text-purple-700 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>

      <div className="mb-4">
        <h4 className="font-semibold text-gray-800 mb-2">Ingredients:</h4>
        <ul className="list-disc list-inside text-sm text-gray-600">
          {ingredients.map((ingredient, index) => (
            <li key={index}>{ingredient}</li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="font-semibold text-gray-800 mb-2">Instructions:</h4>
        <ol className="list-decimal list-inside text-sm text-gray-600">
          {instructions.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}
