# Job Board Frontend

A modern, responsive job board application built with React and Vite.

## Features

- 📋 Browse job listings in a clean card-based grid layout
- 🔍 Filter jobs by type (All, Full-Time, Part-Time, Remote)
- ➕ Post new job listings via modal form
- 🗑️ Delete job postings with confirmation
- 📱 Responsive design that works on all devices
- 🎨 Modern UI with smooth transitions and hover effects

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **CSS3** - Styling with modern features

## Components

### JobBoard.jsx
Main component that handles:
- Job listing display
- Filtering logic
- API integration
- Modal management
- CRUD operations

### Styling
- `JobBoard.css` - Component-specific styles
- `index.css` - Global styles

## Installation

```bash
npm install
```

## Running the App

```bash
# Start development server
npm run dev

# App runs on http://localhost:3000
```

## Building for Production

```bash
npm run build
```

## Features in Detail

### Job Cards
Each job card displays:
- Job title
- Company name
- Location with pin icon
- Job type badge (color-coded)
- Salary range
- Delete button (×)

### Filtering
Four filter buttons at the top:
- **All Jobs** - Shows all available positions
- **Full-Time** - Shows only full-time positions
- **Part-Time** - Shows only part-time positions
- **Remote** - Shows only remote positions

Active filter is highlighted in blue.

### Post a Job Modal
Modal form with fields:
- Job Title (required)
- Company (required)
- Location (required)
- Type (dropdown: Full-Time, Part-Time, Remote)
- Salary (required, free text)

Form validation ensures all fields are filled before submission.

### Delete Functionality
- Click the × button on any job card
- Confirmation dialog appears
- Job is removed from database and UI updates

## API Integration

The frontend connects to the backend API at `http://localhost:3002/api/jobs`

### Endpoints Used:
- `GET /api/jobs` - Fetch all jobs on load
- `POST /api/jobs` - Create new job
- `DELETE /api/jobs/:id` - Delete job

## Color Scheme

- **Primary Blue**: `#3b82f6` - Buttons and active states
- **Full-Time Badge**: Blue (`#dbeafe` / `#1e40af`)
- **Part-Time Badge**: Yellow (`#fef3c7` / `#92400e`)
- **Remote Badge**: Green (`#d1fae5` / `#065f46`)
- **Delete Button**: Red (`#ef4444`)

## Responsive Design

The grid layout automatically adjusts:
- Desktop: 3-4 cards per row
- Tablet: 2 cards per row
- Mobile: 1 card per row

Minimum card width: 320px

## User Experience

- Smooth hover animations on cards and buttons
- Card elevation on hover for depth
- Modal backdrop with click-outside to close
- Form reset after successful submission
- Immediate UI updates after POST/DELETE
- Empty state message when no jobs match filter

## Browser Support

Works in all modern browsers that support:
- ES6+ JavaScript
- CSS Grid
- CSS Flexbox
- Fetch API

## Future Enhancements

Potential features for future versions:
- Search functionality
- Pagination
- Job detail view
- Edit job capability
- Sort options (by date, salary, etc.)
- Favorite/bookmark jobs
- Application tracking
