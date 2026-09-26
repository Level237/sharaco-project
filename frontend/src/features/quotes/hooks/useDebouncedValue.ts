import { useState, useEffect } from 'react';

/**
 * Retourne une version "debouncée" de la valeur.
 * Attend `delay` ms après le dernier changement avant de mettre à jour.
 */
export function useDebouncedValue<T>(value: T, delay: number = 500): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}