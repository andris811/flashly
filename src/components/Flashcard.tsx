// import BookmarkAddIcon from "@mui/icons-material/BookmarkAdd";
// import DeleteIcon from "@mui/icons-material/Delete";

// type HSKCardFront = {
//   simplified: string;
//   traditional?: string;
//   pinyin?: string;
// };

// type QuestionType = HSKCardFront | string | string[];

// type FlashcardProps = {
//   question: QuestionType;
//   answer: string | string[];
//   showPinyin: boolean;
//   showTraditional: boolean;
//   size?: "normal" | "large";
//   onSaveToList?: (card: {
//     question: QuestionType;
//     answer: string | string[];
//   }) => void;
//   flipped: boolean;
//   setFlipped: React.Dispatch<React.SetStateAction<boolean>>;
//   onDeleteCard?: () => void;
//   isDeletable?: boolean;
// };

// const isHSKCard = (q: QuestionType): q is HSKCardFront =>
//   typeof q === "object" && q !== null && "simplified" in q;

// const renderLines = (
//   content: string | string[] | undefined,
//   fontSize = "text-base sm:text-lg xl:text-xl"
// ) => {
//   const text = Array.isArray(content)
//     ? content.join(" | ")
//     : typeof content === "string"
//     ? content
//     : "";

//   const lines = text.split(" | ");

//   return lines.slice(0, 3).map((line, i) => (
//     <div
//       key={i}
//       className={`${fontSize} ${i === 0 ? "font-semibold" : "text-gray-600"}`}
//     >
//       {line}
//     </div>
//   ));
// };

// const Flashcard = ({
//   question,
//   answer,
//   showPinyin,
//   showTraditional,
//   onSaveToList,
//   flipped,
//   setFlipped,
//   onDeleteCard,
//   isDeletable,
// }: FlashcardProps) => {
//   const handleFlip = () => {
//     setFlipped((prev) => !prev);
//   };

//   return (
//     <div className="flex-grow flex items-center justify-center py-8 sm:py-12 transition-all">
//       <div className="w-[90%] max-w-md h-64 sm:h-72 xl:h-80 perspective">
//         <div
//           className={`relative w-full h-full transition-transform duration-700 ease-in-out transform-style-preserve-3d ${
//             flipped ? "rotate-y-180" : ""
//           } cursor-pointer`}
//           onClick={handleFlip}
//         >
//           {/* Front */}
//           <div className="absolute w-full h-full p-6 sm:p-8 text-center bg-white/70 backdrop-blur-md border border-gray-300 shadow-2xl hover:scale-[1.03] transition-transform rounded-2xl flex flex-col items-center justify-center backface-hidden">
//             {onSaveToList && (
//               <button
//                 className="absolute top-3 right-3 text-gray-600 hover:text-gray-800"
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   onSaveToList({ question, answer });
//                 }}
//                 aria-label="Save to deck"
//               >
//                 <BookmarkAddIcon fontSize="medium" />
//               </button>
//             )}

//             {isDeletable && onDeleteCard && (
//               <button
//                 className="absolute bottom-3 right-3 text-red-600 hover:text-red-800"
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   onDeleteCard();
//                 }}
//                 aria-label="Delete card"
//               >
//                 <DeleteIcon fontSize="medium" />
//               </button>
//             )}

//             {isHSKCard(question) ? (
//               <>
//                 <div className="text-6xl sm:text-7xl xl:text-8xl font-bold text-gray-800 mb-1">
//                   {question.simplified}
//                 </div>
//                 {showTraditional && question.traditional && (
//                   <div className="text-base sm:text-lg text-gray-500">
//                     {question.traditional}
//                   </div>
//                 )}
//                 {showPinyin && question.pinyin && (
//                   <div className="text-base sm:text-lg text-gray-600 mt-1">
//                     {question.pinyin}
//                   </div>
//                 )}
//               </>
//             ) : (
//               <div className="flex flex-col items-center gap-1 text-gray-900">
//                 {renderLines(question)}
//               </div>
//             )}
//           </div>

//           {/* Back */}
//           <div className="absolute w-full h-full p-6 sm:p-8 text-center bg-gradient-to-br from-indigo-100 to-blue-100 text-gray-900 border border-gray-300 shadow-2xl hover:scale-[1.03] transition-transform rounded-2xl flex items-center justify-center rotate-y-180 backface-hidden">
//             <div className="flex flex-col items-center gap-1 text-gray-900">
//               {renderLines(answer)}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Flashcard;

import BookmarkAddIcon from "@mui/icons-material/BookmarkAdd";
import DeleteIcon from "@mui/icons-material/Delete";

type HSKCardFront = {
  simplified: string;
  traditional?: string;
  pinyin?: string;
};

