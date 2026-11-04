export interface LogActivityUser {
  userId?: string | null;
  email?: string | null;
  name?: string | null;
  phone?: string | null;
  userType?: string | null;
  _id?: any;
  [key: string]: any;
}

export interface LogActivityParams {
  type?: "normal" | "owner" | string;
  action: string;
  user?: LogActivityUser | null;
  title?: string;
  description?: string;
  target?: string | null;
  details?: Record<string, any> | any;
  ip?: string | null;
  userAgent?: string | null;
  status?: "success" | "failed" | "warning" | string;
}

export declare function logActivity(params: LogActivityParams): Promise<any>;
