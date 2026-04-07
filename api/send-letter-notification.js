const websiteUrl =
  process.env.LETTER_WEBSITE_URL || "https://www.google.com/?zx=1775572931959";

function getRecipientPhone(recipient) {
  if (recipient === "tej") {
    return process.env.TEJ_PHONE;
  }
  return process.env.RIDHI_PHONE;
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { recipient, author } = req.body || {};

  if (recipient !== "tej" && recipient !== "ridhi") {
    return res.status(400).json({ error: "Invalid recipient" });
  }

  if (typeof author !== "string" || !author.trim()) {
    return res.status(400).json({ error: "Author is required" });
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;
  const toNumber = getRecipientPhone(recipient);

  if (!accountSid || !authToken || !fromNumber || !toNumber) {
    return res.status(500).json({ error: "Missing SMS server configuration" });
  }

  const messageBody = `you have recieved a letter from ${author.trim()}\n${websiteUrl}`;

  const twilioResponse = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: toNumber,
        From: fromNumber,
        Body: messageBody,
      }),
    },
  );

  if (!twilioResponse.ok) {
    const twilioError = await twilioResponse.text();
    return res
      .status(502)
      .json({ error: `Twilio send failed: ${twilioError}` });
  }

  return res.status(200).json({ success: true });
};
