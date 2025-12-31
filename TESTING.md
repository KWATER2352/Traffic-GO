# Testing Guide for Traffic-GO

## Overview
This project uses **Jest** and **React Testing Library** for unit and integration testing.

## Test Structure
```
__tests__/
├── trafficUpdate.test.js         # Component tests
├── integration/
│   └── trafficAPI.test.js        # API integration tests
└── utils/
    └── trafficHelpers.test.js    # Helper function tests
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode (re-runs on file changes)
```bash
npm run test:watch
```

### Run tests with coverage report
```bash
npm run test:coverage
```

## What's Being Tested

### 1. **Unit Tests** (`__tests__/trafficUpdate.test.js`)
- Component rendering
- Loading states
- Permission handling
- Traffic data display
- Traffic level calculation

### 2. **Integration Tests** (`__tests__/integration/trafficAPI.test.js`)
- API calls to Google Maps
- Response handling
- Error handling
- Traffic ratio calculations

### 3. **Helper Function Tests** (`__tests__/utils/trafficHelpers.test.js`)
- Region coordinate calculations
- Status color mapping
- Icon selection logic
- Traffic ratio edge cases

## Test Coverage
Current coverage includes:
- ✅ Component lifecycle
- ✅ Location permissions
- ✅ API integration
- ✅ Traffic classification logic
- ✅ UI rendering

## Mocked Dependencies
The following are mocked for testing:
- `expo-location` - Location services
- `axios` - HTTP requests
- `@expo/vector-icons` - Icon components
- `react-native-maps` - Map components
- `@react-native-async-storage/async-storage` - Storage

## Writing New Tests

### Component Test Example
```javascript
import { render, waitFor } from '@testing-library/react-native';
import MyComponent from '../assets/components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    const { getByText } = render(<MyComponent />);
    expect(getByText('Expected Text')).toBeTruthy();
  });
});
```

### API Test Example
```javascript
import axios from 'axios';

jest.mock('axios');

it('fetches data successfully', async () => {
  axios.get.mockResolvedValue({ data: { key: 'value' } });
  const response = await axios.get('/api/endpoint');
  expect(response.data.key).toBe('value');
});
```

## Best Practices
1. Clear all mocks before each test: `jest.clearAllMocks()`
2. Use descriptive test names
3. Test one thing per test case
4. Use `waitFor` for async operations
5. Mock external dependencies
6. Aim for >80% code coverage

## Troubleshooting

### Tests timing out
Increase timeout in test:
```javascript
await waitFor(() => { ... }, { timeout: 5000 });
```

### Mock not working
Ensure mock is before imports:
```javascript
jest.mock('module-name');
import Component from './Component';
```

### Coverage gaps
Run coverage report to see untested lines:
```bash
npm run test:coverage
```
