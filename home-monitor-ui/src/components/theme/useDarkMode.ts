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
        const localTheme = window.localStorage.getItem('theme') as Theme | null
        if (localTheme) {
            setTheme(localTheme)
        } else {
            setMode('light')
        }
        setComponentMounted(true)
    }, []);

    return [theme, toggleTheme, componentMounted]
};