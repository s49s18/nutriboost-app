import { useContext } from 'react';
import { NutrientsContext } from '../contexts/NutrientsContexts';

export function useNutrient() {
    const context = useContext(NutrientsContext);
    if (!context) {
        throw new Error('useNutrient must be used within a NutrientsProvider');
    }
    return context;
}
