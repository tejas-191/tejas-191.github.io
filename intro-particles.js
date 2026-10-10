(()=>{
 const root=document.getElementById('tj-centered'),film=root.querySelector('.film'),source=root.querySelector('.scene img'),opening=root.querySelector('.opening'),eyebrow=root.querySelector('.eyebrow'),name=root.querySelector('.end-title'),quote=root.querySelector('.quote'),cue=root.querySelector('.scroll-cue'),slider={value:0},output=document.createElement('span');
 const canvas=document.createElement('canvas');canvas.className='dust-canvas';canvas.setAttribute('aria-hidden','true');film.prepend(canvas);
 const ctx=canvas.getContext('2d',{alpha:false});
 const clamp=x=>Math.min(1,Math.max(0,x)),smooth=x=>{x=clamp(x);return x*x*x*(x*(x*6-15)+10);};
 let p=0,running=false,raf=0,last=0,saveTimer,w=1,h=1,dpr=1,particles=[],ready=false,scrollTarget=0;
 let seed=617;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 const compact=matchMedia("(max-width:650px)").matches,cols=compact?90:180,rows=compact?140:120;
 for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)particles.push({x,y,dx:(random()-.22)*1.5,dy:(random()-.65)*1.5,phase:random()*Math.PI*2,drift:.025+random()*.09,delay:.06+x/cols*.22+random()*.2,duration:.3+random()*.12,size:.2+random()*.5});
 function paint(){ctx.setTransform(dpr,0,0,dpr,0,0);ctx.globalAlpha=1;ctx.fillStyle='#080808';ctx.fillRect(0,0,w,h);if(!ready||p<.055)return;const ih=h,top=0,sourceHeight=Math.min(source.naturalHeight,h*source.naturalWidth/w),sourceWidth=Math.min(source.naturalWidth,w*source.naturalHeight/h),sourceTop=(source.naturalHeight-sourceHeight)/2,sourceLeft=w<=650?0:(source.naturalWidth-sourceWidth)/2,tw=w/cols,th=ih/rows,sw=sourceWidth/cols,sh=sourceHeight/rows;
  if(p>=.94){ctx.drawImage(source,sourceLeft,sourceTop,sourceWidth,sourceHeight,0,top,w,ih);return;}
  for(const a of particles){const t=clamp((p-a.delay)/a.duration);if(t<=0)continue;const remaining=1-smooth(t),angle=t*5+a.phase;const tx=(a.x+.5)*tw,ty=top+(a.y+.5)*th;const x=tx+a.dx*w*remaining+Math.sin(angle)*w*a.drift*remaining*Math.sin(t*Math.PI);const y=ty+a.dy*h*remaining+Math.cos(angle)*h*a.drift*remaining*Math.sin(t*Math.PI);const scale=1-remaining*(1-a.size);const dw=tw*scale+.22,dh=th*scale+.22;if(x<-10||x>w+10||y<-10||y>h+10)continue;ctx.globalAlpha=smooth(t/.72);ctx.drawImage(source,sourceLeft+a.x*sw,sourceTop+a.y*sh,sw,sh,x-dw/2,y-dh/2,dw,dh);}
  const finish=smooth((p-.88)/.06);if(finish>0){ctx.globalAlpha=finish;ctx.drawImage(source,sourceLeft,sourceTop,sourceWidth,sourceHeight,0,top,w,ih);}ctx.globalAlpha=1;
 }
 function draw(v){p=clamp(v);slider.value=Math.round(p*1000);const exit=smooth((p-.07)/.2),arrive=smooth((p-.84)/.1),q=smooth((p-.92)/.08);opening.style.opacity=1-exit;opening.style.transform=`translateY(${-20*exit}px) scale(${1+.045*exit})`;name.style.opacity=arrive;name.style.transform=`translateY(${18*(1-arrive)}px)`;eyebrow.style.opacity=arrive;quote.style.opacity=q;quote.style.transform=`translateY(${12*(1-q)}px)`;cue.textContent='SCROLL';const label=p<.15?'01 / THE NAME':p<.89?'02 / DUST TO FORM':'03 / THE STUDIO';if(output.textContent!==label)output.textContent=label;paint();}

 function resize(){w=film.clientWidth;h=film.clientHeight;dpr=Math.min(window.devicePixelRatio||1,compact?1.25:1.5);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);paint();}
 new ResizeObserver(resize).observe(film);
 let introBee;if(!source.complete){window.BeeLoading.begin('intro');introBee=window.BeeLoading.mount(document.getElementById('intro'),'intro');}const clearBee=()=>{introBee?.remove();window.BeeLoading.end('intro');};source.addEventListener('error',clearBee,{once:true});source.addEventListener('load',()=>{clearBee();ready=true;resize();draw(p)});if(source.complete&&source.naturalWidth){ready=true;resize();}
 let rendered=-1;window.paintPortfolioIntro=value=>{value=clamp(value);if(value!==rendered){rendered=value;draw(value)}};
 window.paintPortfolioIntro(0);
})();
