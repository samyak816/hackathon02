export interface User {
  email: string;
  name: string;
}

export function getUser(): User | null {
  const raw = localStorage.getItem("triage_user");
  return raw ? JSON.parse(raw) : null;
}

export function signIn(email: string, password: string): User | null {
  const users = JSON.parse(localStorage.getItem("triage_users") || "[]");
  const found = users.find((u: any) => u.email === email && u.password === password);
  if (!found) return null;
  const user = { email: found.email, name: found.name };
  localStorage.setItem("triage_user", JSON.stringify(user));
  return user;
}

export function signUp(name: string, email: string, password: string): User {
  const users = JSON.parse(localStorage.getItem("triage_users") || "[]");
  users.push({ name, email, password });
  localStorage.setItem("triage_users", JSON.stringify(users));
  const user = { email, name };
  localStorage.setItem("triage_user", JSON.stringify(user));
  return user;
}

export function signOut() {
  localStorage.removeItem("triage_user");
}
