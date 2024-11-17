Use existing principles in the notepad and the playwright best practices plus doc help me generate a notepad that allows me to effectively write playwright test for my application

# Playwright Testing Guidelines

## Core Principles

### Test Organization
- Store all tests under `tests/` folder
- Name test files based on system/business components, not React components
- Group related tests using describe blocks
- Use isolation - each test should be independent and not rely on other tests

### Test Structure
```typescript
import { test, expect } from '@playwright/test';
test.describe('Component/Feature Name', () => {
test.beforeEach(async ({ page }) => {
// Setup - clean state before each test
});
test('should [expected behavior]', async ({ page }) => {
// Arrange
// Act
// Assert
});
});
```

### Locator Priority
1. Role-based locators (PREFERRED)
```typescript
page.getByRole('button', { name: 'Submit' })
page.getByRole('textbox', { name: 'Email' })
```

2. Text-based locators
```typescript
page.getByText('Welcome')
page.getByText('Password')
```

3. Test IDs (LAST RESORT)
```typescript
page.getByTestId('submit-button')
``` 

### Best Practices

#### DO
- Test user-visible behavior and outcomes
- Use role-based locators whenever possible
- Keep tests isolated and independent
- Clean up test data in beforeEach/afterEach hooks
- Use meaningful test descriptions that explain the expected behavior
- Mock external dependencies and APIs

#### DON'T  
- Test implementation details
- Create brittle tests that depend on specific CSS/markup
- Share state between tests
- Write flaky tests that could fail intermittently
- Test third-party code/components
- Create unnecessary test IDs just for testing

### Error Handling
- Use try/catch for expected errors
- Add meaningful error messages
- Test both success and error scenarios
- Validate error states and messages

### Example Test Structure
```typescript
import { test, expect } from '@playwright/test';
test.describe('Authentication', () => {
test.beforeEach(async ({ page }) => {
await page.goto('/login');
});
test('should login successfully with valid credentials', async ({ page }) => {
// Input credentials
await page.getByRole('textbox', { name: 'Email' }).fill('user@example.com');
await page.getByRole('textbox', { name: 'Password' }).fill('password123');
// Submit form
await page.getByRole('button', { name: 'Sign in' }).click();
// Verify successful login
await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});
});
```

### Common Gotchas
- Avoid timing-based tests - use proper wait conditions instead
- Don't test styles directly unless critical for functionality
- Avoid testing implementation details that could change
- Be cautious with animations/transitions that could cause flakiness

### Performance Considerations
- Run tests in parallel when possible
- Use test sharding for large test suites
- Keep individual tests focused and quick
- Clean up resources after tests complete

### Debugging Tips
- Use `test.only()` to run specific tests
- Leverage Playwright Inspector for debugging
- Add `await page.pause()` to pause execution
- Use trace viewer for post-mortem analysis