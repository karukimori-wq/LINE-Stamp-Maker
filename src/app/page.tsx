'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { AppHeader } from '@/components/layout/AppHeader';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { ProjectCard } from '@/components/project/ProjectCard';
import { deleteProject, duplicateProject, getProjects } from '@/lib/db';
import type { Project } from '@/types/project';

export default function Home(){const[projects,setProjects]=useState<Project[]>([]);const[error,setError]=useState('');const[loading,setLoading]=useState(true);const load=useCallback(async()=>{try{setProjects(await getProjects());setError('');}catch{setError('プロジェクトの読み込みに失敗しました。Safariのストレージ設定をご確認ください。');}finally{setLoading(false);}},[]);useEffect(()=>{getProjects().then(setProjects).catch(()=>setError('プロジェクトの読み込みに失敗しました。Safariのストレージ設定をご確認ください。')).finally(()=>setLoading(false));},[]);
const duplicate=async(id:string)=>{try{await duplicateProject(id);await load();}catch{setError('プロジェクトの複製に失敗しました。');}};const remove=async(id:string)=>{if(!window.confirm('このプロジェクトと関連画像を削除しますか？'))return;try{await deleteProject(id);await load();}catch{setError('プロジェクトの削除に失敗しました。');}};
return <><main className="mx-auto min-h-dvh max-w-md bg-zinc-50 pb-24"><AppHeader/><section className="px-4"><Link href="/projects/new" className="flex min-h-14 items-center justify-center rounded-2xl bg-emerald-500 px-4 font-bold text-white shadow-sm">＋ 新しいスタンプをつくる</Link><h2 className="mb-3 mt-7 font-bold">あなたのプロジェクト</h2>{error&&<p className="mb-3 rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}{loading?<p className="text-sm text-zinc-500">読み込み中...</p>:projects.length===0?<div className="rounded-3xl border border-dashed bg-white p-8 text-center text-sm text-zinc-500">まだプロジェクトがありません。<br/>最初のスタンプ制作を始めましょう。</div>:<div className="space-y-3">{projects.map(p=><ProjectCard key={p.id} project={p} onDuplicate={duplicate} onDelete={remove}/>)}</div>}</section></main><BottomNavigation/></>}
