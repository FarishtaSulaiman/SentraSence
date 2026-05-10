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

GoogleAuth använder paketet:

```bash
npx expo install expo-auth-session
```

I koden används Google-providern så här:

```tsx
import * as Google from "expo-auth-session/providers/google";
```

Starta frontend:

```bash
npx expo start
```

## 3. Backend

Gå till backend-mappen:

```bash
cd Backend
dotnet restore
```

Lägg in connection string via User Secrets:

```bash
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "ER_CONNECTION_STRING"
```

Starta backend:

```bash
dotnet run
```

## 4. Testa GoogleAuth

När både frontend och backend kör:

1. Gå till login/register.
2. Tryck på Google-knappen.
3. Välj Google-konto.
4. Frontend hämtar Google user.
5. Frontend skickar `email`, `name`, `googleId` och `picture` till backend.
6. Backend hämtar/skapar användaren i databasen.
7. Backend returnerar `appUser`.

## Viktigt just nu

Vi använder just nu GoogleAuth som aktiv auth för MVP.

E-post/lösenord-login, vanlig registrering och forgot password är pausat/utkommenterat tills vi bestämmer om vi ska stödja det senare.
