# Features Documentation

## Overview
The application provides a comprehensive solution for tracking daily expenses, managing categories, and administering users. It is designed with a mobile-first approach and supports offline usage via PWA capabilities.

## Core Features

### 1. Expense Management
- **Add Expense**: Users can quickly add expenses with amount, description, date, and category.
- **Expense List**: View a history of expenses.
- **Yearly Filtering**: Expenses are organized by year.
- **Auto-Suggestions**: Expense descriptions auto-complete based on most recently used entries (stored in `descriptions.sqlite`).

### 2. Category Management
- **Manage Categories**: Create and manage expense categories to organize spending.
- Categories are stored in a shared database (`categories.sqlite`).

### 3. User Management & Security
- **Authentication**: Secure login system.
- **Admin Role**: Admin users can manage other users (approve/revoke access).
- **Self-Registration**: New users can register but may require approval.

### 4. Settings & Configuration
- **Application Settings**: Configure behavior such as data migration schedules.
- **User Settings**: Individual user preferences.

### 5. Technical Features
- **PWA Support**: Installable on mobile devices with offline capabilities.
- **Data Persistence**: Uses SQLite for reliable local data storage.
- **Responsive Design**: Optimized for both desktop and mobile views.
