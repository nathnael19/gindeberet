/** Gindeberet office — Global Hotel Lancha area, Addis Ababa */
export const OFFICE = {
  name: 'Gindeberet General Construction PLC',
  placeLabel: 'GLOBAL HOTEL LANCHA, Addis Ababa',
  lat: 8.9935718,
  lng: 38.7598685,
  address: 'Near Global Hotel Lancha\nAddis Ababa, Ethiopia',
};

/** Landmark directions: Stadium (Addis Ababa City Bus Station) → Office */
export const STADIUM_DIRECTIONS_URL =
  'https://www.google.com/maps/dir/Stadium+-+Addis+Ababa+City+Bus+Station,+2Q65%2BQR3,+Addis+Ababa/GLOBAL+HOTEL+LANCHA+%7C%E1%8C%8D%E1%88%8E%E1%89%A3%E1%88%8D+%E1%88%86%E1%89%B4%E1%88%8D+%7CRIDE8294,+XQV5%2BCWF,+Addis+Ababa/@8.9949548,38.7568577,15.47z/data=!4m14!4m13!1m5!1m1!1s0x164b850055ef3411:0xaf9bce6bc6cd1b36!2m2!1d38.7582244!2d9.0125698!1m5!1m1!1s0x164b8500415ef3b5:0x39cc3eb36abaa14b!2m2!1d38.7598685!2d8.9935718!3e2?entry=ttu';

export function officeMapEmbedUrl(lat = OFFICE.lat, lng = OFFICE.lng) {
  return `https://www.google.com/maps?q=${lat},${lng}&hl=en&z=16&output=embed`;
}

export function officePlaceUrl(lat = OFFICE.lat, lng = OFFICE.lng) {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

/** Directions to office; optional origin lat/lng (e.g. user's GPS). */
export function directionsToOfficeUrl(origin?: { lat: number; lng: number }) {
  const dest = `${OFFICE.lat},${OFFICE.lng}`;
  if (origin) {
    return `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${dest}&travelmode=driving`;
  }
  // Google Maps will prompt / use current location when origin is omitted on many devices
  return `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=driving`;
}
