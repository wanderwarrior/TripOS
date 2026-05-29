/* tc-ui.jsx — shared primitives, sidebar, topbar, charts. Exports to window.TC */
(function(){
const { useState, useEffect, useRef } = React;

/* ---------------- icon set (lucide paths) ---------------- */
const P = {
  dashboard:'M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z',
  reports:'M3 3v18h18 M7 16l4-5 3 3 5-7',
  contacts:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
  heart:'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z',
  compass:'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36z',
  wallet:'M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2 M21 12h-6a2 2 0 0 0 0 4h6v-4Z',
  file:'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M9 13h6 M9 17h6',
  building:'M3 21h18 M5 21V7l8-4v18 M19 21V11l-6-3 M9 9v.01 M9 12v.01 M9 15v.01',
  clipboard:'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2 M9 2h6a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z M9 13l2 2 4-4',
  message:'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z',
  calendar:'M8 2v4 M16 2v4 M3 10h18 M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2 M12 14v3 M11 16h2',
  search:'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z M21 21l-4.3-4.3',
  bell:'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9 M10.3 21a1.94 1.94 0 0 0 3.4 0',
  plus:'M5 12h14 M12 5v14',
  up:'M7 17 17 7 M7 7h10v10',
  down:'M17 7 7 17 M17 17H7V7',
  trend:'M22 7 13.5 15.5 8.5 10.5 2 17 M16 7h6v6',
  chevR:'M9 18l6-6-6-6',
  chevD:'M6 9l6 6 6-6',
  spark:'M12 3l1.9 5.8L20 10l-5.5 3.5L16 20l-4-3.5L8 20l1.5-6.5L4 10l6.1-1.2z',
  userplus:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M19 8v6 M22 11h-6',
  check:'M20 6 9 17l-5-5',
  clock:'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z M12 6v6l4 2',
  pin:'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  plane:'M17.8 19.2 16 11l3.5-3.5a2.12 2.12 0 0 0-3-3L13 8 4.8 6.2a1 1 0 0 0-1 .3l-1 1a1 1 0 0 0 .3 1.6L9 13l-2 3-2.5.5a.8.8 0 0 0-.4 1.3l2 2 2 2a.8.8 0 0 0 1.3-.4L11 21l3-2 3.6 5.4a1 1 0 0 0 1.6.3l1-1a1 1 0 0 0 .3-1z',
  car:'M5 17a2 2 0 1 0 0 .01 M19 17a2 2 0 1 0 0 .01 M5 17H3v-5l2-5h11l3 5h2v5h-2 M5 12h14',
  ticket:'M3 9V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4Z M13 5v14',
  bed:'M2 4v16 M2 8h18a2 2 0 0 1 2 2v10 M2 17h20 M6 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2',
  more:'M12 12h.01 M19 12h.01 M5 12h.01',
  filter:'M22 3H2l8 9.46V19l4 2v-8.54z',
  download:'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3',
  send:'M22 2 11 13 M22 2l-7 20-4-9-9-4z',
  star:'M12 3l2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 18.6 5.9 21.4l1.4-6.8L2.2 10l6.9-.7z',
  phone:'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.18 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z',
  mail:'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z M22 7l-10 6L2 7',
  dollar:'M12 2v20 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  users:'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
  globe:'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z M2 12h20 M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z',
  layers:'M12 2 2 7l10 5 10-5-10-5Z M2 17l10 5 10-5 M2 12l10 5 10-5',
  flag:'M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z M4 22v-7',
  route:'M6 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z M18 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z M9 19h7a3 3 0 0 0 0-6H8a3 3 0 0 1 0-6h1',
  sliders:'M4 21v-7 M4 10V3 M12 21v-9 M12 8V3 M20 21v-5 M20 12V3 M1 14h6 M9 8h6 M17 16h6',
  settings:'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z',
};
function Icon({n, s, style, cls}){
  const d = P[n] || '';
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      width={s||16} height={s||16} style={style} className={cls}>
      {d.split(' M').map((seg,i)=><path key={i} d={(i?'M':'')+seg}/>)}
    </svg>
  );
}

/* ---------------- navigation ---------------- */
const NAV = [
  {label:null, items:[
    {id:'dashboard', label:'Dashboard', icon:'dashboard'},
    {id:'reports', label:'Reports', icon:'reports'},
  ]},
  {label:'Pipeline', items:[
    {id:'crm', label:'Contacts', icon:'contacts'},
    {id:'customers', label:'Customers', icon:'heart', soft:true},
    {id:'trips', label:'Trips', icon:'compass', badge:'18'},
    {id:'bookings', label:'Bookings', icon:'wallet'},
    {id:'invoices', label:'Invoices', icon:'file', badge:'4'},
  ]},
  {label:'Operations', items:[
    {id:'vendors', label:'Vendors', icon:'building', soft:true},
    {id:'workspace', label:'Operations', icon:'clipboard'},
  ]},
  {label:'Engage', items:[
    {id:'communications', label:'Communications', icon:'message', soft:true},
    {id:'followups', label:'Follow-ups', icon:'calendar', soft:true},
  ]},
];

function Sidebar({active, onNav}){
  return (
    <aside className="side">
      <div className="side-brand">
        <span className="side-mark"><Icon n="compass" s={17}/></span>
        <span className="side-word">Trip<b>Craft</b></span>
      </div>
      <nav className="side-nav">
        {NAV.map((g,gi)=>(
          <div key={gi}>
            {g.label && <p className="nav-group-label">{g.label}</p>}
            {g.items.map(it=>(
              <div key={it.id}
                className={'nav-item'+(active===it.id?' active':'')}
                onClick={()=>onNav(it.soft?active:it.id)}
                style={it.soft?{opacity:.62}:null}
                title={it.soft?'Demo focuses on 6 core screens':''}>
                <Icon n={it.icon}/>
                {it.label}
                {it.badge && <span className="nv-badge">{it.badge}</span>}
              </div>
            ))}
          </div>
        ))}
      </nav>
      <div className="side-foot">
        <span className="ava">AS</span>
        <div style={{minWidth:0}}>
          <div className="nm">Ananya Sharma</div>
          <div className="ag">Wander Atelier</div>
        </div>
      </div>
    </aside>
  );
}

function Topbar({crumbs}){
  return (
    <header className="topbar">
      <div className="crumb">
        {crumbs.map((c,i)=>(
          <React.Fragment key={i}>
            {i>0 && <Icon n="chevR" s={13}/>}
            {i===crumbs.length-1 ? <b>{c}</b> : <span>{c}</span>}
          </React.Fragment>
        ))}
      </div>
      <div className="topbar-spacer"/>
      <div className="searchbox"><Icon n="search"/><span>Search trips, leads, vendors…</span><span className="kbd">⌘K</span></div>
      <div className="icon-btn"><Icon n="bell"/><span className="dot"/></div>
    </header>
  );
}

/* ---------------- charts (SVG) ---------------- */
// reveal helper: animates a CSS var --t 0→1 once mounted
function useReveal(){
  const ref = useRef(null);
  useEffect(()=>{ const el=ref.current; if(!el) return;
    requestAnimationFrame(()=>requestAnimationFrame(()=>el.classList.add('rv-on'))); },[]);
  return ref;
}

function Sparkline({data, w=120, h=34, color='var(--gold)', fill=true}){
  const max=Math.max(...data), min=Math.min(...data), rng=(max-min)||1;
  const pts=data.map((v,i)=>[ (i/(data.length-1))*w, h-4-((v-min)/rng)*(h-8) ]);
  const line=pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ');
  const area=line+` L ${w} ${h} L 0 ${h} Z`;
  const id='sg'+Math.random().toString(36).slice(2,7);
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{display:'block', overflow:'visible'}}>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={color} stopOpacity="0.22"/><stop offset="1" stopColor={color} stopOpacity="0"/>
      </linearGradient></defs>
      {fill && <path d={area} fill={`url(#${id})`}/>}
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="2.6" fill={color}/>
    </svg>
  );
}

