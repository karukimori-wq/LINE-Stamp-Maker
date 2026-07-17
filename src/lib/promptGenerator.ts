import type { Project } from '@/types/project';

export function generateIdeaPrompt(project: Project): string {
  const { idea } = project;
  return `あなたはLINEスタンプの企画・キャラクターデザインを支援するクリエイターです。以下の情報から、企画と9個のスタンプ案を作成してください。\n\n【プロジェクト名】${project.name}\n【アイデア】${idea.rawIdea}\n【ターゲット】${idea.target}\n【利用シーン】${idea.usageScene}\n【雰囲気】${idea.mood}\n【その他の希望】${idea.notes}\n\n重要：回答は説明文やMarkdownを付けず、次のJSON形式だけで返してください。stampsは必ず9件にしてください。commentは実際にスタンプ画像へ入れる短く自然な日本語にしてください。emotion、expression、pose、sceneはcommentに合う内容にしてください。\n\n{\n  "concept": "企画コンセプト",\n  "characterDirection": "キャラクター方向性",\n  "designStyle": "デザインテイスト",\n  "usageScene": "主な利用シーン",\n  "dialogueDirection": "セリフ全体の方向性",\n  "differentiation": "差別化ポイント",\n  "stamps": [\n    { "number": 1, "comment": "ありがとう！", "emotion": "嬉しい", "expression": "笑顔", "pose": "お辞儀", "scene": "感謝を伝える" }\n  ]\n}\n\n9件は日常で実際に使う頻度と企画コンセプトの両方を考えて選定してください。LINE公式サービスと誤認される表現や既存キャラクターの模倣は避け、オリジナル作品として提案してください。`;
}

export function generateCharacterPrompt(project: Project): string {
  const { concept, character } = project;
  const comments = project.stamps.map((s) => `・${s.text}`).join('\n');
  return `あなたはスタンプ向けキャラクターを設計するイラストレーターです。STEP 1で確定した企画を基準に、キャラクター画像を1体生成してください。\n\n【企画コンセプト】${concept.concept}\n【キャラクター方向性】${concept.characterDirection}\n【デザインテイスト】${concept.designStyle}\n【利用シーン】${concept.usageScene}\n【差別化ポイント】${concept.differentiation}\n\n【今後展開する9スタンプのコメント】\n${comments}\n\n【キャラクター名】${character.name}\n【種類】${character.type}\n【性格】${character.personality}\n【外見】${character.appearance}\n【服装】${character.clothing}\n【メインカラー】${character.mainColor}\n【画風】${character.artStyle}\n【特徴】${character.features}\n【NG条件】${character.negativePrompt}\n\n9種類の感情・表情・ポーズへ展開しやすく、すべてのスタンプで顔・体型・配色・服装・線のタッチを一貫して維持できるデザインにしてください。`;
}

export function generateStampGridPrompt(project: Project): string {
  const stampLines = project.stamps.map((stamp) => `${String(stamp.number).padStart(2, '0')}. セリフ「${stamp.text}」 / 感情:${stamp.emotion} / 表情:${stamp.expression} / ポーズ:${stamp.pose} / シチュエーション:${stamp.situation}`).join('\n');
  const { character, concept } = project;
  return `あなたはLINEスタンプ用イラストを制作するイラストレーターです。STEP 1で確定した9個のスタンプ案とSTEP 2で確定したキャラクター設定を使い、9種類のスタンプを1枚の3×3グリッド画像として生成してください。\n\n【企画】${concept.concept}\n【利用シーン】${concept.usageScene}\n【セリフ方向性】${concept.dialogueDirection}\n\n【キャラクター】${character.name} / ${character.type}\n性格:${character.personality}\n外見:${character.appearance}\n服装:${character.clothing}\nメインカラー:${character.mainColor}\n画風:${character.artStyle}\n特徴:${character.features}\nNG:${character.negativePrompt}\n\n【重要な一貫性指示】\n9コマすべてで同一キャラクターとして、顔、体型、配色、服装、線のタッチを統一してください。各コマは独立して切り出せるよう、キャラクターや文字がセル境界をまたがないようにしてください。\n\n【STEP 1で確定した9スタンプ】\n${stampLines}\n\n【配置】\n左上から右へ01,02,03、中央段04,05,06、下段07,08,09の順で、完全な3列×3行の均等グリッドに配置してください。各セルの余白を十分に確保し、正方形キャンバスで生成してください。`;
}
