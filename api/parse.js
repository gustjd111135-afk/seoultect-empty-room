// /api/parse — 시간표 텍스트를 Claude로 파싱 (API 키는 서버 환경변수에만 존재)
export default async function handler(req, res) {
  if (req.method !== "POST") { res.status(405).json({ error: "POST만 허용" }); return; }
  try {
    let body = req.body;
    if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
    const prompt = body && body.prompt;
    if (!prompt) { res.status(400).json({ error: "prompt 없음" }); return; }

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1800,
        messages: [{ role: "user", content: prompt }]
      })
    });
    const data = await r.json();
    if (data.error) { res.status(500).json({ error: data.error.message || "AI 오류" }); return; }
    const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("\n").trim();
    res.status(200).json({ text });
  } catch (e) {
    res.status(500).json({ error: "요청 실패" });
  }
}
