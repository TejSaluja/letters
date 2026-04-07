import { sql } from "@vercel/postgres";

const VALID_RECIPIENTS = new Set(["tej", "ridhi"]);

async function ensureLettersTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS letters (
      id TEXT PRIMARY KEY,
      recipient TEXT NOT NULL,
      author TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT letters_recipient_check CHECK (recipient IN ('tej', 'ridhi'))
    )
  `;
}

function normalizeRow(row) {
  return {
    id: row.id,
    recipient: row.recipient,
    author: row.author,
    content: row.content,
    date: new Date(row.created_at).toISOString(),
  };
}

function validatePayload(payload) {
  const recipient = payload?.recipient;
  const author =
    typeof payload?.author === "string" ? payload.author.trim() : "";
  const content =
    typeof payload?.content === "string" ? payload.content.trim() : "";

  if (!VALID_RECIPIENTS.has(recipient)) {
    return { error: "Invalid recipient" };
  }

  if (!author) {
    return { error: "Author is required" };
  }

  if (!content) {
    return { error: "Letter content is required" };
  }

  return {
    recipient,
    author,
    content,
  };
}

export default async function handler(req, res) {
  try {
    await ensureLettersTable();

    if (req.method === "GET") {
      const result = await sql`
        SELECT id, recipient, author, content, created_at
        FROM letters
        ORDER BY created_at DESC
      `;

      return res.status(200).json({
        letters: result.rows.map(normalizeRow),
      });
    }

    if (req.method === "POST") {
      const validated = validatePayload(req.body);
      if (validated.error) {
        return res.status(400).json({ error: validated.error });
      }

      const id = crypto.randomUUID();
      const result = await sql`
        INSERT INTO letters (id, recipient, author, content)
        VALUES (${id}, ${validated.recipient}, ${validated.author}, ${validated.content})
        RETURNING id, recipient, author, content, created_at
      `;

      return res.status(201).json({
        letter: normalizeRow(result.rows[0]),
      });
    }

    if (req.method === "PUT") {
      const id = typeof req.query?.id === "string" ? req.query.id : "";
      if (!id) {
        return res.status(400).json({ error: "Missing letter id" });
      }

      const validated = validatePayload(req.body);
      if (validated.error) {
        return res.status(400).json({ error: validated.error });
      }

      const result = await sql`
        UPDATE letters
        SET recipient = ${validated.recipient},
            author = ${validated.author},
            content = ${validated.content},
            updated_at = NOW()
        WHERE id = ${id}
        RETURNING id, recipient, author, content, created_at
      `;

      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Letter not found" });
      }

      return res.status(200).json({
        letter: normalizeRow(result.rows[0]),
      });
    }

    if (req.method === "DELETE") {
      const id = typeof req.query?.id === "string" ? req.query.id : "";
      if (!id) {
        return res.status(400).json({ error: "Missing letter id" });
      }

      const result = await sql`
        DELETE FROM letters
        WHERE id = ${id}
      `;

      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Letter not found" });
      }

      return res.status(200).json({ success: true });
    }

    res.setHeader("Allow", "GET,POST,PUT,DELETE");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("letters api failed:", error);
    return res.status(500).json({ error: "Letters API failed" });
  }
}
