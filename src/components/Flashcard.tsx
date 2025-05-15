import { useState } from "react";

type FlashcardProps = {
  question:
    | {
        simplified: string;
        traditional?: string;
        pinyin?: string;
      }
    | string;
  answer: string;
  showPinyin: boolean;
  showTraditional: boolean;
};

const Flashcard = ({ question, answer, showPinyin, showTraditional }: FlashcardProps) => {
  const [flipped, setFlipped] = useState(false);
  const handleFlip = () => setFlipped(!flipped);

  const isStringFront = typeof question === "string";

  return (
    <div
      className="w-full max-w-xs sm:max-w-sm h-48 perspective mx-auto"
      onClick={handleFlip}
    >
      <div
        className={`relative w-full h-full duration-700 transform-style-preserve-3d transition-transform ${
          flipped ? "rotate-y-180" : ""
        }`}
      >
        {/* Front */}
        <div className="absolute w-full h-full bg-white text-black border border-gray-300 shadow-xl rounded-lg flex flex-col items-center justify-center text-xl sm:text-2xl font-semibold backface-hidden p-4 text-center">
          {isStringFront ? (
            <div className="text-base sm:text-lg">{question}</div>
          ) : (
            <>
              <div>{question.simplified}</div>
              {showTraditional && question.traditional && (
                <div className="text-sm sm:text-base text-gray-500 mt-1">
                  {question.traditional}
                </div>
              )}
              {showPinyin && question.pinyin && (
                <div className="text-sm sm:text-base text-blue-500 mt-1">
                  {question.pinyin}
                </div>
              )}
            </>
          )}
        </div>

        {/* Back */}
        <div className="absolute w-full h-full bg-indigo-100 text-gray-800 border border-gray-300 shadow-xl rounded-lg flex items-center justify-center text-base sm:text-lg font-medium rotate-y-180 backface-hidden p-4 text-center">
          {answer}
        </div>
      </div>
    </div>
  );
};

export default Flashcard;
