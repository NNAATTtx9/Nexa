"use server";

import { Client, Account, Databases, Users } from "node-appwrite";
import { cookies } from "next/headers";

const getClient = () =>
  new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!);

export async function createGuestClient() {
  const client = getClient();

  return {
    get account() {
      return new Account(client);
    },
  };
}

export async function createSessionClient() {
  const client = getClient();

  const session = (await cookies()).get("appwrite-session");

  if (!session || !session.value) {
    throw new Error("No session");
  }

  client.setSession(session.value);

  return {
    get account() {
      return new Account(client);
    },
  };
}

export async function createAdminClient() {
  const client = getClient()
    .setKey(process.env.NEXT_APPWRITE_KEY!);

  return {
    get account() {
      return new Account(client);
    },
    get database() {
      return new Databases(client);
    },
    get user() {
      return new Users(client);
    }
  };
}