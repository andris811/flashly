import BookmarkAddIcon from "@mui/icons-material/BookmarkAdd";
import DeleteIcon from "@mui/icons-material/Delete";

type QuestionType =
  | {
      simplified: string;
      traditional?: string;
      pinyin?: string;
    }
  | string;

type FlashcardProps = {
  question: QuestionType;
  answer: string;
  showPinyin: boolean;
  showTraditional: boolean;
  onSaveToList?: (card: { question: QuestionType; answer: string }) => void;
  flipped: boolean;
  setFlipped: React.Dispatch<React.SetStateAction<boolean>>;
  onDeleteCard?: () => void;
  isDeletable?: boolean;
};

const Flashcard = ({
  question,
  answer,
  showPinyin,
  showTraditional,
  onSaveToList,
  flipped,
  setFlipped,
  onDeleteCard,
  isDeletable,
}: FlashcardProps) => {
  const isStringFront = typeof question === "string";

  const handleFlip = () => {
    setFlipped((prev) => !prev);
  };

  return (
    <div className="flex-grow flex items-center justify-center py-8 sm:py-12 transition-all">
      <div className="w-[90%] max-w-md h-64 sm:h-72 xl:h-80 perspective">
        <div
          className={`relative w-full h-full transition-transform duration-700 ease-in-out transform-style-preserve-3d ${
            flipped ? "rotate-y-180" : ""
          } cursor-pointer`}
          onClick={handleFlip}
        >
          {/* Front */}
          <div className="absolute w-full h-full p-6 sm:p-8 text-center bg-white/70 backdrop-blur-md border border-gray-300 shadow-2xl hover:scale-[1.03] transition-transform rounded-2xl flex flex-col items-center justify-center backface-hidden">
            {onSaveToList && (
              <button
                className="absolute top-3 right-3 text-blue-600 hover:text-blue-800"
                onClick={(e) => {
                  e.stopPropagation();
                  onSaveToList({ question, answer });
                }}
                aria-label="Save to deck"
              >
                <BookmarkAddIcon fontSize="medium" />
              </button>
            )}

            {isDeletable && onDeleteCard && (
              <button
                className="absolute bottom-3 right-3 text-red-600 hover:text-red-800"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteCard();
                }}
                aria-label="Delete card"
              >
                <DeleteIcon fontSize="medium" />
              </button>
            )}

            {isStringFront ? (
              <div className="text-lg sm:text-xl xl:text-2xl font-medium text-gray-900">
                {question}
              </div>
            ) : (
              <>
                <div className="text-2xl sm:text-4xl xl:text-5xl font-extrabold text-gray-800 mb-1">
                  {question.simplified}
                </div>
                {showTraditional && question.traditional && (
                  <div className="text-base sm:text-lg text-gray-500">
                    {question.traditional}
                  </div>
                )}
                {showPinyin && question.pinyin && (
                  <div className="text-base sm:text-lg text-blue-600 mt-1">
                    {question.pinyin}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Back */}
          <div className="absolute w-full h-full p-6 sm:p-8 text-center bg-gradient-to-br from-indigo-100 to-blue-100 text-gray-900 border border-gray-300 shadow-2xl hover:scale-[1.03] transition-transform rounded-2xl flex items-center justify-center rotate-y-180 backface-hidden">
            <div className="text-lg sm:text-xl xl:text-2xl font-semibold leading-snug">
              {answer}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;
