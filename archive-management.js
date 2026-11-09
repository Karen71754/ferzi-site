(() => {
"use strict";
const KEY="ferziArchiveRecordsV1";
const $=id=>document.getElementById(id);
const form=$("archive-form");
if(!form)return;
let records=[];
try{records=JSON.parse(localStorage.getItem(KEY)||"[]");if(!Array.isArray(records))records=[];}catch(e){records=[];}
const labels={timeline:"ХРОНОЛОГИЯ",conflict:"КОНФЛИКТ",news:"НОВОСТЬ",rating:"РЕЙТИНГ"};
const esc=v=>String(v==null?"":v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const list=(type)=>records.filter(r=>r.type===type);
function save(){try{localStorage.setItem(KEY,JSON.stringify(records));$("admin-feedback").textContent="Запись сохранена в этом браузере.";render();}catch(e){$("admin-feedback").textContent="Не удалось сохранить: хранилище браузера недоступно или переполнено.";}}
function render(){
const timeline=list("timeline").slice().sort((a,b)=>(b.date||"").localeCompare(a.date||""));
$("timeline-list").innerHTML=timeline.length?timeline.map(r=>'<article class="timeline-entry"><div class="entry-date">'+esc(r.date||"ДАТА НЕ УКАЗАНА")+'</div><h3>'+esc(r.title)+'</h3>'+(r.people?'<div class="entry-meta">'+esc(r.people)+'</div>':"")+'<p>'+esc(r.description)+'</p></article>').join(""):'<p class="empty-state">Хронология пока не содержит подтверждённых записей.</p>';
const conflicts=list("conflict");
$("conflicts-list").innerHTML=conflicts.length?conflicts.map(r=>'<article class="record-card"><span class="record-tag">ДЕЛО / '+esc(r.date||"БЕЗ ДАТЫ")+'</span><h3>'+esc(r.title)+'</h3>'+(r.people?'<div class="record-people">'+esc(r.people)+'</div>':"")+'<p>'+esc(r.description)+'</p></article>').join(""):'<p class="empty-state">Архив конфликтов пока пуст.</p>';
const news=list("news").slice().sort((a,b)=>(b.date||"").localeCompare(a.date||""));
$("news-list").innerHTML=news.length?news.map(r=>'<article class="record-card"><span class="record-tag">СВОДКА / '+esc(r.date||"БЕЗ ДАТЫ")+'</span><h3>'+esc(r.title)+'</h3><p>'+esc(r.description)+'</p></article>').join(""):'<p class="empty-state">Новостей пока нет.</p>';
const ratings=list("rating").slice().sort((a,b)=>(Number(b.score)||0)-(Number(a.score)||0));
$("ratings-list").innerHTML=ratings.length?ratings.map((r,i)=>'<tr><td><span class="rating-place">'+String(i+1).padStart(2,"0")+'</span></td><td>'+esc(r.title)+'</td><td><span class="rating-score">'+(r.score===""||r.score==null?"—":esc(r.score+" / 100"))+'</span></td><td>'+esc(r.achievements||"—")+'</td></tr>').join(""):'<tr><td colspan="4" class="empty-state">Рейтинги ещё не заполнены.</td></tr>';
$("admin-record-list").innerHTML=records.length?records.map(r=>'<div class="admin-record-item"><div><strong>'+esc(r.title)+'</strong><small>'+(labels[r.type]||"ЗАПИСЬ")+' · '+esc(r.date||"БЕЗ ДАТЫ")+'</small></div><div class="record-actions"><button type="button" data-edit="'+esc(r.id)+'">ИЗМЕНИТЬ</button><button type="button" data-delete="'+esc(r.id)+'">УДАЛИТЬ</button></div></div>').join(""):'<p class="empty-state">Пока нет добавленных записей.</p>';
}
function reset(){form.reset();$("record-id").value="";$("admin-feedback").textContent="";}
form.addEventListener("submit",e=>{e.preventDefault();const id=$("record-id").value;const row={id:id||(crypto.randomUUID?crypto.randomUUID():String(Date.now())),type:$("record-type").value,date:$("record-date").value.trim(),title:$("record-title").value.trim(),people:$("record-people").value.trim(),description:$("record-description").value.trim(),score:$("record-score").value,achievements:$("record-achievements").value.trim()};if(!row.title)return;const i=records.findIndex(r=>r.id===id);if(i>=0)records[i]=row;else records.push(row);save();reset();});
$("cancel-edit").addEventListener("click",reset);
$("admin-record-list").addEventListener("click",e=>{const edit=e.target.closest("[data-edit]");const del=e.target.closest("[data-delete]");if(edit){const r=records.find(x=>x.id===edit.dataset.edit);if(!r)return;$("record-id").value=r.id;$("record-type").value=r.type;$("record-date").value=r.date||"";$("record-title").value=r.title||"";$("record-people").value=r.people||"";$("record-description").value=r.description||"";$("record-score").value=r.score==null?"":r.score;$("record-achievements").value=r.achievements||"";$("admin-feedback").textContent="Измените поля и сохраните запись.";$("record-type").focus();location.hash="admin";}if(del&&confirm("Удалить запись из локального архива?")){records=records.filter(x=>x.id!==del.dataset.delete);save();reset();}});
$("export-data").addEventListener("click",()=>{const blob=new Blob([JSON.stringify(records,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="ferzi-archive-backup.json";a.click();URL.revokeObjectURL(url);});
$("import-data").addEventListener("change",async e=>{const file=e.target.files&&e.target.files[0];if(!file)return;try{const data=JSON.parse(await file.text());if(!Array.isArray(data)||data.some(r=>!r||!["timeline","conflict","news","rating"].includes(r.type)||!r.title))throw Error("bad");if(confirm("Импортировать резервную копию? Текущие записи будут заменены.")){records=data;save();reset();}}catch(err){$("admin-feedback").textContent="Файл не распознан. Нужна резервная копия JSON."; }finally{e.target.value="";}});
render();
})();