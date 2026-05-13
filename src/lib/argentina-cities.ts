import { City } from 'country-state-city';

// Manual data for Buenos Aires and CABA (since country-state-city has incomplete data)
const BUENOS_AIRES_CITIES = [
  'La Plata',
  'Mar del Plata',
  'Bahía Blanca',
  'Avellaneda',
  'Quilmes',
  'Lanús',
  'Lomas de Zamora',
  'Almirante Brown',
  'Morón',
  'Ituzaingó',
  'La Matanza',
  'San Isidro',
  'Vicente López',
  'San Martín',
  'Tres de Febrero',
  'Hurlingham',
  'Merlo',
  'Castelar',
  'Ramos Mejía',
  'Ciudadela',
  'Junín',
  'Bragado',
  'Pergamino',
  'Salto',
  'Arrecifes',
  'San Nicolás de los Arroyos',
  'Campana',
  'Zárate',
  'San Pedro',
  'Ramallo',
];

const CABA_BARRIOS = [
  'Almagro',
  'Balvanera',
  'Barracas',
  'Belgrano',
  'Benítez',
  'Boedo',
  'Caballito',
  'Chacarita',
  'Coghlan',
  'Colegiales',
  'Constitución',
  'Flores',
  'Floresta',
  'La Boca',
  'La Paternal',
  'Liniers',
  'Mataderos',
  'Monserrat',
  'Nueva Pompeya',
  'Palermo',
  'Parque Acoyte',
  'Parque Chacabuco',
  'Parque Chas',
  'Parque Centenario',
  'Parque Mitre',
  'Parque Patricios',
  'Paternal',
  'Puerto Madero',
  'Recoleta',
  'Retiro',
  'Riachuelo',
  'Rivadavia',
  'San Cristóbal',
  'San Nicolás',
  'San Telmo',
  'Saavedra',
  'Semillero',
  'Soldati',
  'Villa Crespo',
  'Villa Devoto',
  'Villa General Mitre',
  'Villa Lugano',
  'Villa Luro',
  'Villa Ortúzar',
  'Villa Pueyrredón',
  'Villa Real',
  'Villa Riachuelo',
  'Villa Santa Rita',
  'Villa Urquiza',
  'Vélez Sársfield',
];

export const getCitiesForProvince = (provinceCode: string) => {
  // Use manual data for Buenos Aires and CABA
  if (provinceCode === 'B') {
    return BUENOS_AIRES_CITIES.map(name => ({ name }));
  }
  if (provinceCode === 'C') {
    return CABA_BARRIOS.map(name => ({ name }));
  }
  
  // Use country-state-city for all other provinces
  return City.getCitiesOfState('AR', provinceCode) || [];
};
