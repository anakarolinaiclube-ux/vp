export const runtime = "nodejs18";

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OpenAI API Key not configured' });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Você é um planejador de viagens moderno e conciso." },
          { role: "user", content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 300
      })
    });

    const data = await response.json();
    const result = data?.choices?.[0]?.message?.content || "";

    return res.status(200).json({ result });

  } catch (error) {
    console.error("AI Error:", error);
    return res.status(500).json({ error: 'AI Error' });
  }
}
