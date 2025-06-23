# 📚 Flashly

**Flashly** is a lightweight, mobile-friendly flashcard app for learning vocabulary — perfect for Chinese learners and beyond. Built with React, TypeScript, Tailwind CSS, and MUI, Flashly supports both HSK vocabulary decks (HSK1–HSK9) and custom user-created decks for any language or subject.

## ✨ Features

- ✅ Built-in HSK decks (HSK1 through HSK9)
- ✍️ Create your own flashcards and organize them into custom decks
- 🀄 Toggle between Simplified, Traditional, and Pinyin for Chinese decks
- 💾 Decks saved to `localStorage` (persistent between sessions)
- 💡 Intuitive flashcard interface with progress bar and navigation
- ➕ Save built-in cards to custom decks on-the-fly

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/flashly.git
cd flashly
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the App Locally

```bash
npm run dev
```

Open your browser and navigate to [http://localhost:5173](http://localhost:5173)

### 4. Build for Production

```bash
npm run build
```

## 📁 Project Structure

```
src/
├── components/        # Reusable React components (Flashcard, Modals, Controls)
├── data/              # HSK decks (JSON and TypeScript)
├── App.tsx            # Main app logic and layout
└── main.tsx           # Entry point
```

## 🛠 Tech Stack

- React + TypeScript
- Vite for fast development
- Tailwind CSS v4
- Material UI (MUI)
- LocalStorage for persistence

## 📦 Deployment

To deploy on GitHub Pages:

1. Add `"homepage": "https://your-username.github.io/flashly"` to `package.json`
2. Run:

```bash
npm run build
npx gh-pages -d dist
```

Make sure to install [gh-pages](https://www.npmjs.com/package/gh-pages) first:

```bash
npm install --save-dev gh-pages
```

## 🧭 Roadmap

- [ ] Progress tracking system: mark cards as “seen”, “learning”, “mastered”
- [ ] Export/import decks (JSON format)
- [ ] User accounts & syncing
- [ ] Dark mode toggle
- [ ] Audio playback for pronunciation

## 🤝 Contributing

Pull requests are welcome! If you'd like to suggest improvements or help with feature development, feel free to fork and submit a PR.

## 📄 License

MIT License © 2025 [András Varga](https://github.com/andris811)
