import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Address } from "viem";
import { connectUrl } from "@/lib/studio-entry";
import { SESSION_COOKIE_NAME, readSessionValue } from "./session";

export async function requireStudioSession(): Promise<Address> {
  const store = await cookies();
  const address = readSessionValue(store.get(SESSION_COOKIE_NAME)?.value);
  if (!address) redirect(connectUrl("/studio"));
  return address;
}
