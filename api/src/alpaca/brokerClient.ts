import axios from "axios";

const Env = (name: string): string => {
  const v = process.env[name]?.trim();
  if (!v) throw new Error(`Missing ${name}`);
  return v;
};

const base = Env("ALPACA_BROKER_BASE");
const key = Env("ALPACA_BROKER_KEY");
const sec = Env("ALPACA_BROKER_SECRET");

export const broker = axios.create({
  baseURL: base,
  auth: { username: key, password: sec },
  headers: { "Content-Type": "application/json" },
  timeout: 10_000,
});
