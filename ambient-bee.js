(() => {
'use strict';
const connection=navigator.connection, local=['localhost','127.0.0.1'].includes(location.hostname);
function fastEnough(){
 if(connection?.saveData || (connection?.effectiveType && connection.effectiveType!=='4g') || (connection?.downlink!=null && connection.downlink<3) || (connection?.rtt>250)) return false;
 if(connection?.effectiveType==='4g' && connection.downlink>=3) return true;
 return performance.getEntriesByType('resource').some(r=>r.transferSize>100000 && r.responseEnd>r.responseStart && r.transferSize/(r.responseEnd-r.responseStart)>500);
}
document.documentElement.dataset.ambientBee='checking'; if(matchMedia('(prefers-reduced-motion: reduce)').matches || !fastEnough()) {document.documentElement.dataset.ambientBee='skipped';return;}
async function start(){
 document.documentElement.dataset.ambientBee="starting"; if(!fastEnough() || !window.THREE) return;
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),9000);
 const stopDownload=()=>{if(!fastEnough())controller.abort();};connection?.addEventListener('change',stopDownload);
 let gltf;
 try {const response=await fetch('Bee-web.glb',{signal:controller.signal,priority:'low'});if(!response.ok)throw Error();const bytes=await response.arrayBuffer();gltf=await new Promise((resolve,reject)=>new THREE.GLTFLoader().parse(bytes,'',resolve,reject));}
 catch(error){document.documentElement.dataset.ambientBee="unavailable: "+error.message;return;}finally{clearTimeout(timeout);connection?.removeEventListener('change',stopDownload);}
 if(!fastEnough())return;
 const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(75,75);renderer.outputEncoding=THREE.sRGBEncoding;
 renderer.setClearColor(0x000000,0);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.3;
 const canvas=renderer.domElement;canvas.id='ambient-bee';canvas.setAttribute('aria-hidden','true');canvas.style.cssText='position:fixed;left:0;top:0;width:75px;height:75px;pointer-events:none;z-index:20;opacity:0;transition:opacity .8s;';document.body.append(canvas);
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,1,.01,100);camera.position.set(2,3.4,4.5);camera.lookAt(0,0,0);
 scene.add(new THREE.HemisphereLight(0xffffff,0x65573b,1.7));const light=new THREE.DirectionalLight(0xffeed6,2.3);light.position.set(3,5,5);scene.add(light);
 const model=gltf.scene,bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
 model.position.sub(center);const pivot=new THREE.Group();pivot.add(model);pivot.scale.setScalar(2.4/Math.max(size.x,size.y,size.z));scene.add(pivot);
 const mixer=new THREE.AnimationMixer(model),clip=gltf.animations.find(a=>a.name.includes('hover'))||gltf.animations[0];if(clip)mixer.clipAction(clip).play();
 let behavior='',orbit=0,lastProject=null;
 let visit=0,phase='flight',began=performance.now(),duration=3400,last=began,from={x:innerWidth+90,y:innerHeight*.25},to=destination(),point={...from},bend=100,stopped=false;
 function context(){
  if(document.body.classList.contains('project-open') || window.galleryState?.mode==='opening' || window.galleryState?.mode==='project')return 'reading';
  if(window.galleryState?.progress>=.275)return 'cube';
  return 'home';
 }
 function destination(){
  const behaviorNow=context();
  if(behaviorNow==='reading')return{x:innerWidth-42,y:innerHeight*.22+Math.random()*innerHeight*.18,kind:'reading'};
  if(behaviorNow==='cube'){
   const spots=[[.5,.19],[.69,.33],[.65,.62],[.48,.72],[.32,.54],[.32,.30]];
   const spot=spots[orbit++%spots.length];
   return{x:innerWidth*spot[0],y:Math.max(95,Math.min(innerHeight-100,innerHeight*spot[1])),kind:'cube'};
  }
  const state=window.galleryState,home=state?.mode==='gallery' && state.progress>=.23 && state.progress<.275;
  if(home && visit++%3!==2){const s=Math.max(innerWidth,innerHeight),left=innerWidth<=650?0:(innerWidth-s)/2,top=(innerHeight-s)/2;const hive=visit%3===1;return{x:Math.max(40,Math.min(innerWidth-40,left+s*(hive?.075:.105))),y:Math.max(90,Math.min(innerHeight-70,top+s*(hive?.385:.57))),kind:hive?'hive':'chair'};}
  return{x:50+Math.random()*Math.max(1,innerWidth-100),y:100+Math.random()*Math.max(1,innerHeight-210),kind:'wander'};
 }
 function frame(now){
  if(stopped)return;requestAnimationFrame(frame);if(document.hidden){last=now;began=now;from={...point};return;}if(now-last<33)return;
  const dt=Math.min((now-last)/1000,.08);last=now;
  if(!fastEnough()){stopped=true;canvas.remove();renderer.dispose();return;}
  const state=window.galleryState,hidden=state?.mode==='gallery'&&state.progress<.23;canvas.style.opacity=hidden?'0':'1';
  const nextBehavior=context(),projectId=state?.id;
  if(nextBehavior!==behavior || (nextBehavior==='cube' && projectId!==lastProject)){
   behavior=nextBehavior;lastProject=projectId;phase='flight';from={...point};to=destination();began=now;
   duration=behavior==='reading'?1300:2000;bend=behavior==='cube'?25:50;
   canvas.dataset.behavior=behavior;
  }
  const t=Math.min(1,(now-began)/duration);
  if(phase==='flight'){
   const e=t*t*(3-2*t);point.x=from.x+(to.x-from.x)*e;point.y=from.y+(to.y-from.y)*e-Math.sin(Math.PI*t)*bend;
   pivot.rotation.y+=( (to.x>from.x?1.1:-1.1)-pivot.rotation.y)*.07;pivot.rotation.z=Math.sin(t*Math.PI)*.16*(to.x>from.x?-1:1);
   if(t===1){phase='hover';began=now;duration=to.kind==='reading'?6500:to.kind==='cube'?900:to.kind==='wander'?1000:2300;}
  }else{point.x=to.x+Math.sin(now*.002)*3;point.y=to.y+Math.sin(now*.005)*4;pivot.rotation.z*=.9;
   if(t===1){phase='flight';from={...point};to=destination();began=now;duration=behavior==='cube'?1900+Math.random()*600:behavior==='reading'?2600:2600+Math.random()*1800;bend=behavior==='cube'?20:behavior==='reading'?8:30+Math.random()*85;}}
  canvas.style.transform=`translate3d(${point.x-37.5}px,${point.y-37.5}px,0)`;
  mixer.update(dt);renderer.render(scene,camera);
 }
 requestAnimationFrame(frame);
}
const schedule=()=>setTimeout(()=>{if('requestIdleCallback'in window)requestIdleCallback(start,{timeout:3000});else start();},1500);
if(document.readyState==='complete')schedule();else addEventListener('load',schedule,{once:true});
})();



