(()=>{
 const jobs=new Map();let timer=null;
 function tick(){const now=performance.now();document.querySelectorAll('[data-bee-key]').forEach(el=>{const j=jobs.get(el.dataset.beeKey);let seconds=.55;if(j&&now-j.last<1200&&j.rate>0)seconds=.55-.44*Math.min(1,Math.log2(1+j.rate/32000)/6);el.style.setProperty('--bee-period',seconds.toFixed(3)+'s');});if(!jobs.size){clearInterval(timer);timer=null;}}
 function begin(key){jobs.set(key,{last:performance.now(),bytes:0,rate:0});if(!timer)timer=setInterval(tick,250);}
 function progress(key,bytes){const j=jobs.get(key);if(!j)return;const now=performance.now(),dt=now-j.last;if(bytes>j.bytes&&dt>0){const rate=(bytes-j.bytes)*1000/dt;j.rate=j.rate?j.rate*.65+rate*.35:rate;j.bytes=bytes;j.last=now;}}
 function end(key){jobs.delete(key);tick();}
 function mount(parent,key){const el=document.createElement('span');el.className='bee-indicator';el.dataset.beeKey=key;el.setAttribute('role','status');el.setAttribute('aria-label','Loading');parent.append(el);return el;}
 async function image(media,url){const key='image:'+url,el=mount(media.parentElement,key);begin(key);try{const response=await fetch(url);if(!response.ok)throw Error('HTTP '+response.status);let blob;if(response.body){const reader=response.body.getReader(),parts=[];let bytes=0;while(true){const {done,value}=await reader.read();if(done)break;parts.push(value);bytes+=value.length;progress(key,bytes);}blob=new Blob(parts,{type:response.headers.get('content-type')||'image/webp'});}else blob=await response.blob();const objectURL=URL.createObjectURL(blob);try{media.src=objectURL;await media.decode();}finally{URL.revokeObjectURL(objectURL);}}catch(error){el.className='media-load-error';el.textContent='Image unavailable';el.removeAttribute('data-bee-key');throw error;}finally{end(key);if(el.classList.contains('bee-indicator'))el.remove();}}
 window.BeeLoading={begin,progress,end,mount,image};
 document.querySelectorAll('#tj-journey .signature').forEach(img=>{if(img.complete)return;const key='signature',el=mount(img.parentElement,key);begin(key);const done=()=>{el.remove();end(key);};img.addEventListener('load',done,{once:true});img.addEventListener('error',done,{once:true});});
})();