type QuestionType = HSKCardFront | string | string[];

type FlashcardProps = {
  question: QuestionType;
  answer: string | string[];
  showPinyin: boolean;
  showTraditional: boolean;
  size?: "normal" | "large"; // NEW
  onSaveToList?: (card: { question: QuestionType; answer: string | string[] }) => void;
  flipped: boolean;
  setFlipped: React.Dispatch<React.SetStateAction<boolean>>;
  onDeleteCard?: () => void;
  isDeletable?: boolean;
};

const isHSKCard = (q: QuestionType): q is HSKCardFront =>
  typeof q === "object" && q !== null && "simplified" in q;

const renderLines = (
  content: string | string[] | undefined,
  fontSizeClass = "text-base sm:text-lg xl:text-xl"
) => {
  const text = Array.isArray(content)
    ? content.join(" | ")
    : typeof content === "string"
    ? content
    : "";

  const lines = text.split(" | ");
  return lines.slice(0, 3).map((line, i) => (
    <div
      key={i}
      className={`${fontSizeClass} ${i === 0 ? "font-semibold" : "text-gray-600"}`}
    >
      {line}
    </div>
  ));
};

const Flashcard = ({
  question,
  answer,
  showPinyin,
  showTraditional,
  size = "normal",          // NEW default
  onSaveToList,
  flipped,
  setFlipped,
  onDeleteCard,
  isDeletable,
}: FlashcardProps) => {
  const isLarge = size === "large";

  // Container sizing
  const frameClass = isLarge
    ? // Wide & tall on slideshow; cap width for ultra-wide screens
      "w-[92vw] md:w-[96vw] max-w-[1400px] h-[56vh] md:h-[64vh] lg:h-[70vh]"
    : // Your original small/normal card sizing
      "w-[90%] max-w-md h-64 sm:h-72 xl:h-80";

  // Card padding
  const padClass = isLarge ? "p-6 sm:p-10" : "p-6 sm:p-8";

  // Typography scales
  const simpStyle =
    isLarge
      ? { fontSize: "clamp(3.5rem, 10vw, 8rem)", lineHeight: 1.05 as number } // BIG but safe
      : undefined;
  const tradCls   = isLarge ? "text-lg sm:text-xl"  : "text-base sm:text-lg";
  const pinyinCls = isLarge ? "text-lg sm:text-xl"  : "text-base sm:text-lg";
  const backText  = isLarge ? "text-lg sm:text-xl xl:text-2xl" : "text-base sm:text-lg xl:text-xl";

  const handleFlip = () => setFlipped((prev) => !prev);

  return (
    <div className={`flex-grow flex items-center justify-center ${isLarge ? "py-4 sm:py-6" : "py-8 sm:py-12"} transition-all`}>
      <div className={`${frameClass} perspective`}>
        <div
          className={`relative w-full h-full transition-transform duration-700 ease-in-out transform-style-preserve-3d ${flipped ? "rotate-y-180" : ""} cursor-pointer`}
          onClick={handleFlip}
        >
          {/* Front */}
          <div
            className={`absolute w-full h-full ${padClass} text-center bg-white/70 backdrop-blur-md border border-gray-300 shadow-2xl hover:scale-[1.03] transition-transform rounded-2xl flex flex-col items-center justify-center backface-hidden`}
          >
            {onSaveToList && (
              <button
                className="absolute top-3 right-3 text-gray-600 hover:text-gray-800"
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

            {isHSKCard(question) ? (
              <>
                <div
                  className="font-bold text-gray-800 mb-1"
                  style={simpStyle ?? undefined}
                >
                  {/* For normal size, keep your original classes */}
                  {!isLarge && (
                    <span className="text-6xl sm:text-7xl xl:text-8xl">
                      {question.simplified}
                    </span>
                  )}
                  {isLarge && question.simplified}
                </div>

                {showTraditional && question.traditional && (
                  <div className={`${tradCls} text-gray-500`}>
                    {question.traditional}
                  </div>
                )}
                {showPinyin && question.pinyin && (
                  <div className={`${pinyinCls} text-gray-600 mt-1`}>
                    {question.pinyin}
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center gap-1 text-gray-900">
                {renderLines(question, backText)}
              </div>
            )}
          </div>

          {/* Back */}
          <div
            className={`absolute w-full h-full ${padClass} text-center bg-gradient-to-br from-indigo-100 to-blue-100 text-gray-900 border border-gray-300 shadow-2xl hover:scale-[1.03] transition-transform rounded-2xl flex items-center justify-center rotate-y-180 backface-hidden`}
          >
            <div className="flex flex-col items-center gap-1 text-gray-900">
              {renderLines(answer, backText)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;