import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

export const useDarkMode = (): [Theme, () => void, boolean] => {
    const [theme, setTheme] = useState<Theme>('light')
    const [componentMounted, setComponentMounted] = useState<boolean>(false)

    const setMode = (mode: Theme): void => {
        window.localStorage.setItem('theme', mode)
        setTheme(mode)
    };

    const toggleTheme = (): void => {
        if (theme === 'light') {
            setMode('dark')
        } else {
            setMode('light')
        }
    };

    useEffect(() => {
        const storedTheme = window.localStorage.getItem('theme')
        if (storedTheme === 'light' || storedTheme === 'dark') {
            const localTheme: Theme = storedTheme
            setTheme(localTheme)
        } else {
            setMode('light')
        }
        setComponentMounted(true)
    }, []);

    return [theme, toggleTheme, componentMounted]
};