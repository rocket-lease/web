import type { Characteristic } from '@rocket-lease/contracts'
import { t } from '@/i18n/es'

export const ALL_CHARACTERISTICS: Characteristic[] = [
  'GPS',
  'BABY_SEAT',
  'SUNROOF',
  'PET_FRIENDLY',
  'WIFI',
  'USB_CHARGER',
  'AUX_CABLE',
  'BLUETOOTH',
]

const CHARACTERISTIC_LABELS: Record<Characteristic, string> = {
  GPS: t('caracteristicas.gps'),
  BABY_SEAT: t('caracteristicas.babySeat'),
  SUNROOF: t('caracteristicas.sunroof'),
  PET_FRIENDLY: t('caracteristicas.petFriendly'),
  WIFI: t('caracteristicas.wifi'),
  USB_CHARGER: t('caracteristicas.usbCharger'),
  AUX_CABLE: t('caracteristicas.auxCable'),
  BLUETOOTH: t('caracteristicas.bluetooth'),
}

export const getCharacteristicLabel = (value: Characteristic): string =>
  CHARACTERISTIC_LABELS[value] ?? value
