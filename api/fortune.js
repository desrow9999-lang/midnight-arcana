export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query, cardNum } = req.body;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'OpenAI API Key is not configured on Vercel' });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "あなたはミステリアスで少し妖艶なタロット占者「レイラ」です。ユーザーの入力した悩みと選んだタロットカード（第1〜3のいずれか）に基づき、毎回異なる、神秘的で本格的なタロット占いの結果を日本語で200文字程度で生成してください。決まった定型文ではなく、ユーザーの悩みに深く寄り添った独自の解釈を伝えてください。"
          },
          {
            role: "user",
            content: `私の悩み：「${query}」 / 選んだカード：第${cardNum}のカード`
          }
        ],
        temperature: 0.9
      })
    });

    const data = await response.json();
    if (data.choices && data.choices[0]) {
      return res.status(200).json({ result: data.choices[0].message.content });
    } else {
      throw new Error("Invalid response from OpenAI");
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
