import type { Project } from '@/types/project';

export function generateIdeaPrompt(project: Project): string {
  const { idea } = project;
  return `あなたはLINEスタンプの企画・キャラクターデザインを支援するクリエイターです。\n以下の情報をもとに、日常で使いやすく統一感のあるLINEスタンプ企画を提案してください。\n\n【プロジェクト名】${project.name}\n【アイデア】${idea.rawIdea}\n【ターゲット】${idea.target}\n【利用シーン】${idea.usageScene}\n【雰囲気】${idea.mood}\n【その他の希望】${idea.notes}\n\n次の項目に分けて日本語で回答してください。\n1. コンセプト\n2. キャラクター方向性\n3. デザインテイスト\n4. 利用シーン\n5. セリフ方向性\n6. 差別化ポイント\n\nLINE公式サービスと誤認される表現は避け、オリジナル作品として提案してください。`;
}

export function generateCharacterPrompt(project: Project): string {
  const { concept, character } = project;
  return `あなたはスタンプ向けキャラクターを設計するイラストレーターです。以下の設定を厳密に維持して、キャラクター画像を1体生成してください。\n\n【企画コンセプト】${concept.concept}\n【キャラクター方向性】${concept.characterDirection}\n【デザインテイスト】${concept.designStyle}\n\n【キャラクター名】${character.name}\n【種類】${character.type}\n【性格】${character.personality}\n【外見】${character.appearance}\n【服装】${character.clothing}\n【メインカラー】${character.mainColor}\n【画風】${character.artStyle}\n【特徴】${character.features}\n【NG条件】${character.negativePrompt}\n\n白または透明にしやすいシンプルな背景、キャラクター全身が見える構図、スタンプ展開しやすいデザインにしてください。今後9種類のポーズや表情へ展開しても、顔・体型・配色・服装・線のタッチが一貫するデザインにしてください。`;
}

export function generateStampGridPrompt(project: Project): string {
  const stampLines = project.stamps.map((stamp) => `${String(stamp.number).padStart(2, '0')}. セリフ「${stamp.text}」 / 感情:${stamp.emotion} / 表情:${stamp.expression} / ポーズ:${stamp.pose} / シチュエーション:${stamp.situation}`).join('\n');
  const { character, concept } = project;
  return `あなたはLINEスタンプ用イラストを制作するイラストレーターです。以下の企画とキャラクター設定を使い、9種類のスタンプを1枚の3×3グリッド画像として生成してください。\n\n【企画】${concept.concept}\n【利用シーン】${concept.usageScene}\n【セリフ方向性】${concept.dialogueDirection}\n\n【キャラクター】${character.name} / ${character.type}\n性格:${character.personality}\n外見:${character.appearance}\n服装:${character.clothing}\nメインカラー:${character.mainColor}\n画風:${character.artStyle}\n特徴:${character.features}\nNG:${character.negativePrompt}\n\n【重要な一貫性指示】\n9コマすべてで同一キャラクターとして、顔、体型、耳や髪などの形状、配色、服装、線のタッチを統一してください。各コマは独立して切り出せるよう、キャラクターや文字がセル境界をまたがないようにしてください。\n\n【9スタンプ】\n${stampLines}\n\n【配置】\n左上から右へ01,02,03、中央段04,05,06、下段07,08,09の順で、完全な3列×3行の均等グリッドに配置してください。各セルの余白を十分に確保し、正方形キャンバスで生成してください。`;
}
