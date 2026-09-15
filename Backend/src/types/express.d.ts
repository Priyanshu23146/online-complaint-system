export interface AuthUser {
  id: number;
  role: string;
  organizationId: number;
  departmentId: number | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};
