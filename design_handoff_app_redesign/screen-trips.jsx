/* screen-trips.jsx */
(function(){
const { useState } = React;
const tcTrips = window.TC;

function TripsScreen({onOpen}){
  const I = tcTrips.Icon;
  const [filter,setFilter]=useState('all');
  const trips=[
    {dest:'Maldives · Overwater Villa', who:'Mehta family', lead:'MF', cat:'bed', status:['b-ok','Confirmed'], dates:'12–18 Jun', d:6, pax:4, val:'₹8,40,000', prog:85, owner:'AS'},
    {dest:'Switzerland Honeymoon', who:'Rohan Kapoor', lead:'RK', cat:'plane', status:['b-warn','Proposal'], dates:'02–11 Jul', d:9, pax:2, val:'₹6,20,000', prog:40, owner:'AS'},
    {dest:'Kerala Backwaters Retreat', who:'Priya Nair', lead:'PN', cat:'route', status:['b-ok','Confirmed'], dates:'20–25 Jun', d:5, pax:3, val:'₹3,40,000', prog:70, owner:'DV'},
    {dest:'Rajasthan Heritage Circuit', who:'Iyer & co.', lead:'IC', cat:'compass', status:['b-info','In progress'], dates:'28 May–04 Jun', d:8, pax:6, val:'₹9,75,000', prog:55, owner:'AS'},
    {dest:'Bali Wellness Escape', who:'Sana Sheikh', lead:'SS', cat:'globe', status:['b-warn','Proposal'], dates:'15–22 Aug', d:7, pax:2, val:'₹4,10,000', prog:30, owner:'DV'},
    {dest:'Dubai City Break', who:'Verma group', lead:'VG', cat:'ticket', status:['b-neutral','Draft'], dates:'09–13 Sep', d:4, pax:5, val:'₹3,90,000', prog:12, owner:'AS'},
    {dest:'Andaman Island Hopping', who:'Das family', lead:'DF', cat:'route', status:['b-ok','Confirmed'], dates:'01–07 Jul', d:6, pax:4, val:'₹5,60,000', prog:78, owner:'DV'},
    {dest:'Japan Cherry Blossom', who:'Reddy & partner', lead:'RP', cat:'plane', status:['b-bad','Hold'], dates:'24 Mar–03 Apr', d:10, pax:2, val:'₹11,20,000', prog:48, owner:'AS'},
  ];
  const filters=[['all','All trips'],['Confirmed','Confirmed'],['Proposal','Proposal'],['In progress','Live'],['Draft','Draft']];
  const shown=trips.filter(t=>filter==='all'||t.status[1]===filter);
  const colors={AS:'var(--dv-slate)',DV:'var(--dv-sage)'};
  return (
    <div className="screen page">
      <div className="page-head">
        <div>
          <div className="eyebrow gold"><I n="compass" s={13}/> Pipeline</div>
          <h1 className="page-title">Trips</h1>
          <p className="page-sub">Every itinerary in flight — from first draft to confirmed departure.</p>
        </div>
        <div className="flex gap">
          <button className="btn btn-ghost"><I n="download" s={15}/>Export</button>
          <button className="btn btn-gold"><I n="plus"/>New trip</button>
        </div>
      </div>

      <div className="grid g-4" style={{marginBottom:20}}>
        {[['Open trips','18','var(--dv-slate)'],['Confirmed','7','var(--ok)'],['Value in flight','₹56.8L','var(--gold-deep)'],['Departing · 30d','5','var(--dv-clay)']].map((s,i)=>(
          <div key={i} className="card card-pad" style={{padding:'13px 16px'}}>
            <div className="stat-label">{s[0]}</div>
            <div className="stat-val tnum" style={{fontSize:24, color:s[2]}}>{s[1]}</div>
          </div>
        ))}
      </div>

      <div className="flex ac jb wrap" style={{marginBottom:14, gap:10}}>
        <div className="flex gap wrap">
          {filters.map(f=>(
            <div key={f[0]} className={'chip'+(filter===f[0]?' on':'')} onClick={()=>setFilter(f[0])}>{f[1]}</div>
          ))}
        </div>
        <div className="flex gap">
          <div className="chip"><I n="filter" s={13}/>Owner</div>
          <div className="chip"><I n="calendar" s={13}/>This quarter</div>
        </div>
      </div>

      <div className="card" style={{overflow:'hidden'}}>
        <table className="tbl">
          <thead><tr>
            <th>Trip</th><th>Status</th><th>Dates</th><th className="r">Pax</th><th className="r">Value</th><th>Progress</th><th>Owner</th><th></th>
          </tr></thead>
          <tbody>
            {shown.map((t,i)=>(
              <tr key={i} onClick={onOpen}>
                <td>
                  <div className="cell-lead">
                    <span className="ava-sm">{t.lead}</span>
                    <div><div className="t-strong">{t.dest}</div><div className="t-mut">{t.who}</div></div>
                  </div>
                </td>
                <td><span className={'badge '+t.status[0]}><span className="bdot"/>{t.status[1]}</span></td>
                <td><span className="t-strong" style={{fontWeight:500}}>{t.dates}</span><div className="t-mut">{t.d} days</div></td>
                <td className="r mono tnum">{t.pax}</td>
                <td className="r mono tnum t-strong">{t.val}</td>
                <td style={{minWidth:130}}>
                  <div className="flex ac gap"><div className="meter" style={{flex:1}}><i style={{width:t.prog+'%'}}/></div>
                  <span className="mono t-mut" style={{fontSize:11}}>{t.prog}%</span></div>
                </td>
                <td><span className="ava-sm" style={{background:colors[t.owner]+'22', borderColor:colors[t.owner]+'55', color:colors[t.owner]}}>{t.owner}</span></td>
                <td><span className="icon-btn" style={{width:28,height:28,border:0,background:'transparent'}} onClick={e=>e.stopPropagation()}><I n="chevR" s={15}/></span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
window.TripsScreen = TripsScreen;
})();
