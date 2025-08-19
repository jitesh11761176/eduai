
import { createContext } from 'react';
import { AuthenticatedUser } from '../types';

interface AuthContextType {
  user: AuthenticatedUser | null;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  logout: () => {},
});
