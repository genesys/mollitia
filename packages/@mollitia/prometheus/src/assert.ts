export function assert (value: unknown, msg: string): asserts value {
  if (!value) {
    throw new Error(msg);
  }
}

export function assertNever (key: never): never {
  throw new Error(key);
}
