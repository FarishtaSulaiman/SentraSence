# GoogleAuth – kör lokalt

GoogleAuth är nu mergat i `dev` ✅

För att köra projektet lokalt efter att ni dragit ner senaste `dev`, gör så här:

## 1. Hämta senaste dev

```bash
git checkout dev
git pull origin dev
```

## 2. Frontend

Gå till frontend-mappen:

```bash
cd Frontend
npm install
```

GoogleAuth är uppdelat per plattform:

- **Webb:** `expo-auth-session`
- **Android:** native Google Sign-In via `@react-native-google-signin/google-signin`

Starta frontend:

```bash
npx expo start
```

För att testa i webbläsaren:

- Tryck `w` i terminalen
- eller kör:

```bash
npx expo start --web
```

## 3. Backend

Gå till backend-mappen:

```bash
cd Backend
dotnet restore
```

### Lägg in connection string via User Secrets

Lägg in connection string via User Secrets om det inte redan är gjort sedan tidigare.

Om backend redan har körts lokalt mot Azure-databasen behöver detta steg inte göras igen.

Kommandon (vid behov):

```bash
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "ER_CONNECTION_STRING"
```

Starta backend:

```bash
dotnet run
```

## 4. Testa GoogleAuth på webb

När både frontend och backend kör:

1. Gå till login eller registrering.
2. Tryck på Google-knappen.
3. Välj Google-konto.
4. Frontend hämtar Google-användaren.
5. Frontend skickar `email`, `name`, `googleId` och `picture` till backend.
6. Vid login kontrollerar backend att användaren finns.
7. Vid registrering skapar backend en ny användare, eller visar fel om kontot redan finns.
8. Backend returnerar `appUser`.

## 5. Android

GoogleAuth på Android använder native Google Sign-In och fungerar därför **inte** via Expo Go.

För att testa riktig GoogleAuth på Android krävs:

- fysisk Android-enhet eller emulator
- development build av appen

### Starta backend för Android-test

Gå till backend-mappen och starta backend så att mobilen/emulatorn kan nå den:

```bash
cd Backend
dotnet run --urls "http://0.0.0.0:5255"
```

### Starta frontend för Android-test

Gå till frontend-mappen:

```bash
cd Frontend
```

Om en development build redan finns installerad på enheten/emulatorn, starta frontend med:

```bash
npx expo start --dev-client
```

Öppna sedan development build-appen på Android-enheten/emulatorn.

#### Första gången Android-builden installeras

Om development build ännu inte finns installerad på Android-enheten/emulatorn behöver den byggas och installeras först:

```bash
npx expo run:android
```

Detta bygger och installerar Android-appen lokalt. Därefter kan appen vanligtvis startas framöver med:

```bash
npx expo start --dev-client
```

### Viktigt vid Android-test lokalt

För att mobilappen ska nå backend lokalt behöver `API_BASE_URL` peka på datorns lokala IP-adress, inte `localhost`.

Exempel:

```js
const API_BASE_URL = "http://192.168.x.x:5255";
```

Backendens CORS-konfiguration behöver också tillåta motsvarande lokala frontend-origin.

Detta behövs främst vid Android-testning. GoogleAuth för webb kan testas fullt ut utan Android-enhet.

(iOS med GoogleAuth inte implementerat i MVP)

---

### Viktigt just nu

Vi använder just nu GoogleAuth som aktiv auth för MVP.

E-post/lösenord-login, vanlig registrering och forgot password är pausat tills vi bestämmer om vi ska stödja det senare.

Vid Android-testning lokalt behöver varje utvecklare:

1. Ändra `API_BASE_URL` i `login.tsx` och `register.tsx` till sin egen lokala IP-adress.
2. Lägga till sin Expo-origin i `Program.cs`, exempelvis:
   `"http://192.168.x.x:8081"`
3. Starta backend med:
   `dotnet run --urls "http://0.0.0.0:5255"`

Webbtestning kräver inga sådana ändringar och fungerar som vanligt via `localhost`.
