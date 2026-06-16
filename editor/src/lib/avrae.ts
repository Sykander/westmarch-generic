export type AvraeGvar = {
  id?: string;
  value?: string;
  name?: string;
};

const GVARS_URL = "https://api.avrae.io/customizations/gvars";
const GVAR_DASHBOARD_URL = "https://avrae.io/dashboard/gvars";
const GVAR_ID_RE =
  /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/;

const REDIRECT_ERROR =
  "Avrae redirected the API request instead of returning gvar JSON. Check that the gvar id is a bare UUID and the token is current, or paste the gvar source manually.";

function headers(token: string) {
  return {
    Accept: "application/json, text/plain, */*",
    "Content-Type": "application/json",
    Authorization: token,
  };
}

export function normalizeGvarId(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";

  try {
    const url = new URL(trimmed);
    const queryId =
      url.searchParams.get("westmarch_config") ??
      url.searchParams.get("gvar") ??
      url.searchParams.get("id");
    if (queryId) return normalizeGvarId(queryId);
  } catch {
    // Not a URL; fall through to UUID extraction.
  }

  const match = GVAR_ID_RE.exec(trimmed);
  if (match) return match[0].toLowerCase();

  throw new Error(
    "Enter a westmarch_config gvar id as a UUID, or paste an editor share link containing ?westmarch_config=<uuid>.",
  );
}

export function makeGvarDashboardUrl(input: string): string | null {
  try {
    const gvarId = normalizeGvarId(input);
    return gvarId ? `${GVAR_DASHBOARD_URL}?lookup=${encodeURIComponent(gvarId)}` : null;
  } catch {
    return null;
  }
}

async function parseResponse(response: Response) {
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function requestAvrae(
  method: "GET" | "POST",
  id: string,
  token: string,
  payload?: unknown,
) {
  const gvarId = normalizeGvarId(id);
  let response: Response;

  try {
    response = await fetch(`${GVARS_URL}/${encodeURIComponent(gvarId)}`, {
      method,
      headers: headers(token),
      redirect: "manual",
      credentials: "omit",
      mode: "cors",
      body: payload === undefined ? undefined : JSON.stringify(payload),
    });
  } catch (error) {
    throw new Error(networkErrorMessage(error));
  }

  if (response.type === "opaqueredirect" || response.redirected) {
    throw new Error(REDIRECT_ERROR);
  }

  if (response.status >= 300 && response.status < 400) {
    throw new Error(REDIRECT_ERROR);
  }

  if (response.status === 0) {
    throw new Error(
      "The browser blocked the Avrae API response. Check the token and gvar id, then retry or use paste/export mode.",
    );
  }

  const data = await parseResponse(response);

  if (!response.ok) throw new Error(errorMessage(response, data));

  return data;
}

export async function fetchGvar(id: string, token: string): Promise<AvraeGvar> {
  const data = await requestAvrae("GET", id, token);

  if (!data || typeof data !== "object" || !("value" in data)) {
    throw new Error("Avrae returned a response without a gvar value.");
  }

  return data as AvraeGvar;
}

export async function updateGvar(
  id: string,
  token: string,
  body: string,
): Promise<unknown> {
  return requestAvrae("POST", id, token, { value: body });
}

function errorMessage(response: Response, data: unknown) {
  if (typeof data === "object" && data && "error" in data) {
    return String((data as { error: unknown }).error);
  }

  if (typeof data === "string" && data.trim()) {
    return `${data.trim()} (HTTP ${response.status})`;
  }

  return `HTTP ${response.status}`;
}

function networkErrorMessage(error: unknown) {
  const detail = error instanceof Error ? error.message : String(error);
  if (/redirect/i.test(detail)) return REDIRECT_ERROR;

  return `Avrae request failed before the API returned JSON. Check the token, gvar id, and browser network/CORS status. ${detail}`;
}
