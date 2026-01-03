# CLAUDE.md - AI Development Context

This document provides context for AI assistants working on the QuizDeck project. It captures architectural decisions, patterns, and learnings from development sessions.

## Project Overview

**QuizDeck** is a web-based quiz application that supports:
- Text input and multiple choice questions
- Custom deck uploads (JSON format)
- Random question ordering with limits
- Two quiz modes: Strict (must answer correctly) and Practice (scoring)
- Optional images and sound effects

## Architecture Decisions

### Display Logic Pattern
**Decision:** Use `style.display` directly instead of CSS classes for showing/hiding containers.

```javascript
// Correct pattern
questionContainer.style.display = 'none';
multipleChoiceContainer.style.display = 'block';

// Avoid: CSS classes weren't reliably hiding elements
questionContainer.classList.add('hidden');
```

**Reason:** CSS class approach had specificity issues causing elements to remain visible when they should be hidden, particularly for `questionContainer` and `multipleChoiceContainer`.

**Affected Components:**
- `questionContainer` (text input + submit button)
- `multipleChoiceContainer` (choice buttons)
- Used in: `displayCurrentQuestion()`, `checkAnswer()`, `showCompletion()`

### Question Type Detection
**Pattern:** Check for `choices` array to determine question type.

```javascript
if (currentQuestion.choices && currentQuestion.choices.length > 0) {
    // Multiple choice mode
} else {
    // Text input mode
}
```

This single check determines:
- Which UI elements to display
- How to handle answer submission
- What visual feedback to show

## Bug Patterns & Solutions

### 1. Message Display Persistence
**Problem:** "WRONG ANSWER" message remained visible after correct answer in text input mode without images.

**Solution:** Always hide `messageDisplay` when transitioning states.

```javascript
// When correct answer without image
messageDisplay.classList.add('hidden');
setTimeout(() => moveToNextQuestion(), 1000);
```

**Location:** `app.js:282`

### 2. Multiple Choice Button States
**Problem:** Users could click multiple buttons during feedback animation.

**Solution:** Disable all buttons during feedback period.

```javascript
allButtons.forEach(btn => {
    btn.style.pointerEvents = 'none';
});
// ... show feedback ...
setTimeout(() => {
    btn.style.pointerEvents = ''; // Re-enable
}, 2500);
```

**Location:** `showMultipleChoiceFeedback()` in `app.js:307-309`

### 3. Container Visibility on Next Question
**Problem:** Wrong container type shown when moving to next question.

**Solution:** Let `displayCurrentQuestion()` control which container to show, don't override in `moveToNextQuestion()`.

```javascript
// moveToNextQuestion - DON'T force visibility
function moveToNextQuestion() {
    currentQuestionIndex++;
    imageContainer.classList.add('hidden');
    messageDisplay.classList.add('hidden');
    // Let displayCurrentQuestion() handle container visibility
    displayCurrentQuestion();
}
```

## Data Structure

### Question Deck JSON Format

```json
{
  "name": "Quiz Name",
  "requireCorrectAnswers": false,  // true = strict, false = practice
  "random": true,                  // shuffle questions
  "maxQuestions": 10,              // limit number of questions
  "steps": [
    {
      "step": 1,
      "question": "Question text?",
      "answer": "correct answer",     // string or array
      "choices": ["A", "B", "C", "D"], // optional for multiple choice
      "image": "path/to/image.png"     // optional
    }
  ]
}
```

**Key Conventions:**
- `requireCorrectAnswers: false` = Practice Mode (show score card)
- `requireCorrectAnswers: true` = Strict Mode (must answer correctly)
- `answer` can be string or array for multiple correct answers
- `choices` presence determines text input vs multiple choice
- `image` is optional; if missing or fails to load, auto-proceeds

### Answer Validation
**Always case-insensitive:**

