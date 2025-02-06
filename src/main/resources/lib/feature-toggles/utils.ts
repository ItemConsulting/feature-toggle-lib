export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export function forceArray<A>(data: A | A[] | undefined | null): A[] {
  data = data ?? [];
  return Array.isArray(data) ? data : [data];
}

export function includes<T>(arr: T[], value: T): boolean {
  return arr.indexOf(value) !== -1;
}

export function notNullOrUndefined<T>(val: T | null | undefined): val is T {
  return val !== null && val !== undefined;
}

export function unique(items: string[]): string[] {
  return items.filter(function (value, index, array) {
    return array.indexOf(value) === index;
  });
}
