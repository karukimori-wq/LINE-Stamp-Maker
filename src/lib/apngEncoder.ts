type Chunk = { type: string; data: Uint8Array };

const PNG_SIGNATURE = new Uint8Array([137,80,78,71,13,10,26,10]);
let crcTable: Uint32Array | null = null;

function getCrcTable(){
  if(crcTable)return crcTable;
  crcTable=new Uint32Array(256);
  for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=(c&1)?(0xedb88320^(c>>>1)):(c>>>1);crcTable[n]=c>>>0;}
  return crcTable;
}
function crc32(bytes:Uint8Array){const table=getCrcTable();let c=0xffffffff;for(const b of bytes)c=table[(c^b)&0xff]^(c>>>8);return (c^0xffffffff)>>>0;}
function u32(n:number){const a=new Uint8Array(4);new DataView(a.buffer).setUint32(0,n);return a;}
function u16(n:number){const a=new Uint8Array(2);new DataView(a.buffer).setUint16(0,n);return a;}
function ascii(s:string){return new TextEncoder().encode(s);}
function concat(parts:Uint8Array[]){const size=parts.reduce((sum,p)=>sum+p.length,0);const out=new Uint8Array(size);let offset=0;for(const p of parts){out.set(p,offset);offset+=p.length;}return out;}
function chunk(type:string,data:Uint8Array){const typeBytes=ascii(type);const crcInput=concat([typeBytes,data]);return concat([u32(data.length),typeBytes,data,u32(crc32(crcInput))]);}
function parsePng(buffer:ArrayBuffer):Chunk[]{const bytes=new Uint8Array(buffer);if(bytes.length<8||!PNG_SIGNATURE.every((v,i)=>bytes[i]===v))throw new Error('PNGファイルではありません。');const chunks:Chunk[]=[];let offset=8;while(offset<bytes.length){const len=new DataView(bytes.buffer,bytes.byteOffset+offset,4).getUint32(0);offset+=4;const type=new TextDecoder().decode(bytes.slice(offset,offset+4));offset+=4;const data=bytes.slice(offset,offset+len);offset+=len+4;chunks.push({type,data});if(type==='IEND')break;}return chunks;}
function getSize(ihdr:Uint8Array){const view=new DataView(ihdr.buffer,ihdr.byteOffset,ihdr.byteLength);return{width:view.getUint32(0),height:view.getUint32(4)};}
function fcTL(seq:number,width:number,height:number,delayMs:number){return concat([u32(seq),u32(width),u32(height),u32(0),u32(0),u16(Math.max(1,Math.round(delayMs))),u16(1000),new Uint8Array([0,0])]);}

export async function encodeApng(frameBlobs:Blob[],delayMs=125,loops=0):Promise<{blob:Blob;width:number;height:number;frames:number;durationMs:number}>{
  if(frameBlobs.length<2)throw new Error('APNG作成には2枚以上のPNGフレームが必要です。');
  const parsed=await Promise.all(frameBlobs.map(async blob=>parsePng(await blob.arrayBuffer())));
  const first=parsed[0];
  const ihdr=first.find(c=>c.type==='IHDR');
  if(!ihdr)throw new Error('PNGのIHDRが見つかりません。');
  const {width,height}=getSize(ihdr.data);
  const beforeIdat=first.filter(c=>c.type!=='IDAT'&&c.type!=='IEND'&&c.type!=='IHDR');
  let seq=0;
  const out:Uint8Array[]=[PNG_SIGNATURE,chunk('IHDR',ihdr.data),chunk('acTL',concat([u32(frameBlobs.length),u32(loops)]))];
  for(const c of beforeIdat)out.push(chunk(c.type,c.data));
  parsed.forEach((chunks,index)=>{
    const frameIhdr=chunks.find(c=>c.type==='IHDR');
    if(!frameIhdr)throw new Error(`${index+1}枚目のPNGが不正です。`);
    const size=getSize(frameIhdr.data);
    if(size.width!==width||size.height!==height)throw new Error('すべてのフレーム画像は同じサイズにしてください。');
    out.push(chunk('fcTL',fcTL(seq++,width,height,delayMs)));
    const idats=chunks.filter(c=>c.type==='IDAT');
    if(index===0){for(const idat of idats)out.push(chunk('IDAT',idat.data));}
    else{for(const idat of idats)out.push(chunk('fdAT',concat([u32(seq++),idat.data])));}
  });
  out.push(chunk('IEND',new Uint8Array()));
  return{blob:new Blob([concat(out)],{type:'image/png'}),width,height,frames:frameBlobs.length,durationMs:frameBlobs.length*delayMs};
}
