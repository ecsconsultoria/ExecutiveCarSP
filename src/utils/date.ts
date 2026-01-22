import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import 'dayjs/locale/pt-br';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('pt-br');

const DEFAULT_TIMEZONE = 'America/Sao_Paulo';

export function formatDate(date: Date | string, format = 'DD/MM/YYYY'): string {
  return dayjs(date).tz(DEFAULT_TIMEZONE).format(format);
}

export function formatDateTime(date: Date | string, format = 'DD/MM/YYYY HH:mm'): string {
  return dayjs(date).tz(DEFAULT_TIMEZONE).format(format);
}

export function parseDate(dateString: string): Date {
  return dayjs.tz(dateString, DEFAULT_TIMEZONE).toDate();
}

export function getHoursDifference(date1: Date, date2: Date): number {
  return Math.abs(dayjs(date1).diff(dayjs(date2), 'hour', true));
}

export function addHours(date: Date, hours: number): Date {
  return dayjs(date).add(hours, 'hour').toDate();
}

export function now(): Date {
  return dayjs().tz(DEFAULT_TIMEZONE).toDate();
}
