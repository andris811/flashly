import { useState } from "react";
import {
  Box, Button, FormControl, InputLabel, MenuItem, Select,
  Stack, TextField
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import type { AddCardBody, TextCard, QACard, MCQCard, ClozeCard, HSKCard } from "../types/api";

type Props = {
  onSubmit: (card: AddCardBody) => void;
  defaultType?: AddCardBody["type"];
};

const CARD_TYPES: AddCardBody["type"][] = ["text", "qa", "mcq", "cloze", "hsk"];

export default function CreateCardForm({ onSubmit, defaultType = "text" }: Props) {
  const [type, setType] = useState<AddCardBody["type"]>(defaultType);

  // common fields
  const [question, setQuestion] = useState("");            // text/qa/mcq/cloze prompt
  const [hint, setHint] = useState("");                    // qa optional
  const [choices, setChoices] = useState<string>("");      // mcq, comma-separated
  const [answer, setAnswer] = useState<string>("");        // string or comma-separated list

  // HSK-specific
  const [simplified, setSimplified] = useState("");
  const [pinyin, setPinyin] = useState("");
  const [traditional, setTraditional] = useState("");

  const buildPayload = (): AddCardBody => {
    // convert "a, b, c" → ["a","b","c"]
    const toList = (s: string) =>
      s.split(",").map(v => v.trim()).filter(Boolean);

    // parse answer: if user provided commas, treat as list, else string
    const answerValue: string | string[] =
      answer.includes(",") ? toList(answer) : answer;

    switch (type) {
      case "text":
        return { type, question, answer: answerValue } as TextCard;

      case "qa":
        return { type, question: { prompt: question, hint: hint || undefined }, answer: answerValue } as QACard;

      case "mcq": {
        const list = toList(choices);
        return { type, question: { prompt: question, choices: list }, answer: (answerValue as string) } as MCQCard;
      }

      case "cloze":
        return { type, question: { text: question }, answer: answerValue } as ClozeCard;

      case "hsk":
        return {
          type,
          question: {
            simplified,
            pinyin: pinyin || undefined,
            traditional: traditional || undefined,
          },
          answer: answerValue,
        } as HSKCard;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(buildPayload());
  };

  const handleTypeChange = (e: SelectChangeEvent<string>) => {
    const next = e.target.value as AddCardBody["type"];
    setType(next);
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <FormControl fullWidth>
          <InputLabel id="card-type-label">Card Type</InputLabel>
          <Select
            labelId="card-type-label"
            label="Card Type"
            value={type}
            onChange={handleTypeChange}
          >
            {CARD_TYPES.map(t => (
              <MenuItem key={t} value={t}>{t.toUpperCase()}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {type === "hsk" ? (
          <>
            <TextField label="Simplified" value={simplified} onChange={e => setSimplified(e.target.value)} required />
            <TextField label="Pinyin" value={pinyin} onChange={e => setPinyin(e.target.value)} />
            <TextField label="Traditional" value={traditional} onChange={e => setTraditional(e.target.value)} />
            <TextField label="Answer (comma = multiple)" value={answer} onChange={e => setAnswer(e.target.value)} required />
          </>
        ) : (
          <>
            <TextField label="Question / Prompt" value={question} onChange={e => setQuestion(e.target.value)} required />
            {type === "qa" && (
              <TextField label="Hint (optional)" value={hint} onChange={e => setHint(e.target.value)} />
            )}
            {type === "mcq" && (
              <TextField
                label="Choices (comma-separated)"
                value={choices}
                onChange={e => setChoices(e.target.value)}
                helperText="Example: red, blue, green"
                required
              />
            )}
            <TextField
              label={type === "mcq" ? "Correct answer" : "Answer (comma = multiple)"}
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              required
            />
          </>
        )}

        <Button variant="contained" type="submit">Save Card</Button>
      </Stack>
    </Box>
  );
}