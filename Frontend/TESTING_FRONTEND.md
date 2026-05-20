# Testa Frontend (React Native/Expo)

## Förutsättningar
- Node.js och npm installerat
- Alla beroenden installerade (`npm install` i Frontend-mappen)

## Testbibliotek
- Vi använder **Jest** och **@testing-library/react-native** för tester.

## Köra tester

1. Gå till frontend-mappen:
   ```sh
   cd Frontend
   ```
2. Kör testerna:
   ```sh
   npm test
   ```
   eller
   ```sh
   npx jest
   ```

## Lägga till egna tester
- Lägg testfiler i `app/__tests__/` eller bredvid komponenten med filändelsen `.test.tsx` eller `.test.ts`.
- Exempel på testfil: `app/__tests__/login.test.tsx`

## Exempel på enkel test
```tsx
import { render } from '@testing-library/react-native';
import MyComponent from '../MyComponent';

test('visar rätt text', () => {
  const { getByText } = render(<MyComponent />);
  expect(getByText('Hej!')).toBeTruthy();
});
```

## Tips
- Mocka externa beroenden (t.ex. Google-auth) för att isolera tester.
- Använd `npm test -- --watch` för att köra tester automatiskt vid filändringar.
- Läs mer: https://testing-library.com/docs/react-native-testing-library/intro/
