'use client'

import * as React from 'react'
import type { User } from '@/types'

const UserContext = React.createContext<User | null>(null)

export function UserProvider({ user, children }: { user: User | null; children: React.ReactNode }) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>
}

export function useUser(): User {
  const user = React.useContext(UserContext)
  if (!user) throw new Error('useUser debe usarse dentro de UserProvider')
  return user
}
