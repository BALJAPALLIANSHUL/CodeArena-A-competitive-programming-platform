# Contributing to CodeArena

Thank you for your interest in contributing to CodeArena! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Java >= 17
- Maven >= 3.8
- Docker (for judge service)
- Git

### Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/codearena.git`
3. Install dependencies: `npm run install:all`
4. Set up environment variables: `cp env.example .env`
5. Start development servers: `npm run dev:all`

## 📋 Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

- Follow the coding standards (see below)
- Write tests for new functionality
- Update documentation as needed

### 3. Test Your Changes

```bash
# Run all tests
npm run test:all

# Run specific tests
npm run test          # Frontend tests
npm run test:backend  # Backend tests
```

### 4. Commit Your Changes

```bash
git add .
git commit -m "feat: add new feature description"
```

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

## 📝 Coding Standards

### Frontend (React/JavaScript)

- Use **ESLint** and **Prettier** for code formatting
- Follow **React Hooks** best practices
- Use **TypeScript** for type safety (when applicable)
- Write **JSDoc** comments for functions and components
- Use **Tailwind CSS** for styling

### Backend (Java/Spring Boot)

- Follow **Java coding conventions**
- Use **JavaDoc** comments for classes and methods
- Follow **Spring Boot** best practices
- Use **Lombok** for boilerplate code reduction
- Write **unit tests** for all business logic

### General Guidelines

- Write **clear, descriptive commit messages**
- Keep functions and methods **small and focused**
- Use **meaningful variable and function names**
- Add **comments** for complex logic
- Follow **DRY (Don't Repeat Yourself)** principle

## 🧪 Testing Guidelines

### Frontend Testing

- Use **Vitest** for unit testing
- Write tests for all components and hooks
- Test user interactions and edge cases
- Maintain good test coverage (>80%)

### Backend Testing

- Use **JUnit 5** and **Mockito** for unit tests
- Write **integration tests** for API endpoints
- Test **error scenarios** and edge cases
- Use **TestContainers** for database tests

### Test Naming Convention

```javascript
// Frontend
describe('ComponentName', () => {
  it('should do something when condition', () => {
    // test implementation
  });
});

// Backend
@Test
void shouldDoSomething_whenCondition() {
    // test implementation
}
```

## 📚 Documentation

### Code Documentation

- **JSDoc** for JavaScript/TypeScript functions
- **JavaDoc** for Java classes and methods
- **README** files for each major component
- **Inline comments** for complex logic

### API Documentation

- Use **Swagger/OpenAPI** for API documentation
- Keep **endpoint descriptions** up to date
- Document **request/response examples**
- Include **error codes and messages**

## 🔧 Development Tools

### Recommended VS Code Extensions

- **ESLint** - JavaScript linting
- **Prettier** - Code formatting
- **Java Extension Pack** - Java development
- **Spring Boot Extension Pack** - Spring Boot development
- **Tailwind CSS IntelliSense** - Tailwind CSS support
- **GitLens** - Git integration

### Useful Commands

```bash
# Development
npm run dev:all          # Start all services
npm run dev              # Start frontend only
npm run dev:backend      # Start backend only

# Testing
npm run test:all         # Run all tests
npm run test             # Frontend tests
npm run test:backend     # Backend tests

# Building
npm run build:all        # Build all components
npm run build            # Build frontend
npm run build:backend    # Build backend

# Code Quality
npm run lint             # Lint frontend code
npm run lint:fix         # Fix linting issues
```

## 🐛 Bug Reports

### Before Submitting a Bug Report

1. Check if the bug has already been reported
2. Try to reproduce the bug with the latest version
3. Check the documentation and existing issues

### Bug Report Template

```markdown
**Bug Description**
A clear description of what the bug is.

**Steps to Reproduce**

1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected Behavior**
What you expected to happen.

**Actual Behavior**
What actually happened.

**Environment**

- OS: [e.g. Windows 10, macOS, Ubuntu]
- Browser: [e.g. Chrome, Firefox, Safari]
- Version: [e.g. 1.0.0]

**Additional Context**
Any other context about the problem.
```

## 💡 Feature Requests

### Feature Request Template

```markdown
**Feature Description**
A clear description of the feature you'd like to see.

**Use Case**
How would this feature be used? What problem does it solve?

**Proposed Solution**
Any ideas you have for implementation.

**Alternative Solutions**
Any alternative solutions you've considered.

**Additional Context**
Any other context or screenshots about the feature request.
```

## 🔄 Pull Request Process

### Before Submitting a PR

1. **Test thoroughly** - Ensure all tests pass
2. **Update documentation** - Update README, API docs, etc.
3. **Check formatting** - Run linters and formatters
4. **Review your changes** - Self-review your code

### PR Template

```markdown
## Description

Brief description of changes made.

## Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist

- [ ] Code follows the style guidelines
- [ ] Self-review of code completed
- [ ] Documentation updated
- [ ] No new warnings generated
```

## 🏷️ Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to the build process or auxiliary tools

### Examples

```
feat: add user authentication system
fix(auth): resolve token validation issue
docs: update API documentation
style: format code with prettier
refactor: extract common utility functions
test: add unit tests for user service
```

## 🤝 Code Review Process

### Review Guidelines

- **Be constructive** - Provide helpful feedback
- **Be specific** - Point out exact issues
- **Be respectful** - Maintain a positive tone
- **Focus on code** - Avoid personal comments

### Review Checklist

- [ ] Code follows project standards
- [ ] Tests are included and pass
- [ ] Documentation is updated
- [ ] No security vulnerabilities
- [ ] Performance considerations addressed

## 📞 Getting Help

### Communication Channels

- **GitHub Issues**: For bug reports and feature requests
- **GitHub Discussions**: For general questions and discussions
- **Email**: support@codearena.com (for private matters)

### Resources

- [Project Documentation](README.md)
- [Architecture Guide](docs/ARCHITECTURE.md)
- [API Documentation](backend/README.md)
- [Frontend Guide](frontend/README.md)

## 🙏 Recognition

Contributors will be recognized in:

- **README.md** contributors section
- **Release notes** for significant contributions
- **GitHub contributors** page

Thank you for contributing to CodeArena! 🎉
