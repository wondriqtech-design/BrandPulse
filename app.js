const app = document.querySelector('#app');
const sites = [
  ['Victoria Island',52,75],['Ajah',89,69],['Yaba',43,45],['Lekki',73,70],
  ['Festac',14,65],['Maryland',43,30],['Ikeja',30,20],['Gbagada',55,33],
  ['Ikoyi',62,62],['Surulere',33,59],['Magodo',53,16],['Apapa',27,77]
];
const checks = ['Branding installed','Stock levels','Staffing and ambassadors','Sampling activity','Pricing and POS','Footfall estimate','Consumer feedback interviews','Competitor activity'];
const agents = ['Tolu','Chiamaka','Ifeanyi','Aisha','Kunle','Ngozi','Emeka','Bisi'];
const timeline = ['Flagged','Notified','Actioned','Re-verified','Closed'];
const seeded = [
  {id:101,site:10,title:'Branding partially installed',severity:'Medium',status:'Actioned',owner:'Ngozi',time:'12:06',note:'The second banner arrived after opening.'},
  {id:102,site:2,title:'Low footfall before noon',severity:'Low',status:'Open',owner:'Aisha',time:'11:48',note:'Sampling team recorded light traffic before noon.'},
  {id:103,site:7,title:'2 ambassadors absent',severity:'Medium',status:'Closed',owner:'Kunle',time:'09:40',note:'Two relief staff arrived at 10:30.'}
];
const init = () => ({issues:structuredClone(seeded),requests:[],assign:{4:'Tolu',7:'Kunle',2:'Aisha'},visits:{},qa:{},activity:['09:12 · Agent Kunle checked in at Site 07, Ikeja.','11:48 · Tolu assigned to Site 04, Lekki.']});
let state;
try {state=JSON.parse(localStorage.getItem('brandpulse-v1')) || init();} catch {state=init();}
const persist=()=>{try{localStorage.setItem('brandpulse-v1',JSON.stringify(state));}catch{}};
const esc=(s='')=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>'₦'+n.toLocaleString('en-NG');
const siteLabel=n=>'Site '+String(n).padStart(2,'0')+' · '+sites[n-1][0];
const time=()=>new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit',timeZone:'Africa/Lagos'}).format(new Date());
const pill=s=>'<span class="pill '+s.toLowerCase().replaceAll(' ','-')+'">'+esc(s)+'</span>';
const action=(label,act,cls='',attr='')=>'<button type="button" class="'+cls+'" data-action="'+act+'" '+attr+'>'+esc(label)+'</button>';
const link=(label,path,cls='')=>'<a class="'+cls+'" href="#'+path+'">'+esc(label)+'</a>';
const photo=(file,alt='Field evidence from the Lagos sampling campaign')=>'<img class="evidence" src="'+esc(file)+'" alt="'+esc(alt)+'">';
const logo='<a class="logo" href="#home">BrandPulse <svg viewBox="0 0 36 22" aria-hidden="true"><path d="M0 13H9L13 3L18 20L23 8L26 13H36" fill="none" stroke="#ccff33" stroke-width="2"/></svg></a>';
const openIssues=()=>state.issues.filter(x=>x.status==='Open');
const unresolved=x=>x.status!=='Closed'&&x.status!=='Re-verified';
let selectedSite=4, fieldSite=4, fieldScreen='today', requestStep=0, requestResult='', selectedIssue=null, gallerySite='', galleryType='', galleryDay='';
let draft={locations:[{}],checks:[],depth:'Standard'}, issueDraft={severity:'High',category:'Stock levels',note:'',photo:''};
let timer;
const log=s=>state.activity.unshift(time()+' · '+s);
function toast(s){const t=document.querySelector('#toast');t.textContent=s;clearTimeout(timer);timer=setTimeout(()=>t.textContent='',3800);}
const route=()=>location.hash.slice(1)||'home';
const visit=()=>state.visits[fieldSite]??={status:'Not started',answers:{},photos:{}};
const sample='assets/stock.webp';
function renderHeader(page){
  const area=page.split('/')[0];
  return '<header class="top"><div class="topin">'+logo+'<nav aria-label="Main">'+link('How it works','home/how')+link('Pricing','home/pricing')+link('Sample report','client/report')+link('Request a deployment','request')+'</nav><div class="roles"><label class="mono" for="role">View as</label><select id="role" aria-label="View as"><option value="home">Website</option><option value="client">Client</option><option value="field">Field agent</option><option value="ops">Ops</option></select></div></div></header>';
}
const footer=(copy='Concept prototype. Proposed features.')=>'<footer>'+copy+'</footer>';
function home(){return `
<section class="hero"><div class="wrap"><div><span class="mono lime">Independent field verification · Nigeria</span><h1>See your campaign<br>the day it happens.</h1><p>Independent field verification, live issue alerts and evidence-backed reports for consumer goods campaigns in Nigeria. Pay per deployment.</p><div class="actions">${link('Request a deployment','request','btn primary')} ${link('See a sample report','client/report','textlink')}</div></div>
<div class="hero-visual corners"><div class="phone"><div class="phhead mono"><span>Site 04 · Lekki</span><span class="lime">● Live</span></div><img src="assets/service.webp" alt="Beverage sampling stand at a Lagos activation"><div class="phfoot mono"><span>Stock shortage · 3 crates left</span><span>14:41 WAT</span></div></div></div></div></section>
<section class="section"><div class="wrap split"><div><h2>The blind window</h2><p class="muted">Each one is fixable on the day. Almost none is fixable from a report.</p></div><div class="strip"><div><span class="mono">Day 01</span><br>Campaign opens</div><div><span class="mono">Day 03</span><br>Stock runs low</div><div><span class="mono">Day 06</span><br>Staff absent</div><div><span class="mono">Day 10–14</span><br>Branding gaps and low turnout</div><div><span class="mono">Day 21+</span><br>Agency report arrives</div></div></div></section>
<section class="section" id="how"><div class="wrap"><h2>How it works</h2><div class="grid3">${[['Request','Client','Send the campaign brief, sites and checks.'],['Scope and quote','BrandPulse','Agree coverage, escalation owners and fee.'],['Approve and pay','Client','Confirm the scope before deployment.'],['Deploy and monitor','Field','Agents check in and capture on-site evidence.'],['QA and escalate','BrandPulse','Review evidence and route issues to the right owner.'],['Deliver report','BrandPulse','Get a site-by-site record of execution and action taken.']].map(([h,o,p],i)=>`<article class="tile"><p class="mono muted">0${i+1} / ${o}</p><h3>${h}</h3><p>${p}</p></article>`).join('')}</div></div></section>
<section class="section"><div class="wrap"><h2>What we capture</h2><div class="grid4">${[['Verify','Branding, stock levels, staffing and setup.'],['Capture','Time-stamped and geo-tagged field photos.'],['Escalate','Flag issues while the team can still fix them.'],['Report','Compare sites and review the evidence behind every finding.']].map(([h,p])=>`<article class="tile"><h3>${h}</h3><p>${p}</p></article>`).join('')}</div></div></section>
<section class="section"><div class="wrap split"><h2>Built for consumer goods teams</h2><div><p><strong>Beverages and FMCG · Personal and home care · Food and packaged goods</strong></p><p class="muted">Product launches, sampling drives, roadshows, festivals and seasonal promotions.</p></div></div></section>
<section class="section" id="pricing"><div class="wrap"><div class="card dark split"><div><div class="price">₦1,000,000</div><p>Per standard deployment</p></div><div><h3>Pay per deployment</h3><p>Scope depends on locations, duration, checks required, field coverage and reporting depth.</p><p>Agree the fee for each campaign without an annual subscription.</p>${link('Request a deployment','request','btn primary')}</div></div></div></section>
<section class="section"><div class="wrap split"><div><h2>See the evidence behind the score</h2><p>A sample report from Crestline Beverages’ Lagos activation.</p>${link('Open sample report','client/report','btn solid')}</div><div class="card row"><div class="score">83<small class="mono">Execution</small></div><div><span class="mono">Sample report</span><h3>Summer Sampling, Lagos</h3><p>12 sites verified · 146 evidence items</p></div></div></div></section>
<section class="section"><div class="wrap split"><h2>Frequently asked questions</h2><div>${[['Are you an agency?','BrandPulse independently verifies campaigns run by your activation agency.'],['How fast are issues escalated?','Critical issues are routed by call and app alert, with a proposed 15-minute response window. High issues have a proposed one-hour window.'],['Where do you operate?','Coverage starts in Lagos, followed by Abuja and Port Harcourt.'],['How is evidence protected?','The proposed service limits evidence access to authorised campaign teams and reviewers.']].map(([q,a])=>`<details><summary>${q}</summary><p class="space">${a}</p></details>`).join('')}</div></div></section><div class="wrap">${footer('BrandPulse · Concept prototype')}</div>`;}
const reqInput=(name,label,type='text',required=true,value=draft[name]||'')=>`<label>${label}<input name="${name}" type="${type}" value="${esc(value)}" ${required?'required':''}></label>`;
const select=(name,options,value='')=>`<select name="${name}">${options.map(o=>`<option${o===value?' selected':''}>${esc(o)}</option>`).join('')}</select>`;
const cities=['Lagos','Abuja','Port Harcourt','Ibadan','Kano','Enugu','Benin City'];
function requestPage(){
 if(requestResult)return `<main class="wizard card"><p class="mono">${requestResult}</p><h1>Request received</h1><p>A BrandPulse lead will confirm scope within 24 hours.</p><div class="actions">${link('View request in Ops','ops','btn solid')}${action('Start another request','new-request')}</div>${footer()}</main>`;
 const steps=['Company details','Campaign brief','Locations','Checks and reporting','Review request'];
 const pages=[
 `<div class="grid3">${reqInput('company','Company')}${reqInput('contact','Contact name')}${reqInput('role','Role')}${reqInput('email','Work email','email')}${reqInput('phone','Phone','tel')}</div>`,
 `<div class="grid3">${reqInput('campaign','Campaign name')}<label>Campaign type${select('type',['Activation','Product launch','Sampling','Roadshow','Retail visibility','Other'],draft.type)}</label>${reqInput('start','Start date','date')}${reqInput('end','End date','date')}${reqInput('agency','Agency running it (optional)','text',false)}</div>`,
 draft.locations.map((loc,i)=>`<div class="space tile"><div class="row spread"><strong>Site ${i+1}</strong>${i?action('Remove','remove-location','','data-index="'+i+'"'):''}</div><div class="grid3">${reqInput('site'+i,'Site name','text',true,loc.name||'')}${reqInput('address'+i,'Address','text',true,loc.address||'')}<label>City${select('city'+i,cities,loc.city)}</label><label>Expected days<input name="days${i}" type="number" min="1" required value="${esc(loc.days||'1')}"></label></div></div>`).join('')+action('Add a location','add-location','space'),
 `<div class="grid3">${checks.map(c=>`<label><input name="checks" type="checkbox" value="${esc(c)}" ${draft.checks.includes(c)?'checked':''}> ${c}</label>`).join('')}</div><label>Reporting depth${select('depth',['Standard','Detailed'],draft.depth)}</label>`,
 `<div class="card"><h3>${esc(draft.campaign)}</h3><p>${esc(draft.company)} · ${esc(draft.type)} · ${esc(draft.start)} to ${esc(draft.end)}</p><p>${draft.locations.map(l=>esc(l.name)+' ('+esc(l.city)+')').join(', ')}</p><p>${draft.checks.map(esc).join(', ')} · ${esc(draft.depth)} reporting</p></div><div class="card dark space"><div class="mono lime">Indicative quote</div><div class="price">₦1,000,000</div><p>${draft.locations.length} site${draft.locations.length===1?'':'s'} · ${draft.locations.reduce((n,l)=>n+Number(l.days||1),0)} site-days · ${draft.checks.length} checks</p><p>Final fee confirmed after scoping.</p></div>`
 ];
 return `<main class="wizard card"><p class="mono muted">Step ${requestStep+1} of 5</p><h1>${steps[requestStep]}</h1><div class="stepbar">${steps.map((_,i)=>`<i class="${i<=requestStep?'done':''}"></i>`).join('')}</div><form id="request-form">${pages[requestStep]}<div class="actions space">${requestStep?action('Back','request-back'):link('Cancel','home','btn')}<button class="solid" type="submit">${requestStep===4?'Submit request':'Continue'}</button></div></form>${footer()}</main>`;
}
function stashRequest(){
 const f=document.querySelector('#request-form'); if(!f)return;
 const d=new FormData(f);
 if(requestStep===2){draft.locations=draft.locations.map((_,i)=>({name:d.get('site'+i),address:d.get('address'+i),city:d.get('city'+i),days:d.get('days'+i)}));}
 else if(requestStep===3){draft.checks=d.getAll('checks');draft.depth=d.get('depth');}
 else if(requestStep<2)Object.assign(draft,Object.fromEntries(d));
}
function workspace(area, active, body){
 const tabs=area==='ops'?[['Request inbox','ops'],['Agent assignment','ops/agents'],['Evidence QA','ops/qa'],['Escalations','ops/escalations']]:[['Deployments','client'],['Live workspace','client/live'],['Evidence gallery','client/evidence'],['Campaign report','client/report']];
 return `<div class="workspace"><aside class="sidebar" aria-label="Workspace navigation">${tabs.map(([t,p])=>link(t,p,p===active?'active':'')).join('')}</aside><main class="main">${body}${footer()}</main></div>`;
}
const head=(label,title,right='')=>`<div class="pagehead"><div><div class="mono muted">${label}</div><h1>${title}</h1></div><div class="actions">${right}</div></div>`;
function map(){
 return `<div class="map" aria-label="Schematic map of Lagos campaign sites"><svg viewBox="0 0 600 300" preserveAspectRatio="none" aria-hidden="true"><rect width="600" height="300" fill="#e9eddf"/><path d="M600 155Q493 128 425 161T315 173Q270 166 267 204T212 235L0 274V300H600Z" fill="#abc9d4"/><path d="M331 213Q403 178 495 185L600 196V238L557 221Q419 202 331 242Z" fill="#e9eddf"/><g fill="none" stroke="#c6cebb" stroke-width="2"><path d="M0 55L168 91L267 52L600 110M0 151L142 142L235 116L286 158L551 112M0 210L170 190L227 154L246 20M113 253L137 160L98 64L144 0M348 166L364 77L336 0M464 160L444 79L524 0M302 255L389 216L489 205L600 212"/></g><g fill="#536458" font-size="12" font-family="sans-serif"><text x="180" y="50">Ikeja</text><text x="264" y="125">Yaba</text><text x="460" y="236">Lekki</text><text x="360" y="190">Lagos Lagoon</text></g></svg>${sites.map(([name,x,y],i)=>{const n=i+1;const has=state.issues.some(q=>q.site===n&&unresolved(q)); return `<button class="pin ${has?'issue':n>8&&n!==10?'pending':''} ${n===selectedSite?'selected':''}" data-action="select-site" data-index="${n}" aria-label="${siteLabel(n)}${has?', issue pending':''}" style="left:${x}%;top:${y}%">${n}</button>`;}).join('')}</div>`;
}
function issueTable(list=state.issues){
 return `<div class="tablewrap"><table><thead><tr><th>Severity</th><th>Issue</th><th>Site</th><th>Raised</th><th>Owner</th><th>Status</th><th>Resolution</th></tr></thead><tbody>${list.map(x=>`<tr><td>${pill(x.severity)}</td><td>${action(x.title,'issue','link','data-index="'+x.id+'"')}</td><td>${siteLabel(x.site)}</td><td>${esc(x.time)} WAT</td><td>${esc(x.owner)}</td><td>${pill(x.status)}</td><td>${esc(x.resolution||'Pending')}</td></tr>`).join('')}</tbody></table></div>`;
}
function client(p){
 let body;
 if(p==='client/login')return workspace('client',p,`${head('Demo access','Client sign-in')}<div class="card"><p>Open the Crestline Beverages workspace with demo access.</p>${link('Continue as Crestline Beverages','client','btn solid')}</div>`);
 if(p==='client'){
 const rows=[['Summer Sampling, Lagos','Live','10–14 Jun 2026',12,openIssues().length,'client/live'],['Retail Visibility Audit','Report ready','01–05 Jun 2026',8,0,'client/report'],['Abuja Roadshow','Scoping','21–25 Jun 2026',6,0,''],['Cold Serve Launch','Awaiting payment','03–06 Jul 2026',4,0,''],['Weekend Market Sampling','In QA','08–09 Jun 2026',5,0,''],...state.requests.map(r=>[r.campaign,r.status,r.start+' to '+r.end,r.locations.length,0,''])];
 body=head('Crestline Beverages','Deployments',link('Request a deployment','request','btn solid'))+`<div class="card tablewrap"><table><thead><tr><th>Campaign</th><th>Status</th><th>Dates</th><th>Sites</th><th>Open issues</th></tr></thead><tbody>${rows.map(([n,s,d,k,o,l])=>`<tr><td>${l?link(n,l):esc(n)}</td><td>${pill(s)}</td><td>${esc(d)}</td><td>${k}</td><td>${o}</td></tr>`).join('')}</tbody></table></div>`;
 }else if(p==='client/report'){
 body=head('Crestline Beverages · Sample campaign report','Summer Sampling, Lagos',action('Download PDF','print','solid'))+`<div class="columns"><div class="card row"><div class="score">83<small class="mono">Execution</small></div><div><h3>Executive summary</h3><p>Sampling was active across Lagos. Earlier stock checks and a backup staffing plan would improve execution at lower-scoring sites.</p></div></div><div class="card"><h3>Verification summary</h3><p>12 sites verified · 146 evidence items</p><p>4 issues raised · 3 resolved during the campaign</p><p class="mono muted">10–14 June 2026</p></div></div><div class="columns"><div class="card"><h3>Site scorecards</h3>${sites.map(([n],i)=>{const s=[92,79,84,62,85,87,88,82,89,87,78,83][i];return `<div class="listitem"><div class="row spread"><strong>${n}</strong><span class="mono">${s}/100</span></div><span class="bar ${s<70?'low':''}" style="width:${s}%"></span></div>`;}).join('')}</div><div class="card"><h3>Evidence appendix</h3>${photo(sample)}<p class="mono">Site 04 · Lekki · 14:41 WAT</p><h3>Issue summary</h3><p>Lekki stock shortage, staffing gap in Ikeja, incomplete branding in Surulere and low footfall in Ajah.</p><h3>Recommendations</h3><ul><li>Set a replenishment threshold before peak sampling hours.</li><li>Confirm relief staff before each activation opens.</li><li>Photograph branding before the first consumer interaction.</li></ul></div></div>`;
 }else if(p==='client/evidence'){
 const entries=[{site:4,type:'Stock levels',day:'Day 3',img:sample},{site:1,type:'Sampling activity',day:'Day 2',img:'assets/service.webp'},{site:7,type:'Staffing and ambassadors',day:'Day 3',img:'assets/activation.webp'},...state.issues.filter(x=>x.photo&&x.photo!==sample).map(x=>({site:x.site,type:x.category||'Stock levels',day:'Day 3',img:x.photo}))];
 body=head('Crestline Beverages · Summer Sampling, Lagos','Evidence gallery')+`<div class="actions"><label>Site <select id="gallerySite"><option value="">All sites</option>${sites.map(([n],i)=>`<option value="${i+1}" ${gallerySite==i+1?'selected':''}>${n}</option>`).join('')}</select></label><label>Check ${select('galleryType',['All checks',...checks],galleryType)}</label><label>Day ${select('galleryDay',['All days','Day 2','Day 3'],galleryDay)}</label></div><div class="grid3 gallery space">${entries.filter(x=>(!gallerySite||x.site==gallerySite)&&(!galleryType||galleryType==='All checks'||x.type===galleryType)&&(!galleryDay||galleryDay==='All days'||x.day===galleryDay)).map(x=>`<article class="card">${photo(x.img)}<div class="mono">Geo-tagged · 14:41 · ${siteLabel(x.site)}</div><p>${x.type} · ${x.day}</p></article>`).join('')||'<p>No evidence matches these filters.</p>'}</div>`;
 }else{
 const q=state.issues.find(x=>x.site===selectedSite&&unresolved(x));
 body=head('Crestline Beverages · Day 3 of 5','Summer Sampling, Lagos',pill('Live')+link('Evidence gallery','client/evidence','btn'))+`<div class="stats">${[['Locations live','12 / 12'],['Checks completed','8 / 12'],['Open issues',openIssues().length],['Evidence items',146+state.issues.filter(x=>x.id>103).length]].map(([k,v],i)=>`<div class="card stat ${i===2?'dark':''}"><span>${k}</span><strong>${v}</strong></div>`).join('')}</div><div class="columns"><section class="card"><div class="row spread"><h3>Site status map</h3><span class="mono muted">12 Lagos locations</span></div>${map()}<p class="mono space muted">Lime verified · Orange issue · Grey pending</p></section><section class="card"><p class="mono">${siteLabel(selectedSite)}</p>${photo(q?.photo||(selectedSite===4?sample:'assets/service.webp'))}<p class="mono muted">${selectedSite===4?'6.4474 N · 3.4723 E · ':''}14:41 WAT</p>${q?`<h3>${esc(q.title)}</h3><p>${esc(q.note)}</p><div class="actions">${pill(q.status)}${action('View issue','issue','','data-index="'+q.id+'"')}${q.status==='Open'?action('Mark as actioned','actioned','solid','data-index="'+q.id+'"'):''}</div>`:`<h3>${selectedSite<=8?'Latest site check':'Visit pending'}</h3><p>${selectedSite===4?'Review check results or flag a stock issue from the field app.':'Select another pin to review its site details.'}</p>`}</section></div><section class="card"><h3>Issue log</h3>${issueTable()}</section><div class="columns"><section class="card dark"><h3>Check-ins by hour</h3><div class="hour" aria-label="Peak at midday">${[23,45,60,95,68,39].map(v=>`<i style="height:${v}%"></i>`).join('')}</div><p class="mono">09:00 to 15:00 · Avg. escalation 11 min</p></section><section class="card"><h3>Activity</h3><ul class="feed">${state.activity.slice(0,6).map(s=>`<li>${esc(s)}</li>`).join('')}</ul></section></div>`;
 }
 return workspace('client',p,body);
}
function field(){
 const v=visit(), q=state.issues.find(x=>x.site===fieldSite&&x.status==='Actioned');
 const title=fieldScreen==='today'?'Today':fieldScreen==='checkin'?'Check in on site':fieldScreen==='checklist'?'Site checklist':fieldScreen==='issue'?'Flag an issue':fieldScreen==='checkout'?'Check out':'Re-verify issue';
 let body;
 if(fieldScreen==='today'){
  body='<p class="mono muted">Summer Sampling, Lagos · Day 3 of 5</p>'+[4,7,2].map(n=>`<div class="listitem"><div class="row spread"><strong>${siteLabel(n)}</strong>${pill(state.visits[n]?.status||'Not started')}</div><p>Assigned to ${esc(state.assign[n]||'Field team')}</p><div class="actions">${action('Open visit','field-open','solid','data-index="'+n+'"')}${state.issues.some(x=>x.site===n&&x.status==='Actioned')?action('Re-verify issue','field-reverify','','data-index="'+n+'"'):''}</div></div>`).join('');
 }else if(fieldScreen==='checkin'){
  body=`<p class="mono muted">${siteLabel(fieldSite)}</p><div class="card dark"><strong class="lime">Inside geofence</strong><p>38 m from the activation point</p><div class="mono">${{4:'6.4474 N · 3.4723 E',7:'6.5965 N · 3.3421 E',2:'6.4689 N · 3.5656 E'}[fieldSite]} · ${time()} WAT</div></div><p class="space muted">Time and location are stamped automatically and cannot be edited. Demo geofence.</p>${action('Check in on site','check-in','primary full')}`;
 }else if(fieldScreen==='checklist'){
  const done=checks.filter(c=>v.answers[c]&&v.photos[c]).length;
  body=`<p class="mono muted">${siteLabel(fieldSite)} · ${done} of 8 checked with evidence</p><progress style="width:100%" value="${done}" max="8"></progress><div class="actions space">${action('Flag stock issue','flag','danger')}${q?action('Re-verify issue','field-reverify','','data-index="'+fieldSite+'"'):''}</div>${checks.map((c,i)=>`<div class="checkrow"><div><label for="answer-${i}">${c}</label>${i===1?'<small class="muted">Record crates remaining</small>':''}<div>${v.photos[c]?'Photo attached':action('Use sample photo','check-sample','','data-index="'+i+'"')}</div></div><div><input id="answer-${i}" data-check="${i}" value="${esc(v.answers[c]||'')}" placeholder="${i===1?'Crates':'Yes / No'}" aria-label="${c} result"><label for="file-${i}">Add photo</label><input id="file-${i}" data-check-file="${i}" type="file" accept="image/*" capture="environment"></div></div>`).join('')}${action('Review checkout','field-screen','solid full','data-screen="checkout"')}`;
 }else if(fieldScreen==='issue'){
  body=`<p class="mono muted">${siteLabel(fieldSite)} · Summer Sampling, Lagos</p><form id="issue-form"><label>Check${select('category',checks,issueDraft.category)}</label><label>Severity${select('severity',['Low','Medium','High','Critical'],issueDraft.severity)}</label><p class="mono muted">Critical 15 min · High 1 hour · Medium same day · Low in report</p>${photo(issueDraft.photo||sample)}<p class="mono muted">Geo-tagged · Demo evidence · ${time()} WAT</p><label>Replace photo<input id="issue-photo" type="file" accept="image/*" capture="environment"></label><label>Note<textarea name="note" required>${esc(issueDraft.note||'3 crates left. Replenishment needed before the evening rush.')}</textarea></label><button type="submit" class="danger full">Escalate to client</button></form>`;
 }else if(fieldScreen==='reverify'){
  body=q?`<p class="mono muted">${siteLabel(fieldSite)}</p><h3>${esc(q.title)}</h3><p>The brand team marked this actioned. Confirm the stock has been replenished on site.</p>${photo(q.photo||sample)}<label>Verification note<textarea id="verify-note">Stock replenished. Sampling can continue.</textarea></label>${action('Re-verify and close issue','verified','primary full','data-index="'+q.id+'"')}`:'<p>There are no actioned issues to re-verify at this site.</p>';
 }else{
  const done=checks.filter(c=>v.answers[c]&&v.photos[c]).length;
  body=`<p class="mono muted">${siteLabel(fieldSite)}</p><p>Checked in at ${esc(v.at||'')}. ${done} of 8 checks have answers and photo evidence.</p><p class="muted">Every check needs an answer and a photo before you submit the visit.</p>${done===8?action('Submit visit','checkout','primary full'):action('Return to checklist','field-screen','solid full','data-screen="checklist"')}`;
 }
 return `<main class="field"><header class="fieldhead mono">BrandPulse Field</header><div class="fieldbody">${fieldScreen!=='today'?action('Back to today','field-screen','','data-screen="today"'):''}<h1 class="space">${title}</h1>${body}${footer()}</div></main>`;
}
function ops(p){
 let body;
 if(p==='ops/agents'){
  body=head('BrandPulse operations','Agent assignment')+`<div class="columns"><section class="card"><h3>Field agents</h3>${agents.map((n,i)=>`<div class="listitem" draggable="true" data-agent="${n}"><strong>${n}</strong><p class="muted">Lagos · ${[4.9,4.8,4.7][i%3]} rating · ${12+i} deployments</p></div>`).join('')}</section><section class="card"><h3>Assignment by site</h3>${sites.map(([n],i)=>`<div class="listitem" data-site-drop="${i+1}"><label>${siteLabel(i+1)} ${select('assign-'+(i+1),['Unassigned',...agents],state.assign[i+1])}</label></div>`).join('')}</section></div>`;
 }else if(p==='ops/qa'){
  const queue=[{id:0,site:4,title:'Stock levels · 3 crates remaining',owner:'Tolu',photo:sample},...state.issues.filter(x=>x.id>103)];
  body=head('BrandPulse operations','Evidence QA')+`<div class="grid3">${queue.map(q=>`<section class="card"><p class="mono">${siteLabel(q.site)} · ${esc(q.owner)}</p>${photo(q.photo||sample)}<h3>${esc(q.title)}</h3>${state.qa[q.id]?`<p>${esc(state.qa[q.id])}</p>`:`<div class="actions">${action('Approve','qa-approve','solid','data-index="'+q.id+'"')}${action('Reject','qa-reject','','data-index="'+q.id+'"')}</div>`}</section>`).join('')}</div>`;
 }else if(p==='ops/escalations'){
  body=head('BrandPulse operations','Escalation board')+`<div class="card">${issueTable()}</div><div class="grid3 space">${timeline.map(stage=>`<section class="tile"><h3>${stage}</h3>${state.issues.filter(q=>(q.status==='Open'?'Notified':q.status)===stage || (stage==='Re-verified'&&q.verified)).map(q=>`<p>${action(q.title,'issue','link','data-index="'+q.id+'"')}</p>`).join('')||'<p class="muted">No issues at this stage.</p>'}</section>`).join('')}</div>`;
 }else{
  body=head('BrandPulse operations','Request inbox',link('Open deployment request','request','btn'))+`<div class="card">${state.requests.length?state.requests.map(r=>`<article class="listitem row spread"><div><p class="mono muted">${r.id} · ${esc(r.status)}</p><h3>${esc(r.campaign)}</h3><p>${esc(r.company)} · ${r.locations.length} site(s) · ${esc(r.start)} to ${esc(r.end)}</p></div>${action('Scope and quote','quote','solid','data-id="'+r.id+'"')}</article>`).join(''):'<h3>No incoming requests</h3><p>Submit a deployment request from the website to see it here.</p>'}</div><div class="grid3 space"><section class="tile"><h3>Agent assignment</h3><p>${Object.keys(state.assign).length} site assignments</p>${link('Manage agents','ops/agents','btn')}</section><section class="tile"><h3>Evidence QA</h3><p>Review field photos and checklist answers.</p>${link('Open queue','ops/qa','btn')}</section><section class="tile"><h3>Escalations</h3><p>${openIssues().length} open issues</p>${link('View board','ops/escalations','btn')}</section></div>`;
 }
 return workspace('ops',p,body);
}
function dialog(content){const d=document.querySelector('dialog');d.innerHTML=content+'<div class="space"><form method="dialog"><button>Close</button></form></div>';d.showModal();}
function showIssue(q){
 const progress=q.status==='Closed'?4:q.status==='Actioned'?2:1;
 dialog(`<p class="mono muted">${siteLabel(q.site)} · ${esc(q.time)} WAT</p><h2>${esc(q.title)}</h2><div class="actions">${pill(q.severity)}${pill(q.status)}</div>${photo(q.photo||sample)}<p>${esc(q.note)}</p><ol>${timeline.map((s,i)=>`<li class="${i>progress?'muted':''}">${s}${i<=progress?' ✓':''}</li>`).join('')}</ol>${q.verified?'<p>'+esc(q.verified)+'</p>':''}${q.status==='Open'&&route().startsWith('client')?action('Mark as actioned','actioned','solid','data-index="'+q.id+'"'):''}`);
}
function render(){
 const p=route();
 app.innerHTML=renderHeader(p)+(p==='request'?requestPage():p.startsWith('client')?client(p):p.startsWith('field')?field():p.startsWith('ops')?ops(p):home())+'<dialog></dialog>';
 document.querySelector('#role').value=p.startsWith('client')?'client':p.startsWith('field')?'field':p.startsWith('ops')?'ops':'home';
}
window.addEventListener('hashchange',()=>{render();const anchor=route().startsWith('home/')?document.getElementById(route().split('/')[1]):null;if(anchor)anchor.scrollIntoView();else scrollTo(0,0);});
const setRoute=p=>{if(route()===p)render();else location.hash=p;};
document.addEventListener('change',e=>{
 const el=e.target;
 if(el.id==='role'){setRoute(el.value==='client'?'client/login':el.value);return;}
 if(el.id==='gallerySite'){gallerySite=el.value;render();}
 if(el.name==='galleryType'){galleryType=el.value;render();}
 if(el.name==='galleryDay'){galleryDay=el.value;render();}
 if(el.name?.startsWith('assign-')){const n=el.name.split('-')[1];if(el.value==='Unassigned')delete state.assign[n];else state.assign[n]=el.value;persist();toast('Assignment saved.');}
 if(el.dataset.check!==undefined){visit().answers[checks[el.dataset.check]]=el.value;persist();if(el.value==='No'||(Number(el.dataset.check)===1&&el.value!==''&&Number(el.value)<5))toast('Below target. Use “Flag stock issue” to escalate.');}
 if(el.dataset.checkFile!==undefined||el.id==='issue-photo'){
  const file=el.files[0];if(!file)return;
  if(!file.type.startsWith('image/')||file.size>5e6){toast('Choose an image under 5 MB.');return;}
  const reader=new FileReader();
  reader.onload=()=>{const img=new Image();img.onload=()=>{const scale=Math.min(1,768/img.width);const canvas=document.createElement('canvas');canvas.width=img.width*scale;canvas.height=img.height*scale;canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);const url=canvas.toDataURL('image/jpeg',.72);if(el.id==='issue-photo'){const d=new FormData(document.querySelector('#issue-form'));issueDraft={...Object.fromEntries(d),photo:url};}else visit().photos[checks[el.dataset.checkFile]]=url;persist();render();};img.src=reader.result;};reader.readAsDataURL(file);
 }
});
document.addEventListener('dragstart',e=>{if(e.target.dataset.agent)e.dataTransfer.setData('text/plain',e.target.dataset.agent);});
document.addEventListener('dragover',e=>{if(e.target.closest('[data-site-drop]'))e.preventDefault();});
document.addEventListener('drop',e=>{const t=e.target.closest('[data-site-drop]');const a=e.dataTransfer.getData('text/plain');if(t&&agents.includes(a)){e.preventDefault();state.assign[t.dataset.siteDrop]=a;persist();render();toast('Agent assigned.');}});
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-action]');if(!b)return;
 const n=Number(b.dataset.index), q=state.issues.find(x=>x.id===n);
 switch(b.dataset.action){
 case 'new-request':requestResult='';requestStep=0;draft={locations:[{}],checks:[],depth:'Standard'};break;
 case 'request-back':stashRequest();requestStep--;break;
 case 'add-location':stashRequest();draft.locations.push({});break;
 case 'remove-location':stashRequest();draft.locations.splice(n,1);break;
 case 'select-site':selectedSite=n;break;
 case 'issue':showIssue(q);return;
 case 'actioned':q.status='Actioned';log(siteLabel(q.site)+' issue marked actioned.');toast('Action recorded. Return to Field agent to re-verify.');break;
 case 'field-screen':fieldScreen=b.dataset.screen;break;
 case 'field-open':fieldSite=n;fieldScreen=visit().status==='Not started'?'checkin':'checklist';break;
 case 'check-in':visit().status='Checked in';visit().at=time();log('Agent '+(state.assign[fieldSite]||'Tolu')+' checked in at '+siteLabel(fieldSite)+'.');fieldScreen='checklist';break;
 case 'check-sample':visit().photos[checks[n]]=sample;break;
 case 'flag':issueDraft={severity:'High',category:'Stock levels',note:'',photo:''};fieldScreen='issue';break;
 case 'field-reverify':fieldSite=n;fieldScreen='reverify';break;
 case 'verified':q.verified=document.querySelector('#verify-note').value.trim()||'Replenishment confirmed.';q.status='Closed';q.resolution='Re-verified on site';log(siteLabel(q.site)+' issue re-verified and closed.');fieldScreen='today';toast('Issue closed. The site pin is verified.');break;
 case 'checkout':visit().status='Completed';log(siteLabel(fieldSite)+' visit submitted.');fieldScreen='today';toast('Visit submitted for review.');break;
 case 'qa-approve':state.qa[n]='Approved';toast('Evidence approved.');break;
 case 'qa-reject':dialog(`<h2>Reject evidence</h2><form id="reject-form"><input type="hidden" name="id" value="${n}"><label class="stacklabel">Reason ${select('reason',['Blurry photo','Wrong site','Missing timestamp'])}</label><button class="solid space">Reject evidence</button></form>`);return;
 case 'quote':{
  const r=state.requests.find(x=>x.id===b.dataset.id);
  dialog(`<h2>Scope and quote</h2><p>${esc(r.campaign)}</p><form id="quote-form"><input type="hidden" name="id" value="${r.id}"><label class="stacklabel">Site coverage<textarea name="scope" required>${esc(r.scope||r.locations.map(l=>l.name+' · '+l.city+' · '+l.days+' day(s)').join('\n'))}</textarea></label><label class="stacklabel">Checks<textarea name="checks" required>${esc(r.quoteChecks||r.checks.join(', '))}</textarea></label><label class="stacklabel">Fee in naira<input type="number" name="fee" value="${r.fee||1000000}" min="1" required></label><button class="solid space">Send quote</button></form>`);return;
 }
 case 'print':window.print();return;
 }
 persist();render();
});
document.addEventListener('submit',e=>{
 const f=e.target, formId=f.getAttribute('id');if(!['request-form','issue-form','quote-form','reject-form'].includes(formId))return;
 e.preventDefault();const d=new FormData(f);
 if(formId==='request-form'){
  stashRequest();
  if(requestStep===1&&draft.end<draft.start){toast('End date must be on or after the start date.');return;}
  if(requestStep===3&&!draft.checks.length){toast('Choose at least one check.');return;}
  if(requestStep===4){requestResult='BP-2026-'+String(147+state.requests.length).padStart(4,'0');state.requests.unshift({...structuredClone(draft),id:requestResult,status:'Requested'});}else requestStep++;
 }
 if(formId==='issue-form'){
  const category=d.get('category'), severity=d.get('severity'), note=d.get('note').trim();if(!note)return;
  if(state.issues.some(x=>x.site===fieldSite&&x.category===category&&unresolved(x))){toast('An issue for this check is already active.');return;}
  state.issues.unshift({id:Date.now(),site:fieldSite,title:category==='Stock levels'?'Stock shortage · 3 crates left':category+' issue',category,severity,note,photo:issueDraft.photo||sample,status:'Open',time:time(),owner:state.assign[fieldSite]||'Tolu'});
  selectedSite=fieldSite;log(siteLabel(fieldSite)+' · '+severity+' issue escalated.');fieldScreen='checklist';toast('Routed to the brand team and Ops. Demo alert sent.');
 }
 if(formId==='quote-form'){const r=state.requests.find(x=>x.id===d.get('id'));Object.assign(r,{scope:d.get('scope'),quoteChecks:d.get('checks'),fee:Number(d.get('fee')),status:'Awaiting payment'});toast('Demo quote sent for '+money(r.fee)+'.');}
 if(formId==='reject-form'){state.qa[d.get('id')]='Rejected · '+d.get('reason');toast('Evidence returned for re-submission.');}
 persist();render();
});
render();
