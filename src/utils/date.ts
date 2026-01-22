import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import 'dayjs/locale/pt-br';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('pt-br');

const DEFAULT_TIMEZONE = 'America/Sao_Paulo';

export function formatDate(date: Date | string, format: string = 'DD/MM/YYYY'): string {
  return dayjs(date).tz(DEFAULT_TIMEZONE).format(format);
}

export function formatDateTime(date: Date | string): string {
  return dayjs(date).tz(DEFAULT_TIMEZONE).format('DD/MM/YYYY HH:mm');
}

export function formatTime(date: Date | string): string {
  return dayjs(date).tz(DEFAULT_TIMEZONE).format('HH:mm');
}

export function parseDate(dateString: string): Date {
  return dayjs(dateString).tz(DEFAULT_TIMEZONE).toDate();
}

export function now(): Date {
  return dayjs().tz(DEFAULT_TIMEZONE).toDate();
}

export function addHours(date: Date, hours: number): Date {
  return dayjs(date).add(hours, 'hour').toDate();
}

export function diffHours(date1: Date, date2: Date): number {
  return Math.abs(dayjs(date1).diff(dayjs(date2), 'hour', true));
}

export function isBefore(date1: Date, date2: Date): boolean {
  return dayjs(date1).isBefore(dayjs(date2));
}

export function isAfter(date1: Date, date2: Date): boolean {
  return dayjs(date1).isAfter(dayjs(date2));
}
