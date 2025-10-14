# System Authorization Review

## Overview

System Authorization Review (SAR) is a comprehensive application designed to manage and review user access permissions across various systems within an organization. This application follows Test-Driven Development (TDD) and Behavior-Driven Development (BDD) principles to ensure high-quality, reliable code.

## Features

- User authentication and authorization
- Application management
- User Access Review (UAR) system
- System master data management
- Logging and monitoring
- Schedule management
- UAR Person in Charge (PIC) management

## Technology Stack

- React 18+
- TypeScript
- Tailwind CSS
- Jest
- React Testing Library
- Vite

## TDD/BDD Approach

This project follows Test-Driven Development (TDD) and Behavior-Driven Development (BDD) principles:

### Test-Driven Development (TDD)

1. **Write tests first**: Before implementing any new feature or fixing a bug, we write tests that define the expected behavior.
2. **Run tests**: Initially, these tests will fail because the functionality doesn't exist yet.
3. **Write minimal code**: Write just enough code to make the tests pass.
4. **Refactor**: Improve the code while ensuring all tests still pass.
5. **Repeat**: Continue this cycle for each new feature or improvement.

### Behavior-Driven Development (BDD)

1. **Define behaviors**: We define how the application should behave from a user's perspective using Gherkin syntax (Given-When-Then).
2. **Collaborate**: BDD encourages collaboration between developers, testers, and business stakeholders to ensure everyone understands the expected behavior.
3. **Automate**: We automate these behavioral specifications as tests.

For detailed BDD scenarios, please refer to [BDD_DOCUMENTATION.md](BDD_DOCUMENTATION.md).

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```bash
   cd system-authorization-review
   ```

3. Install dependencies:
   ```bash
   pnpm install
   ```

### Running the Application

To start the development server:
```bash
pnpm run dev
```

The application will be available at `http://localhost:3000`.

### Running Tests

To run all tests:
```bash
pnpm test
```

To run tests in watch mode:
```bash
pnpm test:watch
```

## Project Structure

```
system-authorization-review/
├── components/          # React components
├── utils/               # Utility functions
├── constants.ts         # Application constants
├── data.ts              # Mock data
├── index.html           # HTML entry point
├── index.tsx            # React entry point
├── App.tsx              # Main application component
├── types.ts             # TypeScript types
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
├── jest.config.cjs     # Jest configuration
├── BDD_DOCUMENTATION.md # BDD scenarios documentation
└── README.md           # Project documentation
```

## Development Guidelines

1. **Follow TDD**: Always write tests before implementing new features
2. **Use BDD**: Define behaviors using Gherkin syntax before implementation
3. **Component-based architecture**: Keep components small, focused, and reusable
4. **Type safety**: Use TypeScript to ensure type safety throughout the application
5. **Responsive design**: Ensure all components are responsive and work well on different screen sizes
6. **Accessibility**: Follow WCAG guidelines to ensure the application is accessible to all users

## Contributing

1. Fork the repository
2. Create a new branch for your feature or bug fix
3. Write tests for your changes
4. Implement your changes
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.