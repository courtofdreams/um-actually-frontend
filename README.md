
### Project Overview
This project is a frontend application built with React and TypeScript. It provides users with the ability to analyze text or YouTube video content for accuracy, delivering feedback on the correctness of statements made within the input. 

### Features
- **Text Analysis**: Users can input text directly into the application for analysis fact-checking purposes.
- **YouTube Video Analysis**: Users can provide a YouTube video URL, and the application will extract and analyze the video's transcript.

### Technologies Used
- React
- TypeScript
- Tailwind CSS
- Vite

### Getting Started
To run this project locally, follow these steps:
1. Clone the repository then Navigate to the project directory
2. Install the dependencies
    ```bash
    npm install
    ```
3. Start the development server:
    ```bash
    npm start
    ```

## Directory Structure
```
components                      # React components
├── Main.tsx                    # Main component for user input
├── TextAnalysis.tsx            # Component for displaying text analysis results (Task 1) 
└── VideoAnalysis.tsx           # Component for displaying video analysis results (Task 2 % 3)
context                         # Context providers for state management
└── AppContext.tsx              # Application-wide context
styles                          # Global styles and CSS files
└── components.css              # Main CSS for shared components like primary buttons and etc.
└── variables.css               # CSS variables for system colors 
...
```

### Deployment
- Pending