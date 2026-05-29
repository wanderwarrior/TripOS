/* screen-reports.jsx */
(function(){
const { useState } = React;
const tcRep = window.TC;

function ReportsScreen(){
  const I=tcRep.Icon, { Bars, Donut, AreaLine } = tcRep;
  const monthly=[
    {label:'Dec',values:[18,24]},{label:'Jan',values:[24,30]},{label:'Feb',values:[21,26]},
    {label:'Mar',values:[33,38]},{label:'Apr',values:[38,44]},{label:'May',values:[47,52]},
  ];
  const funnel=[
    {label:'Leads', n:248, pct:100, c:'var(--dv-slate)'},
    {label:'Qualified', n:142, pct:57, c:'var(--dv-sage)'},
    {label:'Proposals sent', n:86, pct:35, c:'var(--gold)'},
    {label:'Negotiation', n:41, pct:17, c:'var(--dv-clay)'},
    {label:'Booked', n:31, pct:13, c:'var(--inkwash)'},
  ];
  const dest=[
    {label:'Maldives', value:9, color:'var(--dv-slate)'},
    {label:'Kerala', value:7, color:'var(--dv-sage)'},
    {label:'Rajasthan', value:5, color:'var(--gold)'},
    {label:'Europe', value:4, color:'var(--dv-clay)'},
    {label:'Other', value:6, color:'var(--dv-plum)'},
  ];
  const leaders=[
    {n:'Ananya Sharma', in:'AS', trips:18, rev:'₹47.2L', pct:100, c:'var(--dv-slate)'},
    {n:'Dev Varma', in:'DV', trips:13, rev:'₹34.8L', pct:74, c:'var(--dv-sage)'},
    {n:'Meera Joshi', in:'MJ', trips:9, rev:'₹21.4L', pct:45, c:'var(--gold)'},
  ];
  return (
    <div className="screen page">
      <div className="page-head">
        <div>
          <div className="eyebrow gold"><I n="reports" s={13}/> Insights</div>
          <h1 className="page-title">Reports</h1>
          <p className="page-sub">How the agency is performing — revenue, conversion, and where your travelers are going.</p>
        </div>
        <div className="flex gap">
          <div className="tabs"><button className="on">FY 2026</button><button>FY 2025</button></div>
          <button className="btn btn-ghost"><I n="download" s={15}/>Export</button>
        </div>
      </div>

      <div className="grid g-4" style={{marginBottom:20}}>
        {[
          ['Total revenue','₹2.41Cr','+19%',true,'wallet','navy'],
          ['Trips booked','31','+6',true,'compass','sage'],
          ['Conversion','12.5%','+1.8',true,'trend',''],
          ['Avg. trip value','₹7.8L','−3%',false,'dollar','clay'],
        ].map((s,i)=>(
          <div key={i} className="stat">
            <div className="stat-top"><span className={'stat-ic '+s[5]}><I n={s[4]} s={15}/></span>
              <span className={'delta '+(s[3]?'up':'down')}><I n={s[3]?'up':'down'} s={11}/>{s[2]}</span></div>
            <div className="stat-label">{s[0]}</div>
            <div className="stat-val tnum">{s[1]}</div>
          </div>
        ))}
      </div>

      <div className="col-main" style={{marginBottom:18}}>
        <div className="card">
          <div className="card-head">
            <div className="ttl"><I n="reports"/><h3>Revenue · booked vs collected</h3></div>
            <div className="flex ac" style={{gap:14}}>
              <span className="flex ac" style={{gap:6, fontSize:11.5, color:'var(--muted)'}}><span style={{width:9,height:9,borderRadius:3,background:'var(--gold)'}}/>Collected</span>
              <span className="flex ac" style={{gap:6, fontSize:11.5, color:'var(--muted)'}}><span style={{width:9,height:9,borderRadius:3,background:'var(--dv-slate)'}}/>Booked</span>
            </div>
          </div>
          <div className="card-pad"><Bars data={monthly} h={210} colors={['var(--gold)','var(--dv-slate)']}/></div>
        </div>
        <div className="card">
          <div className="card-head"><div className="ttl"><I n="globe"/><h3>Destinations</h3></div></div>
          <div className="card-pad"><Donut data={dest} size={150}/></div>
        </div>
      </div>

      <div className="col-main">
        <div className="card">
          <div className="card-head"><div className="ttl"><I n="filter"/><h3>Conversion funnel</h3></div><span className="t-mut">Last 90 days</span></div>
          <div className="card-pad">
            {funnel.map((f,i)=>(
              <div key={i} style={{marginBottom:i<funnel.length-1?16:0}}>
                <div className="flex jb ac" style={{marginBottom:7}}>
                  <span className="flex ac" style={{gap:8, fontSize:13, color:'var(--ink-2)'}}><span style={{width:9,height:9,borderRadius:3,background:f.c}}/>{f.label}</span>
                  <span className="mono" style={{fontSize:12.5}}><b className="t-strong tnum">{f.n}</b> <span className="t-mut">· {f.pct}%</span></span>
                </div>
                <div className="meter" style={{height:8}}><i style={{width:f.pct+'%', background:f.c}}/></div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-head"><div className="ttl"><I n="star"/><h3>Sales leaderboard</h3></div></div>
          <div className="card-pad">
            {leaders.map((l,i)=>(
              <div key={i} style={{marginBottom:i<leaders.length-1?16:0}}>
                <div className="flex ac gap" style={{marginBottom:8}}>
                  <span className="ava-sm" style={{background:l.c+'22',borderColor:l.c+'55',color:l.c}}>{l.in}</span>
                  <div style={{flex:1}}><div className="t-strong" style={{fontSize:13}}>{l.n}</div><div className="t-mut" style={{fontSize:11}}>{l.trips} trips booked</div></div>
                  <span className="mono t-strong tnum" style={{fontSize:13.5}}>{l.rev}</span>
                </div>
                <div className="meter"><i style={{width:l.pct+'%', background:l.c}}/></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
window.ReportsScreen = ReportsScreen;
})();
