/**
 * Serialize a value into base64 encoded JSON string.
 *
 * @param value - The value to be serialized.
 * @returns
 */
export const serialize = (value: unknown): string => {
  return Buffer.from(JSON.stringify(value)).toString("base64");
};

/**
 * Deserialize a value from a base64 encoded JSON byte array.
 *
 * @param value - The string to be deserialized.
 * @returns
 */
export const deserialize = <Return>(
  value: Uint8Array | readonly number[]
): Return => {
  return JSON.parse(Buffer.from(value).toString()) as Return;
};
