export interface ArgentinaProvince {
  isoCode: string
  name: string
}

export const ARGENTINA_PROVINCES: ArgentinaProvince[] = [
  { isoCode: 'B', name: 'Buenos Aires' },
  { isoCode: 'C', name: 'Ciudad Autónoma de Buenos Aires' },
  { isoCode: 'K', name: 'Catamarca' },
  { isoCode: 'H', name: 'Chaco' },
  { isoCode: 'U', name: 'Chubut' },
  { isoCode: 'X', name: 'Córdoba' },
  { isoCode: 'W', name: 'Corrientes' },
  { isoCode: 'E', name: 'Entre Ríos' },
  { isoCode: 'P', name: 'Formosa' },
  { isoCode: 'Y', name: 'Jujuy' },
  { isoCode: 'L', name: 'La Pampa' },
  { isoCode: 'F', name: 'La Rioja' },
  { isoCode: 'M', name: 'Mendoza' },
  { isoCode: 'N', name: 'Misiones' },
  { isoCode: 'Q', name: 'Neuquén' },
  { isoCode: 'R', name: 'Río Negro' },
  { isoCode: 'A', name: 'Salta' },
  { isoCode: 'J', name: 'San Juan' },
  { isoCode: 'D', name: 'San Luis' },
  { isoCode: 'Z', name: 'Santa Cruz' },
  { isoCode: 'S', name: 'Santa Fe' },
  { isoCode: 'G', name: 'Santiago del Estero' },
  { isoCode: 'V', name: 'Tierra del Fuego' },
  { isoCode: 'T', name: 'Tucumán' },
]

const CITIES_BY_PROVINCE: Record<string, string[]> = {
  B: [
    'La Plata', 'Mar del Plata', 'Bahía Blanca', 'Avellaneda', 'Quilmes',
    'Lanús', 'Lomas de Zamora', 'Almirante Brown', 'Morón', 'Ituzaingó',
    'La Matanza', 'San Isidro', 'Vicente López', 'San Martín', 'Tres de Febrero',
    'Hurlingham', 'Merlo', 'Castelar', 'Ramos Mejía', 'Ciudadela',
    'Junín', 'Bragado', 'Pergamino', 'San Nicolás de los Arroyos',
    'Campana', 'Zárate', 'San Pedro', 'Tandil', 'Olavarría', 'Necochea',
    'Azul', 'Chivilcoy', 'Mercedes', 'Luján', 'Pilar', 'Escobar',
  ],
  C: [
    'Almagro', 'Balvanera', 'Barracas', 'Belgrano', 'Boedo',
    'Caballito', 'Chacarita', 'Coghlan', 'Colegiales', 'Constitución',
    'Flores', 'Floresta', 'La Boca', 'La Paternal', 'Liniers',
    'Mataderos', 'Monserrat', 'Nueva Pompeya', 'Palermo', 'Parque Chacabuco',
    'Parque Chas', 'Parque Patricios', 'Puerto Madero', 'Recoleta', 'Retiro',
    'San Cristóbal', 'San Nicolás', 'San Telmo', 'Saavedra', 'Soldati',
    'Villa Crespo', 'Villa Devoto', 'Villa Lugano', 'Villa Luro',
    'Villa Ortúzar', 'Villa Pueyrredón', 'Villa Santa Rita', 'Villa Urquiza',
    'Vélez Sársfield',
  ],
  K: ['San Fernando del Valle de Catamarca', 'Recreo', 'Andalgalá', 'Belén', 'Tinogasta'],
  H: ['Resistencia', 'Barranqueras', 'Fontana', 'Villa Ángela', 'Roque Sáenz Peña', 'Charata'],
  U: ['Rawson', 'Trelew', 'Comodoro Rivadavia', 'Puerto Madryn', 'Esquel', 'Sarmiento'],
  X: [
    'Córdoba', 'Villa Carlos Paz', 'Río Cuarto', 'San Francisco', 'Villa María',
    'Alta Gracia', 'Cosquín', 'La Falda', 'Jesús María', 'Bell Ville',
  ],
  W: ['Corrientes', 'Goya', 'Mercedes', 'Curuzú Cuatiá', 'Paso de los Libres', 'Santo Tomé'],
  E: ['Paraná', 'Concordia', 'Gualeguaychú', 'Colón', 'Concepción del Uruguay', 'Victoria'],
  P: ['Formosa', 'Clorinda', 'Pirané', 'El Colorado'],
  Y: ['San Salvador de Jujuy', 'Palpalá', 'San Pedro de Jujuy', 'Libertador General San Martín', 'Humahuaca'],
  L: ['Santa Rosa', 'General Pico', 'Toay', 'Victorica', 'Realicó', 'General Acha'],
  F: ['La Rioja', 'Chilecito', 'Aimogasta', 'Vinchina', 'Chepes'],
  M: ['Mendoza', 'San Rafael', 'Godoy Cruz', 'Guaymallén', 'Maipú', 'Las Heras', 'Luján de Cuyo', 'Rivadavia'],
  N: ['Posadas', 'Oberá', 'Eldorado', 'Puerto Iguazú', 'Apóstoles', 'Montecarlo'],
  Q: ['Neuquén', 'Zapala', 'San Martín de los Andes', 'Villa La Angostura', 'Cutral Có', 'Plottier'],
  R: ['Viedma', 'Bariloche', 'Cipolletti', 'General Roca', 'Allen', 'Catriel', 'El Bolsón'],
  A: ['Salta', 'San Ramón de la Nueva Orán', 'Tartagal', 'Metán', 'Cafayate', 'Embarcación'],
  J: ['San Juan', 'Rivadavia', 'Pocito', 'Rawson', 'Chimbas', 'Santa Lucía', 'Caucete'],
  D: ['San Luis', 'Villa Mercedes', 'Merlo', 'Quines', 'Justo Daract'],
  Z: ['Río Gallegos', 'Caleta Olivia', 'Pico Truncado', 'Las Heras', 'Puerto Santa Cruz'],
  S: [
    'Rosario', 'Santa Fe', 'Rafaela', 'Venado Tuerto', 'Villa Gobernador Gálvez',
    'Santo Tomé', 'Reconquista', 'Casilda', 'Esperanza',
  ],
  G: ['Santiago del Estero', 'La Banda', 'Termas de Río Hondo', 'Añatuya', 'Frías'],
  V: ['Ushuaia', 'Río Grande', 'Tolhuin'],
  T: ['San Miguel de Tucumán', 'Yerba Buena', 'Tafí Viejo', 'Concepción', 'Banda del Río Salí', 'Alderetes', 'Aguilares'],
}

export function getCitiesForProvince(provinceCode: string): { name: string }[] {
  return (CITIES_BY_PROVINCE[provinceCode] ?? []).map(name => ({ name }))
}
