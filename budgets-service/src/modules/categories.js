// Categorías base definidas en el README del monorepo, más "Comida" y "Otros" como comodín.
export const CATEGORIES = ['Alimentación', 'Comida', 'Vivienda', 'Transporte', 'Ocio', 'Servicios', 'Otros'];

export const isValidCategory = (value) => CATEGORIES.includes(value);
