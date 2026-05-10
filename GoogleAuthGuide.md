# Guide: Google Auth – Installation & Setup

## Frontend (React Native/Expo)

1. **Installera nödvändiga paket**
   ```sh
   npx expo install expo-auth-session expo-google-auth-session
   ```

2. **Skapa OAuth 2.0 Client ID**
   - Gå till [Google Cloud Console](https://console.cloud.google.com/).
   - Skapa ett nytt projekt (eller välj befintligt).
   - Aktivera "Google Sign-In" API.
   - Skapa OAuth 2.0 Client ID för "Android" och/eller "iOS".
   - Spara `clientId` för respektive plattform.

3. **Lägg till Google Auth i koden**
   - Importera och använd `useAuthRequest` från `expo-auth-session/providers/google`.
   - Exempel:
     ```tsx
     import * as Google from 'expo-auth-session/providers/google';
     // ...i din komponent:
     const [request, response, promptAsync] = Google.useAuthRequest({
       clientId: 'DIN_CLIENT_ID',
       // ev. androidClientId, iosClientId, webClientId
     });
     ```

4. **Hantera svaret**
   - När användaren loggar in, hantera `response` och skicka token till backend för verifiering.

5. **Extra: Android & iOS konfiguration**
   - Följ Expo-dokumentationen för att lägga till rätt `intent-filters` (Android) och URL-scheman (iOS).

6. **Dokumentation**
   - [Expo Google Auth](https://docs.expo.dev/guides/authentication/#google)

---

## Backend (.NET)

1. **Installera Google Auth NuGet-paket**
   ```sh
   dotnet add package Google.Apis.Auth
   ```

2. **Verifiera ID-token**
   - Ta emot ID-token från frontend.
   - Verifiera med Google:
     ```csharp
     using Google.Apis.Auth;
     var payload = await GoogleJsonWebSignature.ValidateAsync(idToken);
     // payload.Email, payload.Name, etc.
     ```

3. **Hantera användarlogik**
   - Skapa eller hämta användare i databasen baserat på Google-kontot.

4. **Dokumentation**
   - [Google.Apis.Auth på NuGet](https://www.nuget.org/packages/Google.Apis.Auth)
   - [Google Sign-In för servrar](https://developers.google.com/identity/sign-in/web/backend-auth)

---

## Tips

- Spara aldrig hemliga nycklar i frontend.
- Testa i både utvecklings- och produktionsmiljö.
- Se till att redirect-URI:er är korrekt konfigurerade i Google Cloud Console.

---

Behöver ni kodexempel eller hjälp med någon del, säg till!
