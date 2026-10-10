(()=>{const $=id=>document.getElementById(id),loading=$('loading');try{
const ids=window.PORTFOLIO_PROJECT_IDS,clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x)},position=i=>[Math.floor(i/2)*2,Math.ceil(i/2)*2];
const scene=new THREE.Scene(),renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:false});renderer.setPixelRatio(Math.min(devicePixelRatio,window.innerWidth<650?1.25:1.5));renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;renderer.localClippingEnabled=true;$('scene').appendChild(renderer.domElement);const camera=new THREE.PerspectiveCamera(35,1,.02,80);
scene.add(new THREE.HemisphereLight(0xffffff,0x75866c,1.2));const key=new THREE.DirectionalLight(0xfff8eb,1.5);key.position.set(4,8,4);scene.add(key);const fill=new THREE.DirectionalLight(0xe4efff,.55);fill.position.set(-4,4,-2);scene.add(fill);
const pivot=new THREE.Group(),rig=new THREE.Group(),counter=new THREE.Group(),hover=new THREE.Group(),slot=new THREE.Group();scene.add(pivot);pivot.add(rig);rig.add(counter);counter.add(hover);hover.add(slot);
const glass=new THREE.Group();rig.add(glass);const cube=new THREE.BoxGeometry(2,2,2);glass.add(new THREE.LineSegments(new THREE.EdgesGeometry(cube),new THREE.LineBasicMaterial({color:0x8aa8a5,transparent:true,opacity:.55})));const pane=new THREE.Mesh(cube,new THREE.MeshBasicMaterial({color:0xc6e4df,transparent:true,opacity:.025,depthWrite:false,side:THREE.DoubleSide}));pane.renderOrder=9;glass.add(pane);const plinth=new THREE.Mesh(new THREE.BoxGeometry(1.88,.035,1.88),new THREE.MeshStandardMaterial({color:0xe1e7d7,roughness:1}));plinth.position.y=-.967;rig.add(plinth);
const localPlanes=[new THREE.Plane(new THREE.Vector3(1,0,0),.98),new THREE.Plane(new THREE.Vector3(-1,0,0),.98),new THREE.Plane(new THREE.Vector3(0,1,0),.98),new THREE.Plane(new THREE.Vector3(0,-1,0),.98),new THREE.Plane(new THREE.Vector3(0,0,1),.98),new THREE.Plane(new THREE.Vector3(0,0,-1),.98)],planes=localPlanes.map(p=>p.clone());
const footprints=[];for(let i=0;i<ids.length;i++){const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');g.fillStyle='#f1f3ed';g.fillRect(0,0,256,256);g.strokeStyle='#d1d8cc';g.lineWidth=2;g.strokeRect(1,1,254,254);g.fillStyle='#aab3a0';g.font='32px Montserrat,Arial';g.textAlign='center';g.fillText(String(i+1).padStart(2,'0'),128,140);const tile=new THREE.Mesh(new THREE.PlaneGeometry(1.98,1.98),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true,opacity:.8,side:THREE.DoubleSide}));tile.rotation.x=-Math.PI/2;const [x,z]=position(i);tile.position.set(x,-.012,z);tile.visible=false;scene.add(tile);footprints.push(tile);}
const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=128;const sg=shadowCanvas.getContext('2d'),gradient=sg.createRadialGradient(64,64,0,64,64,64);gradient.addColorStop(0,'rgba(20,40,20,.18)');gradient.addColorStop(1,'rgba(20,40,20,0)');sg.fillStyle=gradient;sg.fillRect(0,0,128,128);const shadow=new THREE.Mesh(new THREE.PlaneGeometry(3.8,3.8),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=-.006;scene.add(shadow);
const loader=new THREE.GLTFLoader(),draco=new THREE.DRACOLoader();draco.setDecoderPath('viewer-assets/draco/');loader.setDRACOLoader(draco);const cache=new Map(),pending=new Map();let progress=0,target=0,current=0,visibleId=null,mode='gallery',playing=false,previous=0,projectProgress=0,projectTarget=0,openingStart=0,openingEye=null,openingTarget=null,openingEnd=null;const aim=new THREE.Vector3(),eye=new THREE.Vector3(),mouse={x:0,y:0,tx:0,ty:0};
function batch(original){original.updateMatrixWorld(true);const groups=new Map();original.traverse(o=>{if(!o.isMesh||Array.isArray(o.material))return;const g=o.geometry.clone().applyMatrix4(o.matrixWorld),key=o.material.uuid+'|'+Object.keys(g.attributes).sort().join(',')+'|'+!!g.index;if(!groups.has(key))groups.set(key,{material:o.material.clone(),parts:[]});groups.get(key).parts.push(g);});const group=new THREE.Group();for(const {material,parts} of groups.values()){material.side=THREE.DoubleSide;material.clippingPlanes=planes;const merged=parts.length>1?THREE.BufferGeometryUtils.mergeBufferGeometries(parts,false):parts[0];if(merged){group.add(new THREE.Mesh(merged,material));if(parts.length>1)parts.forEach(p=>p.dispose());}else parts.forEach(p=>group.add(new THREE.Mesh(p,material)));}const old=new Set();original.traverse(o=>{if(o.geometry)old.add(o.geometry);});old.forEach(g=>g.dispose());return group;}
function fit(group,id){let bounds=new THREE.Box3().setFromObject(group);if(id==='SEM-6'){const axes=[[],[],[]];group.traverse(o=>{if(o.geometry){const a=o.geometry.attributes.position;for(let i=0;i<a.count;i++){axes[0].push(a.getX(i));axes[1].push(a.getY(i));axes[2].push(a.getZ(i));}}});const min=[],max=[];axes.forEach((a,i)=>{a.sort((x,y)=>x-y);const low=a[Math.floor(a.length*.01)],high=a[Math.floor(a.length*.99)],margin=(high-low)*.05;min[i]=low-margin;max[i]=high+margin;});bounds=new THREE.Box3(new THREE.Vector3(...min),new THREE.Vector3(...max));}if(id==='SEM-7'){bounds=new THREE.Box3(new THREE.Vector3(-14.301994,-5.211549,3.855078),new THREE.Vector3(52.322212,37.627468,56.398194));}const size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3()),s=1.88/Math.max(size.x,size.y,size.z);group.scale.setScalar(s);group.position.set(-center.x*s,-.94-bounds.min.y*s,-center.z*s);const low=bounds.min.clone().multiplyScalar(s).add(group.position),high=bounds.max.clone().multiplyScalar(s).add(group.position);group.userData.fitCorners=[];for(const x of [low.x,high.x])for(const y of [low.y,high.y])for(const z of [low.z,high.z])group.userData.fitCorners.push(new THREE.Vector3(x,y,z));group.userData.fitCenter=low.clone().add(high).multiplyScalar(.5);group.userData.fitSize=high.clone().sub(low).toArray();return group;}
function load(id){if(cache.has(id))return Promise.resolve(cache.get(id));if(pending.has(id))return pending.get(id);const promise=loader.loadAsync('project-library/'+encodeURIComponent(id)+'/model.glb').then(gltf=>{const group=fit(batch(gltf.scene),id);cache.set(id,group);pending.delete(id);return group;}).catch(error=>{pending.delete(id);console.error(error);if(ids[current]===id){loading.hidden=false;loading.dataset.error='true';loading.textContent='Unable to load '+id;window.galleryState={status:'error',id,message:error.message};}throw error;});pending.set(id,promise);return promise;}
function display(id){if(visibleId===id)return;if(cache.has(id)){slot.clear();slot.add(cache.get(id));visibleId=id;loading.hidden=true;}else{slot.clear();visibleId=null;loading.hidden=false;loading.removeAttribute('data-error');loading.textContent='';loading.setAttribute('aria-label','Loading '+id); load(id).catch(()=>{});}if(progress>.32&&!navigator.connection?.saveData)load(ids[Math.min(ids.length-1,current+1)]).catch(()=>{});}
function setOpacity(opacity){slot.traverse(o=>{if(o.material){o.material.transparent=opacity<.999;o.material.opacity=opacity;o.material.depthWrite=opacity>.4;}});}
let textId=null,lastFrameKey=null;
function gallery(){
 const travel=clamp((progress-.36)/.60)*(ids.length-1),step=Math.min(ids.length-1,Math.floor(travel)),fraction=travel-step,t=ease((fraction-.24)/.56);
 current=Math.min(ids.length-1,step+(t>.5?1:0));if(progress>.16)display(ids[current]);
 const angle=t*Math.PI/2,alongZ=step%2===0,[x,z]=position(step),nextX=x+(alongZ?0:2*t),nextZ=z+(alongZ?2*t:0),follow=(nextX+nextZ)/2;
 pivot.position.set(x+(alongZ?0:1),0,z+(alongZ?1:0));pivot.rotation.set(alongZ?angle:0,0,alongZ?0:-angle);rig.position.set(alongZ?0:-1,1,alongZ?-1:0);
 const drop=1-ease((progress-.27)/.09);pivot.position.y=drop*7;counter.rotation.set(current>step&&alongZ?-Math.PI/2:0,0,current>step&&!alongZ?Math.PI/2:0);
 hover.rotation.set(mouse.y*.085,mouse.x*.20,-mouse.x*.025);hover.position.set(mouse.x*.012,0,mouse.y*.012);hover.scale.setScalar(1);
 const fitted=cache.get(ids[current]);if(fitted){const turn=new THREE.Matrix4().makeRotationFromEuler(hover.rotation),c=fitted.userData.fitCenter,rotatedCenter=c.clone().applyMatrix4(turn);let radius=new THREE.Vector3();for(const corner of fitted.userData.fitCorners){const q=corner.clone().sub(c).applyMatrix4(turn);radius.max(new THREE.Vector3(Math.abs(q.x),Math.abs(q.y),Math.abs(q.z)));}const safe=Math.min(1,.945/Math.max(radius.x+.012,radius.z+.012),.945/Math.max(radius.y,1e-8));hover.scale.setScalar(safe);hover.position.set(-rotatedCenter.x*safe+mouse.x*.012,-.94+radius.y*safe-rotatedCenter.y*safe,-rotatedCenter.z*safe+mouse.y*.012);}
 setOpacity(1-.99*Math.pow(Math.sin(Math.PI*t),6));footprints.forEach((tile,i)=>{tile.visible=i<step||i===step&&t>.04;tile.material.opacity=i===step?ease(t/.4)*.8:Math.max(.18,.75-(step-i)*.13);});shadow.position.set(nextX,-.006,nextZ);shadow.material.opacity=1-drop*.8;
 aim.set(follow,.7,follow);const distance=Math.max(1,.95/camera.aspect);eye.set(follow+5.5*distance,4.4*distance,follow+5.5*distance);camera.position.copy(eye);camera.up.set(0,1,0);camera.lookAt(aim);rig.visible=progress>.27;shadow.visible=progress>.29;scene.updateMatrixWorld(true);planes.forEach((plane,i)=>plane.copy(localPlanes[i]).applyMatrix4(rig.matrixWorld));
 const info=(window.PROJECT_INFORMATION||{})[ids[current]]||{title:ids[current]};
 if(textId!==ids[current]){textId=ids[current];$('gallery-title').textContent=info.title;$('gallery-subtitle').textContent=info.subtitle||'';$('gallery-awards').textContent=info.achievements||'';$('gallery-credits').textContent=info.credits||'';}
 const heading=document.querySelector('.heading');heading.style.opacity=ease((progress-.31)/.05)*(1-Math.pow(Math.sin(Math.PI*t),4));heading.style.transform='translateY('+((t<.5?-1:1)*Math.sin(Math.PI*t)*20)+'px)';
 window.paintPortfolioIntro(progress/.25);$('intro').style.transform='translateY('+(-ease((progress-.27)/.09)*105)+'%)';document.querySelector('.foot').style.opacity=ease((progress-.31)/.05);loading.style.visibility=progress>.32?'visible':'hidden';$('intro').style.pointerEvents='none';document.querySelector('header').style.opacity=ease((progress-.31)/.05);
 $('enter').hidden=progress<.36||t>.03&&t<.97||visibleId!==ids[current];$('enter').textContent='Explore project ↗';$('count').textContent=progress<.35?'FROM THE STUDIO':String(current+1).padStart(2,'0')+' / '+String(ids.length).padStart(2,'0')+' PROJECTS';$('note').textContent='';$('status').textContent=progress<.35?'Homepage → gallery':visibleId;$('progress').value=Math.round(progress*1000);
 window.updatePortfolioLinks?.(progress,mode);window.galleryState={status:visibleId===ids[current]?'ready':'loading',id:ids[current],progress,mode,step,t,loaded:[...cache.keys()],hoverRotation:hover.rotation.toArray(),cubeRotation:pivot.rotation.toArray()};
}
function openProject(){if(mode!=='gallery'||!visibleId||progress<.35)return;playing=false;target=progress;mode='opening';openingStart=performance.now();openingEye=camera.position.clone();openingTarget=aim.clone();openingEnd=rig.getWorldPosition(new THREE.Vector3());mouse.tx=mouse.ty=0;glass.visible=false;$('enter').hidden=true;$('play').disabled=true;$('home').disabled=true;$('progress').disabled=true;document.querySelector('.heading').style.opacity=0;document.querySelector('header').style.opacity=0;}
const originalStory=$('story').innerHTML;let storyStops=[],storyLength=4;
function buildStory(image){
 const presentation=(window.PROJECT_PRESENTATIONS||{})[ids[current]];
 $('story').innerHTML=originalStory;
 if(presentation){
  const story=$('story'),hero=story.firstElementChild;
  story.replaceChildren(hero);
  presentation.slides.forEach((slide,i)=>{
   const page=document.createElement('article');page.className='page board';page.dataset.label=slide.label;
   const media=document.createElement(slide.type==='video'?'video':'img');media.dataset.src=slide.src;
   if(slide.type==='video'){media.muted=true;media.playsInline=true;media.preload='none';page.dataset.film='true';const hint=document.createElement('span');hint.className='film-hint';hint.textContent='Scroll to move through the film';page.append(hint);}
   else{media.alt=ids[current]+' — '+slide.label;media.decoding='async';page.dataset.ratio=slide.width/slide.height;page.classList.add('full-height');}
   page.append(media);story.append(page);
  });
 }
 $('hero-image').src=image;const storyImage=$('story-image');if(storyImage)storyImage.src=image;
 const info=(window.PROJECT_INFORMATION||{})[ids[current]];
 $('project-name').textContent=info?.title||ids[current];
 if(info){const title=$('project-name').parentElement;title.querySelector('small').textContent=info.credits==='ACADEMIC'?'ACADEMIC PROJECT':info.credits==='THESIS'?'THESIS':'ARCHITECTURAL PROJECT';
 for(const [key,tag] of [['subtitle','em'],['achievements','p'],['credits','p']]){if(!info[key])continue;const el=document.createElement(tag);el.className='project-'+key;el.textContent=info[key];title.insertBefore(el,title.lastElementChild);}}

 const returnButton=document.createElement('button');returnButton.className='back-to-projects';returnButton.textContent='Back to projects ↗';returnButton.addEventListener('click',event=>{event.stopPropagation();back();});$('story').lastElementChild.append(returnButton);
 layoutStory();
}
function layoutStory(){
 const width=$('stage').clientWidth,height=$('stage').clientHeight;let offset=0,cursor=0;
 storyStops=Array.from($('story').children).map((page,i)=>{
  const ratio=Number(page.dataset.ratio),w=ratio>0?Math.min(width,height*ratio):width;page.style.flexBasis=w+'px';
  const stop={page,index:i,hold:page.dataset.film?5:0,offset,width:w};offset+=w;return stop;
 });
 const maxOffset=Math.max(0,offset-width);
 storyStops.forEach((stop,i)=>{stop.position=Math.min(stop.offset,maxOffset);const next=storyStops[i+1];stop.travel=((next?Math.min(next.offset,maxOffset):maxOffset)-stop.position)/width;stop.start=cursor;cursor+=stop.hold+stop.travel;});storyLength=cursor;
}
let sheetSnapTimer;
function settleSheet(){clearTimeout(sheetSnapTimer);sheetSnapTimer=setTimeout(()=>{if(mode==='project'&&storyLength>0&&!storyStops.some(stop=>stop.hold)){const at=projectTarget*storyLength,nearest=storyStops.reduce((best,stop)=>Math.abs(stop.start-at)<Math.abs(best.start-at)?stop:best,storyStops[0]);projectTarget=nearest.start/storyLength;}},260);}
function panStory(){
 const t=projectProgress*storyLength;let active=storyStops[0];
 for(const stop of storyStops){if(t>=stop.start)active=stop;}
 const offset=active.position+Math.min(active.travel,Math.max(0,t-active.start-active.hold))*$('stage').clientWidth;
 $('story').style.transform='translateX('+(-offset)+'px)';
 storyStops.forEach(stop=>{const media=stop.page.querySelector('[data-src]');if(!media)return;if(stop.offset+stop.width>offset-$('stage').clientWidth&&stop.offset<offset+2*$('stage').clientWidth&&!media.getAttribute('src')){media.src=media.dataset.src;if(media.tagName==='VIDEO'){media.preload='auto';media.load();}}
 if(media.tagName==='VIDEO'&&Number.isFinite(media.duration)&&media.duration>0){const desired=clamp((t-stop.start)/stop.hold)*Math.max(0,media.duration-.04);if(!media.seeking&&Math.abs(media.currentTime-desired)>.045)media.currentTime=desired;}});
 $('chapter').textContent=String(active.index+1).padStart(2,'0')+' / '+storyStops.length+' · '+(active.page.dataset.label|| (active.index===0?'OVERVIEW':'PROJECT'));
}
function revealProject(){renderer.render(scene,camera);const image=renderer.domElement.toDataURL('image/png');document.body.classList.add('project-open');resize();buildStory(image);$('project-id').textContent=ids[current];$('project').hidden=false;mode='project';projectProgress=projectTarget=0;$('play').disabled=false;$('home').disabled=false;$('progress').disabled=false;$('play').textContent='Pan project';$('project').focus({preventScroll:true});}
let returnScrollUntil=0;
function back(){returnScrollUntil=performance.now()+650;mode='gallery';document.body.classList.remove('project-open');resize();playing=false;glass.visible=true;$('project').hidden=true;$('play').textContent='Play sequence';target=progress;gallery();$('enter').focus();}
document.querySelector('.heading').addEventListener('click',openProject);document.querySelector('.heading').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openProject();}});$('enter').addEventListener('click',openProject);const raycaster=new THREE.Raycaster();renderer.domElement.addEventListener('click',event=>{if(mode!=='gallery')return;const rect=renderer.domElement.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1),camera);if(raycaster.intersectObject(pane,false).length)openProject();});
$('stage').addEventListener('pointermove',event=>{if(mode!=='gallery'||event.pointerType==='touch')return;const rect=$('stage').getBoundingClientRect();mouse.tx=Math.max(-1,Math.min(1,(event.clientX-rect.left-rect.width*.5)/(rect.width*.3)));mouse.ty=Math.max(-1,Math.min(1,(event.clientY-rect.top-rect.height*.52)/(rect.height*.3)));});$('stage').addEventListener('pointerleave',()=>{mouse.tx=mouse.ty=0;});
// Stop at the completed intro and the first landed cube; discard gesture momentum.
function createScrollStops(){
 const stops=[.25,.36],quietMs=320,holdMs=450;let lock=null,lastInput=-Infinity;
 return {
  beginGesture(){lastInput=-Infinity;},
  advance(value,delta,now,rendered){
   const quiet=now-lastInput>=quietMs;lastInput=now;
   if(lock){
    if(delta<0){lock=null;}
    else if(!quiet||now-lock.since<holdMs||Math.abs(rendered-lock.at)>.001)return lock.at;
    else lock=null;
   }
   const next=clamp(value+delta);
   if(delta>0){const stop=stops.find(point=>value<point&&next>=point);if(stop!==undefined){lock={at:stop,since:now};return stop;}}
   return next;
  }
 };
}
const scrollStops=createScrollStops();
function goToProjects(){if(location.hash!=='#projects')return;if(mode!=='gallery')back();playing=false;target=.36;}
window.addEventListener('hashchange',goToProjects);window.addEventListener('portfolio:projects',()=>{if(mode!=='gallery')back();playing=false;target=.36;});goToProjects();
$('stage').addEventListener('wheel',event=>{if(performance.now()<returnScrollUntil){event.preventDefault();return;}if(mode==='opening'){event.preventDefault();return;}const amount=Math.abs(event.deltaX)>Math.abs(event.deltaY)?event.deltaX:event.deltaY;if(mode==='project'&&amount<0&&projectTarget===0&&projectProgress<.002){event.preventDefault();back();return;}const value=mode==='project'?projectTarget:target;if(amount>0&&value<1||amount<0&&value>0){event.preventDefault();playing=false;$('play').textContent=mode==='project'?'Pan project':'Play sequence';if(mode==='project'){projectTarget=clamp(projectTarget+amount/Math.max(2200,storyLength*900));settleSheet();}else target=scrollStops.advance(target,amount/(target<.27?11600:1800+ids.length*400),performance.now(),progress);}},{passive:false});
$('progress').addEventListener('input',()=>{playing=false;const value=$('progress').value/1000;if(mode==='project')projectProgress=projectTarget=value;else progress=target=value;});$('play').addEventListener('click',()=>{playing=!playing;if(playing){if(mode==='project'&&projectProgress>=.999)projectProgress=projectTarget=0;if(mode==='gallery'&&progress>=.999)progress=target=0;}$('play').textContent=playing?'Pause':mode==='project'?'Pan project':'Play sequence';});$('home').addEventListener('click',()=>{if(mode!=='gallery')back();progress=target=0;playing=true;$('play').textContent='Pause';});
let touchY=null,touchX=null;$('stage').addEventListener('touchstart',e=>{clearTimeout(sheetSnapTimer);touchY=e.touches[0].clientY;touchX=e.touches[0].clientX;scrollStops.beginGesture();},{passive:true});$('stage').addEventListener('touchmove',e=>{if(touchY===null||mode==='opening')return;if(performance.now()<returnScrollUntil){touchY=e.touches[0].clientY;e.preventDefault();return;}const vertical=touchY-e.touches[0].clientY,horizontal=touchX-e.touches[0].clientX,dy=mode==='project'&&Math.abs(horizontal)>Math.abs(vertical)?horizontal:vertical;touchY=e.touches[0].clientY;touchX=e.touches[0].clientX;e.preventDefault();playing=false;if(mode==='project'&&dy<0&&projectTarget===0&&projectProgress<.002){back();return;}if(mode==='project')projectTarget=clamp(projectTarget+dy/Math.max(300,storyLength*window.innerWidth*.85));else target=scrollStops.advance(target,dy/(target<.27?1800:2000),performance.now(),progress);},{passive:false});
$('stage').addEventListener('touchend',()=>{touchY=touchX=null;settleSheet();},{passive:true});$('stage').addEventListener('touchcancel',()=>{touchY=touchX=null;},{passive:true});
function resize(){lastFrameKey=null;const stage=$('stage');camera.aspect=stage.clientWidth/stage.clientHeight;camera.updateProjectionMatrix();renderer.setSize(stage.clientWidth,stage.clientHeight);if(mode==='project')layoutStory();}window.addEventListener('resize',resize);resize();
renderer.setAnimationLoop(time=>{if(document.hidden){previous=0;return;}
 const key=[mode,target.toFixed(5),progress.toFixed(5),projectTarget.toFixed(5),projectProgress.toFixed(5),mouse.x.toFixed(4),mouse.y.toFixed(4),mouse.tx,mouse.ty,visibleId,cache.size,camera.aspect].join('|');
 if(!playing&&mode!=='opening'&&key===lastFrameKey){previous=time;return;}lastFrameKey=key;
 const dt=previous?Math.min(50,time-previous):16;previous=time;const motion=1-Math.exp(-dt/130),hoverMotion=1-Math.exp(-dt/175);mouse.x+=(mouse.tx-mouse.x)*hoverMotion;mouse.y+=(mouse.ty-mouse.y)*hoverMotion;if(mode==='gallery'){if(playing){target=clamp(target+dt/(target<.27?56000:6000+ids.length*3100));if(target>=1){playing=false;$('play').textContent='Replay sequence';}}progress+=(target-progress)*motion;if(Math.abs(target-progress)<.00005)progress=target;gallery();}else if(mode==='opening'){const t=ease((time-openingStart)/1400);camera.position.lerpVectors(openingEye,openingEnd.clone().add(new THREE.Vector3(.001,3.3,.001)),t);camera.up.lerpVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(0,0,-1),t).normalize();camera.lookAt(openingTarget.clone().lerp(openingEnd,t));if(t>=1)revealProject();}else{if(playing){projectTarget=clamp(projectTarget+dt/16000);if(projectTarget>=1){playing=false;$('play').textContent='Pan project';}}projectProgress+=(projectTarget-projectProgress)*motion;if(Math.abs(projectTarget-projectProgress)<.00005)projectProgress=projectTarget;panStory();$('progress').value=Math.round(projectProgress*1000);$('status').textContent=$('chapter').textContent;window.galleryState={...window.galleryState,mode,projectProgress};}if(mode==='opening'||mode==='gallery'&&progress>.26)renderer.render(scene,camera);});


}catch(error){loading.hidden=false;loading.textContent='Preview error: '+error.message;console.error(error);window.galleryState={status:'error',message:error.message};}})();

