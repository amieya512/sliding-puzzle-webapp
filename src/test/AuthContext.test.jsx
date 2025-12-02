import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "../context/AuthContext";

// Mock firebase/auth FIRST — use inline mocks to avoid hoisting issues.
vi.mock("firebase/auth", () => {
  return {
    createUserWithEmailAndPassword: vi.fn(),
    signInWithEmailAndPassword: vi.fn(),
    signInWithPopup: vi.fn(),
    sendPasswordResetEmail: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChanged: vi.fn(),
    setPersistence: vi.fn(),
    browserLocalPersistence: "local",

    // factory must return a class or function
    GoogleAuthProvider: vi.fn(function () {
      return {};
    }),
  };
});

// Import the mocked functions
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

// Mock ../firebase
vi.mock("../firebase", () => ({
  auth: { currentUser: null },
}));

// Small component for testing the context
function TestComponent() {
  const { signUp, signIn, signOutUser, startGuest, guest } = useAuth();

  return (
    <div>
      <button onClick={() => signUp("test@example.com", "password123")}>Sign Up</button>
      <button onClick={() => signIn("test@example.com", "password123")}>Sign In</button>
      <button onClick={signOutUser}>Sign Out</button>
      <button onClick={startGuest}>Start Guest</button>

      <div data-testid="guest-status">{guest ? "guest" : "not guest"}</div>
    </div>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // mock auth listener
    onAuthStateChanged.mockImplementation((auth, callback) => {
      callback(null); // simulate no logged-in user
      return vi.fn(); // unsubscribe
    });
  });

  it("creates a user on signUp", async () => {
    createUserWithEmailAndPassword.mockResolvedValue({
      user: { uid: "123", email: "test@example.com" },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    screen.getByText("Sign Up").click();

    await waitFor(() => {
      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        { currentUser: null },
        "test@example.com",
        "password123"
      );
    });
  });

  it("signs in a user on signIn", async () => {
    signInWithEmailAndPassword.mockResolvedValue({
      user: { uid: "123", email: "test@example.com" },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    screen.getByText("Sign In").click();

    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        { currentUser: null },
        "test@example.com",
        "password123"
      );
    });
  });

  it("signs out when signOutUser is called", async () => {
    signOut.mockResolvedValue(undefined);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    screen.getByText("Sign Out").click();

    await waitFor(() => {
      expect(signOut).toHaveBeenCalled();
    });
  });

  it("sets guest mode on startGuest", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId("guest-status").textContent).toBe("not guest");

    screen.getByText("Start Guest").click();

    await waitFor(() => {
      expect(screen.getByTestId("guest-status").textContent).toBe("guest");
    });
  });
});


