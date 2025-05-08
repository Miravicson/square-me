import { Result } from '../definitions';

export function stringToBoolean(item: string | boolean) {
  if (typeof item === 'boolean') return item;
  return ['1', 'true'].includes(item);
}

export function choice<T>(arr: T[]): T {
  if (arr.length === 0) throw new Error('Array cannot be empty');
  return arr[Math.floor(Math.random() * arr.length)] as T;
}

export const tryCatch = <T, E = Error>(
  arg: Promise<T> | (() => T)
): Result<T, E> | Promise<Result<T, E>> => {
  if (typeof arg === 'function') {
    try {
      const data = (arg as () => T)();
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as E };
    }
  }

  return (arg as Promise<T>)
    .then((data) => ({ data, error: null }))
    .catch((error) => ({ data: null, error: error as E }));
};
