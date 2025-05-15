import { useState } from "react"

type Props = {
  onAddCard: (card: { question: string; answer: string }) => void
}

const CreateCardForm = ({ onAddCard }: Props) => {
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim() || !answer.trim()) return
    onAddCard({ question, answer })
    setQuestion("")
    setAnswer("")
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 w-80 flex flex-col gap-2">
      <input
        type="text"
        placeholder="English word"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        className="px-3 py-2 rounded border"
      />
      <input
        type="text"
        placeholder="Chinese translation"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        className="px-3 py-2 rounded border"
      />
      <button
        type="submit"
        className="bg-indigo-500 text-white py-2 rounded hover:bg-indigo-600"
      >
        Add Card
      </button>
    </form>
  )
}

export default CreateCardForm
