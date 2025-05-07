interface User {
  email: string;
  id: string;
}

export interface AuthenticatedUser extends User {
  isImpersonated?: boolean;
  impersonatedBy?: string;
}
