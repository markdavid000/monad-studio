interface RotatingWordProps {
  word: string;
  shouldAnimate: boolean;
}

export function RotatingWord({ word, shouldAnimate }: RotatingWordProps) {
  return (
    <span key={word} className="inline-flex [perspective:40rem]">
      {Array.from(word).map((char, index) => (
        <span
          key={`${word}-${index}`}
          data-char
          className="inline-block origin-bottom"
          style={
            shouldAnimate
              ? { animation: `char-in 0.7s cubic-bezier(0.2, 0.7, 0.2, 1) ${index * 40}ms both` }
              : undefined
          }
        >
          {char}
        </span>
      ))}
    </span>
  );
}
