import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_API_KEY });

// Notionデータベースから全TIPSを取得してテキストにまとめる
// スキーマ: TIPS(title), 内容(text), カテゴリ(select), スコア帯(multi_select)
export async function fetchTips() {
  const databaseId = process.env.NOTION_DATABASE_ID;
  const tips = [];
  let cursor = undefined;

  while (true) {
    const response = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
      page_size: 100,
    });

    for (const page of response.results) {
      const props = page.properties;

      const title = props["TIPS"]?.title?.map((t) => t.plain_text).join("") ?? "";
      const content = props["内容"]?.rich_text?.map((t) => t.plain_text).join("") ?? "";
      const category = props["カテゴリ"]?.select?.name ?? "";
      const scoreBands = props["スコア帯"]?.multi_select?.map((s) => s.name).join(", ") ?? "";

      if (!title) continue;

      const lines = [`【${title}】`];
      if (category) lines.push(`カテゴリ: ${category}`);
      if (scoreBands) lines.push(`対象スコア帯: ${scoreBands}`);
      if (content) lines.push(`内容: ${content}`);

      tips.push(lines.join("\n"));
    }

    if (!response.has_more) break;
    cursor = response.next_cursor;
  }

  return tips.join("\n\n---\n\n");
}
