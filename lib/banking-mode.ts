"use server";

import { createAdminClient } from "@/lib/appwrite";
import { parseStringify } from "@/lib/utils";
import { Query } from "node-appwrite";
import { cookies } from "next/headers";
import { verifyBankingModeToken } from "@/lib/auth-session";

const {
  APPWRITE_DATABASE_ID: DATABASE_ID,
  APPWRITE_USER_COLLECTION_ID: USER_COLLECTION_ID,
} = process.env;

export type BankingMode = "demo" | "actual" | "unset";

export async function getUserBankingMode(userId: string): Promise<BankingMode> {
  const modeCookie = (await cookies()).get("nexa-banking-mode")?.value;
  const signedMode = verifyBankingModeToken(modeCookie);

  if (signedMode && signedMode.userId === userId) {
    return signedMode.mode as BankingMode;
  }

  try {
    const { database } = await createAdminClient();
    const result = await database.listDocuments(
      DATABASE_ID!,
      USER_COLLECTION_ID!,
      [Query.equal("userId", userId)]
    );

    const user = result.documents[0];
    return (user?.mode as BankingMode | undefined) || "unset";
  } catch (error) {
    console.error("Unable to read banking mode:", error);
    return "unset";
  }
}

export const getDemoAccounts = async (userId: string): Promise<{
  data: Account[];
  totalBanks: number;
  totalCurrentBalance: number;
}> => {
  const demoAccounts: Account[] = [
    {
      id: "demo-checking",
      appwriteItemId: `demo-checking-${userId}`,
      availableBalance: 12840.76,
      currentBalance: 12840.76,
      institutionId: "demo-bank",
      name: "Demo Checking",
      officialName: "Nexa Demo Checking",
      mask: "1024",
      type: "depository",
      subtype: "checking",
      sharableId: "demo-checking-sharable",
    },
    {
      id: "demo-savings",
      appwriteItemId: `demo-savings-${userId}`,
      availableBalance: 45280.19,
      currentBalance: 45280.19,
      institutionId: "demo-bank",
      name: "Demo Savings",
      officialName: "Nexa Demo Savings",
      mask: "8891",
      type: "depository",
      subtype: "savings",
      sharableId: "demo-savings-sharable",
    },
  ];

  return parseStringify({
    data: demoAccounts,
    totalBanks: demoAccounts.length,
    totalCurrentBalance: demoAccounts.reduce((sum, item) => sum + item.currentBalance, 0),
  });
};

export const getDemoAccount = async ({ appwriteItemId }: { appwriteItemId: string }): Promise<{
  data: Account;
  transactions: Transaction[];
}> => {
  const demoResult = await getDemoAccounts("demo-user");
  const accounts = demoResult.data as Account[];
  const fallbackAccount = accounts[0];
  const account: Account = (accounts.find((entry) => entry.appwriteItemId === appwriteItemId) ?? fallbackAccount) as Account;

  const now = new Date();
  const transactions = [
    {
      id: "demo-tx-1",
      name: "Payroll Deposit",
      amount: 3250.0,
      date: new Date(now.getTime() - 2 * 86400000).toISOString(),
      paymentChannel: "online",
      category: "Payment",
      type: "credit",
    },
    {
      id: "demo-tx-2",
      name: "Coffee House",
      amount: 12.4,
      date: new Date(now.getTime() - 4 * 86400000).toISOString(),
      paymentChannel: "online",
      category: "Food and Drink",
      type: "debit",
    },
    {
      id: "demo-tx-3",
      name: "Transfer to Savings",
      amount: 800.0,
      date: new Date(now.getTime() - 7 * 86400000).toISOString(),
      paymentChannel: "online",
      category: "Transfer",
      type: "debit",
    },
    {
      id: "demo-tx-4",
      name: "Apartment Rent",
      amount: 1750.0,
      date: new Date(now.getTime() - 12 * 86400000).toISOString(),
      paymentChannel: "online",
      category: "Payment",
      type: "debit",
    },
    {
      id: "demo-tx-5",
      name: "Groceries",
      amount: 146.2,
      date: new Date(now.getTime() - 18 * 86400000).toISOString(),
      paymentChannel: "online",
      category: "Food and Drink",
      type: "debit",
    },
  ];

  return parseStringify({
    data: account,
    transactions: transactions.map((transaction) => ({
      ...transaction,
      accountId: account.id,
      image: "/icons/transaction.svg",
      paymentChannel: transaction.paymentChannel,
    })),
  });
};

export const isDemoModeAllowed = async (userId: string) => {
  const mode = await getUserBankingMode(userId);
  return mode === "demo";
};
