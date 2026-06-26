import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

// 1) Allez sur https://console.cloud.google.com -> créez un projet
// 2) Activez l'API "Google Calendar API" (bibliothèque d'API)
// 3) Écran de consentement OAuth -> configurez le type "Externe", ajoutez votre email en testeur
// 4) Identifiants -> créer un identifiant OAuth -> type "Application Web" (pour Expo Go)
//    et un autre de type "Android" avec le package name de app.json si vous buildez l'APK
// 5) Collez le Client ID Web ci-dessous
export const GOOGLE_CLIENT_ID = 'REMPLACER_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
export const isGoogleConfigured = !GOOGLE_CLIENT_ID.startsWith('REMPLACER');

const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
};

export function useGoogleAuthRequest() {
  return AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_ID,
      scopes: ['https://www.googleapis.com/auth/calendar.events'],
      redirectUri: AuthSession.makeRedirectUri(),
      responseType: AuthSession.ResponseType.Token,
    },
    discovery
  );
}

export async function createCalendarEvent(
  accessToken: string,
  event: { title: string; description?: string; date: string }
) {
  const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      summary: event.title,
      description: event.description ?? '',
      start: { date: event.date },
      end: { date: event.date },
    }),
  });
  if (!res.ok) throw new Error(`Erreur Google Calendar: ${res.status}`);
  return res.json();
}
