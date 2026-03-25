# Language Practice Generator - Design Plan

## Overview

A mobile-first web app for kids (5–10) to practice English and Arabic with AI-generated, adaptive exercises. Teachers/academy admins manage students and track usage data. The app features three main exercise types: quizzes, fill-in-the-blank, and word matching.

---

## Screen List

### Student-Facing Screens

1. **Splash/Welcome Screen** — Initial load with app branding
2. **Student Login** — Simple PIN or name-based entry (no complex auth for kids)
3. **Home Screen** — Shows student name, level, and quick-start buttons
4. **Exercise Selection** — Browse available exercise types and difficulty levels
5. **Quiz Screen** — Multiple-choice questions with immediate feedback
6. **Fill-in-the-Blank Screen** — Text input with word bank or hints
7. **Word Matching Screen** — Drag-and-drop or tap-based matching
8. **Results Screen** — Score, feedback, and next steps
9. **Progress Dashboard** — Student's stats: total exercises, accuracy, levels completed

### Teacher/Admin Screens

10. **Teacher Login** — Email/password or academy code
11. **Admin Dashboard** — Overview of all students, usage stats, recent activity
12. **Student Management** — Add/remove students, assign levels, view individual progress
13. **Analytics Screen** — Charts: completion rates, common mistakes, time spent per exercise
14. **Settings** — App configuration, language preferences, difficulty ranges

---

## Primary Content and Functionality

### Student-Facing Flows

#### Home Screen
- **Content:** Student name, current level (Beginner/Intermediate/Advanced), daily streak, total points
- **Functionality:** 
  - Quick-start button to begin random exercise
  - Browse by exercise type (Quiz, Fill-in-Blank, Matching)
  - View progress chart (mini bar chart of this week's activity)
  - Settings icon (language toggle, sound on/off)

#### Exercise Selection
- **Content:** Grid of exercise cards showing type, language (English/Arabic), difficulty, estimated time
- **Functionality:**
  - Tap to start exercise
  - Filter by language or difficulty
  - Show "Recommended" section based on student's level

#### Quiz Screen
- **Content:** Question text, 4 multiple-choice options (with icons/images for younger kids), progress bar
- **Functionality:**
  - Tap option to select
  - Immediate visual feedback (green for correct, red for incorrect)
  - Auto-advance to next question or show explanation
  - Sound effects for correct/incorrect (optional)

#### Fill-in-the-Blank Screen
- **Content:** Sentence with blank, word bank below, keyboard input
- **Functionality:**
  - Tap word from bank to fill blank (for younger kids)
  - Or type manually (for older kids)
  - Hint button (reveals first letter or similar word)
  - Submit button with validation

#### Word Matching Screen
- **Content:** Left column (words/images), right column (definitions/translations), tap to connect
- **Functionality:**
  - Tap left item, then right item to match
  - Visual feedback (line drawn between matches)
  - Undo last match
  - Submit when all matched

#### Results Screen
- **Content:** Score (e.g., 8/10), accuracy %, time taken, encouraging message, next exercise button
- **Functionality:**
  - Show correct answers for missed questions
  - Suggest next exercise level
  - Earn badges/points for streaks

#### Progress Dashboard
- **Content:** Bar chart (exercises per day), pie chart (accuracy by type), list of recent exercises
- **Functionality:**
  - Swipe to toggle between weekly/monthly views
  - Tap on chart to see details
  - Share progress (teacher view)

### Teacher/Admin Flows

#### Admin Dashboard
- **Content:** Total students, total exercises completed, average accuracy, top performers, recent activity feed
- **Functionality:**
  - Search students by name
  - Quick access to student detail view
  - Export data as CSV
  - Refresh to see live updates

#### Student Management
- **Content:** List of students with name, level, last active, accuracy %
- **Functionality:**
  - Add student (form: name, age, starting level)
  - Edit student level/settings
  - View individual student progress
  - Delete student (with confirmation)
  - Bulk assign exercise sets

#### Analytics Screen
- **Content:** Line chart (completion over time), bar chart (accuracy by exercise type), heatmap (activity by day/time)
- **Functionality:**
  - Date range picker
  - Filter by student or exercise type
  - Export chart as image/PDF
  - Identify struggling students

---

## Key User Flows

### Student: First-Time Setup
1. App opens → Splash screen (2 sec)
2. Tap "Get Started"
3. Enter name (or PIN if pre-registered)
4. Select starting level (Beginner/Intermediate/Advanced)
5. Home screen appears

### Student: Complete an Exercise
1. Home screen → Tap "Start Exercise" or select from grid
2. Exercise screen loads (Quiz/Fill-in-Blank/Matching)
3. Complete all questions
4. Results screen shows score and feedback
5. Tap "Next Exercise" or "Home"

### Teacher: Monitor Progress
1. Login to admin dashboard
2. View overview stats
3. Tap on a student to see detailed progress
4. Identify struggling areas (e.g., low accuracy in Arabic quizzes)
5. Assign targeted exercises or adjust level

### Teacher: Generate Exercises
1. Admin dashboard → "Generate New Exercises"
2. Select: language (English/Arabic), type (Quiz/Fill-in-Blank/Matching), difficulty, topic
3. AI generates 5–10 exercises
4. Preview and approve
5. Assign to students or add to library

---

## Color Choices

### Brand Palette
- **Primary (Teal):** `#0a7ea4` — Action buttons, highlights, progress bars
- **Secondary (Coral):** `#ff6b6b` — Encouragement, achievements, badges
- **Success (Green):** `#22c55e` — Correct answers, checkmarks
- **Warning (Amber):** `#f59e0b` — Hints, cautions
- **Error (Red):** `#ef4444` — Incorrect answers, errors
- **Background (Off-white):** `#f8f9fa` — Main app background
- **Surface (Light Gray):** `#f5f5f5` — Cards, exercise containers
- **Foreground (Dark Gray):** `#11181c` — Primary text
- **Muted (Medium Gray):** `#687076` — Secondary text, disabled states

### Kid-Friendly Adjustments
- Soft, rounded corners on all cards and buttons
- Generous spacing for touch targets (min 44×44 pt)
- Large, readable fonts (min 16pt for body text)
- Bright, cheerful colors with high contrast for accessibility

---

## Interaction Patterns

### For Kids (5–8)
- Large tap targets (no small buttons)
- Immediate visual feedback (color change, sound, animation)
- Minimal text, use icons and illustrations
- Encourage with positive feedback (badges, points, encouraging messages)

### For Older Kids (8–10)
- Slightly smaller touch targets, but still generous
- More text-based explanations
- Leaderboards and competitive elements (optional)
- Ability to customize difficulty and exercise types

### For Teachers
- Clear, data-focused UI
- Quick access to common actions (add student, view analytics)
- Bulk operations (assign exercises to multiple students)
- Export functionality for reports

---

## Technical Considerations

- **Offline Support:** Exercises cached locally; sync when online
- **Adaptive Logic:** Track accuracy per exercise type and language; recommend harder/easier exercises
- **AI Integration:** OpenAI API to generate exercises on-demand
- **Data Privacy:** No personal data stored; only usage metrics (exercise type, accuracy, time)
- **Accessibility:** WCAG AA compliance, high contrast, readable fonts, alt text for images

---

## Success Metrics

1. **Student Engagement:** Daily active users, average session duration
2. **Learning Outcomes:** Accuracy improvement over time, level progression
3. **Teacher Adoption:** Number of students per teacher, feature usage
4. **App Performance:** Load time, crash rate, offline functionality
