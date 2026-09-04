import{t as h,c as v,i as y,f as N,j as $,h as C}from"./format.3UTNi05R.js";function U(e,t){const n=()=>v(t?.in,NaN),r=x(e);let a;if(r.date){const s=Y(r.date,2);a=k(s.restDateString,s.year)}if(!a||isNaN(+a))return n();const l=+a;let o=0,c;if(r.time&&(o=z(r.time),isNaN(o)))return n();if(r.timezone){if(c=O(r.timezone),isNaN(c))return n()}else{const s=new Date(l+o),p=h(0,t?.in);return p.setFullYear(s.getUTCFullYear(),s.getUTCMonth(),s.getUTCDate()),p.setHours(s.getUTCHours(),s.getUTCMinutes(),s.getUTCSeconds(),s.getUTCMilliseconds()),p}return h(l+o+c,t?.in)}const f={dateTimeDelimiter:/[T ]/,timeZoneDelimiter:/[Z ]/i,timezone:/([Z+-].*)$/},I=/^-?(?:(\d{3})|(\d{2})(?:-?(\d{2}))?|W(\d{2})(?:-?(\d{1}))?|)$/,M=/^(\d{2}(?:[.,]\d*)?)(?::?(\d{2}(?:[.,]\d*)?))?(?::?(\d{2}(?:[.,]\d*)?))?$/,w=/^([+-])(\d{2})(?::?(\d{2}))?$/;function x(e){const t={},n=e.split(f.dateTimeDelimiter);let i;if(n.length>2)return t;if(/:/.test(n[0])?i=n[0]:(t.date=n[0],i=n[1],f.timeZoneDelimiter.test(t.date)&&(t.date=e.split(f.timeZoneDelimiter)[0],i=e.substr(t.date.length,e.length))),i){const r=f.timezone.exec(i);r?(t.time=i.replace(r[1],""),t.timezone=r[1]):t.time=i}return t}function Y(e,t){const n=new RegExp("^(?:(\\d{4}|[+-]\\d{"+(4+t)+"})|(\\d{2}|[+-]\\d{"+(2+t)+"})$)"),i=e.match(n);if(!i)return{year:NaN,restDateString:""};const r=i[1]?parseInt(i[1]):null,a=i[2]?parseInt(i[2]):null;return{year:a===null?r:a*100,restDateString:e.slice((i[1]||i[2]).length)}}function k(e,t){if(t===null)return new Date(NaN);const n=e.match(I);if(!n)return new Date(NaN);const i=!!n[4],r=d(n[1]),a=d(n[2])-1,l=d(n[3]),o=d(n[4]),c=d(n[5])-1;if(i)return H(t,o,c)?R(t,o,c):new Date(NaN);{const s=new Date(0);return!E(t,a,l)||!F(t,r)?new Date(NaN):(s.setUTCFullYear(t,a,Math.max(r,l)),s)}}function d(e){return e?parseInt(e):1}function z(e){const t=e.match(M);if(!t)return NaN;const n=m(t[1]),i=m(t[2]),r=m(t[3]);return Z(n,i,r)?n*y+i*N+r*1e3:NaN}function m(e){return e&&parseFloat(e.replace(",","."))||0}function O(e){if(e==="Z")return 0;const t=e.match(w);if(!t)return 0;const n=t[1]==="+"?-1:1,i=parseInt(t[2]),r=t[3]&&parseInt(t[3])||0;return W(i,r)?n*(i*y+r*N):NaN}function R(e,t,n){const i=new Date(0);i.setUTCFullYear(e,0,4);const r=i.getUTCDay()||7,a=(t-1)*7+n+1-r;return i.setUTCDate(i.getUTCDate()+a),i}const S=[31,null,31,30,31,30,31,31,30,31,30,31];function T(e){return e%400===0||e%4===0&&e%100!==0}function E(e,t,n){return t>=0&&t<=11&&n>=1&&n<=(S[t]||(T(e)?29:28))}function F(e,t){return t>=1&&t<=(T(e)?366:365)}function H(e,t,n){return t>=1&&t<=53&&n>=0&&n<=6}function Z(e,t,n){return e===24?t===0&&n===0:n>=0&&n<60&&t>=0&&t<60&&e>=0&&e<25}function W(e,t){return t>=0&&t<=59}const b={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},u=e=>e.replace(/[&<>"']/g,t=>b[t]),g=e=>`<p class="incidents-daily__day__no-incidents">${e}</p>`,j=e=>{try{const{protocol:t}=new URL(e);return t==="http:"||t==="https:"}catch{return!1}},D=e=>{const t=U(e.date),n=`${u(e.source.name)}: ${u(e.title)}`;return`
      <div class="incidents-daily__incident">
        <h6 class="incidents-daily__incident__title">
          ${j(e.url)?`<a href="${u(e.url)}">${n}</a>`:n}
        </h6>
        <div class="incidents-daily__incident__update__description">
          <div>${e.ongoing?`${u(e.status)} — `:""}${u(e.description)}</div>
        </div>
        ${$(t)?`<p class="incidents-daily__incident__update__timestamp">
          ${C(t,"MMMM d, yyyy")}
        </p>`:""}
      </div>
    `},_=(e,t)=>`
    <div class="incidents-daily__day">
      <h5 class="incidents-daily__day__title">${e}</h5>
      <div>${t}</div>
    </div>
  `,L=e=>{const t=e.filter(i=>i.ongoing),n=e.filter(i=>!i.ongoing);return _("Ongoing",t.length>0?t.map(D).join(""):g("No ongoing incidents."))+(n.length>0?_("Recently resolved",n.map(D).join("")):"")};class P extends HTMLElement{connectedCallback(){fetch("/api/feeds").then(t=>{if(t.status===404)return null;if(!t.ok)throw new Error(`/api/feeds returned ${t.status}`);return t.json()}).then(t=>{t!==null&&this.render(t&&t.length>0?L(t):g("All third-party components are operational."))}).catch(t=>{console.error(t),this.render(g("Third-party status is currently unavailable."))})}render(t){this.innerHTML=`
        <div class="incidents-daily">
          <div class="incidents-daily__title">Third-Party Components</div>
          <div>${t}</div>
        </div>
      `}}customElements.define("third-party-components",P);
