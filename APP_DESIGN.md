# Quran Circle Management Platform

## Overview

A web-based platform designed for Quran teachers and supervisors to manage Quran circles, track memorization progress, record recitation performance, monitor mistakes, and gain meaningful insights into each student's memorization journey.

The platform is designed around a single principle:

**Teachers should spend their attention listening to students, not interacting with software.**

---

# Core Objectives

* Track memorization progress accurately.
* Record recitation performance at the verse level.
* Identify recurring weaknesses and mistakes.
* Measure mastery and improvement over time.
* Simplify Quran circle management.
* Maintain a complete historical record of student recitations.
* Minimize teacher interaction during live sessions.

---

# Student Management

## Student Profiles

Each student has a dedicated profile containing:

* Full name
* Contact information
* Group assignment
* Current memorization progress
* Recitation history
* Mastery statistics
* Performance trends

---

## Student Dashboard

Provides a quick overview of:

* Latest recitation sessions
* Current memorization target
* Review requirements
* Overall mastery score
* Common mistake patterns
* Total memorized verses
* Historical performance metrics

---

# Circle Management

Teachers can create and manage multiple Quran circles.

Examples:

* Fajr Circle
* Youth Circle
* Advanced Memorization Circle

Each circle maintains:

* Student roster
* Recitation records
* Performance statistics

---

# Memorization Planning

## Student Memorization Plan

The system helps teachers manage future memorization goals.

Example:

Current Memorization:

* Surah Taha (57–134)

Next Target:

* Surah Taha (135–200)

Review Targets:

* Al-A'la
* Al-Ghashiyah
* At-Tariq

This transforms the platform from a tracking system into a teaching and planning tool.

---

# Recitation Session System

## Session Setup

Before starting a session, the teacher selects:

* Student
* One or more surahs, each with its own ayah range (from–to)

Example: Surah Taha (57–80) + Al-A'la (1–19) for new memorization plus review in one session.

The session then enters Live Recitation Mode.

---

# Active Recitation Mode

This is the primary screen used during daily teaching.

Displayed information:

* Student name
* Current surah
* Current recitation range
* Session timer
* Number of recorded mistakes
* Quick action controls

The interface is optimized for speed and minimal distractions.

---

# Interactive Quran View

The Quran is displayed directly inside the platform.

Teachers can interact with individual verses while listening to students.

Teachers choose between two display modes — optimized for different teaching contexts:

| Mode | Purpose | Layout |
|------|---------|--------|
| **Structured Mode** | Data-focused recitation tracking | One verse per row; ayah number in margin; status border + labels |
| **Mushaf Mode** | Authentic Mushaf reading experience | Madinah-style page layout; continuous RTL text flow; inline ayah markers; page navigation |

Both modes share the same interaction model (3-tap attempt cycle, mistakes panel, undo). Switching modes during a live session preserves all marks and scroll/page position where possible.

Features (both modes):

* Verse-level interaction
* Quick status updates
* Detailed mistake review
* Teacher notes
* Teacher preference persisted across sessions

### Structured Mode (default)

* One ayah per row — optimized for scanning status while listening
* Large touch targets; ayah number and attempt label in LTR margin
* Virtualized list for 50+ ayah sessions
* Uses bundled Uthmani text from `/api/quran/[surah]`

### Mushaf Mode

* Page-based Madinah Mushaf layout (604 pages, Hafs ʿan ʿĀṣim)
* Continuous text per line with traditional spacing and surah headers
* Inline Arabic ayah end markers (۝)
* Page number and surah name in chrome (Mushaf-style footer/header)
* Prev/next page navigation within session page range
* Ayat outside the session range are visually de-emphasized (not interactive)
* Mistake highlights use subtle translucent tints — not row borders — to preserve Mushaf appearance
* Typography: KFGQPC Uthmanic Hafs (official Madinah print complex font)

### Display mode preference

* Toggle in live session chrome (Structured | Mushaf) and in Settings
* Stored per teacher (`user_preferences.quran_display_mode`)
* Instant switch without losing session state (marks, timer, undo stack)

---

# Minimal Interaction Tracking

The system assumes that all verses are correct unless otherwise recorded.

Teachers only record exceptional events.

This dramatically reduces the number of interactions required during recitation.

---

# Verse Status System

Each verse can have one of the following statuses:

### Correct

Recited correctly without intervention.

### Reminder Required

Student needed a small reminder before self-correcting.

### Second Attempt

Student required another attempt before succeeding. Recorded on **first tap** of the ayah.

### Third Attempt

Student required a third attempt before succeeding. Recorded on **second tap** of the same ayah.

### Prompting Required

Teacher actively guided the student.

### Incomplete

Student could not continue successfully.

---

# Mistakes Detail Panel (Third Tap)

On the **third tap** of a verse (after 2nd and 3rd attempt are recorded), a detail panel opens.

This allows the teacher to tag mistake categories and add notes without a separate status picker.

Possible information includes:

