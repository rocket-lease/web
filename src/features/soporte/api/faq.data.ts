import {
  CalendarCheck,
  CreditCard,
  Car,
  UserCheck,
  ShieldAlert,
  LayoutGrid,
} from 'lucide-react'
import type { FaqItem, FaqCategory, FaqCategoryId } from '../types'

export const faqData: FaqItem[] = [
  // ─── RESERVAS ───
  {
    id: 'res-1',
    categoryId: 'reservas',
    question: '¿Cómo hago una reserva?',
    answer:
      'Es muy sencillo: buscá el vehículo que querés en la sección "Buscar", elegí las fechas de retiro y devolución, completá el pago y ¡listo! Recibirás un voucher con código QR que confirma tu reserva.',
    tags: ['reservar', 'como', 'proceso', 'paso a paso', 'buscar'],
  },
  {
    id: 'res-2',
    categoryId: 'reservas',
    question: '¿Qué estados puede tener mi reserva?',
    answer:
      'Tu reserva puede pasar por estos estados: Pago pendiente (esperando confirmación del pago), Confirmada (pagada y lista para retirar), En curso (vehículo retirado), Completada (devuelto sin inconvenientes), Cancelada (cancelada antes del retiro) o Rechazada (el rentador no la aceptó).',
    tags: ['estados', 'pendiente', 'confirmada', 'en curso', 'completada', 'cancelada', 'rechazada'],
  },
  {
    id: 'res-3',
    categoryId: 'reservas',
    question: '¿Cómo cancelo una reserva?',
    answer:
      'Ingresá a "Mis reservas", seleccioná la reserva y tocá "Cancelar reserva". Tené en cuenta la política de cancelación: más de 48 hs antes del retiro recibís el 100% del reembolso, entre 24 y 48 hs el 50%, y menos de 24 hs no hay reembolso.',
    tags: ['cancelar', 'cancelación', 'reembolso', 'devolver dinero'],
  },
  {
    id: 'res-4',
    categoryId: 'reservas',
    question: '¿Qué es el voucher QR?',
    answer:
      'El voucher QR es un código único generado al confirmarse tu reserva. Lo presentás en el momento de retirar el vehículo y también al devolverlo. El rentador lo escanea con su app para registrar el inicio y el cierre del alquiler.',
    tags: ['QR', 'voucher', 'código', 'comprobante', 'qr code'],
  },
  {
    id: 'res-5',
    categoryId: 'reservas',
    question: '¿Cómo funciona la entrega del vehículo?',
    answer:
      'Al llegar al punto de retiro, mostrás el voucher QR desde tu app. El rentador lo escanea y la reserva pasa al estado "En curso". Desde ese momento el período de alquiler comienza a correr.',
    tags: ['entrega', 'retiro', 'pickup', 'inicio', 'retirar vehículo'],
  },
  {
    id: 'res-6',
    categoryId: 'reservas',
    question: '¿Cómo funciona la devolución?',
    answer:
      'Al devolver el vehículo, el rentador escanea nuevamente tu código QR para cerrar el período. La reserva pasa a "Completada" y ambos podrán dejarse una reseña. Si hay algún inconveniente, el rentador puede reportarlo en el momento.',
    tags: ['devolución', 'return', 'devolver', 'cierre', 'fin del alquiler'],
  },
  {
    id: 'res-7',
    categoryId: 'reservas',
    question: '¿Tengo un tiempo límite para retirar el vehículo?',
    answer:
      'Sí, tenés 1 hora de gracia desde la hora pactada de retiro. Si no aparecés dentro de ese plazo, el rentador puede marcar la reserva como incumplida. En ese caso, se aplica la política de cancelación correspondiente.',
    tags: ['tiempo', 'límite', 'hora', 'retiro', 'incumplimiento', 'no show'],
  },

  // ─── PAGOS ───
  {
    id: 'pag-1',
    categoryId: 'pagos',
    question: '¿Qué métodos de pago acepta Rocket Lease?',
    answer:
      'Aceptamos tarjetas de crédito y débito (Visa, Mastercard, American Express), transferencia bancaria y billeteras virtuales como Mercado Pago. No aceptamos efectivo para garantizar la seguridad de ambas partes.',
    tags: ['pago', 'tarjeta', 'visa', 'mastercard', 'débito', 'transferencia', 'mercado pago', 'método'],
  },
  {
    id: 'pag-2',
    categoryId: 'pagos',
    question: '¿Cuándo se me cobra la reserva?',
    answer:
      'El monto se retiene al confirmar la reserva. La acreditación al rentador se realiza 24 hs después de la devolución del vehículo, una vez verificado que todo estuvo en orden.',
    tags: ['cobro', 'cuando', 'pago', 'retención', 'acreditación'],
  },
  {
    id: 'pag-3',
    categoryId: 'pagos',
    question: '¿Cómo funcionan las tarifas escalonadas?',
    answer:
      'Los rentadores pueden configurar precios distintos según la duración del alquiler: tarifa diaria, semanal y mensual. El sistema aplica automáticamente el precio más conveniente según las fechas que elegís. Siempre vas a ver el precio final antes de confirmar.',
    tags: ['tarifa', 'precio', 'escalonada', 'semanal', 'mensual', 'diaria', 'descuento'],
  },
  {
    id: 'pag-4',
    categoryId: 'pagos',
    question: '¿Cómo me devuelven el dinero si cancelo?',
    answer:
      'La política de reembolso depende del tiempo de anticipación: más de 48 hs antes del retiro → 100% del importe, entre 24 y 48 hs → 50%, menos de 24 hs → sin reembolso. Los reintegros se acreditan en 5 a 10 días hábiles según el banco.',
    tags: ['reembolso', 'devolución dinero', 'cancelar', 'política', 'plazos'],
  },
  {
    id: 'pag-5',
    categoryId: 'pagos',
    question: '¿Hay cargos adicionales que no se muestran?',
    answer:
      'El precio mostrado incluye el seguro básico de responsabilidad civil. Los cargos adicionales posibles son: kilómetros extras (si superás el límite diario), daños al vehículo (según el contrato firmado) y combustible (si devolvés el vehículo sin el nivel acordado).',
    tags: ['cargos', 'extra', 'adicionales', 'kilómetros', 'combustible', 'daños', 'seguro'],
  },

  // ─── VEHÍCULOS ───
  {
    id: 'veh-1',
    categoryId: 'vehiculos',
    question: '¿Cómo publico mi vehículo en Rocket Lease?',
    answer:
      'Activá el modo Rentador desde tu perfil, ingresá a "Mis vehículos" y tocá "Publicar vehículo". Completá los datos del auto (marca, modelo, año, transmisión), subí al menos 3 fotos, configurá la disponibilidad y establecé tus tarifas. Una vez revisado, quedará publicado.',
    tags: ['publicar', 'vehículo', 'rentador', 'como publicar', 'subir auto'],
  },
  {
    id: 'veh-2',
    categoryId: 'vehiculos',
    question: '¿Qué documentación necesita mi vehículo?',
    answer:
      'Para publicar tu vehículo necesitás: cédula verde o azul vigente, seguro de vehículos vigente (contra terceros como mínimo), VTV al día y que el auto no tenga deudas de infracciones. Antes de la primera reserva verificamos estos datos.',
    tags: ['documentación', 'cédula', 'seguro', 'VTV', 'requisitos', 'papeles'],
  },
  {
    id: 'veh-3',
    categoryId: 'vehiculos',
    question: '¿Cómo establezco el precio de mi vehículo?',
    answer:
      'Vos fijás la tarifa diaria y opcionalmente podés agregar tarifas semanales y mensuales (escalonadas). Rocket Lease cobra una comisión del 15% sobre cada alquiler. Te mostramos sugerencias de precio basadas en vehículos similares en tu zona.',
    tags: ['precio', 'tarifa', 'comisión', 'cuánto cobrar', 'establecer precio'],
  },
  {
    id: 'veh-4',
    categoryId: 'vehiculos',
    question: '¿Puedo limitar los kilómetros que recorre el conductor?',
    answer:
      'Sí. En la configuración del vehículo podés definir un límite de kilómetros diarios y el costo por kilómetro extra. Si el conductor supera el límite, el cargo adicional se descuenta automáticamente de la garantía o se cobra aparte.',
    tags: ['kilómetros', 'límite', 'km', 'restricción', 'km extra'],
  },

  // ─── CUENTA ───
  {
    id: 'cta-1',
    categoryId: 'cuenta',
    question: '¿Qué verificación necesito para empezar a alquilar?',
    answer:
      'Para hacer tu primera reserva necesitás verificar tu identidad: subí una foto de tu DNI (frente y dorso), una selfie de verificación y tu licencia de conducir vigente. El proceso toma entre 24 y 48 hs hábiles.',
    tags: ['verificación', 'DNI', 'licencia', 'identidad', 'documentos', 'validar cuenta'],
  },
  {
    id: 'cta-2',
    categoryId: 'cuenta',
    question: '¿Qué es el sistema de niveles?',
    answer:
      'Los conductores suben de nivel a medida que acumulan alquileres y buenas calificaciones. Los niveles son: Bronce (nuevos), Plata (5+ alquileres con 4.0+), Oro (20+ alquileres con 4.5+) y Platino (50+ alquileres con 4.8+). Más nivel = más beneficios y mayor visibilidad.',
    tags: ['niveles', 'bronce', 'plata', 'oro', 'platino', 'fidelización', 'beneficios'],
  },
  {
    id: 'cta-3',
    categoryId: 'cuenta',
    question: '¿Puedo ser conductor y rentador al mismo tiempo?',
    answer:
      'Sí. Rocket Lease tiene un sistema multi-rol. Podés cambiar entre el modo Conductor y el modo Rentador desde el encabezado de la app con un solo toque. Tus datos y reputación de cada rol son independientes.',
    tags: ['multi-rol', 'conductor', 'rentador', 'ambos', 'cambiar modo', 'rol'],
  },
  {
    id: 'cta-4',
    categoryId: 'cuenta',
    question: '¿Cómo funciona el sistema de reputación?',
    answer:
      'Al completar una reserva, tanto el conductor como el rentador pueden calificarse mutuamente (1 a 5 estrellas) y dejar un comentario. La puntuación promedio se muestra públicamente en el perfil e influye en la visibilidad de los vehículos y en la prioridad en búsquedas.',
    tags: ['reputación', 'calificación', 'estrellas', 'reseña', 'rating', 'score'],
  },
  {
    id: 'cta-5',
    categoryId: 'cuenta',
    question: '¿Puedo eliminar mi cuenta?',
    answer:
      'Sí. Ingresá a Perfil → Configuración → Eliminar cuenta. Antes de eliminarse, todas tus reservas activas deben estar finalizadas. Tus datos personales se eliminan en 30 días, salvo los que debemos conservar por obligaciones legales.',
    tags: ['eliminar cuenta', 'borrar', 'cancelar cuenta', 'cerrar cuenta', 'baja'],
  },

  // ─── DISPUTAS ───
  {
    id: 'dis-1',
    categoryId: 'disputas',
    question: '¿Qué hago si el rentador reporta daños a mi vehículo?',
    answer:
      'Si el rentador reporta daños al escanear el QR de devolución, recibirás una notificación con fotos y descripción. Tenés 24 hs para aceptar, rechazar o contestar el reporte. Si no hay acuerdo, Rocket Lease interviene como mediador.',
    tags: ['daños', 'daño', 'accidente', 'vehículo dañado', 'reporte', 'mediación'],
  },
  {
    id: 'dis-2',
    categoryId: 'disputas',
    question: '¿Cómo inicio una disputa?',
    answer:
      'En el detalle de la reserva, tocá "Reportar problema". Describí el inconveniente con el mayor detalle posible y adjuntá fotos o evidencias. El equipo de soporte revisará el caso y contactará a ambas partes dentro de las 24 hs hábiles.',
    tags: ['disputa', 'reportar', 'problema', 'queja', 'reclamación', 'iniciar disputa'],
  },
  {
    id: 'dis-3',
    categoryId: 'disputas',
    question: '¿Cuánto tarda la resolución de una disputa?',
    answer:
      'El plazo máximo de resolución es de 5 días hábiles. Ambas partes recibirán notificaciones con el avance del caso. La decisión de Rocket Lease es final. Si aplica un reembolso o cargo, se procesa dentro de las 48 hs de la resolución.',
    tags: ['resolución', 'plazo', 'cuánto tarda', 'demora', 'tiempo'],
  },
  {
    id: 'dis-4',
    categoryId: 'disputas',
    question: '¿Qué pasa si el conductor no devuelve el vehículo?',
    answer:
      'Contactá al soporte inmediatamente mediante el chat de la app o WhatsApp. Se activa un protocolo de emergencia: intentamos contactar al conductor, notificamos a la aseguradora y, si es necesario, intervenimos con autoridades. Nunca estás solo ante esta situación.',
    tags: ['no devuelve', 'robo', 'emergencia', 'vehículo no devuelto', 'protocolo'],
  },
  {
    id: 'dis-5',
    categoryId: 'disputas',
    question: '¿Cómo contacto al equipo de soporte?',
    answer:
      'Podés comunicarte con nosotros por tres vías: chat en la app (ícono abajo de esta pantalla), WhatsApp al +54 11 3456-7890, o email a hola@rocketleaser.com. Nuestro horario de atención es lunes a viernes de 9:00 a 20:00 hs (hora Argentina).',
    tags: ['contacto', 'soporte', 'ayuda', 'atención', 'chat', 'whatsapp', 'email', 'teléfono'],
  },
]

const countByCategory = (id: FaqCategoryId) => faqData.filter(item => item.categoryId === id).length

export const faqCategories: FaqCategory[] = [
  { id: 'all', label: 'Todas', icon: LayoutGrid, count: faqData.length },
  { id: 'reservas', label: 'Reservas', icon: CalendarCheck, count: countByCategory('reservas') },
  { id: 'pagos', label: 'Pagos y tarifas', icon: CreditCard, count: countByCategory('pagos') },
  { id: 'vehiculos', label: 'Vehículos', icon: Car, count: countByCategory('vehiculos') },
  { id: 'cuenta', label: 'Cuenta y verificación', icon: UserCheck, count: countByCategory('cuenta') },
  { id: 'disputas', label: 'Disputas y soporte', icon: ShieldAlert, count: countByCategory('disputas') },
]