```javascript
function isAnswerCorrect(userAnswer, correctAnswer) {
    const normalized = userAnswer.trim().toLowerCase();
    if (Array.isArray(correctAnswer)) {
        return correctAnswer.some(ans => ans.toLowerCase() === normalized);
    }
    return correctAnswer.toLowerCase() === normalized;
}
```

## Development Patterns

### Testing Checklist
When making changes, test:
- [ ] Text input questions (with and without images)
- [ ] Multiple choice questions
- [ ] Strict mode (requireCorrectAnswers: true)
- [ ] Practice mode (requireCorrectAnswers: false)
- [ ] Random + maxQuestions combination
- [ ] Wrong answer → correct answer flow
- [ ] File upload with deck summary

### Visual Feedback Timing
- **Wrong answer error message:** 1.5 seconds (text input)
- **Wrong answer with visual feedback:** 2.5 seconds (multiple choice)
- **Correct answer auto-proceed:** 1 second (no image)
- **Image display:** User-controlled (press Enter or click button)

### Sound Effects
- **Correct:** C-E-G ascending major chord (0.5s)
- **Wrong:** Descending tone (0.3s)
- Uses Web Audio API for cross-browser compatibility

## File Structure

```
quiz-deck/
├── index.html           # Main UI structure
├── app.js              # Core logic (17KB)
├── style.css           # Styling with dark theme
├── decks/              # Question decks and images
│   ├── *.json         # Question deck files
│   └── *.png/jpg      # Optional images
├── README.md           # User documentation
└── CLAUDE.md          # This file (AI context)
```

## Known Limitations

1. **Image Loading:** Images must be pre-uploaded to the project. No support for external URLs or dynamic image loading.

2. **No Progress Persistence:** Quiz state is not saved. Refreshing the page restarts the quiz.

3. **No Answer History:** Can't review previous questions or see which ones were answered incorrectly.

4. **Single Session:** No user accounts or session management.

5. **Local Images Only:** Uploaded deck JSON files can reference images, but images must be in the project directory or accessible via relative paths.

## Future Enhancement Ideas

### Potential Features
- **Answer History:** Show review screen with correct/incorrect breakdown
- **Timed Quizzes:** Add countdown timer per question or for entire quiz
- **Leaderboard:** Local storage or backend for score tracking
- **Image URLs:** Support loading images from external URLs
- **Export Results:** Download quiz results as PDF/CSV
- **Study Mode:** Show correct answer immediately without penalty
- **Categories:** Tag questions and filter by category

### Technical Improvements
- **State Management:** Use a state machine for clearer flow control
- **TypeScript:** Add type safety for deck structure
- **Unit Tests:** Test answer validation, scoring, and state transitions
- **Accessibility:** Improve keyboard navigation and screen reader support
- **Mobile:** Optimize for touch interactions

## Common Pitfalls

### ❌ Don't Do This
```javascript
// Don't rely on classList for container visibility
questionContainer.classList.add('hidden');

// Don't forget to hide messages between states
// (causes "WRONG ANSWER" to persist)

// Don't assume container state in moveToNextQuestion()
questionContainer.classList.remove('hidden');
```

### ✅ Do This Instead
```javascript
// Use style.display for reliable visibility control
questionContainer.style.display = 'none';

// Always hide messages when transitioning
messageDisplay.classList.add('hidden');

// Let displayCurrentQuestion() control containers
displayCurrentQuestion(); // handles visibility based on question type
```

## Git Workflow Notes

- **Test locally before pushing:** Always ask before `git push`
- **Commit message format:** Descriptive with "why" explanation
- **Branch:** `main` (no feature branches yet, direct commits for small changes)

## Contact & Collaboration

This project was built with Claude (Anthropic). For questions about architectural decisions or context, refer to this document or commit messages with detailed explanations.

**Repository:** https://github.com/RemyDeWolf/quiz-deck

---

*Last updated: January 2, 2026*
*Session: Initial development with Claude Sonnet 4.5*
