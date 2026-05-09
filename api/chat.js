export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: "Method not allowed"
    });
  }

  const backendUrl = process.env.APPS_SCRIPT_BACKEND_URL;

  if (!backendUrl) {
    return res.status(500).json({
      ok: false,
      error: "Missing APPS_SCRIPT_BACKEND_URL in Vercel Environment Variables."
    });
  }

  try {
    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(req.body || {})
    });

    const text = await response.text();

    let data;

    try {
      data = JSON.parse(text);
    } catch (err) {
      return res.status(502).json({
        ok: false,
        error: "Apps Script returned non-JSON response.",
        preview: text.substring(0, 500)
      });
    }

    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: String(err && err.message ? err.message : err)
    });
  }
}