* Mistake categories
* Teacher notes
* Additional observations
* Special comments

---

# Mistake Tracking

## Memorization Mistakes

Examples:

* Forgotten word
* Forgotten verse
* Similar verse confusion
* Word order mistakes
* Missing phrases

---

## Tajweed Mistakes

Examples:

* Madd errors
* Ghunnah errors
* Noon and Meem rules violations
* Stopping and starting mistakes
* Pronunciation issues
* Articulation problems

---

## Recitation Behavior Observations

Examples:

* Hesitation
* Slow recall
* Lack of confidence
* Loss of concentration

---

## Multiple Mistakes Per Verse

A verse may contain multiple tagged mistakes across different categories.

Example:

* Memorization issue
* Tajweed issue
* Hesitation

All attached to the same verse record.

---

# Mastery Calculation

Mastery scores are calculated automatically.

Factors include:

* Number of perfect verses
* Reminders required
* Second attempts
* Prompted verses
* Total mistake count

The goal is to measure quality of memorization, not simply completion.

---

# Session Summary

Displayed immediately after finishing a recitation session.

Includes:

* Total verses recited
* Total mistakes
* Reminder count
* Prompt count
* Mastery score
* Most common mistake categories

The session is then saved to the student's history.

---

# Quran Progress Visualization

## Quran Mastery Map

Provides a visual overview of the student's progress across the Quran.

Verse and passage states include:

### Memorized

Successfully recited and mastered.

### Needs Review

Contains recurring mistakes.

### Frequently Weak

Shows repeated performance issues.

### Not Yet Recited

No recorded recitation history.

This allows teachers to instantly identify weak areas.

---

# Review Management

The platform automatically identifies passages requiring review.

Recommendations may be based on:

* Frequent mistakes
* Low mastery scores
* Long periods without review
* Previously weak passages

---

# Historical Tracking

Complete recitation history is maintained for every student.

Teachers can review:

* Session dates
* Surahs covered
* Recited verse ranges
* Mistakes recorded
* Progress over time

---

# Performance Analytics

Per-student analytics include:

* Total recited verses
* Total mistakes
* Mastery percentage
* Improvement trend
* Most common mistake categories
* Strongest surahs
* Weakest surahs

---

# Teacher Notes

Teachers can record notes at:

* Verse level
* Session level
* Student level

All notes become part of the student's permanent record.

---

# Intelligence & Insights

Advanced analytics layer that transforms historical recitation data into actionable teaching intelligence. Builds on existing session records, mistake tags, mastery scores, and review recommendations (M3–M4).

---

## 1. Repeated Weak Ayat Engine

### Purpose

Identify and rank ayat with recurring mistakes across all historical sessions for each student.

### Problem it solves

Teachers lose track of persistent weak spots that recur across different sessions. Recent session memory hides long-term patterns.

### Detailed feature description

Aggregates `VerseRecord` and `Mistake` data per `(surah, ayah)`. Computes total mistake count, frequency, last occurrence, and cross-session persistence. Ranks ayat by total mistakes. Supports drill-down into individual recitation events with session date, status, and tags.

### User workflow

Teacher opens student profile → Weak Ayat → reviews ranked list → drills into ayah history → jumps to source session or starts review.

### UI/UX requirements

Ranked list with surah name, ayah number, mistake count, last seen date. Persistent weak ayahs visually distinguished. Event timeline on drill-down. Link from mastery map ayah detail.

### Expected outputs

```
Most Problematic Ayat:
- Taha 64 (8 mistakes)
- Taha 109 (6 mistakes)
- Al-Baqarah 255 (5 mistakes)
```

### Benefits

Data-driven review targeting; surfaces problems invisible in single-session summaries; connects mastery map to concrete mistake evidence.

---

## 2. Weak Ayah Review Session Generator

### Purpose

Automatically propose review session ranges from weak-ayah data.

### Problem it solves

Teachers manually translate weak ayah lists into practical recitation ranges. Nearby weak ayahs should be grouped into one flowing passage.

### Detailed feature description

Consumes Repeated Weak Ayat Engine output. Clusters weak ayahs by surah with configurable gap tolerance. Pads ranges for context. Produces editable `SessionPassage` preview. Tags sessions as **Review** vs **Regular**.

### User workflow

From weak ayat view → Generate review → adjust proposed ranges → Begin review → live session → summary tagged as review.

### UI/UX requirements

Reuses session setup passage editor. Type badge: Review | Regular. History shows session type. Warning for very long generated ranges.

### Expected outputs

```
Weak ayat:
- Taha 64
- Taha 109

Generated review:
- Taha 60–110
```

### Benefits

Seconds instead of minutes for review session prep; natural passage grouping; clear separation of memorization vs review work.

---

## 3. Smart Review Planner

### Purpose

Generate daily and weekly review recommendations with priority scores and time estimates.

### Problem it solves

Inconsistent manual prioritization across students; overdue passages; no time budgeting for circle sessions.

### Detailed feature description

