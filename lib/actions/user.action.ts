'use server'

import { ID, Query } from "node-appwrite";
import { createAdminClient, createGuestClient } from "../appwrite";
import { AUTH_COOKIE_NAME, createAuthToken, createBankingModeToken, getAuthCookieOptions, verifyAuthToken, verifyBankingModeToken } from "../auth-session";
import { cookies } from "next/headers";
import { encryptId, extractCustomerIdFromUrl, parseStringify } from "../utils";
import { CountryCode, ProcessorTokenCreateRequest, ProcessorTokenCreateRequestProcessorEnum, Products } from "plaid";
import { plaidClient  } from "@/lib/plaid";
import { revalidatePath } from "next/cache";
import { addFundingSource, createDwollaCustomer } from "./dwolla.actions";

const {
    APPWRITE_DATABASE_ID: DATABASE_ID,
    APPWRITE_USER_COLLECTION_ID: USER_COLLECTION_ID,
    APPWRITE_BANK_COLLECTION_ID: BANK_COLLECTION_ID,
} = process.env;

export const getUserInfo = async ({ userId }: getUserInfoProps) => {
    try {
        const { database } = await createAdminClient();

        const user = await database.listDocuments(
            DATABASE_ID!,
            USER_COLLECTION_ID!,
            [Query.equal('userId', userId)]
        )

        return parseStringify(user.documents[0]);
    } catch (error) {
        console.log(error)
    }
}

export async function toAppUser(appwriteUser: {
    $id: string;
    email?: string;
    name?: string;
    mode?: BankingMode;
    firstName?: string;
    lastName?: string;
    userId?: string;
} | null): Promise<User> {
    const modeCookie = verifyBankingModeToken((await cookies()).get('nexa-banking-mode')?.value);
    const resolvedMode: BankingMode = modeCookie && (modeCookie.userId === (appwriteUser?.userId || appwriteUser?.$id))
        ? modeCookie.mode
        : appwriteUser?.mode || 'unset';

    const name = appwriteUser?.name?.trim() || 'Guest';
    const nameParts = name.split(/\s+/);

    return {
        $id: appwriteUser?.$id || 'guest',
        email: appwriteUser?.email || '',
        userId: appwriteUser?.userId || appwriteUser?.$id || 'guest',
        name,
        firstName: appwriteUser?.firstName || nameParts[0] || 'Guest',
        lastName: appwriteUser?.lastName || nameParts.slice(1).join(' '),
        dwollaCustomerUrl: '',
        dwollaCustomerId: '',
        address1: '',
        city: '',
        country: '',
        regionCode: '',
        postalCode: '',
        dateOfBirth: '',
        ssn: '',
        mode: resolvedMode,
    };
}

export const signIn = async (userData: LoginUser): Promise<{ success: boolean; error: string | null }> => {
    try {
        const { account } = await createGuestClient();
        const session = await account.createEmailPasswordSession(
            userData.email,
            userData.password,
        );

        (await cookies()).set(AUTH_COOKIE_NAME, createAuthToken(session.userId), getAuthCookieOptions());
        return { success: true, error: null };
    } catch (error) {
        console.error('Error', error);
        return {
            success: false,
            error: error instanceof Error
                ? error.message
                : 'Unable to sign in. Please try again.',
        };
    }
}