function Bars({data, w=560, h=200, colors}){
  // data: [{label, values:[...]}] grouped or [{label, value}]
  const ref=useReveal();
  const max=Math.max(...data.flatMap(d=>d.values||[d.value]))*1.12;
  const pad=28, bw=(w-pad)/data.length;
  const grid=[0,.25,.5,.75,1];
  return (
    <svg ref={ref} width="100%" viewBox={`0 0 ${w} ${h}`} className="chart">
      {grid.map((g,i)=>{const y=10+(h-40)*(1-g); return(
        <line key={i} x1={pad} y1={y} x2={w} y2={y} stroke="var(--line-2)" strokeWidth="1"/>);})}
      {data.map((d,i)=>{
        const vals=d.values||[d.value]; const gw=bw*0.62; const each=gw/vals.length;
        return vals.map((v,j)=>{
          const bh=((h-40)*v/max); const x=pad+i*bw+bw*0.19+j*each;
          const c=(colors||['var(--gold)','var(--dv-slate)'])[j];
          return <rect key={i+'-'+j} className="bar" x={x} y={10+(h-40)-bh} width={each-2} height={bh}
            rx="3" fill={c} style={{'--bh':bh+'px', transformOrigin:'bottom'}}/>;
        });
      })}
      {data.map((d,i)=>(<text key={'l'+i} x={pad+i*bw+bw*0.4} y={h-12} fontSize="10" fill="var(--muted)" textAnchor="middle">{d.label}</text>))}
    </svg>
  );
}

