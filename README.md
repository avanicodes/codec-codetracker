# CODEC CodeTracker

A dashboard for CODEC mentors and club heads to track new recruits' progress on LeetCode, Codeforces, CodeChef and HackerRank.

## Features
- Overview with mentor performance, weekly progress and platform split
- Common leaderboard with mentor column and mentor filter
- Needs-attention list for inactive mentees
- Per-student side panel: activity heatmap, platform breakdown, rating trend
- Integrity check that flags unusual solving patterns for review (indicators only, not proof)

## Roadmap
1. Supabase project and tables
2. Codeforces sync script
3. Connect dashboard to real data
4. Invite-only login with mentor / head roles (RLS)
5. Daily sync with Vercel Cron
6. LeetCode, then CodeChef and HackerRank

---

## Design decisions

### Principles
- **One question per view.** Each tab answers one thing, since a single crowded page was overwhelming.
- **Summary first, detail on demand.** Lists stay short; the side panel holds the detail.
- **Colour means status only.** Green / amber / red helps spot problems quickly.
- **Every chart has a hover tooltip** with exact numbers, so charts stay simple.
- **Indicators, not verdicts.** Integrity flags prompt a conversation; they prove nothing.

### Overview

| Visual | Why this choice | How it helps | Limits |
|---|---|---|---|
| Summary cards | One number answers "how are we doing?" fastest | 2-second health check; Active/Inactive shows engagement | Snapshot only, no trend |
| Mentor performance table | Few mentors, four measures: a table compares all at once | Heads compare groups; clicking a row filters the dashboard | Averages can swing for small groups; not a measure of mentor quality |
| Solved per week (bars) | Weeks are separate buckets; bars compare better than a line | Shows if the batch is speeding up or dipping | Current week is partial and looks low |
| Platform split (donut) | Only four fixed categories, so a donut stays readable | Shows which platforms get the effort | Compares counts, not skill |
| Top this week / Needs attention (lists) | The useful output is a name, so a list lets you click straight in | Praises progress, catches drift early | Thresholds (5+ days idle or under 3 solved) are guesses |

### Leaderboard

| Visual | Why this choice | How it helps | Limits |
|---|---|---|---|
| Sortable table with Mentor column | Ranking and sorting are the main tasks | One table for heads (sort/filter by mentor) and mentors (dropdown) | Total favours early starters, so "this week" sits beside it |
| Mini stacked bar under Total | Four platform columns were too crowded | Shows if someone uses one platform only | Exact values need a hover |
| "Last active" pill | Inactivity is the most actionable signal | Idle students stand out down a column | Text always accompanies colour |

### Student side panel

| Visual | Why this choice | How it helps | Limits |
|---|---|---|---|
| Key numbers (total, this week, streaks) | Quick answer before any chart; streaks show consistency | Rewards regular habits, good for new recruits | Counts days with any submission |
| Activity heatmap (26 weeks) | Shows rhythm and gaps that bars can't for 180 days | Spots last-minute bursts vs steady habits; hover shows date and count | Needs saved daily history; counts submissions, not difficulty |
| Solved per week (bars) | Same chart as Overview, so it is learned once | Shows improvement even when the heatmap is irregular | Same as Overview |
| Platform split (donut) | Same reasoning as Overview, for one person | Shows if a student is stuck on one platform | Same as Overview |
| Codeforces rating (line) | Rating is continuous, and lines show direction | Hard to inflate, so a reliable progress signal | Codeforces only; empty state if no contests |
| LeetCode difficulty (stacked bar) | One bar shows proportions of a single total | Separates 200 Easy from 200 Hard | Demo estimate for now; real data from profile |
| Topic strength (horizontal bars) | Long topic names read better than on a radar chart | Tells the mentor what to teach next | Needs problem tags; likely Codeforces and LeetCode only |

### Integrity check

| Visual | Why this choice | How it helps |
|---|---|---|
| Flag counts (High / Medium / Low) | Heads see how many need follow-up before any list | Quick overview |
| Flagged list sorted by score | Time goes to the few highest scores | Plain-language reasons (e.g. "Hard problems solved in under 10 min: 4") tell the mentor what to ask |
| Signal rows with dots (student panel) | Shows value, typical range and a dot together | Judge a value without knowing the thresholds |

**Limits:** indicators only. Fast solvers, experienced students and offline solving can look the same as copying. "Time per problem" is estimated from gaps between submissions. Weights and thresholds are guesses and need tuning on real data. Suggested follow-up for a flagged student is a short conversation or explanation of their solution.

### Interaction choices
- **Side panel, not inline details:** the leaderboard stays visible while opening several students.
- **Single mentor dropdown:** applies to every tab.
- **Mentor performance stays visible when filtered:** the selected mentor is highlighted so groups can still be compared.
- **Softened glass cards:** matches the CODEC look; blur was toned down for readability.
- **Light and dark mode:** follows the device setting.

### To review once real data is connected
- Tune "Needs attention" and integrity thresholds on the real batch.
- Replace the generated heatmap, rating, difficulty and topic data with stored data.
- Check charts with very small groups (1 to 3 mentees) and very large totals.
- Decide who can see the integrity tab (suggested: mentors for their own mentees, and club heads).
