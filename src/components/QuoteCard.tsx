type Quote = {
  text: string;
  author: string;
};

interface QuoteCardProps {
  quote: Quote;
}

export function QuoteCard({ quote }: QuoteCardProps) {
  return (
    <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md text-white border border-white/30 shadow-[inset_2px_2px_5px_rgba(255,255,255,0.2),inset_-2px_-2px_5px_rgba(0,0,0,0.2),0_4px_20px_rgba(0,0,0,0.2)]">
      <p className="text-lg font-semibold italic">“{quote.text}”</p>
      <p className="mt-2 text-right text-sm font-light">— {quote.author}</p>
    </div>
  );
}
