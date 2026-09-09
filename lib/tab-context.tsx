'use client';
import { createContext, useContext } from 'react';

export const TabContext = createContext<(id: string) => void>(() => {});
export const useTabNav = () => useContext(TabContext);
