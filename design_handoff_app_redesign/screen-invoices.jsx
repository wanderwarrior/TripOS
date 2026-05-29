/* screen-invoices.jsx */
(function(){
const { useState } = React;
const tcInv = window.TC;

function InvoicesScreen(){
  const I=tcInv.Icon;
  const [tab,setTab]=useState('invoices');
  const invoices=[
    {no:'INV-2026-0142', who:'Mehta family', trip:'Maldives', amt:'₹8,40,000', paid:71, due:'05 Jun', s:['b-warn','Partial']},
    {no:'INV-2026-0141', who:'Priya Nair', trip:'Kerala Backwaters', amt:'₹3,40,000', paid:100, due:'—', s:['b-ok','Paid']},
    {no:'INV-2026-0140', who:'Iyer & co.', trip:'Rajasthan Heritage', amt:'₹9,75,000', paid:50, due:'31 May', s:['b-warn','Partial']},
    {no:'INV-2026-0139', who:'Reddy & partner', trip:'Japan Blossom', amt:'₹11,20,000', paid:0, due:'28 May', s:['b-bad','Overdue']},
    {no:'INV-2026-0138', who:'Das family', trip:'Andaman', amt:'₹5,60,000', paid:100, due:'—', s:['b-ok','Paid']},
    {no:'INV-2026-0137', who:'Verma group', trip:'Dubai City Break', amt:'₹3,90,000', paid:0, due:'Draft', s:['b-neutral','Draft']},
  ];
  return (
    <div className="screen page">
      <div className="page-head">
        <div>
          <div className="eyebrow gold"><I n="file" s={13}/> Pipeline · Finance</div>
          <h1 className="page-title">Invoices &amp; bookings</h1>
          <p className="page-sub">Cash position across every confirmed trip — what’s collected, what’s outstanding, what’s overdue.</p>
        </div>
        <div className="flex gap">
          <button className="btn btn-ghost"><I n="download" s={15}/>Statement</button>
          <button className="btn btn-gold"><I n="plus"/>New invoice</button>
        </div>
      </div>

      <div className="grid g-4" style={{marginBottom:22}}>
        {[
          ['Collected · FY26','₹47.2L','sage','wallet','+24%',true],
          ['Outstanding','₹18.6L','','clock','3 invoices',null],
          ['Overdue','₹11.2L','clay','flag','1 invoice',null],
          ['Avg. days to pay','9.4','navy','calendar','1.2 days faster',null],
        ].map((s,i)=>(
          <div key={i} className="stat">
            <div className="stat-top"><span className={'stat-ic '+s[2]}><I n={s[3]} s={15}/></span>
              {typeof s[5]==='boolean' && <span className={'delta '+(s[5]?'up':'down')}><I n={s[5]?'up':'down'} s={11}/>{s[4]}</span>}</div>
            <div className="stat-label">{s[0]}</div>
            <div className="stat-val tnum">{s[1]}</div>
            {typeof s[5]!=='boolean' && <div className="stat-foot">{s[4]}</div>}
          </div>
        ))}
      </div>

      <div className="flex ac jb wrap" style={{marginBottom:14, gap:10}}>
        <div className="tabs">
          {[['invoices','file','Invoices'],['bookings','wallet','Bookings']].map(t=>(
            <button key={t[0]} className={tab===t[0]?'on':''} onClick={()=>setTab(t[0])}><I n={t[1]} s={14}/>{t[2]}</button>
          ))}
        </div>
        <div className="flex gap">
          <div className="chip on">All</div><div className="chip">Overdue</div><div className="chip">Partial</div><div className="chip">Paid</div>
        </div>
      </div>

      <div className="card" style={{overflow:'hidden'}}>
        <table className="tbl">
          <thead><tr>
            <th>Invoice</th><th>Client · Trip</th><th className="r">Amount</th><th>Collection</th><th>Due</th><th>Status</th><th></th>
          </tr></thead>
          <tbody>
            {invoices.map((v,i)=>(
              <tr key={i}>
                <td className="mono t-strong" style={{fontSize:12}}>{v.no}</td>
                <td><div className="t-strong">{v.who}</div><div className="t-mut">{v.trip}</div></td>
                <td className="r mono tnum t-strong">{v.amt}</td>
                <td style={{minWidth:140}}>
                  <div className="flex ac gap">
                    <div className={'meter '+(v.paid===100?'sage':'')} style={{flex:1}}><i style={{width:v.paid+'%'}}/></div>
                    <span className="mono t-mut" style={{fontSize:11}}>{v.paid}%</span>
                  </div>
                </td>
                <td className={v.s[1]==='Overdue'?'':'t-mut'} style={{fontSize:12.5, color:v.s[1]==='Overdue'?'var(--bad)':'', fontWeight:v.s[1]==='Overdue'?600:400}}>{v.due}</td>
                <td><span className={'badge '+v.s[0]}><span className="bdot"/>{v.s[1]}</span></td>
                <td><span className="icon-btn" style={{width:28,height:28,border:0,background:'transparent'}}><I n="more" s={15}/></span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
window.InvoicesScreen = InvoicesScreen;
})();