Extends review urgency with mastery score, mistake frequency, days since last review, weak-ayah rank, and performance trend. Outputs today's top passages and a weekly schedule with estimated duration per item.

### User workflow

Open review plan on profile → review today's priorities → tap passage to pre-fill session → optionally run full daily plan as multi-passage session.

### UI/UX requirements

Numbered priority list with scores and reason chips. Weekly calendar view. Circle-level aggregate of students needing review today.

### Expected outputs

```
Today's Review Plan:
1. Al-Ghashiyah (Priority 94)
2. At-Tariq (Priority 86)
3. Taha 57–80 (Priority 80)
```

### Benefits

Consistent prioritization; time estimates aid scheduling; reduces planning cognitive load.

---

## 4. Weakness Pattern Analytics

### Purpose

Identify recurring mistake patterns across memorization, tajweed, and behavior categories.

### Problem it solves

Session summaries show per-session breakdowns, not longitudinal pattern insight (e.g. chronic similar-verse confusion or hesitation).

### Detailed feature description

Aggregates mistake tags over selectable periods. Calculates category percentages, top subcategories, strongest/weakest areas, and trend vs prior period.

### User workflow

Open Insights → select time range → view category charts → drill subcategory → see affected ayat list.

### UI/UX requirements

Category charts with percentages. Three highlight cards for top memorization, tajweed, and behavioral issues. Trend indicators. Accessible labels.

### Expected outputs

```
Most Common Issue:
- Similar Verse Confusion (38%)

Most Common Tajweed Issue:
- Madd (27%)

Most Common Behavioral Pattern:
- Hesitation (41%)
```

### Benefits

Pattern-aware remediation; measurable improvement trends; stronger parent conversations.

---

## 5. Parent Report Generator

### Purpose

Generate professional parent-facing progress reports with export options.

### Problem it solves

Manual parent updates are time-consuming and inconsistent. Parents lack structured visibility into progress.

### Detailed feature description

Monthly and custom-range reports including memorized verses, reviewed verses, session count, mastery score, strengths, improvements, and teacher notes. Export as PDF, print layout, or shareable read-only link.

### User workflow

Select period → preview report → curate notes → export PDF or share link with parent.

### UI/UX requirements

WYSIWYG print-friendly layout. Share link with optional expiry. School-appropriate design. Mobile-friendly preview.

### Expected outputs

```
Student: Yusuf
Period: June 2026
Memorized: 48 verses
Reviewed: 180 verses
Mastery: 89%
```

### Benefits

Saves teacher time; improves parent engagement; professional program presentation.

---

## 6. Progress Timeline

### Purpose

Visual chronological history of student progress and milestones.

### Problem it solves

Session lists lack narrative. Stakeholders want milestone stories (started surah, completed juz).

### Detailed feature description

Timeline of sessions, surah starts/completions, juz milestones, mastery improvements, and review milestones. Optional GitHub-style activity heatmap for session frequency.

### User workflow

Open timeline → scroll monthly milestones → tap event for detail → optionally include in parent report.

### UI/UX requirements

Vertical timeline with month grouping. Milestone type icons. Optional 12-month heatmap. Responsive single-column mobile layout.

### Expected outputs

```
January:
- Started Surah Taha

February:
- Completed Surah Taha

March:
- Started Surah Maryam

April:
- Completed Juz 30
```

### Benefits

Motivating progress narrative; quick preparation for parent meetings; consistency visibility via heatmap.

---

## 7. AI Session Summary (Future Feature)

### Purpose

AI-generated natural-language insights after each recitation session.

### Problem it solves

Teachers manually synthesize performance; parents need readable summaries beyond raw statistics.

### Detailed feature description

Post-session LLM analysis of summary JSON, marked verses, weak ayat context, and recent session comparison. Produces teacher observations, parent-friendly summary, review suggestions, and trend notes. Admin-gated feature flag.

### User workflow

End session → summary page → AI insights card loads → teacher reviews/edits → optional save to notes or parent report.

### UI/UX requirements

Loading state on summary. Edit before save. AI disclaimer. Teacher opt-out. Admin model/prompt config (future).

### Expected outputs

```
Yusuf demonstrated strong memorization today.
Main challenge: Similar verse confusion.
Recommended review: Taha 60–90.
Performance improved by 8% compared to recent sessions.
```

### Benefits

Faster debrief; surfaces non-obvious patterns; foundation for AI-assisted teaching.

**Status:** Future — requires LLM integration, cost controls, privacy review.

---

# Future Roadmap

Future platform expansions may include:

* Attendance tracking
* Parent portal
* Supervisor dashboard
* Achievement badges
* Student rankings
* Audio recording integration
* Mobile applications
* Multi-teacher collaboration

*Note: Automated review scheduling, PDF reports, and AI-assisted analysis are partially addressed in **Intelligence & Insights** above.*

---

# Design Philosophy

The platform follows one fundamental principle:

**The teacher should spend nearly all of their attention listening to the student, while the platform quietly captures meaningful performance data in the background.**
