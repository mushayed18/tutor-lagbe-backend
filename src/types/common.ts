export interface AuthUser {
  id: string;
  role: "TUTOR" | "PARENT" | "ADMIN";
  name?: string;
}