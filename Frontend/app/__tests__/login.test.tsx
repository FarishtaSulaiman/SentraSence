import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import Login from "../login";

/**
 * Mockar expo-auth-session.
 *
 * I testmiljö finns ingen riktig Expo app-manifest,
 * därför måste makeRedirectUri mockas så att
 * Login-komponenten inte kraschar.
 */
jest.mock("expo-auth-session", () => ({
  makeRedirectUri: jest.fn(() => "sentrasense://redirect"),
}));

/**
 * Mockar Google Auth-hooken.
 *
 * Vi vill INTE anropa riktig Google-inloggning i tester.
 * Därför ersätter vi useAuthRequest med en fejkad version.
 */
jest.mock("expo-auth-session/providers/google", () => ({
  useAuthRequest: jest.fn(),
}));

/**
 * Mockar expo-router.
 *
 * Vi vill inte att riktiga navigationer sker under tester.
 */
jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
  },
}));

/**
 * Mock-funktion som representerar Google popup/login-fönstret.
 *
 * Denna funktion ska anropas när användaren trycker
 * på "Logga in med Google".
 */
const mockPromptAsync = jest.fn();

/**
 * Hämtar vår mockade version av useAuthRequest
 * så att vi kan styra vad den returnerar i testerna.
 */
const mockUseAuthRequest = require("expo-auth-session/providers/google")
  .useAuthRequest as jest.Mock;

describe("Login screen", () => {
  /**
   * Körs före varje test.
   *
   * Återställer alla mocks och sätter upp
   * standardbeteende för Google Auth.
   */
  beforeEach(() => {
    jest.clearAllMocks();

    /**
     * useAuthRequest returnerar normalt:
     * [request, response, promptAsync]
     *
     * Här fejkar vi:
     * - att request finns
     * - att inget svar kommit ännu
     * - att promptAsync är vår mockfunktion
     */
    mockUseAuthRequest.mockReturnValue([
      { clientId: "test-client-id" },
      null,
      mockPromptAsync,
    ]);
  });

  /**
   * Testar att Google-knappen visas på skärmen.
   */
  it("should render Google login button", () => {
    const { getByText } = render(<Login />);

    expect(getByText("Logga in med Google")).toBeTruthy();
  });

  /**
   * Testar att promptAsync anropas när användaren
   * trycker på Google-knappen.
   *
   * Detta motsvarar att Google login-flödet startar.
   */
  it("should call promptAsync when Google button is pressed", () => {
    const { getByText } = render(<Login />);

    fireEvent.press(getByText("Logga in med Google"));

    expect(mockPromptAsync).toHaveBeenCalledTimes(1);
  });

  /**
   * Testar att komponenten fortfarande renderas
   * även om Google-svaret saknar access token.
   *
   * Detta verifierar att appen inte kraschar
   * vid ett ogiltigt eller ofullständigt svar.
   */
  it("should render Google login button even if response has no access token", () => {
    mockUseAuthRequest.mockReturnValue([
      { clientId: "test-client-id" },

      /**
       * Simulerar ett "success"-svar från Google
       * utan access token.
       */
      { type: "success", authentication: null, params: {} },

      mockPromptAsync,
    ]);

    const { getByText } = render(<Login />);

    expect(getByText("Logga in med Google")).toBeTruthy();
  });
});
