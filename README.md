# GitHub User Search Application

## Overview

This project is a frontend web application that allows users to search for GitHub users and view their profile information and repositories. The application provides a simple and intuitive interface to search users by their username and display relevant information such as avatar, bio, follower count, and repositories.

## Problem Statement

In the age of collaborative development and open-source contributions, GitHub is a vital platform for developers. However, navigating user profiles and their repositories can be cumbersome. This application aims to create a user-friendly web interface that allows users to search for GitHub users and view their profile information and repositories in a straightforward manner.

## Features

- **User Search**: Search GitHub users by username
- **Profile Display**: View detailed user information including avatar, bio, followers count, and more
- **Repositories List**: Browse through the user's repositories with pagination
- **Responsive Design**: Works seamlessly on both desktop and mobile devices
- **Error Handling**: Clear messages for invalid searches or API limitations

## Technical Requirements

### Frontend

- React (or another frontend framework of your choice)
- State management using React hooks or other state management libraries
- Responsive design using CSS or UI library
- Proper error handling and loading states

### API Integration

- GitHub REST API for fetching user and repository data
- Proper handling of API rate limits and errors

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd github-user-search
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:

   ```bash
   npm start
   # or
   yarn start
   ```

4. The application should now be running at `http://localhost:3000`

## API Information

This application uses the GitHub REST API. The main endpoints used are:

- User search: `https://api.github.com/search/users?q={username}`
- User details: `https://api.github.com/users/{username}`
- User repositories: `https://api.github.com/users/{username}/repos`

Note: GitHub API has rate limits. For unauthenticated requests, the rate limit is 60 requests per hour.

## Project Structure

```
src/
  ├── components/       # Reusable components
  ├── pages/           # Main application pages
  ├── services/        # API service functions
  ├── utils/           # Helper utilities
  ├── App.js           # Main application component
  └── index.js         # Entry point
```

## Evaluation Criteria

The assignment will be evaluated based on:

1. **Functionality**: Does the application meet all the requirements?
2. **Code Quality**: Is the code well-structured, maintainable, and following best practices?
3. **UI/UX Design**: Is the interface intuitive, responsive, and visually appealing?
4. **Error Handling**: How well does the application handle errors and edge cases?
5. **Performance**: Is the application optimized for performance?

## Submission Guidelines

1. Create a GitHub repository with your code
2. Deploy the application using GitHub Pages, Vercel, or Netlify
3. Provide a README with setup instructions and any additional notes
4. Submit the repository URL and the deployed application URL

## Resources

- [GitHub REST API Documentation](https://docs.github.com/en/rest)
- [React Documentation](https://reactjs.org/docs/getting-started.html)

---

_This is a frontend assignment for the interview process at Graphy._
