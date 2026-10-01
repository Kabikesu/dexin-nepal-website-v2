document.addEventListener("DOMContentLoaded",async()=>{const root=document.getElementById("gallery-albums"),viewer=document.getElementById("gallery-viewer"),image=document.getElementById("viewer-image"),title=document.getElementById("viewer-title"),count=document.getElementById("viewer-count"),thumbs=document.getElementById("viewer-thumbnails");if(!root||!viewer)return;let albums=[],activeAlbum=null,activeIndex=0,lastFocused=null,touchStartX=0;try{const response=await fetch("data/gallery.json",{cache:"no-store"});if(!response.ok)throw new Error("Gallery manifest unavailable");const manifest=await response.json();albums=normalizeAlbums(manifest);renderAlbums()}catch(error){root.innerHTML='<p class="gallery-status">Gallery is being prepared. Please check back soon.</p>'}

function normalizeAlbums(manifest){
  const normalized=[];
  for(const album of manifest||[]){
    const grouped=new Map();
    for(const item of album.images||[]){
      const parts=String(item.src||"").split("/");
      const albumRoot=album.title;
      const rootIndex=parts.findIndex(part=>part===albumRoot);
      const relativeParts=rootIndex>=0?parts.slice(rootIndex+1):[];
      const nestedFolder=relativeParts.length>1?relativeParts[0]:null;
      const key=nestedFolder||"__direct__";
      if(!grouped.has(key))grouped.set(key,[]);
      grouped.get(key).push(item);
    }
    for(const [key,images] of grouped){
      if(key==="__direct__"){
        normalized.push({...album,images});
      }else{
        normalized.push({
          id:slugify(album.id+"-"+key),
          title:key,
          images
        });
      }
    }
  }
  return normalized;
}

function slugify(value){return String(value).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}

function renderAlbums(){if(!albums.length){root.innerHTML='<p class="gallery-status">No gallery albums are available yet. Add photos to the gallery folders to publish them automatically.</p>';return}root.innerHTML=albums.map((album,index)=>{const cover=album.images[0];return '<button class="album-card" type="button" data-album-index="'+index+'"><span class="album-cover"><img loading="lazy" src="'+escapeAttr(cover.src)+'" alt="'+escapeAttr(album.title)+'"></span><span class="album-info"><span><strong class="album-info-title">'+escapeHtml(album.title)+'</strong></span><span class="album-info-count">'+album.images.length+' image'+(album.images.length===1?"":"s")+'</span></span></button>'}).join("");root.querySelectorAll("[data-album-index]").forEach(card=>card.addEventListener("click",()=>openAlbum(Number(card.dataset.albumIndex))))}

function openAlbum(index){activeAlbum=albums[index];activeIndex=0;lastFocused=document.activeElement;renderViewer();viewer.hidden=false;document.body.style.overflow="hidden";setTimeout(()=>viewer.querySelector(".viewer-close")?.focus(),0)}

function renderViewer(){if(!activeAlbum?.images?.length)return;const item=activeAlbum.images[activeIndex];image.src=item.src;image.alt=item.alt||activeAlbum.title;title.textContent=item.title||activeAlbum.title;count.textContent=(activeIndex+1)+" / "+activeAlbum.images.length;thumbs.innerHTML=activeAlbum.images.map((entry,i)=>'<button class="viewer-thumb '+(i===activeIndex?"is-active":"")+'" type="button" data-thumb="'+i+'" aria-label="View image '+(i+1)+'"><img loading="lazy" src="'+escapeAttr(entry.src)+'" alt=""></button>').join("");thumbs.querySelectorAll("[data-thumb]").forEach(t=>t.addEventListener("click",()=>{activeIndex=Number(t.dataset.thumb);renderViewer();scrollActiveThumbIntoView()}));scrollActiveThumbIntoView()}

function scrollActiveThumbIntoView(){thumbs.querySelector(".is-active")?.scrollIntoView({behavior:"smooth",block:"nearest",inline:"center"})}

function closeViewer(){viewer.hidden=true;document.body.style.overflow="";image.src="";activeAlbum=null;lastFocused?.focus?.()}

function step(direction){if(!activeAlbum)return;activeIndex=(activeIndex+direction+activeAlbum.images.length)%activeAlbum.images.length;renderViewer()}

viewer.querySelectorAll("[data-viewer-close]").forEach(el=>el.addEventListener("click",closeViewer));viewer.querySelector(".viewer-prev").addEventListener("click",()=>step(-1));viewer.querySelector(".viewer-next").addEventListener("click",()=>step(1));viewer.querySelector(".viewer-main").addEventListener("touchstart",event=>{touchStartX=event.changedTouches[0]?.screenX||0},{passive:true});viewer.querySelector(".viewer-main").addEventListener("touchend",event=>{const endX=event.changedTouches[0]?.screenX||0,diff=endX-touchStartX;if(Math.abs(diff)>50)step(diff<0?1:-1)},{passive:true});document.addEventListener("keydown",event=>{if(viewer.hidden)return;if(event.key==="Escape"){event.preventDefault();closeViewer();return}if(event.key==="ArrowLeft"){event.preventDefault();step(-1)}if(event.key==="ArrowRight"){event.preventDefault();step(1)}});function escapeHtml(value){return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}function escapeAttr(value){return escapeHtml(value)}});