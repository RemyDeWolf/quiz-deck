# QuizDeck

A simple web app for interactive quizzes where users answer questions step by step and can optionally see pictures when they get correct answers.

Upload your own question decks or use built-in quizzes with support for text input, multiple choice, images, and scoring.

**Live at https://remydewolf.github.io/quiz-deck/**

## Features

- **Upload Custom Decks**: Upload your own JSON quiz files with preview summary
- **Multiple Question Decks**: Choose from different quiz decks
- Dynamic quiz title display
- Dark background with large white text for easy reading
- **Two Question Types**:
  - **Text Input**: Type your answer
  - **Multiple Choice**: Click to select from 4 options
- **Sound Effects**: Pleasant sounds for correct and wrong answers
- Optional images that display after correct answers (automatically skips if image doesn't exist)
- **Two Quiz Modes**:
  - **Strict Mode** (`requireCorrectAnswers: true`): Must answer correctly to proceed
  - **Practice Mode** (`requireCorrectAnswers: false`): Continue after wrong answers and see final score
- **Random Questions** (`random: true`): Shuffle questions for each quiz session
- **Limited Question Sets** (`maxQuestions`): Set a maximum number of questions to ask
- Progress bar at the bottom showing quiz completion
- Score card for practice mode quizzes
- Celebration message for strict mode quizzes
- Keyboard shortcuts (Enter to submit/proceed)
- **Multiple Answer Support**: Text input questions can accept multiple correct answers

## How to Use

1. Open `index.html` in a web browser (you'll need to serve it via a local web server to load the data files)
2. **Select a question deck** from the available options
3. Read the question displayed on screen
4. Type your answer in the large text field
5. Press "Submit Answer" or hit Enter
6. If correct: a pleasant sound plays
   - If there's an image, it displays (press Enter or click "Next Question")
   - If no image, automatically proceeds to next question
7. If wrong:
   - **Strict Mode**: Shows error message, you must try again
   - **Practice Mode**: Shows error message and automatically proceeds to next question
8. Track your progress with the golden progress bar at the bottom
9. Complete all questions to see:
   - **Strict Mode**: Celebration message
   - **Practice Mode**: Score card with results

## Running the App

Since the app loads data from JSON files, you need to run it through a web server. Here are some options:

### Option 1: Python (if installed)
```bash
python3 -m http.server 8000
```
Then open http://localhost:8000

### Option 2: Node.js with npx
```bash
npx serve
```

### Option 3: VS Code Live Server
Install the "Live Server" extension and click "Go Live"

## Customizing Your Quiz

### Adding a New Question Deck

1. Create a new JSON file in the `decks/` directory (e.g., `my-quiz.json`)
2. Make sure your JSON includes the `name` and `icon` fields
3. Add the filename to `decks/index.json`:
   ```json
   {
     "decks": [
       "pirate-treasure.json",
       "egg-hunt.json",
       "us-capitals.json",
       "my-quiz.json"
     ]
   }
   ```
4. Refresh the page - your deck will automatically appear!

**No HTML changes needed!** The app dynamically loads all decks from the manifest.

### JSON Format

Each question deck file should follow this format:

```json
{
  "name": "Quiz Name",
  "icon": "🎯",
  "requireCorrectAnswers": true,
  "random": false,
  "maxQuestions": 10,
  "steps": [
    {
      "step": 1,
      "question": "Your question here?",
      "answer": "the answer",
      "image": "decks/image1.jpg"
    },
    {
      "step": 2,
      "question": "Multiple choice question?",
      "answer": "Sacramento",
      "choices": ["Los Angeles", "San Francisco", "Sacramento", "San Diego"]
    },
    {
      "step": 3,
      "question": "Text input with multiple correct answers?",
      "answer": ["answer1", "answer2"]
    }
  ]
}
```

### Fields

**Deck Properties:**
- **name**: The name of your quiz (displayed at the top during quiz)
- **icon**: Emoji or symbol to display next to the quiz name (e.g., "🏴‍☠️", "🥚", "🗺️"). Defaults to "📋" if not specified
- **requireCorrectAnswers**: Boolean field that determines quiz behavior:
  - `true`: Strict mode - users must answer correctly to proceed, celebration at end
  - `false`: Practice mode - users can continue after wrong answers, score card shown at end
- **random**: (Optional) Boolean - if `true`, questions are shuffled for each quiz session. Default: `false`
- **maxQuestions**: (Optional) Number - limits how many questions to ask. Useful with `random: true` for large question banks. Default: all questions

**Question Properties:**
- **step**: The question number (1, 2, 3, etc.) - keep them in sequence
- **question**: The question to display to the user
- **answer**: The correct answer (case-insensitive). Can be:
  - A single string: `"sacramento"`
  - An array of strings for multiple correct answers (text input only): `["egg", "eggs"]`
- **choices**: (Optional) Array of 4 strings for multiple choice questions. If present, displays buttons instead of text input
- **image**: (Optional) The image file path to display when answered correctly (relative to project root). Omit this field if you don't want to show an image

### Adding Images

Place your image files in the `decks/` folder, and reference them by path in the question deck JSON file. Example: `"decks/my-image.png"`

If you omit the `image` field or if the image file doesn't exist, the app will automatically proceed to the next question after showing the success sound.

## Project Structure

```
quiz-deck/
├── index.html           - Main HTML structure
├── style.css            - Styling with dark background and white text
├── app.js               - JavaScript logic for quiz functionality
├── decks/               - Question deck data files and images
│   ├── index.json      - Manifest listing all available decks
│   ├── pirate-treasure.json
│   ├── egg-hunt.json
│   ├── us-capitals.json
│   └── pirate-ship.png
├── README.md
└── CLAUDE.md           - AI development context
```

## Included Question Decks

- **Pirate Treasure Hunt** (5 questions, strict mode): A pirate-themed adventure with text input
- **Easter Egg Hunt** (5 questions, strict mode): An Easter-themed quiz with multiple answer support (text input)
- **US State Capitals** (50 questions, random, max 10, practice mode): Multiple choice quiz with all 50 US state capitals. Questions are randomized and limited to 10 per session with scoring

## Examples

### Strict Mode (requireCorrectAnswers: true)
- User must answer each question correctly to proceed
- Wrong answers show error message and allow retry
- Completion shows celebration message
- No score tracking

### Practice Mode (requireCorrectAnswers: false)
- User can continue after wrong answers
- Wrong answers show error message for 1.5 seconds, then proceed
- Completion shows score card with percentage
- Great for learning and testing knowledge

### Multiple Choice Questions
- Add a `choices` array with 4 options to any question
- User clicks to select an answer (automatic submission)
- Perfect for quizzes where you want to provide options

### Random + Max Questions
- Use `random: true` and `maxQuestions: 10` to create dynamic quizzes
- Great for large question banks (like the 50 state capitals)
- Each quiz session presents different questions
- Ideal for repeated practice without memorizing question order
