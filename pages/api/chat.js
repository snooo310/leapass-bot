import { fetchTips } from "../../lib/notion";

export const config = {
  api: {
    responseLimit: false,
  },
};

// TIPSをキャッシュ（10分）
let cachedTips = null;
let cacheTime = 0;
const CACHE_TTL = 10 * 60 * 1000;

async function getTips() {
  if (cachedTips && Date.now() - cacheTime < CACHE_TTL) return cachedTips;
  cachedTips = await fetchTips();
  cacheTime = Date.now();
  return cachedTips;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { messages } = req.body;
  if (!messages?.length) return res.status(400).json({ error: "messages required" });

  const tips = await getTips();

  const systemPrompt = `あなたはTOEICコーチング「LeaPASS」のAIアシスタントです。
LeaPASSの講師・竹下れおが蓄積したTOEIC攻略ノウハウをもとに、受講生や訪問者の質問に答えてください。

【LeaPASS講師・竹下れおのプロフィール】
- 名前：竹下れお（たけしたれお）/ Reo Takeshita
- 性別：女性 / 生年月日：1996年12月19日
- 出身：純ジャパ（高校まで特別な英語教育ゼロ、海外経験なし）
- 学歴：国際教養大学（AIU）卒、GPA 3.8
- 英語資格：TOEIC 985点（L:495 / R:490）、英検準1級
  ※ TOEICスコアは2021年6月にファーストリテイリング社（ユニクロ親会社）受験で公式証明済み
- 職歴：ファーストリテイリング（ユニクロ）で翻訳・通訳業務（2020年）
- 留学・海外経験：カナダ留学（2018年）/ オーストラリアワーホリ（2025年〜現在進行中・5ヶ月目）
- 就活実績：ボストンキャリアフォーラムで4社内定
- 挫折経験：オンライン英会話の詐欺に遭い200万円を失った経験あり。この体験から「本当に効果的な英語学習法」を追求し、LeaPASSを立ち上げた
- SNS：Instagram @reo_toeiceng / note: note.com/reo_toeiceng
- 指導スタンス：「純ジャパでもTOEIC985点が取れた」実証済みのメソッドを伝える。受講生に寄り添い、継続をサポートすることを最重視

【LeaPASSサービス概要】
- サービス名：LeaPASS（リーパス）
- コンセプト：TOEIC 900点突破に特化したパーソナルコーチング
- 料金：¥98,000（買い切り・分割払い相談可）
- 内容：①個別学習計画作成 ②月2回オンライン面談 ③無制限チャットサポート ④毎日の日報フィードバック ⑤オンライン学習コンテンツ ⑥受講生コミュニティ ⑦キャリア相談サポート
- ターゲット：TOEIC 600〜800点台で900点を目指している社会人・学生
- 問い合わせ：Instagram @reo_toeiceng のDMへ

【重要なルール】
- 以下のTIPSデータベースに書かれた内容をベースに回答する
- TIPSに載っていない内容は「詳しくはLeaPASSのコーチ・れおに直接聞いてみてください！Instagram @reo_toeiceng のDMへどうぞ😊」と案内する
- 返答は簡潔・具体的・実践的に
- 親しみやすい日本語で話しかける（です・ます調）
- スコア帯（600点台・700点台・800点台など）を意識した回答をする
- れおのプロフィールについて聞かれた場合は、上記のプロフィールをもとに自信を持って答える
- 「詐欺に遭った話」など繊細なトピックは事実として伝えつつ、ネガティブにならないようポジティブな文脈（だから今のれおがある）で伝える

【LeaPASSのTIPSデータベース】
${tips}`;

  // Groq APIへのメッセージ配列（OpenAI互換形式）
  const groqMessages = [
    { role: "system", content: systemPrompt },
    ...messages.map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    })),
  ];

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  try {
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: groqMessages,
        stream: true,
        max_tokens: 1024,
      }),
    });

    if (!groqRes.ok) {
      const err = await groqRes.text();
      console.error("[groq] error:", err);
      res.write(`data: ${JSON.stringify({ error: "エラーが発生しました" })}\n\n`);
      res.end();
      return;
    }

    const reader = groqRes.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop(); // 未完成行を次回に持ち越す

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data:")) continue;
        const data = trimmed.slice(5).trim();
        if (data === "[DONE]") {
          res.write("data: [DONE]\n\n");
          res.end();
          return;
        }
        try {
          const json = JSON.parse(data);
          const text = json.choices?.[0]?.delta?.content;
          if (text) res.write(`data: ${JSON.stringify({ text })}\n\n`);
        } catch {
          // ignore parse errors
        }
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (err) {
    console.error("[groq] fetch error:", err);
    res.write(`data: ${JSON.stringify({ error: "エラーが発生しました" })}\n\n`);
    res.end();
  }
}
