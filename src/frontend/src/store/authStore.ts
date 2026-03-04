import { generateOrderId } from "../utils/idGenerator";
import type { Session, User, UserRole } from "./types";

const STORAGE_KEY = "unibite_auth";
const SESSION_KEY = "unibite_session";

interface AuthState {
  users: User[];
}

const PREDEFINED_OWNER: User = {
  id: "owner-predefined",
  email: "owner@unibite.com",
  password: "owner123",
  name: "UniBite Owner",
  role: "OWNER",
  status: "ACTIVE",
  createdAt: new Date().toISOString(),
};

function loadState(): AuthState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const state = JSON.parse(raw) as AuthState;
      // Ensure predefined owner always exists and is active
      const hasOwner = state.users.some((u) => u.email === "owner@unibite.com");
      if (!hasOwner) {
        state.users.unshift(PREDEFINED_OWNER);
        saveState(state);
      } else {
        // Ensure predefined owner is always ACTIVE
        const ownerIdx = state.users.findIndex(
          (u) => u.email === "owner@unibite.com",
        );
        if (ownerIdx >= 0) {
          state.users[ownerIdx].status = "ACTIVE";
          state.users[ownerIdx].role = "OWNER";
        }
      }
      return state;
    }
  } catch {
    // ignore
  }
  const initial: AuthState = { users: [PREDEFINED_OWNER] };
  saveState(initial);
  return initial;
}

function saveState(state: AuthState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
}

export const authStore = {
  getState(): AuthState {
    return loadState();
  },

  getUsers(): User[] {
    return loadState().users;
  },

  getUserById(id: string): User | undefined {
    return loadState().users.find((u) => u.id === id);
  },

  getUserByEmail(email: string): User | undefined {
    return loadState().users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase(),
    );
  },

  signup(
    email: string,
    password: string,
    name: string,
    role: UserRole,
  ): { success: boolean; message: string; user?: User } {
    const state = loadState();
    const existing = state.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase(),
    );
    if (existing) {
      return { success: false, message: "Email already registered." };
    }
    const user: User = {
      id: generateOrderId(),
      email,
      password,
      name,
      role,
      status: role === "OWNER" ? "OWNER_PENDING" : "ACTIVE",
      createdAt: new Date().toISOString(),
    };
    state.users.push(user);
    saveState(state);
    return { success: true, message: "Account created.", user };
  },

  login(
    email: string,
    password: string,
  ): { success: boolean; message: string; session?: Session } {
    const state = loadState();
    const user = state.users.find(
      (u) =>
        u.email.toLowerCase() === email.toLowerCase() &&
        u.password === password,
    );
    if (!user) {
      return { success: false, message: "Invalid email or password." };
    }
    const session: Session = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return { success: true, message: "Logged in.", session };
  },

  logout(): void {
    localStorage.removeItem(SESSION_KEY);
  },

  getSession(): Session | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) return JSON.parse(raw) as Session;
    } catch {
      // ignore
    }
    return null;
  },

  approveOwner(userId: string): void {
    const state = loadState();
    const idx = state.users.findIndex((u) => u.id === userId);
    if (idx >= 0) {
      state.users[idx].status = "ACTIVE";
      saveState(state);
      // Update session if this is the current user
      const session = authStore.getSession();
      if (session && session.userId === userId) {
        session.status = "ACTIVE";
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      }
    }
  },

  getPendingOwners(): User[] {
    return loadState().users.filter(
      (u) => u.role === "OWNER" && u.status === "OWNER_PENDING",
    );
  },

  rejectOwner(userId: string): void {
    const state = loadState();
    state.users = state.users.filter((u) => u.id !== userId);
    saveState(state);
  },
};
