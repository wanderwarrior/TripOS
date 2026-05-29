/* screen-workspace.jsx */
(function(){
const { useState } = React;
const tcWs = window.TC;
const Icon = window.TC.Icon;

function Stepper(){
  const I=tcWs.Icon;
  const steps=[['Brief',1],['Itinerary',1],['Quote',1],['Vendors',2],['Vouchers',0],['Travel',0]];
  // state: 1 done, 2 active, 0 pending
  return (
    <div className="flex ac" style={{gap:0, margin:'4px 0 24px', overflowX:'auto'}}>
      {steps.map((s,i)=>(
        <React.Fragment key={i}>
          <div className="flex ac" style={{gap:9, flex:'none'}}>
            <span style={{
              width:26,height:26,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',
              fontSize:11.5, fontWeight:600, fontFamily:'var(--mono)',
              background: s[1]===1?'var(--inkwash)': s[1]===2?'var(--gold)':'var(--paper)',
              color: s[1]===1?'var(--gold)': s[1]===2?'var(--inkwash)':'var(--faint)',
              border: s[1]===0?'1px solid var(--line)':'0', boxShadow: s[1]?'var(--sh-1)':'none'
            }}>{s[1]===1?<I n="check" s={14}/>:i+1}</span>
            <span style={{fontSize:12.5, fontWeight:s[1]===2?600:450, color:s[1]?'var(--ink)':'var(--muted)'}}>{s[0]}</span>
          </div>
          {i<steps.length-1 && <div style={{flex:1, minWidth:24, height:1.5, background: s[1]===1?'var(--gold-line)':'var(--line)', margin:'0 12px'}}/>}
        </React.Fragment>
      ))}
    </div>
  );
}

function WorkspaceScreen({onBack}){
  const I=tcWs.Icon;
  const [tab,setTab]=useState('itinerary');
  const days=[
    {d:'Day 1', date:'12 Jun', title:'Arrival · Malé → Resort seaplane', items:[['plane','Seaplane transfer','TMA · 35 min'],['bed','Check-in · Overwater Villa','The Nautilus Maldives']]},
    {d:'Day 2', date:'13 Jun', title:'Reef & lagoon', items:[['route','Guided snorkel safari','House reef · 09:00'],['ticket','Sunset dolphin cruise','Private dhoni · 17:30']]},
    {d:'Day 3', date:'14 Jun', title:'Wellness day', items:[['heart','Couples spa ritual','Solasta Spa · 11:00'],['bed','Private beach dinner','Lagoon sandbank · 19:30']]},
    {d:'Day 4', date:'15 Jun', title:'Ocean adventure', items:[['route','Manta point excursion','Boat · 08:00']]},
  ];
  const vendors=[
    {n:'The Nautilus Maldives', t:'Resort · 5 nights', s:['b-ok','Confirmed'], v:'₹5,80,000', vch:true, lead:'TN'},
    {n:'Trans Maldivian Airways', t:'Seaplane · return', s:['b-ok','Confirmed'], v:'₹1,10,000', vch:true, lead:'TM'},
    {n:'Solasta Spa', t:'Wellness · 2 sessions', s:['b-warn','Awaiting'], v:'₹68,000', vch:false, lead:'SS'},
    {n:'Ocean Pro Divers', t:'Excursions · 3', s:['b-info','Requested'], v:'₹82,000', vch:false, lead:'OP'},
  ];
  const checklist=[
    ['Trip brief captured', true],['Itinerary published', true],['Quote accepted by client', true],
    ['All vendors confirmed', false],['Vouchers generated & sent', false],['Pre-departure pack', false],
  ];
  return (
    <div className="screen page">
      <div className="flex ac gap" style={{marginBottom:14}}>
        <button className="btn btn-ghost btn-sm" onClick={onBack}><I n="chevR" s={14} style={{transform:'rotate(180deg)'}}/>Trips</button>
        <span className="t-mut mono" style={{fontSize:11.5}}>TRIP-2026-0418</span>
      </div>

      <div className="page-head" style={{marginBottom:18, alignItems:'flex-start'}}>
        <div>
          <div className="flex ac gap" style={{marginBottom:8}}>
            <span className="badge b-ok"><span className="bdot"/>Confirmed</span>
            <span className="badge b-neutral">Honeymoon</span>
          </div>
          <h1 className="page-title">Maldives · Overwater Villa</h1>
          <div className="flex ac wrap" style={{gap:18, marginTop:12}}>
            {[['calendar','12–18 Jun 2026'],['users','4 travelers'],['pin','Malé, Maldives'],['wallet','₹8,40,000']].map((f,i)=>(
              <span key={i} className="flex ac" style={{gap:7, fontSize:13, color:'var(--ink-2)'}}><I n={f[0]} s={15} style={{color:'var(--gold-deep)'}}/>{f[1]}</span>
            ))}
          </div>
        </div>
        <div className="flex gap">
          <button className="btn btn-ghost"><I n="send" s={15}/>Share</button>
          <button className="btn btn-gold"><I n="ticket" s={15}/>Generate vouchers</button>
        </div>
      </div>

      <Stepper/>

      <div className="flex ac jb" style={{marginBottom:16}}>
        <div className="tabs">
          {[['itinerary','route','Itinerary'],['operations','clipboard','Operations'],['vendors','building','Vendors']].map(t=>(
            <button key={t[0]} className={tab===t[0]?'on':''} onClick={()=>setTab(t[0])}><I n={t[1]} s={14}/>{t[2]}</button>
          ))}
        </div>
        <span className="t-mut" style={{fontSize:12}}>Updated 2h ago by Ananya</span>
      </div>

      {tab==='itinerary' && (
        <div className="col-main">
          <div className="card card-pad">
            {days.map((day,i)=>(
              <div key={i} className="flex" style={{gap:16, paddingBottom:i<days.length-1?20:0}}>
                <div style={{flex:'none', width:54, textAlign:'right'}}>
                  <div className="serif" style={{fontSize:17, color:'var(--ink)'}}>{day.d.split(' ')[1]}</div>
                  <div className="t-mut" style={{fontSize:11}}>{day.date}</div>
                </div>
                <div style={{flex:'none', display:'flex', flexDirection:'column', alignItems:'center'}}>
                  <span style={{width:11,height:11,borderRadius:'50%',background:'var(--gold)',border:'2px solid var(--paper)',boxShadow:'0 0 0 1.5px var(--gold-line)'}}/>
                  {i<days.length-1 && <span style={{flex:1, width:2, background:'var(--line)', marginTop:4}}/>}
                </div>
                <div style={{flex:1, paddingBottom:8}}>
                  <h3 style={{fontSize:14}}>{day.title}</h3>
                  <div style={{marginTop:9, display:'flex', flexDirection:'column', gap:8}}>
                    {day.items.map((it,j)=>(
                      <div key={j} className="flex ac gap" style={{padding:'9px 11px', background:'var(--paper-2)', border:'1px solid var(--line)', borderRadius:9}}>
                        <span className="row-ic" style={{width:28,height:28}}><I n={it[0]} s={13}/></span>
                        <div style={{flex:1}}><div style={{fontSize:12.5,fontWeight:500,color:'var(--ink)'}}>{it[1]}</div><div className="t-mut" style={{fontSize:11}}>{it[2]}</div></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="card card-pad">
            <div className="eyebrow" style={{marginBottom:12}}>Trip summary</div>
            {[['Destination','Maldives'],['Duration','6 days · 5 nights'],['Lead guest','Mr. Mehta'],['Travelers','2 adults · 2 children'],['Quote value','₹8,40,000'],['Margin','₹1,12,000 · 13%']].map((r,i)=>(
              <div key={i} className="flex jb" style={{padding:'8px 0', borderBottom:i<5?'1px solid var(--line-2)':'0'}}>
                <span className="t-mut" style={{fontSize:12}}>{r[0]}</span><span className="t-strong" style={{fontSize:12.5}}>{r[1]}</span>
              </div>
            ))}
            <button className="btn btn-ghost btn-sm" style={{width:'100%', marginTop:14, justifyContent:'center'}}><I n="file" s={14}/>View proposal</button>
          </div>
        </div>
      )}

      {tab==='operations' && (
        <div className="col-main">
          <div className="card">
            <div className="card-head"><div className="ttl"><Icon n="clipboard"/><h3>Operations checklist</h3></div><span className="badge b-warn"><span className="bdot"/>3 of 6</span></div>
            <div className="card-pad" style={{paddingTop:6, paddingBottom:8}}>
              {checklist.map((c,i)=>(
                <div className="row" key={i} style={{alignItems:'center'}}>
                  <span style={{width:20,height:20,borderRadius:6,flex:'none',display:'flex',alignItems:'center',justifyContent:'center',
                    background:c[1]?'var(--ok)':'var(--paper)', border:c[1]?'0':'1.5px solid var(--line)', color:'#fff'}}>{c[1]&&<I n="check" s={12}/>}</span>
                  <div className="row-main"><div className="row-t" style={{color:c[1]?'var(--muted)':'var(--ink)', textDecoration:c[1]?'line-through':'none'}}>{c[0]}</div></div>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-head"><div className="ttl"><Icon n="flag"/><h3>Needs attention</h3></div></div>
            <div className="card-pad" style={{paddingTop:6, paddingBottom:8}}>
              {[['bad','Solasta Spa not confirmed','Departure in 14 days'],['warn','2 vouchers not generated','Resort & seaplane ready'],['info','Balance payment due','₹2,40,000 · 05 Jun']].map((a,i)=>(
                <div className="row" key={i}>
                  <span className={'badge b-'+a[0]} style={{height:8,width:8,padding:0,borderRadius:'50%',marginTop:5}}/>
                  <div className="row-main"><div className="row-t">{a[1]}</div><div className="row-meta">{a[2]}</div></div>
                  <span className="chip btn-sm" style={{height:26}}>Resolve</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab==='vendors' && (
        <div className="grid g-2">
          {vendors.map((v,i)=>(
            <div key={i} className="card card-pad" style={{display:'flex', flexDirection:'column', gap:13}}>
              <div className="flex ac jb">
                <div className="cell-lead">
                  <span className="ava-sm">{v.lead}</span>
                  <div><div className="t-strong">{v.n}</div><div className="t-mut">{v.t}</div></div>
                </div>
                <span className={'badge '+v.s[0]}><span className="bdot"/>{v.s[1]}</span>
              </div>
              <div className="hr"/>
              <div className="flex ac jb">
                <div><div className="t-mut" style={{fontSize:11}}>Cost</div><div className="mono t-strong" style={{fontSize:14}}>{v.v}</div></div>
                <div className="flex gap">
                  {v.vch
                    ? <span className="badge b-gold"><Icon n="ticket" s={12}/>Voucher sent</span>
                    : <button className="btn btn-ghost btn-sm"><Icon n="ticket" s={13}/>Generate</button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
window.WorkspaceScreen = WorkspaceScreen;
})();