function AreaLine({data, w=560, h=190, color='var(--gold)'}){
  const ref=useReveal();
  const max=Math.max(...data.map(d=>d.value))*1.15, min=0;
  const pad=8, iw=w-pad*2, ih=h-30;
  const pts=data.map((d,i)=>[ pad+(i/(data.length-1))*iw, 8+ih-((d.value-min)/(max-min))*ih ]);
  const line=pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ');
  const area=line+` L ${pad+iw} ${8+ih} L ${pad} ${8+ih} Z`;
  return (
    <svg ref={ref} width="100%" viewBox={`0 0 ${w} ${h}`} className="chart">
      <defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={color} stopOpacity="0.20"/><stop offset="1" stopColor={color} stopOpacity="0"/></linearGradient></defs>
      {[0,.5,1].map((g,i)=>{const y=8+ih*(1-g);return <line key={i} x1={pad} y1={y} x2={w-pad} y2={y} stroke="var(--line-2)"/>;})}
      <path className="area-fill" d={area} fill="url(#ag)"/>
      <path className="area-line" d={line} fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
      {pts.map((p,i)=><circle key={i} cx={p[0]} cy={p[1]} r="2.4" fill="var(--paper)" stroke={color} strokeWidth="2"/>)}
      {data.map((d,i)=>(<text key={'x'+i} x={pts[i][0]} y={h-8} fontSize="10" fill="var(--muted)" textAnchor="middle">{d.label}</text>))}
    </svg>
  );
}

function Donut({data, size=170}){
  const ref=useReveal();
  const total=data.reduce((s,d)=>s+d.value,0); const R=size/2, r=R-15, C=2*Math.PI*r;
  let acc=0;
  return (
    <div ref={ref} className="chart" style={{display:'flex',alignItems:'center',gap:18}}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{flex:'none'}}>
        <g transform={`rotate(-90 ${R} ${R})`}>
          {data.map((d,i)=>{ const frac=d.value/total; const dash=frac*C;
            const el=<circle key={i} className="donut-seg" cx={R} cy={R} r={r} fill="none" stroke={d.color}
              strokeWidth="13" strokeDasharray={`${dash} ${C-dash}`} strokeDashoffset={-acc*C} strokeLinecap="butt"
              style={{'--dash':dash, '--off':-acc*C}}/>; acc+=frac; return el; })}
        </g>
        <text x={R} y={R-2} textAnchor="middle" fontFamily="var(--serif)" fontSize="26" fill="var(--ink)">{total}</text>
        <text x={R} y={R+15} textAnchor="middle" fontSize="9" letterSpacing="1.5" fill="var(--muted)">TRIPS</text>
      </svg>
      <div style={{flex:1}}>
        {data.map((d,i)=>(
          <div key={i} className="flex ac" style={{justifyContent:'space-between', padding:'5px 0'}}>
            <span className="flex ac" style={{gap:8, fontSize:12.5, color:'var(--ink-2)'}}>
              <span style={{width:9,height:9,borderRadius:3,background:d.color}}/>{d.label}</span>
            <span className="mono" style={{fontSize:12, color:'var(--muted)'}}>{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

window.TC = { Icon, Sidebar, Topbar, Sparkline, Bars, AreaLine, Donut, useReveal };
})();
