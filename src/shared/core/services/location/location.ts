import { appLocale, t } from 'shared/localization/i18n';
import Geolocation from '@react-native-community/geolocation';
import { PermissionsAndroid, Platform } from 'react-native';

export type UserLocation = {
  latitude: number;
  longitude: number;
  city: string;
};

async function requestPermission() {
  if (Platform.OS === 'ios') {
    return new Promise<boolean>(resolve => {
      Geolocation.requestAuthorization(
        () => resolve(true),
        () => resolve(false),
      );
    });
  }

  return (
    (await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    )) === PermissionsAndroid.RESULTS.GRANTED
  );
}

function getCoordinates() {
  return new Promise<{ latitude: number; longitude: number }>(
    (resolve, reject) => {
      Geolocation.getCurrentPosition(
        position => resolve(position.coords),
        reject,
        { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 },
      );
    },
  );
}

const geocodingLanguage = appLocale;

async function reverseGeocode(latitude: number, longitude: number) {
  const url =
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2` +
    `&lat=${latitude}&lon=${longitude}&accept-language=${geocodingLanguage}`;
  const response = await fetch(url, {
    headers: { 'User-Agent': 'Libris/1.0 (mobile app)' },
  });

  if (!response.ok) {
    throw new Error(t('location.determineError'));
  }

  const data = await response.json();
  return (data.address?.city ??
    data.address?.town ??
    data.address?.village ??
    data.address?.municipality ??
    data.address?.county ??
    t('location.unknown')) as string;
}

export async function getCityCenter(
  city: string,
): Promise<UserLocation | null> {
  const url =
    `https://nominatim.openstreetmap.org/search?format=jsonv2` +
    `&q=${encodeURIComponent(`${city}, Ukraine`)}` +
    `&countrycodes=ua&limit=1&accept-language=${geocodingLanguage}`;
  const response = await fetch(url, {
    headers: { 'User-Agent': 'Libris/1.0 (mobile app)' },
  });

  if (!response.ok) {
    throw new Error(t('location.findError'));
  }

  const [result] = await response.json();
  if (!result) {
    return null;
  }

  return {
    city: city.trim(),
    latitude: Number(result.lat),
    longitude: Number(result.lon),
  };
}

export async function getUserLocation(): Promise<UserLocation | null> {
  if (!(await requestPermission())) {
    return null;
  }

  const { latitude, longitude } = await getCoordinates();
  let city = t('location.unknown');

  try {
    city = await reverseGeocode(latitude, longitude);
  } catch {
    // Coordinates are still useful even if reverse geocoding is unavailable.
  }

  return { latitude, longitude, city };
}
