export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: "Method not allowed. Use POST."
    });
  }

  const backendUrl = process.env.APPS_SCRIPT_WEB_APP_URL;

  if (!backendUrl) {
    return res.status(500).json({
      ok: false,
      error: "Missing Vercel environment variable: APPS_SCRIPT_WEB_APP_URL"
    });
  }

  if (
    !backendUrl.startsWith("https://script.google.com/macros/s/") ||
    !backendUrl.endsWith("/exec")
  ) {
    return res.status(500).json({
      ok: false,
      error: "APPS_SCRIPT_WEB_APP_URL must be a Google Apps Script Web App URL ending in /exec."
    });
  }

  try {
    const upstream = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(req.body || {})
    });

    const text = await upstream.text();

    try {
      const json = JSON.parse(text);
      return res.status(upstream.ok ? 200 : upstream.status).json(json);
    } catch (err) {
      return res.status(502).json({
        ok: false,
        error: text || "Apps Script returned a non-JSON response."
      });
    }
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err && err.message ? err.message : String(err)
    });
  }
}
