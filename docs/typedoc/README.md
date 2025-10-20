**SAR - System Authorization Review v1.0.0**

***

# SAR - System Authorization Review

A comprehensive system authorization review application built with React, TypeScript, and modern web technologies.

## 🚀 Features

- **User Authentication & Authorization** - Secure login with role-based access control
- **UAR (User Access Review)** - Track and manage user access reviews with progress visualization
- **Application Management** - Manage applications and their access controls
- **Audit Logging** - Comprehensive logging and monitoring of all system activities
- **Responsive Design** - Works seamlessly across desktop, tablet, and mobile devices
- **Security First** - Built with ISO 27001 compliance in mind

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite
- **State Management**: Zustand
- **Routing**: React Router DOM
- **Charts**: Chart.js with React Chart.js 2
- **Security**: DOMPurify, Validator.js
- **Testing**: Playwright (E2E), Jest (Unit), Testing Library
- **Build Tool**: Vite
- **Package Manager**: pnpm

## 📁 Project Structure

```
SAR-1/
├── src/
│   ├── components/          # React components
│   │   ├── features/        # Feature-based components
│   │   │   ├── auth/        # Authentication components
│   │   │   ├── uar/         # UAR components
│   │   │   ├── application/ # Application management
│   │   │   └── logging/     # Logging components
│   │   └── common/          # Shared components
│   ├── services/            # Business logic services
│   ├── store/               # Zustand state management
│   ├── hooks/               # Custom React hooks
│   ├── utils/               # Utility functions
│   ├── config/              # Configuration files
│   └── constants/           # Application constants
├── tests/                   # Playwright E2E tests
│   ├── auth/                # Authentication tests
│   ├── uar/                 # UAR tests
│   ├── application/         # Application tests
│   ├── api/                 # API tests
│   ├── page-objects/        # Page Object Models
│   ├── fixtures/            # Test data
│   └── utils/               # Test utilities
├── public/                  # Static assets
└── dist/                    # Build output
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SAR-1
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Install Playwright browsers**
   ```bash
   pnpm run test:e2e:install
   ```

### Development

1. **Start development server**
   ```bash
   pnpm run dev
   ```

2. **Open browser**
   Navigate to `http://localhost:3001`

### Testing

#### Unit Tests
```bash
# Run unit tests
pnpm run test

# Run tests in watch mode
pnpm run test:watch

# Run tests with coverage
pnpm run test:coverage
```

#### E2E Tests
```bash
# Run E2E tests
pnpm run test:e2e

# Run E2E tests with UI
pnpm run test:e2e:ui

# Run E2E tests in headed mode
pnpm run test:e2e:headed

# Debug E2E tests
pnpm run test:e2e:debug

# Generate test code
pnpm run test:e2e:codegen

# View test report
pnpm run test:e2e:report
```

#### Run All Tests
```bash
pnpm run test:all
```

### Building for Production

```bash
# Build the application
pnpm run build

# Preview production build
pnpm run preview
```

## 🔐 Login Credentials

### Development Mode
- **Username**: `admin` | **Password**: `password123` | **Role**: Admin
- **Username**: `dph` | **Password**: `password123` | **Role**: DpH  
- **Username**: `systemowner` | **Password**: `password123` | **Role**: System Owner

> ⚠️ **Note**: These are mock credentials for development only. In production, use strong passwords and proper authentication.

## 🧪 Testing Strategy

### Test Structure (Context7 Best Practices)

- **Page Object Models** - Reusable page interactions
- **Test Data Fixtures** - Centralized test data management
- **Test Utilities** - Common helper functions
- **Feature-based Organization** - Tests organized by application features
- **Multi-browser Testing** - Chrome, Firefox, Safari support
- **API Testing** - Separate API endpoint testing
- **Visual Regression** - Screenshot comparison testing

### Test Coverage

- **Authentication** - Login, logout, session management
- **UAR Functionality** - Progress tracking, filtering, data display
- **Application Management** - CRUD operations, search, filtering
- **API Endpoints** - Authentication, data retrieval, error handling
- **Security** - XSS prevention, SQL injection protection, input validation
- **Responsive Design** - Mobile, tablet, desktop compatibility
- **Performance** - Network conditions, loading states, error handling

## 🔒 Security Features

- **Input Validation** - Comprehensive client-side validation
- **XSS Protection** - DOMPurify sanitization
- **SQL Injection Prevention** - Parameterized queries
- **Session Management** - Secure token handling
- **Audit Logging** - Complete activity tracking
- **Account Lockout** - Brute force protection
- **CSRF Protection** - Cross-site request forgery prevention

## 📊 Performance Optimizations

- **Code Splitting** - Lazy loading of components
- **Memoization** - React.memo, useMemo, useCallback
- **Bundle Optimization** - Tree shaking, minification
- **Caching** - API response caching
- **Debouncing** - Search and input debouncing
- **Virtual Scrolling** - Large list optimization

## 🌐 Browser Support

- **Chrome** 90+
- **Firefox** 88+
- **Safari** 14+
- **Edge** 90+

## 📱 Responsive Breakpoints

- **Mobile**: 375px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px+

## 🚀 Deployment

### Environment Variables

```env
REACT_APP_API_BASE_URL=http://localhost:3001/api
REACT_APP_ENVIRONMENT=development
```

### Build Commands

```bash
# Production build
pnpm run build

# Preview build
pnpm run preview
```

## 📈 Monitoring & Analytics

- **Error Tracking** - Comprehensive error logging
- **Performance Monitoring** - Core Web Vitals tracking
- **User Analytics** - Usage pattern analysis
- **Security Monitoring** - Threat detection and response

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the test examples

## 🔄 Changelog

### Version 1.0.0
- Initial release
- Authentication system
- UAR functionality
- Application management
- Comprehensive testing suite
- Security features
- Responsive design

## Variables

### Application

- [default](variables/default.md)
