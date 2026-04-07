import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

const SESSION_COOKIE_NAME = "letters_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

function toBase64Url(value) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (normalized.length % 4)) % 4);
  return Buffer.from(`${normalized}${padding}`, "base64").toString("utf8");
}

function getCookieValue(cookieHeader, name) {
  if (!cookieHeader) {
    return "";
  }

  const pairs = cookieHeader.split(";");
  for (const pair of pairs) {
    const [rawName, ...rest] = pair.trim().split("=");
    if (rawName === name) {
      return rest.join("=");
    }
  }

  return "";
}

function signPayload(encodedPayload, secret) {
  return createHmac("sha256", secret)
    .update(encodedPayload)
    .digest("base64url");
}

function secureStringCompare(left, right) {
  const leftHash = createHash("sha256").update(left).digest();
  const rightHash = createHash("sha256").update(right).digest();
  return timingSafeEqual(leftHash, rightHash);
}

function getSessionSecret() {
  return process.env.LETTER_APP_SESSION_SECRET;
}

export function verifyPassword(password) {
  const expectedPassword = process.env.LETTER_APP_PASSWORD;

  if (typeof expectedPassword !== "string" || !expectedPassword) {
    return { ok: false, status: 500, error: "Authentication is unavailable" };
  }

  if (typeof password !== "string" || !password.trim()) {
    return { ok: false, status: 400, error: "Password is required" };
  }

  const normalizedPassword = password.trim();
  const isValid = secureStringCompare(normalizedPassword, expectedPassword);
  if (!isValid) {
    return { ok: false, status: 401, error: "Invalid password" };
  }

  return { ok: true };
}

export function createSessionToken() {
  const secret = getSessionSecret();
  if (typeof secret !== "string" || !secret) {
    return { ok: false, status: 500, error: "Authentication is unavailable" };
  }

  const payload = {
    exp: Date.now() + SESSION_TTL_SECONDS * 1000,
    nonce: randomBytes(16).toString("hex"),
  };

  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = signPayload(encodedPayload, secret);

  return {
    ok: true,
    token: `${encodedPayload}.${signature}`,
  };
}

export function buildSessionCookie(token) {
  const secureFlag = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${SESSION_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}${secureFlag}`;
}

export function buildExpiredSessionCookie() {
  const secureFlag = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secureFlag}`;
}

export function verifyRequestSession(req) {
  const secret = getSessionSecret();
  if (typeof secret !== "string" || !secret) {
    return { ok: false, status: 500, error: "Authentication is unavailable" };
  }

  const token = getCookieValue(req.headers?.cookie, SESSION_COOKIE_NAME);
  if (!token) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }

  const tokenParts = token.split(".");
  if (tokenParts.length !== 2) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }

  const [encodedPayload, signature] = tokenParts;
  const expectedSignature = signPayload(encodedPayload, secret);

  if (signature.length !== expectedSignature.length) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }

  const isSignatureValid = timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature),
  );
  if (!isSignatureValid) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }

  try {
    const payload = JSON.parse(fromBase64Url(encodedPayload));
    if (typeof payload?.exp !== "number" || Date.now() >= payload.exp) {
      return { ok: false, status: 401, error: "Unauthorized" };
    }
  } catch {
    return { ok: false, status: 401, error: "Unauthorized" };
  }

  return { ok: true };
}
