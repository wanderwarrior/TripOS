/* screen-dashboard.jsx */
(function(){
const { useState } = React;
const { Icon, Sparkline, AreaLine } = window.TC;

function StatTile({icon, tone, label, value, delta, up, spark, sparkColor}){
  return (
    <div className="stat">
      <div className="stat-top">
        <span className={'stat-ic '+(tone||'')}><Icon n={icon} s={15}/></span>
        {delta!=null && <span className={'delta '+(up?'up':'down')}><Icon n={up?'up':'down'} s={11}/>{delta}</span>}
      </div>
      <div className="stat-label">{label}</div>
      <div className="stat-val tnum">{value}</div>
      <div style={{marginTop:10}}><Sparkline data={spark} color={sparkColor||'var(--gold)'} w={150} h={30}/></div>
    </div>
  );
}

function DashboardScreen(){
  const [scope,setScope]=useState('mine');
  const [period,setPeriod]=useState('6M');
  const rev = {
    '6M':[{label:'Dec',value:18},{label:'Jan',value:24},{label:'Feb',value:21},{label:'Mar',value:33},{label:'Apr',value:38},{label:'May',value:47}],
    '12M':[{label:'Jun',value:12},{label:'Jul',value:15},{label:'Aug',value:22},{label:'Sep',value:19},{label:'Oct',value:28},{label:'Nov',value:24},{label:'Dec',value:18},{label:'Jan',value:24},{label:'Feb',value:21},{label:'Mar',value:33},{label:'Apr',value:38},{label:'May',value:47}],
  };
  const activity=[
    {ic:'check', t:<><b>Quote accepted</b> · Kerala Backwaters Retreat</>, m:'Ananya Sharma · ₹3.4L', time:'12m'},
    {ic:'ticket', t:<><b>Voucher sent</b> · The Leela Palace</>, m:'Bengaluru · TC-HOT-2A4B7C', time:'1h'},
    {ic:'wallet', t:<><b>Payment received</b> · ₹1,20,000</>, m:'Mehta family · Maldives', time:'3h'},
    {ic:'userplus', t:<><b>New lead</b> · Rohan Kapoor</>, m:'Honeymoon · Switzerland', time:'5h'},
    {ic:'message', t:<><b>WhatsApp reply</b> · Priya Nair</>, m:'“Can we add Coorg?”', time:'6h'},
    {ic:'compass', t:<><b>Trip confirmed</b> · Rajasthan Heritage</>, m:'8 days · 4 pax', time:'Yesterday'},
  ];
  const upnext=[
    {t:'Call Mehta family re: Maldives', m:'Overdue · 2 days', tone:'bad'},
    {t:'Send Switzerland proposal', m:'Today · 4:00 PM', tone:'warn'},
    {t:'Confirm Jaipur palace hotel', m:'Tomorrow', tone:'neutral'},
    {t:'Follow up — Coorg add-on', m:'Fri, 31 May', tone:'neutral'},
  ];
  const pipeline=[
    {label:'New', n:14, pct:100, c:'var(--dv-slate)'},
    {label:'Qualified', n:9, pct:64, c:'var(--dv-sage)'},
    {label:'Proposal', n:6, pct:43, c:'var(--gold)'},
    {label:'Negotiation', n:3, pct:21, c:'var(--dv-clay)'},
    {label:'Won', n:5, pct:36, c:'var(--inkwash)'},
  ];
  return (
    <div className="screen page">
      <div className="page-head">
        <div>
          <div className="eyebrow gold"><Icon n="spark" s={13}/> May 2026</div>
          <h1 className="page-title">Ananya’s pipeline.</h1>
          <p className="page-sub">Leads you own, follow-ups on your plate, and the revenue you’re closing this month.</p>
        </div>
        <div className="flex" style={{flexDirection:'column', alignItems:'flex-end', gap:11}}>
          <div className="tabs">
            <button className={scope==='mine'?'on':''} onClick={()=>setScope('mine')}><Icon n="contacts" s={14}/>You</button>
            <button className={scope==='agency'?'on':''} onClick={()=>setScope('agency')}><Icon n="users" s={14}/>Agency</button>
          </div>
          <div className="flex gap">
            <button className="btn btn-ghost"><Icon n="plus"/>New trip</button>
            <button className="btn btn-gold"><Icon n="userplus"/>New contact</button>
          </div>
        </div>
      </div>

      <div className="grid g-5" style={{marginBottom:22}}>
        <StatTile icon="contacts" tone="" label="Active leads" value="32" delta="+8%" up spark={[18,22,19,26,24,30,32]}/>
        <StatTile icon="trend" tone="sage" label="Won this month" value="5" delta="+2" up spark={[1,2,2,3,3,4,5]} sparkColor="var(--dv-sage)"/>
        <StatTile icon="wallet" tone="navy" label="Collected" value="₹47.2L" delta="+24%" up spark={[18,24,21,33,38,42,47]}/>
        <StatTile icon="clock" tone="clay" label="Overdue" value="3" spark={[6,5,5,4,4,3,3]} sparkColor="var(--dv-clay)"/>
        <StatTile icon="message" tone="" label="Replies · 7d" value="11" delta="+5" up spark={[3,5,4,7,6,9,11]}/>
      </div>

      <div className="col-main">
        <div className="flex" style={{flexDirection:'column', gap:18}}>
          <div className="card">
            <div className="card-head">
              <div className="ttl"><Icon n="wallet"/><h3>Revenue collected</h3></div>
              <div className="tabs">
                {['6M','12M'].map(p=><button key={p} className={period===p?'on':''} onClick={()=>setPeriod(p)}>{p}</button>)}
              </div>
            </div>
            <div className="card-pad" style={{paddingTop:8}}>
              <div className="flex ac gap" style={{marginBottom:6}}>
                <span className="stat-val tnum" style={{fontSize:32}}>₹47.2L</span>
                <span className="delta up" style={{marginBottom:6}}><Icon n="up" s={12}/>24% vs Apr</span>
              </div>
              <AreaLine data={rev[period]}/>
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <div className="ttl"><Icon n="layers"/><h3>Recent activity</h3></div>
              <span className="lnk sec-head" style={{margin:0}}>All leads</span>
            </div>
            <div className="card-pad" style={{paddingTop:4, paddingBottom:6}}>
              {activity.map((a,i)=>(
                <div className="row" key={i}>
                  <span className="row-ic"><Icon n={a.ic}/></span>
                  <div className="row-main"><div className="row-t">{a.t}</div><div className="row-meta">{a.m}</div></div>
                  <span className="row-time">{a.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex" style={{flexDirection:'column', gap:18}}>
          <div className="card">
            <div className="card-head"><div className="ttl"><Icon n="calendar"/><h3>Up next</h3></div><span className="badge b-bad"><span className="bdot"/>1 overdue</span></div>
            <div className="card-pad" style={{paddingTop:4, paddingBottom:6}}>
              {upnext.map((u,i)=>(
                <div className="row" key={i}>
                  <span className={'badge b-'+u.tone} style={{height:8,width:8,padding:0,borderRadius:'50%',marginTop:5}}/>
                  <div className="row-main"><div className="row-t">{u.t}</div><div className="row-meta">{u.m}</div></div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-head"><div className="ttl"><Icon n="route"/><h3>Pipeline</h3></div><span className="t-mut">37 open</span></div>
            <div className="card-pad">
              {pipeline.map((p,i)=>(
                <div key={i} style={{marginBottom:i<4?14:0}}>
                  <div className="flex jb ac" style={{marginBottom:6}}>
                    <span style={{fontSize:12.5,color:'var(--ink-2)'}}>{p.label}</span>
                    <span className="mono" style={{fontSize:11.5,color:'var(--muted)'}}>{p.n}</span>
                  </div>
                  <div className="meter"><i style={{width:p.pct+'%', background:p.c}}/></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
window.DashboardScreen = DashboardScreen;
})();
