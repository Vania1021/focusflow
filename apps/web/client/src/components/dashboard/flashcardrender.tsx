interface Flashcard {
  question: string;
  answer: string;
}

export const FlashcardsRenderer = ({ data }: { data: any }) => {
  if (!data || !Array.isArray(data.cards)) {
    return (
      <div className="text-sm text-muted-foreground italic">
        No flashcards available.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-serif text-xl font-bold">Flashcards</h3>

      <div className="grid gap-4">
        {data.cards.map((card: Flashcard, index: number) => (
          <div
            key={index}
            className="p-4 rounded-xl border bg-background shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
              Card {index + 1}
            </div>

            <div className="mb-3">
              <p className="text-sm font-semibold text-primary">
                Q. {card.question}
              </p>
            </div>

            <div className="pt-2 border-t">
              <p className="text-sm text-foreground">
                <span className="font-semibold">A.</span> {card.answer}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};