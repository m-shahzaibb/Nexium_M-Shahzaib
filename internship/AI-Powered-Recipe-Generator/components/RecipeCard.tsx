interface RecipeCardProps {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  onDelete?: () => void;
}

export default function RecipeCard({
  title,
  description,
  ingredients,
  instructions,
  onDelete,
}: RecipeCardProps) {
  return (
    <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/20 relative overflow-hidden group hover:bg-white/15 transition-all duration-300">
      {/* Glowing border effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 via-pink-400/10 to-blue-400/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
            {title}
          </h3>
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-all duration-200 border border-red-400/30"
            >
              🗑️
            </button>
          )}
        </div>

        <p className="text-gray-300 mb-4 leading-relaxed">{description}</p>

        <div className="mb-4">
          <h4 className="font-semibold text-purple-300 mb-2 flex items-center">
            <span className="mr-2">🥘</span>
            Ingredients:
          </h4>
          <ul className="space-y-1">
            {ingredients.map((ingredient, index) => (
              <li
                key={index}
                className="text-sm text-gray-300 flex items-start"
              >
                <span className="text-orange-400 mr-2 mt-1">•</span>
                {ingredient}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-blue-300 mb-2 flex items-center">
            <span className="mr-2">📋</span>
            Instructions:
          </h4>
          <ol className="space-y-2">
            {instructions.map((step, index) => (
              <li
                key={index}
                className="text-sm text-gray-300 flex items-start"
              >
                <span className="text-yellow-400 mr-2 mt-1 font-bold">
                  {index + 1}.
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
