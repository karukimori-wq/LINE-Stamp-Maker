import type { Project } from '@/types/project';

export function generateIdeaPrompt(project: Project): string {
  const { idea } = project;
  return `あなたはLINEスタンプの企画・キャラクターデザインを支援するクリエイターです。以下の情報から、企画と9個のスタンプ案を作成してください。\n\n【プロジェクト名】${project.name}\n【アイデア】${idea.rawIdea}\n【ターゲット】${idea.target}\n【利用シーン】${idea.usageScene}\n【雰囲気】${idea.mood}\n【その他の希望】${idea.notes}\n\n重要：回答は説明文やMarkdownを付けず、次のJSON形式だけで返してください。stampsは必ず9件にしてください。commentは実際にスタンプ画像へ入れる短く自然な日本語にしてください。emotion、expression、pose、sceneはcommentに合う内容にしてください。\n\n{\n  "concept": "企画コンセプト",\n  "characterDirection": "キャラクター方向性",\n  "designStyle": "デザインテイスト",\n  "usageScene": "主な利用シーン",\n  "dialogueDirection": "セリフ全体の方向性",\n  "differentiation": "差別化ポイント",\n  "stamps": [\n    { "number": 1, "comment": "ありがとう！", "emotion": "嬉しい", "expression": "笑顔", "pose": "お辞儀", "scene": "感謝を伝える" }\n  ]\n}\n\n9件は日常で実際に使う頻度と企画コンセプトの両方を考えて選定してください。LINE公式サービスと誤認される表現や既存キャラクターの模倣は避け、オリジナル作品として提案してください。`;
}

export function generateCharacterPrompt(project: Project): string {
  const { concept, character } = project;
  const comments = project.stamps.map((s) => `・${s.text}`).join('\n');
  return `あなたはスタンプ向けキャラクターを設計するイラストレーターです。STEP 1で確定した企画を基準に、キャラクター画像を1体生成してください。\n\n【企画コンセプト】${concept.concept}\n【キャラクター方向性】${concept.characterDirection}\n【デザインテイスト】${concept.designStyle}\n【利用シーン】${concept.usageScene}\n【差別化ポイント】${concept.differentiation}\n\n【今後展開する9スタンプのコメント】\n${comments}\n\n【キャラクター名】${character.name}\n【種類】${character.type}\n【性格】${character.personality}\n【外見】${character.appearance}\n【服装】${character.clothing}\n【メインカラー】${character.mainColor}\n【画風】${character.artStyle}\n【特徴】${character.features}\n【NG条件】${character.negativePrompt}\n\n9種類の感情・表情・ポーズへ展開しやすく、すべてのスタンプで顔・体型・配色・服装・線のタッチを一貫して維持できるデザインにしてください。背景は完全透明にし、白背景・単色背景・風景背景は描かないでください。キャラクター以外の不要な文字、番号、ラベル、枠線、グリッド線は描かないでください。`;
}

export function generateStampGridPrompt(project: Project): string {
  const stampLines = project.stamps.map((stamp) => `セル${String(stamp.number).padStart(2, '0')}: セリフ「${stamp.text}」 / 感情:${stamp.emotion} / 表情:${stamp.expression} / ポーズ:${stamp.pose} / シチュエーション:${stamp.situation}`).join('\n');
  const { character, concept } = project;
  return `あなたはLINEスタンプ用イラストを制作するイラストレーターです。STEP 1で確定した9個のスタンプ案とSTEP 2で確定したキャラクター設定を使い、9種類のスタンプを1枚の3×3グリッド画像として生成してください。\n\n【企画】${concept.concept}\n【利用シーン】${concept.usageScene}\n【セリフ方向性】${concept.dialogueDirection}\n\n【キャラクター】${character.name} / ${character.type}\n性格:${character.personality}\n外見:${character.appearance}\n服装:${character.clothing}\nメインカラー:${character.mainColor}\n画風:${character.artStyle}\n特徴:${character.features}\nNG:${character.negativePrompt}\n\n【最重要ルール】\n・背景は完全透明にしてください。白背景、単色背景、紙の質感、風景背景、影付きの背景は描かないでください。\n・画像内に01〜09などの番号、セル番号、管理番号、ラベル、見出しを絶対に描かないでください。\n・グリッド線、枠線、区切り線、パネル境界線を描かないでください。\n・描画してよい文字は、各スタンプで指定されたセリフ本文だけです。\n・各セルは後で個別画像に切り出す前提です。キャラクター、セリフ、効果表現がセル境界をまたがないよう十分な余白を確保してください。\n・9コマすべてで同一キャラクターとして、顔、体型、配色、服装、線のタッチを統一してください。\n\n【STEP 1で確定した9スタンプ】\n${stampLines}\n\n【配置ルール】\n内容の割り当て順は、左上から右へセル01・02・03、中央段がセル04・05・06、下段がセル07・08・09です。ただし、この番号は配置指示のためだけに使用し、生成画像の中には一切描かないでください。正方形キャンバス上に3列×3行で均等配置し、セル同士の間隔は透明な余白だけにしてください。各セルの背景も完全透明にし、切り出した各画像がそのまま透過PNG素材として使える構成にしてください。`;
}
