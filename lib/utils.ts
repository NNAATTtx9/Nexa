/* eslint-disable no-prototype-builtins */
import { type ClassValue, clsx } from "clsx";
import qs from "query-string";
import { twMerge } from "tailwind-merge";
import z from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// FORMAT DATE TIME
export const formatDateTime = (dateString: Date) => {
  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    weekday: "short", // abbreviated weekday name (e.g., 'Mon')
    month: "short", // abbreviated month name (e.g., 'Oct')
    day: "numeric", // numeric day of the month (e.g., '25')
    hour: "numeric", // numeric hour (e.g., '8')
    minute: "numeric", // numeric minute (e.g., '30')
    hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
  };

  return {
    dateTime: new Intl.DateTimeFormat("en-US", dateTimeOptions).format(dateString),
  };
};

export function formatAmount(amount: number): string {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });

  return formatter.format(amount);
}

export const parseStringify = <T>(value: T): T => {
  if (value === undefined || value === null) return value;
  return JSON.parse(JSON.stringify(value)) as T;
};

export const removeSpecialCharacters = (value: string) => {
  return value.replace(/[^\w\s]/gi, "");
};

interface UrlQueryParams {
  params: string;
  key: string;
  value: string;
}

export function formUrlQuery({ params, key, value }: UrlQueryParams) {
  const currentUrl = qs.parse(params);

  currentUrl[key] = value;

  return qs.stringifyUrl(
    {
      url: window.location.pathname,
      query: currentUrl,
    },
    { skipNull: true }
  );
}

export function getAccountTypeColors(type: AccountTypes) {
  switch (type) {
    case "depository":
      return {
        bg: "bg-blue-25",
        lightBg: "bg-blue-100",
        title: "text-blue-900",
        subText: "text-blue-700",
      };

    case "credit":
      return {
        bg: "bg-success-25",
        lightBg: "bg-success-100",
        title: "text-success-900",
        subText: "text-success-700",
      };

    default:
      return {
        bg: "bg-green-25",
        lightBg: "bg-green-100",
        title: "text-green-900",
        subText: "text-green-700",
      };
  }
}

export function countTransactionCategories(
  transactions: Transaction[]
): CategoryCount[] {
  const categoryCounts: { [category: string]: number } = {};
  let totalCount = 0;

  // Iterate over each transaction
  if (transactions) {
    transactions.forEach((transaction) => {
      // Extract the category from the transaction
      const category = transaction.category;

      // If the category exists in the categoryCounts object, increment its count
      if (categoryCounts.hasOwnProperty(category)) {
        categoryCounts[category]++;
      } else {
        // Otherwise, initialize the count to 1
        categoryCounts[category] = 1;
      }

      // Increment total count
      totalCount++;
    });
  }

  // Convert the categoryCounts object to an array of objects
  const aggregatedCategories: CategoryCount[] = Object.keys(categoryCounts).map(
    (category) => ({
      name: category,
      count: categoryCounts[category],
      totalCount,
    })
  );

  // Sort the aggregatedCategories array by count in descending order
  aggregatedCategories.sort((a, b) => b.count - a.count);

  return aggregatedCategories;
}

export function extractCustomerIdFromUrl(url: string) {
  // Split the URL string by '/'
  const parts = url.split("/");

  // Extract the last part, which represents the customer ID
  const customerId = parts[parts.length - 1];

  return customerId;
}

export function encryptId(id: string) {
  return btoa(id);
}

export function decryptId(id: string) {
  return atob(id);
}

export const getTransactionStatus = (date: Date) => {
  const today = new Date();
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(today.getDate() - 2);

  return date > twoDaysAgo ? "Processing" : "Success";
};

export const authFormSchema = (type: string) => z.object({
  firstName: type === 'sign-in' ?   z.string().optional() : z.string().min(3),
  lastName: type === 'sign-in' ?   z.string().optional() : z.string().min(3),
  address1: type === 'sign-in' ? z.string().optional() : z.string().trim().min(3).max(50),
  country: type === 'sign-in' ? z.string().optional() : z.string().length(2, 'Choose your country.'),
  regionCode: type === 'sign-in' ? z.string().optional() : z.string()
    .trim()
    .min(1, 'Enter your state, province, or region.')
    .max(12, 'Use a short region code.'),
  postalCode: type === 'sign-in' ? z.string().optional() : z.string()
    .trim()
    .min(3, 'Enter your postal code.')
    .max(12, 'Enter a valid postal code.'),
  dateOfBirth: type === 'sign-in' ? z.string().optional() : z.string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use the format YYYY-MM-DD.')
    .refine((value) => {
      const birthDate = new Date(`${value}T00:00:00Z`);
      const today = new Date();
      const age = today.getUTCFullYear() - birthDate.getUTCFullYear();
      const hasHadBirthday = today.getUTCMonth() > birthDate.getUTCMonth()
        || (today.getUTCMonth() === birthDate.getUTCMonth() && today.getUTCDate() >= birthDate.getUTCDate());
      return Number.isFinite(birthDate.getTime()) && (age - (hasHadBirthday ? 0 : 1)) >= 18;
    }, 'You must be at least 18 years old.'),
  ssn: type === 'sign-in' ? z.string().optional() : z.string()
    .trim()
    .min(4, 'Enter at least 4 characters.')
    .max(20, 'Enter a valid identity number.'),
  city: type === 'sign-in' ?   z.string().optional() : z.string().min(2),
  //both
    email: z.string().email(),
  password: z.string().min(8),
})