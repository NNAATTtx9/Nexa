import {
  Configuration,
  LinkApi,
  PublicApi,
  TokenGrantTypeEnum,
  type LinkTokenRequest,
  type TokenRequest,
} from "@finverse/sdk-typescript";

const basePath = process.env.FINVERSE_API_URL ?? "https://api.prod.finverse.net";

const getFinverseErrorMessage = (error: unknown) => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: unknown } }).response;
    if (response?.data) {
      return typeof response.data === "string" ? response.data : JSON.stringify(response.data);
    }
  }
  return error instanceof Error ? error.message : "Finverse request failed.";
};

const getCredentials = () => {
  const clientId = process.env.FINVERSE_CLIENT_ID;
  const clientSecret = process.env.FINVERSE_CLIENT_SECRET;
  const redirectUri = process.env.FINVERSE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("Finverse environment variables are not configured.");
  }

  if (clientSecret.length < 64) {
    throw new Error("FINVERSE_CLIENT_SECRET must be the full secret from Finverse and contain at least 64 characters.");
  }

  return { clientId, clientSecret, redirectUri };
};

export const getFinverseCustomerToken = async () => {
  const { clientId, clientSecret } = getCredentials();
  const configuration = new Configuration({ basePath });
  const request: TokenRequest = {
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "client_credentials",
  };
  try {
    const response = await new PublicApi(configuration).generateCustomerAccessToken(request);
    return response.data.access_token;
  } catch (error) {
    throw new Error(getFinverseErrorMessage(error));
  }
};

export const createFinverseLink = async ({ userId, state, institution }: { userId: string; state: string; institution?: string }) => {
  const { clientId, redirectUri } = getCredentials();
  const customerToken = await getFinverseCustomerToken();
  const configuration = new Configuration({ basePath, accessToken: customerToken });
  const request: any = {
    client_id: clientId,
    grant_type: "client_credentials",
    response_type: "code",
    response_mode: "form_post",
    user_id: userId,
    redirect_uri: redirectUri,
    state,
    ui_mode: "redirect",
    language: "en",
    products_requested: ["ACCOUNTS", "TRANSACTIONS"],
  };
  if (institution) {
    request.institution_id = institution;
    console.log(`Requesting Finverse link for institution=${institution}`);
  }
  try {
    const response = await new LinkApi(configuration).generateLinkToken(request);
    return response.data.link_url;
  } catch (error) {
    const providerMessage = getFinverseErrorMessage(error);
    if (providerMessage.toLowerCase().includes("invalid redirect_uri") || providerMessage.includes("40006")) {
      throw new Error(`Finverse rejected the redirect URI "${redirectUri}". Register this exact URL in the Finverse application settings, then restart the app.`);
    }
    throw new Error(getFinverseErrorMessage(error));
  }
};

export const exchangeFinverseCode = async (code: string) => {
  const { clientId, redirectUri } = getCredentials();
  const customerToken = await getFinverseCustomerToken();
  const configuration = new Configuration({ basePath, accessToken: customerToken });
  try {
    const response = await new LinkApi(configuration).token(
      TokenGrantTypeEnum.AuthorizationCode,
      code,
      clientId,
      redirectUri,
    );
    return response.data.access_token;
  } catch (error) {
    throw new Error(getFinverseErrorMessage(error));
  }
};