export const signUp = async ({ password, ...userData }: SignUpParams) => {
    const normalizedUserData = {
        ...userData,
           country: userData.country.trim().toUpperCase(),
           regionCode: userData.regionCode.trim().toUpperCase(),
    };
    const { email, firstName, lastName } = normalizedUserData;
    let createdUserId: string | null = null;

        try {
            const { database, user } = await createAdminClient();

            let dwollaCustomerUrl = '';
            let dwollaCustomerId = '';
            if (normalizedUserData.country === 'US') {
                const createdDwollaUrl = await createDwollaCustomer({
                    firstName,
                    lastName,
                    email,
                    type: 'personal',
                    address1: normalizedUserData.address1,
                    city: normalizedUserData.city,
                    state: normalizedUserData.regionCode,
                    postalCode: normalizedUserData.postalCode,
                    dateOfBirth: normalizedUserData.dateOfBirth,
                    ssn: normalizedUserData.ssn,
                });
                if (!createdDwollaUrl) throw new Error('Error creating Dwolla customer');
                dwollaCustomerUrl = createdDwollaUrl;
                dwollaCustomerId = extractCustomerIdFromUrl(createdDwollaUrl);
            }

            const newUserAccount = await user.create({
                userId: ID.unique(),
                email,
                password,
                name: `${firstName} ${lastName}`,
            });
            createdUserId = newUserAccount.$id;

            if(!newUserAccount) throw new Error('Error creating user')

            await database.createDocument(
                DATABASE_ID!,
                USER_COLLECTION_ID!,
                ID.unique(),
                {
                        ...normalizedUserData,
                        country: userData.country.trim().toUpperCase(),
                        regionCode: userData.regionCode.trim().toUpperCase(),
                    state: normalizedUserData.regionCode,
                    userId: newUserAccount.$id,
                    dwollaCustomerId,
                    dwollaCustomerUrl
                }
            )

        const { account: guestAccount } = await createGuestClient();
        await guestAccount.createEmailPasswordSession(email, password);

        (await cookies()).set(AUTH_COOKIE_NAME, createAuthToken(newUserAccount.$id), getAuthCookieOptions());

        return { user: parseStringify(newUserAccount), error: null };
        } catch (error) {
        if (createdUserId) {
            try {
                const { user } = await createAdminClient();
                await user.delete(createdUserId);
            } catch (cleanupError) {
                console.error('Unable to clean up incomplete sign-up:', cleanupError);
            }
        }
        console.error('Error', error);
        const message = error instanceof Error ? error.message : '';
        return {
            user: null,
            error: message.includes('already exists')
                ? 'An account with this email already exists. Try signing in instead.'
                : message.includes('State must be a 2-letter abbreviation')
                    ? 'Check your country, region, and postal code.'
                : message.includes('documents.write')
                    ? 'Appwrite API key needs the documents.write permission.'
                : 'Unable to create your account. Check your Appwrite configuration and try again.',
        };
    }
} 

export async function getLoggedInUser() {
    try {
        const userId = verifyAuthToken((await cookies()).get("nexa-session")?.value);
        if (!userId) return null;

        const user = await getUserInfo({ userId });
        const modeCookie = verifyBankingModeToken((await cookies()).get('nexa-banking-mode')?.value);
        if (modeCookie && modeCookie.userId === userId) {
            if (user) return { ...user, mode: modeCookie.mode };
        }

        if (user) return user;

        const { user: appwriteUsers } = await createAdminClient();
        const account = await appwriteUsers.get(userId);
        const name = account.name?.trim() || 'Guest';
        const nameParts = name.split(/\s+/);

        return {
            ...account,
            userId: account.$id,
            name,
            firstName: nameParts[0] || 'Guest',
            lastName: nameParts.slice(1).join(' '),
            dwollaCustomerUrl: '',
            dwollaCustomerId: '',
            address1: '',
            city: '',
            country: '',
            regionCode: '',
            postalCode: '',
            dateOfBirth: '',
            ssn: '',
            mode: modeCookie?.userId === userId ? modeCookie.mode : 'unset',
        };
    } catch (error) {
        console.error('Session lookup failed:', error);
        return null;
    }
}

export async function getCurrentUserId() {
    const user = await getLoggedInUser();
    return user?.userId || user?.$id || null;
}

export async function setBankingMode({ userId, mode }: { userId: string; mode: BankingMode }) {
    if (mode !== 'demo' && mode !== 'actual') {
        throw new Error('A valid banking mode is required.');
    }

    (await cookies()).set('nexa-banking-mode', createBankingModeToken(userId, mode), {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
    });

    try {
        const { database } = await createAdminClient();
        const userDoc = await database.listDocuments(
            DATABASE_ID!,
            USER_COLLECTION_ID!,
            [Query.equal('userId', userId)]
        );

        const existingUser = userDoc.documents[0];
        if (!existingUser) {
            return { mode, persisted: false };
        }

        try {
            const updatedUser = await database.updateDocument(
                DATABASE_ID!,
                USER_COLLECTION_ID!,
                existingUser.$id,
                { mode }
            );
            return parseStringify({ ...updatedUser, mode, persisted: true });
        } catch (dbError) {
            console.warn('Mode attribute is not yet available in Appwrite schema; using secure cookie fallback.', dbError);
            return { mode, persisted: false };
        }
    } catch (error) {
        console.warn('Unable to persist banking mode to database; cookie fallback active.', error);
        return { mode, persisted: false };
    }
}

