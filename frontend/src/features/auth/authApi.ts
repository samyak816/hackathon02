export interface User {
  email: string;
  name: string;
}

const API_URL = "https://hackathon02-5pmxe44fw-samyak816s-projects.vercel.app/auth";

/**
 * Checks if a user is currently "logged in" by looking at localStorage.
 * We still use localStorage here just to persist the session in the browser.
 */
export async function getUser(): Promise<User | null> {
  const raw = localStorage.getItem("triage_user");
  return raw ? JSON.parse(raw) : null;
}

/**
 * Connects to the Flask /signin endpoint.
 * If successful, it saves the user object to localStorage for the session.
 */
export async function signIn(email: string, password: string): Promise<User | null> {
  try {
    const response = await fetch(`${API_URL}/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      return null;
    }

    const user: User = await response.json();
    
    // Persist the user session locally
    localStorage.setItem("triage_user", JSON.stringify(user));
    return user;
  } catch (error) {
    console.error("Auth Error:", error);
    return null;
  }
}

/**
 * Connects to the Flask /signup endpoint to create a new record in Neon Postgres.
 */
export async function signUp(name: string, email: string, password: string): Promise<User> {
  const response = await fetch(`${API_URL}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Signup failed");
  }

  // After successful signup, we treat them as logged in
  const user = { email, name };
  localStorage.setItem("triage_user", JSON.stringify(user));
  return user;
}

/**
 * Clears the session from the browser.
 */
export async function signOut(): Promise<void> {
  localStorage.removeItem("triage_user");
}