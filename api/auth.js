import {
  buildExpiredSessionCookie,
  buildSessionCookie,
  createSessionToken,
  verifyPassword,
  verifyRequestSession,
} from "./_auth.js";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const session = verifyRequestSession(req);
      if (!session.ok) {
        return res.status(session.status).json({ error: session.error });
      }

      return res.status(200).json({ authenticated: true });
    }

    if (req.method === "POST") {
      const password =
        typeof req.body?.password === "string" ? req.body.password : "";
      const passwordCheck = verifyPassword(password);
      if (!passwordCheck.ok) {
        return res
          .status(passwordCheck.status)
          .json({ error: passwordCheck.error });
      }

      const tokenResult = createSessionToken();
      if (!tokenResult.ok) {
        return res
          .status(tokenResult.status)
          .json({ error: tokenResult.error });
      }

      res.setHeader("Set-Cookie", buildSessionCookie(tokenResult.token));
      return res.status(200).json({ success: true });
    }

    if (req.method === "DELETE") {
      res.setHeader("Set-Cookie", buildExpiredSessionCookie());
      return res.status(200).json({ success: true });
    }

    res.setHeader("Allow", "GET,POST,DELETE");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("auth api failed:", error);
    return res.status(500).json({ error: "Authentication failed" });
  }
}
