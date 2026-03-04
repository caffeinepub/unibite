export function generateOrderId(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const length = Math.floor(Math.random() * 5) + 16; // 16-20 chars
  let result = "";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    result += chars[array[i] % chars.length];
  }
  return result;
}

export function getNextToken(): number {
  const current = Number.parseInt(
    localStorage.getItem("unibite_token_counter") || "0",
    10,
  );
  const next = current + 1;
  localStorage.setItem("unibite_token_counter", String(next));
  return next;
}