export const createLinkToken = async (user: User) => {
    try {
        const tokenParams = {
            user: {
                client_user_id: user.$id
            },
            client_name: `${user.firstName} ${user.lastName}`,
            products: ['auth'] as Products[],
            language: 'en',
                country_codes: [user.country || 'US'] as CountryCode[]
        }

        const response = await plaidClient.linkTokenCreate(tokenParams);

        return parseStringify({ linkToken: response.data.link_token })
    } catch (error) {
        console.error('Unable to create Plaid link token:', error);
        throw new Error('Unable to create a Plaid link token.');
    }
}

export const getBanks = async ({ userId }: getBanksProps) => {
    const { database } = await createAdminClient();
    const banks = await database.listDocuments(
        DATABASE_ID!,
        BANK_COLLECTION_ID!,
        [Query.equal('userId', userId)]
    );
    return parseStringify(banks.documents);
};

export const getBank = async ({ documentId }: getBankProps) => {
    const { database } = await createAdminClient();
    return parseStringify(await database.getDocument(
        DATABASE_ID!,
        BANK_COLLECTION_ID!,
        documentId
    ));
};

export const getBankByAccountId = async ({ accountId }: getBankByAccountIdProps) => {
    const { database } = await createAdminClient();

    const banks = await database.listDocuments(
        DATABASE_ID!,
        BANK_COLLECTION_ID!,
        [Query.equal('accountId', accountId)]
    );

    return parseStringify(banks.documents[0]);
};

export const createBankAccount = async ({
    userId,
    bankId,
    accountId,
    accessToken,
    fundingSourceUrl,
    sharableId,
}: createBankAccountProps) => {
    try {
        const { database } = await createAdminClient();

        const bankAccount = await database.createDocument(
            DATABASE_ID!,
            BANK_COLLECTION_ID!,
            ID.unique(),
            {
                userId,
                bankId,
                accountId,
                accessToken,
                fundingSourceUrl,
                sharableId,
            }
        )
        
        if(bankAccount.total !== 1) return null;

        return parseStringify(bankAccount);
    } catch (error) {
        console.error('Unable to save bank account:', error);
        throw new Error('Unable to save the linked bank account.');
    }
}

export const exchangePublicToken = async ({
    publicToken, 
    user, 
}: exchangePublicTokenProps) => {
    try {
        //exchane public token for access token and item ID 
        const response = await plaidClient.itemPublicTokenExchange({
            public_token: publicToken,
        });

        const accessToken = response.data.access_token;
        const itemId = response.data.item_id;

        //get account information from plaid using the access token 
        const accountResponse = await plaidClient.accountsGet({
            access_token: accessToken, 
        });

        const accountData = accountResponse.data.accounts[0]
        if (!accountData) throw new Error('No bank account was returned by Plaid.');

        //create a processor token for dwolla using the access token and account ID 
        const request: ProcessorTokenCreateRequest = {
            access_token: accessToken,
            account_id: accountData.account_id,
            processor: "dwolla" as ProcessorTokenCreateRequestProcessorEnum,
        };

        const processorTokenResponse = await plaidClient.processorTokenCreate(request);
        const processorToken = processorTokenResponse.data.processor_token;

        //create a funding source URl for the account usig the Dwolla customer ID, processor token, and bank name
        const fundingSourceUrl = await addFundingSource({
            dwollaCustomerId: user.dwollaCustomerId,
            processorToken,
            bankName: accountData.name,
        });

        //if the funding source URL is not created, throw an error 
        if (!fundingSourceUrl) throw Error;

        //create a bank account using the user ID, item ID, account ID, access token, funding source URL, and sharable ID
        await createBankAccount({
            userId: user.$id,
            bankId: itemId,
            accountId: accountData.account_id,
            accessToken, 
            fundingSourceUrl,
            sharableId: encryptId(accountData.account_id),
        });

        //revalidate the path to reflect the changes
        revalidatePath('/');

        //return a success message
        return parseStringify({
            publicTokenExchange: 'complete'
        });
    } catch (error) {
        console.error("An error occurred while exchanging Plaid token:", error);
        throw new Error('Unable to link this bank account.');
    }
}
