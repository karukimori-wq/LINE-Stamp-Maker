'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getProject, updateProject } from '@/lib/db';
import { generateIdeaPrompt } from '@/lib/promptGenerator';
import type { Project } from '@/types/project';

const inputClass = 'mt-1 min-h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500';
const labelClass = 'block text-sm font-medium text-zinc-700';

export default function IdeaPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [prompt, setPrompt] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getProject(id)
      .then((value) => value ? setProject(value) : setError('プロジェクトが見つかりません。'))
      .catch(() => setError('プロジェクトを読み込めませんでした。'));
  }, [id]);

  if (!project) return <main className="mx-auto min-h-dvh max-w-md bg-zinc-50 p-5 pt-[calc(env(safe-area-inset-top)+1rem)]"><p>{error || '読み込み中...'}</p></main>;

  const save = async (next: Project) => {
    setSaving(true);
    setError('');
    try {
      const saved = await updateProject(next);
      setProject(saved);
      return saved;
    } catch {
      setError('保存に失敗しました。もう一度お試しください。');
      return null;
    } finally { setSaving(false); }
  };

  const updateIdea = (key: keyof Project['idea'], value: string) => setProject({ ...project, idea: { ...project.idea, [key]: value } });
  const updateConcept = (key: keyof Project['concept'], value: string) => setProject({ ...project, concept: { ...project.concept, [key]: value } });

  const makePrompt = async () => {
    const saved = await save(project);
    if (saved) { setPrompt(generateIdeaPrompt(saved)); setMessage('AI用プロンプトを作成しました。'); }
  };

  const copyPrompt = async () => {
    try { await navigator.clipboard.writeText(prompt); setMessage('プロンプトをコピーしました。'); }
    catch { setError('コピーできませんでした。プロンプトを長押ししてコピーしてください。'); }
  };

  const proceed = async () => {
    const saved = await save({ ...project, currentStep: Math.max(project.currentStep, 2) });
    if (saved) router.push(`/projects/${id}/character`);
  };

  return <main className="mx-auto min-h-dvh max-w-md bg-zinc-50 px-5 pb-[calc(env(safe-area-inset-bottom)+2rem)] pt-[calc(env(safe-area-inset-top)+1rem)]">
    <button onClick={() => router.push('/')} className="min-h-11 min-w-11 text-left text-2xl" aria-label="ホームへ戻る">‹</button>
    <header className="mt-2"><p className="text-xs font-bold text-emerald-600">STEP 1 / 5</p><h1 className="mt-1 text-2xl font-bold">アイデア</h1><p className="mt-1 text-sm text-zinc-500">{project.name}</p></header>
    {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {message && <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}

    <section className="mt-6 space-y-4 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
      <label className={labelClass}>アイデア<textarea className={`${inputClass} min-h-24`} value={project.idea.rawIdea} onChange={(e)=>updateIdea('rawIdea',e.target.value)} placeholder="例：ゆるくてかわいい猫。日常で使えるスタンプ" /></label>
      <label className={labelClass}>ターゲット<input className={inputClass} value={project.idea.target} onChange={(e)=>updateIdea('target',e.target.value)} placeholder="例：20〜40代の男女" /></label>
      <label className={labelClass}>利用シーン<input className={inputClass} value={project.idea.usageScene} onChange={(e)=>updateIdea('usageScene',e.target.value)} placeholder="例：日常会話、職場、友達との会話" /></label>
      <label className={labelClass}>雰囲気<input className={inputClass} value={project.idea.mood} onChange={(e)=>updateIdea('mood',e.target.value)} placeholder="例：ゆるい、かわいい、親しみやすい" /></label>
      <label className={labelClass}>その他<textarea className={`${inputClass} min-h-20`} value={project.idea.notes} onChange={(e)=>updateIdea('notes',e.target.value)} placeholder="文字は手書き風、白ベースなど" /></label>
      <button disabled={saving} onClick={makePrompt} className="min-h-12 w-full rounded-xl bg-emerald-600 px-4 font-bold text-white disabled:opacity-50">{saving?'保存中...':'AI用プロンプトを作成'}</button>
    </section>

    {prompt && <section className="mt-6 rounded-3xl border border-emerald-100 bg-emerald-50 p-5"><div className="flex items-center justify-between gap-3"><h2 className="font-bold">AI用プロンプト</h2><button onClick={copyPrompt} className="min-h-11 rounded-xl border border-emerald-600 bg-white px-4 text-sm font-bold text-emerald-700">コピー</button></div><pre className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-zinc-700">{prompt}</pre></section>}

    <section className="mt-6 space-y-4 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div><h2 className="font-bold">AIからの回答を入力</h2><p className="mt-1 text-xs text-zinc-500">外部AIの回答を確認し、必要に応じて編集してください。</p></div>
      <label className={labelClass}>コンセプト<textarea className={`${inputClass} min-h-20`} value={project.concept.concept} onChange={(e)=>updateConcept('concept',e.target.value)} /></label>
      <label className={labelClass}>キャラクター方向性<textarea className={`${inputClass} min-h-20`} value={project.concept.characterDirection} onChange={(e)=>updateConcept('characterDirection',e.target.value)} /></label>
      <label className={labelClass}>デザインテイスト<input className={inputClass} value={project.concept.designStyle} onChange={(e)=>updateConcept('designStyle',e.target.value)} /></label>
      <label className={labelClass}>利用シーン<input className={inputClass} value={project.concept.usageScene} onChange={(e)=>updateConcept('usageScene',e.target.value)} /></label>
      <label className={labelClass}>セリフ方向性<textarea className={`${inputClass} min-h-20`} value={project.concept.dialogueDirection} onChange={(e)=>updateConcept('dialogueDirection',e.target.value)} /></label>
      <label className={labelClass}>差別化ポイント<textarea className={`${inputClass} min-h-20`} value={project.concept.differentiation} onChange={(e)=>updateConcept('differentiation',e.target.value)} /></label>
      <button disabled={saving} onClick={proceed} className="min-h-12 w-full rounded-xl bg-emerald-600 px-4 font-bold text-white disabled:opacity-50">この内容で進む</button>
    </section>
  </main>;
}
