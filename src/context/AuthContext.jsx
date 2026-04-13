import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const USERS_KEY = 'stride_users';
const CURRENT_USER_KEY = 'stride_current_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const currentUserId = localStorage.getItem(CURRENT_USER_KEY);
    if (currentUserId) {
      const users = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
      if (users[currentUserId]) {
        setUser(users[currentUserId]);
      }
    }
    setLoading(false);
  }, []);

  const getUsers = () => {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
  };

  const saveUsers = (users) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  };

  const signUp = async (name, email, password) => {
    const users = getUsers();
    
    // Check if email already exists
    const existingUser = Object.values(users).find(u => u.email === email);
    if (existingUser) {
      throw new Error('An account with this email already exists');
    }

    const userId = Date.now().toString();
    const newUser = {
      id: userId,
      name,
      email,
      password, // In production, this should be hashed!
      createdAt: new Date().toISOString(),
      avatar: name.charAt(0).toUpperCase(),
    };

    users[userId] = newUser;
    saveUsers(users);
    
    // Create empty habits for this user
    localStorage.setItem(`stride_habits_${userId}`, JSON.stringify([]));
    
    // Set current user
    localStorage.setItem(CURRENT_USER_KEY, userId);
    setUser(newUser);
    
    return newUser;
  };

  const signIn = async (email, password) => {
    const users = getUsers();
    
    const foundUser = Object.values(users).find(
      u => u.email === email && u.password === password
    );
    
    if (!foundUser) {
      throw new Error('Invalid email or password');
    }

    localStorage.setItem(CURRENT_USER_KEY, foundUser.id);
    setUser(foundUser);
    
    return foundUser;
  };

  const signOut = () => {
    localStorage.removeItem(CURRENT_USER_KEY);
    setUser(null);
  };

  const updateProfile = (updates) => {
    if (!user) return;
    
    const users = getUsers();
    const updatedUser = { ...users[user.id], ...updates };
    users[user.id] = updatedUser;
    saveUsers(users);
    setUser(updatedUser);
  };

  // Get habits key for current user
  const getHabitsKey = () => {
    return user ? `stride_habits_${user.id}` : 'stride_habits_guest';
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signUp,
      signIn,
      signOut,
      updateProfile,
      getHabitsKey,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
