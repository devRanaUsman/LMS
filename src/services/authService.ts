// Frontend-only Auth Service
//
// ✅ Today: uses localStorage (no backend required)
// 🔁 Later: replace the methods in this file with real API calls
//    (the rest of the app should not need to change).

export type AuthUser = {
  id: string;
  name: string;
  phone: string; // stored as digits, usually 11 digits starting with 0
};

export type AuthSession = {
  token: string;
  user: AuthUser;
};

export type SignInPayload = {
  phone: string;
  password: string;
};

export type SignUpPayload = {
  name: string;
  phone: string;
  password: string;
};

const LS_USERS_KEY = "wp_auth_users";
const LS_SESSION_KEY = "wp_auth_session";

type StoredUser = AuthUser & { password: string };

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function safeUUID() {
  // crypto.randomUUID() is supported in modern browsers; fallback included
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c: any = globalThis.crypto;
  return c?.randomUUID ? c.randomUUID() : `u_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function normalizePkPhone(input: string) {
  const digits = input.replace(/\D/g, "");

  // Accept: 10 digits (3XXXXXXXXX) -> make it 03XXXXXXXXX
  if (digits.length === 10 && digits[0] !== "0") return `0${digits}`;

  // Accept: 11 digits starting with 0 (03XXXXXXXXX)
  if (digits.length === 11 && digits[0] === "0") return digits;

  // Minimal support for +92 / 92: (923XXXXXXXXX) -> 03XXXXXXXXX
  if (digits.length === 12 && digits.startsWith("92")) return `0${digits.slice(2)}`;

  return "";
}

function readUsers(): StoredUser[] {
  const raw = localStorage.getItem(LS_USERS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StoredUser[]) : [];
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]) {
  localStorage.setItem(LS_USERS_KEY, JSON.stringify(users));
}

function writeSession(session: AuthSession) {
  localStorage.setItem(LS_SESSION_KEY, JSON.stringify(session));
}

export function getSession(): AuthSession | null {
  const raw = localStorage.getItem(LS_SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function signOut() {
  localStorage.removeItem(LS_SESSION_KEY);
}

/**
 * SIGN IN
 * Replace this implementation with your API call later.
 */
export async function signIn(payload: SignInPayload): Promise<AuthSession> {
  await sleep(650);

  const phone = normalizePkPhone(payload.phone);
  if (!phone) {
    const err = new Error("Invalid phone format");
    // @ts-expect-error attach code
    err.code = "invalid-phone";
    throw err;
  }

  // Demo fallback (so you can test even before signup exists)
  if ((phone === "03123456789") && payload.password === "admin123") {
    const session: AuthSession = {
      token: "demo-token",
      user: { id: "demo-admin", name: "Demo Admin", phone },
    };
    writeSession(session);
    return session;
  }

  const users = readUsers();
  const user = users.find((u) => u.phone === phone);
  if (!user || user.password !== payload.password) {
    const err = new Error("Invalid credentials");
    // @ts-expect-error attach code
    err.code = "invalid-credential";
    throw err;
  }

  const session: AuthSession = {
    token: `token_${safeUUID()}`,
    user: { id: user.id, name: user.name, phone: user.phone },
  };
  writeSession(session);
  return session;
}

/**
 * SIGN UP
 * Replace this implementation with your API call later.
 */
export async function signUp(payload: SignUpPayload): Promise<AuthSession> {
  await sleep(650);

  const phone = normalizePkPhone(payload.phone);
  if (!phone) {
    const err = new Error("Invalid phone format");
    // @ts-expect-error attach code
    err.code = "invalid-phone";
    throw err;
  }

  const users = readUsers();
  const exists = users.some((u) => u.phone === phone);
  if (exists) {
    const err = new Error("User already exists");
    // @ts-expect-error attach code
    err.code = "user-exists";
    throw err;
  }

  const newUser: StoredUser = {
    id: safeUUID(),
    name: payload.name.trim() || "User",
    phone,
    password: payload.password,
  };
  users.push(newUser);
  writeUsers(users);

  const session: AuthSession = {
    token: `token_${safeUUID()}`,
    user: { id: newUser.id, name: newUser.name, phone: newUser.phone },
  };
  writeSession(session);
  return session;
}
