
export interface User {
  id: string;
  email: string;
  hashedPassword: string;
  role: 'user' | 'moderator' | 'admin' | 'janitor';
}
