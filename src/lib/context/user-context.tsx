'use client'
import * as React from 'react'
import type { User } from '@/types'

interface UserContextValue {
  user: User | null
}

export const UserContext = React.createContext<UserContextValue>({ user: null })
export function useUser() { return React.useContext(UserContext) }
