 a complete extraction of the assignment details from the uploaded PDF:

 Task Management Dashboard Assignment

 Objective

 Build a Task Management Dashboard that allows users to:

 Create tasks

 Manage tasks

 Track task progress efficiently


 The assignment evaluates:

 React development skills

 Application structure

 Functionality

 UI/UX polish



 ---

 Core Requirements

 1. Task Creation

 Users must be able to create tasks with:

 Title

 Description

 Priority

 Low

 Medium

 High


 Due Date



 ---

 2. Task Display

 Mandatory

 Display tasks in a List View


 Bonus

 Add a toggle-based Card View


 Each task should display:

 Title

 Description

 Priority

 Due Date

 Status

 Completed

 Pending




 ---

 3. Edit Tasks

 Users must be able to edit existing tasks.

 Allowed approaches:

 Inline editing

 Modal-based editing



 ---

 4. Delete Tasks

 Requirements:

 Users can delete tasks

 Show a confirmation prompt before deletion



 ---

 5. Task Status Management

 Users should be able to:

 Mark tasks as Complete

 Mark tasks as Incomplete


 UI should visually indicate status using examples like:

 Strikethrough

 Opacity changes

 Color coding



 ---

 6. Search & Filter

 Search

 Provide a search bar to filter tasks by:

 Title

 Description


 Filters

 Status Filters

 All Tasks

 Pending Tasks

 Completed Tasks


 Priority Filters

 Low

 Medium

 High



 ---

 7. Task Count

 Display counts for:

 Total Tasks

 Pending Tasks

 Completed Tasks



 ---

 8. Data Persistence

 Task data must persist using:

 localStorage or

 IndexedDB


 Tasks should remain after page refresh.


 ---

 9. Responsive Design

 Application must work properly on:

 Desktop

 Tablet

 Mobile



 ---

 Bonus Features

 Optional but appreciated:

 Card view toggle

 Dark / Light mode

 Drag-and-drop task reordering

 Smooth animations & micro-interactions

 TypeScript

 Unit tests

 Jest

 React Testing Library




 ---

 Submission Instructions

 1. GitHub Repository

 Push code to a public GitHub repository.

 2. README.md

 Include:

 Setup instructions

 Screenshots

 Design decisions


 3. Deployment

 Deploy the app using:

 Vercel

 Netlify

 GitHub Pages


 Include the live URL in the README.

 4. Submission Deadline

 Share the repository link with the TA team within 48 hours of receiving the assignment.


 ---

 Suggested Tech Stack (recommended approach)

 Frontend

 React

 TypeScript (bonus)

 Tailwind CSS or CSS Modules


 State Management

 React Context

 Zustand

 Redux Toolkit (optional)


 Persistence

 localStorage (simpler)

 IndexedDB (advanced)


 Deployment

 Vercel

 Netlify

 GitHub Pages



 ---

 Recommended Folder Structure

 src/
  ├── components/
   ├── pages/
    ├── hooks/
     ├── context/
      ├── utils/
       ├── types/
        ├── styles/
         └── App.tsx


         ---

         Suggested Feature Priority

         Must-Have First

         1. Task CRUD


         2. Status toggle


         3. Search/filter


         4. localStorage persistence


         5. Responsive UI



         Then Add

         6. Card/List toggle


         7. Dark mode


         8. Animations


         9. Drag & drop


         10. Tests




         ---

         What Interviewers/TAs Will Likely Evaluate

         Code Quality

         Clean components

         Reusable logic

         Proper folder structure


         UI/UX

         Responsive layout

         Visual clarity

         Smooth interactions


         React Skills

         State management

         Props handling

         Component architecture


         Problem Solving

         Filtering logic

         Persistence

         Edge cases



         ---

         Good Extra Enhancements

         Ideas that can make the project stand out:

         Sorting by due date

         Empty states

         Toast notifications

         Keyboard accessibility

         Priority badges

         Deadline overdue highlighting

         Loading skeletons

         Framer Motion animations

         Optimistic UI updates
