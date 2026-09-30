import{s as e}from"./time.Btvzqzq7.js";import{i as t,n,t as r}from"./sectionAnchor.BDL_fSaE.js";var i={"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`},a=e=>e.replace(/[&<>"']/g,e=>i[e]),o=e=>`<p class="incidents-daily__day__no-incidents">${e}</p>`,s=e=>{try{let{protocol:t}=new URL(e);return t===`http:`||t===`https:`}catch{return!1}},c=t=>{let n=e(new Date(t.date)),r=`${a(t.source.name)}: ${a(t.title)}`;return`
      <div class="incidents-daily__incident">
        <h4 class="incidents-daily__incident__title">
          ${s(t.url)?`<a href="${a(t.url)}">${r}</a>`:r}
        </h4>
        <div class="incidents-daily__incident__update__description">
          <div>${t.ongoing?`${a(t.status)} — `:``}${a(t.description)}</div>
        </div>
        ${n?`<p class="incidents-daily__incident__update__timestamp">${n}</p>`:``}
      </div>
    `},l=(e,t)=>`
    <div class="incidents-daily__day">
      <h3 class="incidents-daily__day__title">${e}</h3>
      <div>${t}</div>
    </div>
  `,u=e=>{try{return decodeURIComponent(e)}catch{return e}},d=e=>(e.headers.get(`X-Unreached-Suppliers`)||``).split(`,`).filter(Boolean).map(u),f=e=>e.length>0?o(`No status available from: ${e.map(a).join(`, `)}.`):``,p=e=>{let t=e.filter(e=>e.ongoing),n=e.filter(e=>!e.ongoing);return l(`Ongoing`,t.length>0?t.map(c).join(``):o(`No ongoing incidents.`))+(n.length>0?l(`Recently resolved`,n.map(c).join(``)):``)},m=class extends HTMLElement{connectedCallback(){fetch(`/api/feeds`).then(e=>{if(e.status===404)return null;if(!e.ok)throw Error(`/api/feeds returned ${e.status}`);return e.json().then(t=>({feeds:t,unreached:d(e)}))}).then(e=>{if(e===null){this.render(t(`Third-party status is`,this.id));return}let{feeds:n,unreached:r}=e;if(n&&n.length>0){this.render(p(n)+f(r));return}this.render(r.length>0?o(`No incidents reported by the suppliers that replied.`)+f(r):o(`All third-party components are operational.`))}).catch(e=>{console.error(e),this.render(o(`Third-party status is currently unavailable.`))})}render(e){this.innerHTML=`
        <div class="incidents-daily">
          <h2 class="incidents-daily__title section-title">${n(this.id,`Third-Party Components`)}</h2>
          <div>${e}</div>
        </div>
      `,r()}};customElements.define(`third-party-components`,m);