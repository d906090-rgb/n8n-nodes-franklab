import { FAILURE_STATUSES, SUCCESS_STATUSES, TERMINAL_STATUSES } from './registry';

export function normalizeStatus(status: unknown): string {
	return typeof status === 'string' && status.trim() ? status.trim().toLowerCase() : 'unknown';
}

export function isTerminalStatus(status: unknown): boolean {
	return (TERMINAL_STATUSES as readonly string[]).includes(normalizeStatus(status));
}

export function isFailureStatus(status: unknown): boolean {
	return (FAILURE_STATUSES as readonly string[]).includes(normalizeStatus(status));
}

export function isSuccessStatus(status: unknown): boolean {
	return (SUCCESS_STATUSES as readonly string[]).includes(normalizeStatus(status));
}
