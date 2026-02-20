# 30-Day Skill Improvement Challenge

A web-based daily challenge tracker where users practice C language, language skills, self-improvement, and communication—with persistent progress tracking.

## Features

- **10 predefined users** (user1–user10 / pass1–pass10)
- **Login** with username + password, session persists in localStorage
- **Personal dashboard** per user with:
  - Welcome message
  - Current day (Day 1–30)
  - Task list with daily checkboxes
  - Add new tasks
  - Daily progress chart (Chart.js)
  - Logout

## 30-Day Logic

- On first login, `startDate` is saved
- Current day = (days since start) + 1
- Maximum = Day 30

## Data Persistence

Data is stored in `localStorage`:

- **Refresh safe** – tasks and progress persist
- **Logout safe** – tasks stay keyed by username
- **Long-term safe** – data remains until cleared

> For cloud storage across devices, you can add Firebase/Supabase later.

## How to Run

1. Open `index.html` in a browser, or
2. Serve via a local server:
   ```
   npx serve .
   ```
   or
   ```
   python -m http.server 8000
   ```
   Then open `http://localhost:8000`

## Tech Stack

- Plain HTML, CSS, JavaScript (no frameworks)
- Chart.js (CDN) for progress chart

## Login Credentials

| Username | Password |
|----------|----------|
| user1    | pass1    |
| user2    | pass2    |
| ...      | ...      |
| user10   | pass10   |
