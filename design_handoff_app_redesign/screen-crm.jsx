/* screen-crm.jsx */
(function(){
const { useState } = React;
const tcCrm = window.TC;

function CrmScreen(){
  const I=tcCrm.Icon;
  const [view,setView]=useState('table');
  const contacts=[
    {n:'Rohan Kapoor', in:'RK', src:'Referral', dest:'Switzerland honeymoon', val:'₹6.2L', stage:'Proposal', s:'b-warn', owner:'AS', last:'2h'},
    {n:'Priya Nair', in:'PN', src:'Instagram', dest:'Kerala backwaters', val:'₹3.4L', stage:'Won', s:'b-ok', owner:'DV', last:'1d'},
    {n:'Sana Sheikh', in:'SS', src:'Website', dest:'Bali wellness', val:'₹4.1L', stage:'Qualified', s:'b-info', owner:'DV', last:'4h'},
    {n:'Verma group', in:'VG', src:'WhatsApp', dest:'Dubai city break', val:'₹3.9L', stage:'New', s:'b-neutral', owner:'AS', last:'30m'},
    {n:'Mehta family', in:'MF', src:'Repeat', dest:'Maldives villa', val:'₹8.4L', stage:'Won', s:'b-ok', owner:'AS', last:'12m'},
    {n:'Reddy & partner', in:'RP', src:'Referral', dest:'Japan blossom', val:'₹11.2L', stage:'Proposal', s:'b-warn', owner:'AS', last:'3d'},
    {n:'Das family', in:'DF', src:'Website', dest:'Andaman hopping', val:'₹5.6L', stage:'Qualified', s:'b-info', owner:'DV', last:'5h'},
  ];
  const owners={AS:'var(--dv-slate)',DV:'var(--dv-sage)'};
  const cols=[['New','b-neutral'],['Qualified','b-info'],['Proposal','b-warn'],['Won','b-ok']];
  return (
    <div className="screen page">
      <div className="page-head">
        <div>
          <div className="eyebrow gold"><I n="contacts" s={13}/> Pipeline</div>
          <h1 className="page-title">Contacts</h1>
          <p className="page-sub">Every lead and enquiry, from first touch to booked traveler.</p>
        </div>
        <div className="flex" style={{flexDirection:'column', alignItems:'flex-end', gap:11}}>
          <div className="tabs">
            <button className={view==='table'?'on':''} onClick={()=>setView('table')}><I n="reports" s={14}/>Table</button>
            <button className={view==='kanban'?'on':''} onClick={()=>setView('kanban')}><I n="layers" s={14}/>Kanban</button>
          </div>
          <button className="btn btn-gold"><I n="userplus"/>New contact</button>
        </div>
      </div>

      <div className="grid g-4" style={{marginBottom:22}}>
        {[['Active leads','32'],['Qualified','9'],['Avg. deal','₹5.4L'],['Conversion','38%']].map((s,i)=>(
          <div key={i} className="card card-pad" style={{padding:'13px 16px'}}>
            <div className="stat-label">{s[0]}</div>
            <div className="stat-val tnum" style={{fontSize:24}}>{s[1]}</div>
          </div>
        ))}
      </div>

      {view==='table' ? (
        <div className="card" style={{overflow:'hidden'}}>
          <table className="tbl">
            <thead><tr><th>Contact</th><th>Source</th><th>Interest</th><th className="r">Est. value</th><th>Stage</th><th>Owner</th><th>Last</th></tr></thead>
            <tbody>
              {contacts.map((c,i)=>(
                <tr key={i}>
                  <td><div className="cell-lead"><span className="ava-sm">{c.in}</span><span className="t-strong">{c.n}</span></div></td>
                  <td className="t-mut">{c.src}</td>
                  <td>{c.dest}</td>
                  <td className="r mono tnum t-strong">{c.val}</td>
                  <td><span className={'badge '+c.s}><span className="bdot"/>{c.stage}</span></td>
                  <td><span className="ava-sm" style={{width:26,height:26,fontSize:10,background:owners[c.owner]+'22',borderColor:owners[c.owner]+'55',color:owners[c.owner]}}>{c.owner}</span></td>
                  <td className="row-time">{c.last}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="kanban">
          {cols.map((col,ci)=>{
            const items=contacts.filter(c=>c.stage===col[0]);
            return (
              <div key={ci} className="kcol">
                <div className="kcol-head"><span className={'badge '+col[1]} style={{height:8,width:8,padding:0,borderRadius:'50%'}}/>{col[0]}<span className="cnt">{items.length}</span></div>
                {items.map((c,i)=>(
                  <div key={i} className="kcard">
                    <div className="flex ac gap" style={{marginBottom:9}}>
                      <span className="ava-sm" style={{width:26,height:26,fontSize:10}}>{c.in}</span>
                      <span className="t-strong" style={{fontSize:12.5}}>{c.n}</span>
                    </div>
                    <div className="t-mut" style={{fontSize:11.5, marginBottom:10}}>{c.dest}</div>
                    <div className="flex ac jb">
                      <span className="mono t-strong" style={{fontSize:12.5, color:'var(--gold-deep)'}}>{c.val}</span>
                      <span className="flex ac" style={{gap:5}}>
                        <span className="badge b-neutral" style={{fontSize:10, height:18}}>{c.src}</span>
                        <span className="ava-sm" style={{width:22,height:22,fontSize:9,background:owners[c.owner]+'22',borderColor:owners[c.owner]+'55',color:owners[c.owner]}}>{c.owner}</span>
                      </span>
                    </div>
                  </div>
                ))}
                <div className="flex ac gap" style={{padding:'8px 4px 2px', fontSize:12, color:'var(--muted)', cursor:'pointer'}}><I n="plus" s={13}/>Add</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
window.CrmScreen = CrmScreen;
})();
