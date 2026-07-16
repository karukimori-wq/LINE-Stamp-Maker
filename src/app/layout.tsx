import type { Metadata, Viewport } from 'next';
import './globals.css';
import { PwaRegistrar } from '@/components/layout/PwaRegistrar';
export const metadata:Metadata={title:'LINE Stamp Maker',description:'iPhoneでLINEスタンプ制作を進める個人用Webアプリ',appleWebApp:{capable:true,statusBarStyle:'default',title:'Stamp Maker'}};
export const viewport:Viewport={themeColor:'#10b981',width:'device-width',initialScale:1,viewportFit:'cover'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ja"><body><PwaRegistrar/>{children}</body></html>}
