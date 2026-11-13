import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { getAddress, isAddress, type Address } from "viem";
import { sessionSecret } from "./env";

const SESSION_COOKIE = "ms_session";
const NONCE_COOKIE = "ms_siwe_nonce";
const SESSION_SECONDS = 7 * 24 * 60 * 60;
const NONCE_SECONDS = 10 * 60;

function sign(value: string) {
  return createHmac("sha256", sessionSecret()).update(value).digest("base64url");
}

function seal(value: string) {
  return `${value}.${sign(value)}`;
}

function unseal(sealed: string | undefined) {
  if (!sealed) return null;
  const cut = sealed.lastIndexOf(".");
  if (cut <= 0) return null;
  const value = sealed.slice(0, cut);
  const given = Buffer.from(sealed.slice(cut + 1));
  const expected = Buffer.from(sign(value));
  return given.length === expected.length && timingSafeEqual(given, expected) ? value : null;
}

function readCookie(request: Request, name: string) {
  const header = request.headers.get("cookie") ?? "";
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return undefined;
}

function cookie(name: string, value: string, maxAge: number) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

function sealedUntil(value: string, seconds: number) {
  return seal(`${value}|${Math.floor(Date.now() / 1000) + seconds}`);
}

function openSealed(sealed: string | undefined) {
  const value = unseal(sealed);
  if (!value) return null;
  const [content, expires] = value.split("|");
  return content && Number(expires) > Date.now() / 1000 ? content : null;
}

export function sessionCookie(address: Address) {
  return cookie(SESSION_COOKIE, sealedUntil(getAddress(address), SESSION_SECONDS), SESSION_SECONDS);
}

export function clearedSessionCookie() {
  return cookie(SESSION_COOKIE, "", 0);
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;

export function readSessionValue(sealed: string | undefined): Address | null {
  const address = openSealed(sealed);
  return address && isAddress(address) ? getAddress(address) : null;
}

export function readSession(request: Request): Address | null {
  return readSessionValue(readCookie(request, SESSION_COOKIE));
}

export function nonceCookie(nonce: string) {
  return cookie(NONCE_COOKIE, sealedUntil(nonce, NONCE_SECONDS), NONCE_SECONDS);
}

export function clearedNonceCookie() {
  return cookie(NONCE_COOKIE, "", 0);
}

export function readNonce(request: Request) {
  return openSealed(readCookie(request, NONCE_COOKIE));
}
