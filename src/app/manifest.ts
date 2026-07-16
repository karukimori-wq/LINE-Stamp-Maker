import type { MetadataRoute } from 'next';
export default function manifest(): MetadataRoute.Manifest {return {name:'LINE Stamp Maker',short_name:'Stamp Maker',description:'iPhoneでLINEスタンプ制作を進める個人用PWA',start_url:'/',display:'standalone',background_color:'#ffffff',theme_color:'#10b981',icons:[{src:'/icon.svg',sizes:'any',type:'image/svg+xml'}]};}
