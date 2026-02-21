(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[157],{4962:function(e,t,r){Promise.resolve().then(r.bind(r,71498))},71498:function(e,t,r){"use strict";r.r(t),r.d(t,{default:function(){return p}});var a=r(37821),s=r(58078),o=r(46179),i=r(96871),n=r.n(i),l=r(97485);let c=s.forwardRef(function({title:e,titleId:t,...r},a){return s.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"currentColor","aria-hidden":"true","data-slot":"icon",ref:a,"aria-labelledby":t},r),e?s.createElement("title",{id:t},e):null,s.createElement("path",{d:"m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z"}))}),d=s.forwardRef(function({title:e,titleId:t,...r},a){return s.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:a,"aria-labelledby":t},r),e?s.createElement("title",{id:t},e):null,s.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"}))});var u=r(78348);let m=[{amount:10,label:"$10"},{amount:25,label:"$25"},{amount:50,label:"$50"},{amount:100,label:"$100"}];function p(){let e=(0,o.useParams)(),t=(null==e?void 0:e.slug)||"",[r,i]=(0,s.useState)(25),[p,f]=(0,s.useState)(""),[h,g]=(0,s.useState)(""),[b,x]=(0,s.useState)(""),[y,v]=(0,s.useState)(!1),[w,j]=(0,s.useState)(!1),[N,k]=(0,s.useState)({name:"Community Member",story:"This person is seeking support from the community to improve their situation and work towards stability.",summary:"Help provide essential support for someone in our community.",goalAmount:2500,amountRaised:0,donationCount:0}),[E,C]=(0,s.useState)(!1);(0,s.useEffect)(()=>{O(),k(e=>({...e,name:t.replace(/-/g," ").replace(/\b\w/g,e=>e.toUpperCase())}))},[t]);let O=async()=>{try{let e=await fetch("".concat("https://api.care2connects.org","/api/qr/status")),t=await e.json();t.success&&C(t.data.configured)}catch(e){console.error("Error checking Stripe status:",e)}},S=e=>{i(e),f(""),j(!1)},$=e=>{f(e);let t=parseFloat(e);!isNaN(t)&&t>0?i(t):i(null)},_=async e=>{if(e.preventDefault(),!r||r<.5){l.default.error("Minimum donation amount is $0.50");return}if(!E){l.default.error("Payment system is not configured. Please try again later.");return}v(!0);try{let e=await fetch("".concat("https://api.care2connects.org","/api/qr/checkout"),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({publicSlug:t,amount:r,donorEmail:h||void 0})}),a=await e.json();a.success?window.location.href=a.data.checkoutUrl:l.default.error(a.error||"Failed to create checkout session")}catch(e){console.error("Donation error:",e),l.default.error("Failed to process donation. Please try again.")}finally{v(!1)}},D=window.location.href,A=N.goalAmount?Math.min((N.amountRaised||0)/N.goalAmount*100,100):0;return(0,a.jsxs)("div",{className:"min-h-screen bg-gradient-to-b from-blue-50 to-white",children:[(0,a.jsx)("header",{className:"bg-white border-b shadow-sm",children:(0,a.jsx)("div",{className:"max-w-4xl mx-auto px-4 py-6",children:(0,a.jsxs)(n(),{href:"/",className:"inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors",children:[(0,a.jsx)("svg",{className:"w-5 h-5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:(0,a.jsx)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M10 19l-7-7m0 0l7-7m-7 7h18"})}),(0,a.jsx)("span",{children:"Back to CareConnect"})]})})}),(0,a.jsx)("div",{className:"max-w-4xl mx-auto px-4 py-8",children:(0,a.jsxs)("div",{className:"grid lg:grid-cols-2 gap-8",children:[(0,a.jsxs)("div",{className:"bg-white rounded-lg shadow-lg p-6",children:[(0,a.jsxs)("div",{className:"mb-6",children:[(0,a.jsxs)("h1",{className:"text-2xl font-bold text-gray-900 mb-2",children:["Support ",N.name]}),N.summary&&(0,a.jsx)("p",{className:"text-lg text-gray-600 mb-4",children:N.summary}),N.goalAmount&&(0,a.jsxs)("div",{className:"mb-6",children:[(0,a.jsxs)("div",{className:"flex justify-between text-sm text-gray-600 mb-1",children:[(0,a.jsxs)("span",{children:["$",(N.amountRaised||0).toLocaleString()," raised"]}),(0,a.jsxs)("span",{children:["$",N.goalAmount.toLocaleString()," goal"]})]}),(0,a.jsx)("div",{className:"w-full bg-gray-200 rounded-full h-3",children:(0,a.jsx)("div",{className:"bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500",style:{width:"".concat(A,"%")}})}),(0,a.jsxs)("div",{className:"flex justify-between text-sm text-gray-500 mt-1",children:[(0,a.jsxs)("span",{children:[N.donationCount||0," supporters"]}),(0,a.jsxs)("span",{children:[Math.round(A),"% of goal"]})]})]}),(0,a.jsx)("div",{className:"prose prose-sm max-w-none",children:(0,a.jsx)("p",{className:"text-gray-700 leading-relaxed",children:N.story})})]}),(0,a.jsx)("div",{className:"border-t pt-4",children:(0,a.jsxs)("div",{className:"flex items-center justify-between",children:[(0,a.jsx)("span",{className:"text-sm font-medium text-gray-700",children:"Share this campaign:"}),(0,a.jsxs)("button",{onClick:()=>{navigator.clipboard.writeText(D),l.default.success("Link copied to clipboard!")},className:"flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-700 transition-colors",children:[(0,a.jsx)(d,{className:"w-4 h-4"}),"Copy Link"]})]})})]}),(0,a.jsxs)("div",{className:"bg-white rounded-lg shadow-lg p-6",children:[(0,a.jsxs)("div",{className:"text-center mb-6",children:[(0,a.jsx)(c,{className:"w-12 h-12 text-red-500 mx-auto mb-3"}),(0,a.jsx)("h2",{className:"text-xl font-semibold text-gray-900 mb-2",children:"Make a Donation"}),(0,a.jsx)("p",{className:"text-gray-600",children:"Your support makes a real difference"})]}),!E&&(0,a.jsx)("div",{className:"mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg",children:(0,a.jsxs)("p",{className:"text-yellow-800 text-sm",children:[(0,a.jsx)("strong",{children:"Note:"})," The payment system is currently being set up. Please check back soon to make a donation."]})}),(0,a.jsxs)("form",{onSubmit:_,className:"space-y-6",children:[(0,a.jsxs)("div",{children:[(0,a.jsx)("label",{className:"block text-sm font-medium text-gray-700 mb-3",children:"Choose Amount (USD)"}),(0,a.jsx)("div",{className:"grid grid-cols-2 gap-3 mb-4",children:m.map(e=>{let{amount:t,label:s}=e;return(0,a.jsx)("button",{type:"button",onClick:()=>S(t),className:"p-3 rounded-lg border-2 font-semibold transition-all ".concat(r!==t||w?"bg-white text-gray-700 border-gray-300 hover:border-blue-400":"bg-blue-600 text-white border-blue-600"),children:s},t)})}),(0,a.jsxs)("div",{className:"space-y-2",children:[(0,a.jsx)("button",{type:"button",onClick:()=>j(!w),className:"text-blue-600 text-sm hover:text-blue-700 transition-colors",children:w?"Hide custom amount":"Enter custom amount"}),w&&(0,a.jsx)("input",{type:"number",value:p,onChange:e=>$(e.target.value),className:"w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all",placeholder:"Enter amount",min:"0.50",step:"0.01"})]})]}),(0,a.jsxs)("div",{className:"space-y-4",children:[(0,a.jsxs)("div",{children:[(0,a.jsx)("label",{className:"block text-sm font-medium text-gray-700 mb-1",children:"Email (Optional)"}),(0,a.jsx)("input",{type:"email",value:h,onChange:e=>g(e.target.value),className:"w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all",placeholder:"your@email.com"}),(0,a.jsx)("p",{className:"text-xs text-gray-500 mt-1",children:"For donation receipt (optional)"})]}),(0,a.jsxs)("div",{children:[(0,a.jsx)("label",{className:"block text-sm font-medium text-gray-700 mb-1",children:"Message (Optional)"}),(0,a.jsx)("textarea",{value:b,onChange:e=>x(e.target.value),className:"w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all",rows:3,placeholder:"Leave a message of support..."})]})]}),(0,a.jsx)("button",{type:"submit",disabled:!r||r<.5||!E||y,className:"w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2",children:y?(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)("div",{className:"animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"}),(0,a.jsx)("span",{children:"Processing..."})]}):(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(u.Z,{className:"w-5 h-5"}),(0,a.jsxs)("span",{children:["Donate ",r?"$".concat(r):""," with Card"]})]})})]}),(0,a.jsx)("div",{className:"mt-6 p-3 bg-gray-50 rounded-lg",children:(0,a.jsx)("p",{className:"text-xs text-gray-600 text-center",children:"\uD83D\uDD12 Secure payment powered by Stripe. Your card information is never stored by CareConnect."})}),(0,a.jsxs)("div",{className:"mt-6 pt-6 border-t border-gray-200",children:[(0,a.jsx)("h3",{className:"text-sm font-medium text-gray-700 mb-3",children:"Other ways to help:"}),(0,a.jsxs)("ul",{className:"text-sm text-gray-600 space-y-1",children:[(0,a.jsx)("li",{children:"• Share this page with friends and family"}),(0,a.jsx)("li",{children:"• Connect with local support organizations"}),(0,a.jsx)("li",{children:"• Offer resources or job opportunities if available"})]})]})]})]})})]})}},8489:function(e,t,r){"use strict";var a=r(58078),s=Symbol.for("react.element"),o=Symbol.for("react.fragment"),i=Object.prototype.hasOwnProperty,n=a.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,l={key:!0,ref:!0,__self:!0,__source:!0};function c(e,t,r){var a,o={},c=null,d=null;for(a in void 0!==r&&(c=""+r),void 0!==t.key&&(c=""+t.key),void 0!==t.ref&&(d=t.ref),t)i.call(t,a)&&!l.hasOwnProperty(a)&&(o[a]=t[a]);if(e&&e.defaultProps)for(a in t=e.defaultProps)void 0===o[a]&&(o[a]=t[a]);return{$$typeof:s,type:e,key:c,ref:d,props:o,_owner:n.current}}t.Fragment=o,t.jsx=c,t.jsxs=c},37821:function(e,t,r){"use strict";e.exports=r(8489)},96871:function(e,t,r){e.exports=r(92054)},46179:function(e,t,r){e.exports=r(85353)},78348:function(e,t,r){"use strict";var a=r(58078);let s=a.forwardRef(function({title:e,titleId:t,...r},s){return a.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:s,"aria-labelledby":t},r),e?a.createElement("title",{id:t},e):null,a.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"}))});t.Z=s},97485:function(e,t,r){"use strict";let a,s;r.r(t),r.d(t,{CheckmarkIcon:function(){return K},ErrorIcon:function(){return Y},LoaderIcon:function(){return V},ToastBar:function(){return el},ToastIcon:function(){return er},Toaster:function(){return em},default:function(){return ep},resolveValue:function(){return k},toast:function(){return z},useToaster:function(){return H},useToasterStore:function(){return M}});var o,i=r(58078);let n={data:""},l=e=>{if("object"==typeof window){let t=(e?e.querySelector("#_goober"):window._goober)||Object.assign(document.createElement("style"),{innerHTML:" ",id:"_goober"});return t.nonce=window.__nonce__,t.parentNode||(e||document.head).appendChild(t),t.firstChild}return e||n},c=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,d=/\/\*[^]*?\*\/|  +/g,u=/\n+/g,m=(e,t)=>{let r="",a="",s="";for(let o in e){let i=e[o];"@"==o[0]?"i"==o[1]?r=o+" "+i+";":a+="f"==o[1]?m(i,o):o+"{"+m(i,"k"==o[1]?"":t)+"}":"object"==typeof i?a+=m(i,t?t.replace(/([^,])+/g,e=>o.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,t=>/&/.test(t)?t.replace(/&/g,e):e?e+" "+t:t)):o):null!=i&&(o=/^--/.test(o)?o:o.replace(/[A-Z]/g,"-$&").toLowerCase(),s+=m.p?m.p(o,i):o+":"+i+";")}return r+(t&&s?t+"{"+s+"}":s)+a},p={},f=e=>{if("object"==typeof e){let t="";for(let r in e)t+=r+f(e[r]);return t}return e},h=(e,t,r,a,s)=>{var o;let i=f(e),n=p[i]||(p[i]=(e=>{let t=0,r=11;for(;t<e.length;)r=101*r+e.charCodeAt(t++)>>>0;return"go"+r})(i));if(!p[n]){let t=i!==e?e:(e=>{let t,r,a=[{}];for(;t=c.exec(e.replace(d,""));)t[4]?a.shift():t[3]?(r=t[3].replace(u," ").trim(),a.unshift(a[0][r]=a[0][r]||{})):a[0][t[1]]=t[2].replace(u," ").trim();return a[0]})(e);p[n]=m(s?{["@keyframes "+n]:t}:t,r?"":"."+n)}let l=r&&p.g?p.g:null;return r&&(p.g=p[n]),o=p[n],l?t.data=t.data.replace(l,o):-1===t.data.indexOf(o)&&(t.data=a?o+t.data:t.data+o),n},g=(e,t,r)=>e.reduce((e,a,s)=>{let o=t[s];if(o&&o.call){let e=o(r),t=e&&e.props&&e.props.className||/^go/.test(e)&&e;o=t?"."+t:e&&"object"==typeof e?e.props?"":m(e,""):!1===e?"":e}return e+a+(null==o?"":o)},"");function b(e){let t=this||{},r=e.call?e(t.p):e;return h(r.unshift?r.raw?g(r,[].slice.call(arguments,1),t.p):r.reduce((e,r)=>Object.assign(e,r&&r.call?r(t.p):r),{}):r,l(t.target),t.g,t.o,t.k)}b.bind({g:1});let x,y,v,w=b.bind({k:1});function j(e,t){let r=this||{};return function(){let a=arguments;function s(o,i){let n=Object.assign({},o),l=n.className||s.className;r.p=Object.assign({theme:y&&y()},n),r.o=/ *go\d+/.test(l),n.className=b.apply(r,a)+(l?" "+l:""),t&&(n.ref=i);let c=e;return e[0]&&(c=n.as||e,delete n.as),v&&c[0]&&v(n),x(c,n)}return t?t(s):s}}var N=e=>"function"==typeof e,k=(e,t)=>N(e)?e(t):e,E=(a=0,()=>(++a).toString()),C=()=>{if(void 0===s&&"u">typeof window){let e=matchMedia("(prefers-reduced-motion: reduce)");s=!e||e.matches}return s},O="default",S=(e,t)=>{let{toastLimit:r}=e.settings;switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,r)};case 1:return{...e,toasts:e.toasts.map(e=>e.id===t.toast.id?{...e,...t.toast}:e)};case 2:let{toast:a}=t;return S(e,{type:e.toasts.find(e=>e.id===a.id)?1:0,toast:a});case 3:let{toastId:s}=t;return{...e,toasts:e.toasts.map(e=>e.id===s||void 0===s?{...e,dismissed:!0,visible:!1}:e)};case 4:return void 0===t.toastId?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(e=>e.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let o=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(e=>({...e,pauseDuration:e.pauseDuration+o}))}}},$=[],_={toasts:[],pausedAt:void 0,settings:{toastLimit:20}},D={},A=(e,t=O)=>{D[t]=S(D[t]||_,e),$.forEach(([e,r])=>{e===t&&r(D[t])})},L=e=>Object.keys(D).forEach(t=>A(e,t)),P=e=>Object.keys(D).find(t=>D[t].toasts.some(t=>t.id===e)),T=(e=O)=>t=>{A(t,e)},I={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},M=(e={},t=O)=>{let[r,a]=(0,i.useState)(D[t]||_),s=(0,i.useRef)(D[t]);(0,i.useEffect)(()=>(s.current!==D[t]&&a(D[t]),$.push([t,a]),()=>{let e=$.findIndex(([e])=>e===t);e>-1&&$.splice(e,1)}),[t]);let o=r.toasts.map(t=>{var r,a,s;return{...e,...e[t.type],...t,removeDelay:t.removeDelay||(null==(r=e[t.type])?void 0:r.removeDelay)||(null==e?void 0:e.removeDelay),duration:t.duration||(null==(a=e[t.type])?void 0:a.duration)||(null==e?void 0:e.duration)||I[t.type],style:{...e.style,...null==(s=e[t.type])?void 0:s.style,...t.style}}});return{...r,toasts:o}},R=(e,t="blank",r)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...r,id:(null==r?void 0:r.id)||E()}),F=e=>(t,r)=>{let a=R(t,e,r);return T(a.toasterId||P(a.id))({type:2,toast:a}),a.id},z=(e,t)=>F("blank")(e,t);z.error=F("error"),z.success=F("success"),z.loading=F("loading"),z.custom=F("custom"),z.dismiss=(e,t)=>{let r={type:3,toastId:e};t?T(t)(r):L(r)},z.dismissAll=e=>z.dismiss(void 0,e),z.remove=(e,t)=>{let r={type:4,toastId:e};t?T(t)(r):L(r)},z.removeAll=e=>z.remove(void 0,e),z.promise=(e,t,r)=>{let a=z.loading(t.loading,{...r,...null==r?void 0:r.loading});return"function"==typeof e&&(e=e()),e.then(e=>{let s=t.success?k(t.success,e):void 0;return s?z.success(s,{id:a,...r,...null==r?void 0:r.success}):z.dismiss(a),e}).catch(e=>{let s=t.error?k(t.error,e):void 0;s?z.error(s,{id:a,...r,...null==r?void 0:r.error}):z.dismiss(a)}),e};var B=1e3,H=(e,t="default")=>{let{toasts:r,pausedAt:a}=M(e,t),s=(0,i.useRef)(new Map).current,o=(0,i.useCallback)((e,t=B)=>{if(s.has(e))return;let r=setTimeout(()=>{s.delete(e),n({type:4,toastId:e})},t);s.set(e,r)},[]);(0,i.useEffect)(()=>{if(a)return;let e=Date.now(),s=r.map(r=>{if(r.duration===1/0)return;let a=(r.duration||0)+r.pauseDuration-(e-r.createdAt);if(a<0){r.visible&&z.dismiss(r.id);return}return setTimeout(()=>z.dismiss(r.id,t),a)});return()=>{s.forEach(e=>e&&clearTimeout(e))}},[r,a,t]);let n=(0,i.useCallback)(T(t),[t]),l=(0,i.useCallback)(()=>{n({type:5,time:Date.now()})},[n]),c=(0,i.useCallback)((e,t)=>{n({type:1,toast:{id:e,height:t}})},[n]),d=(0,i.useCallback)(()=>{a&&n({type:6,time:Date.now()})},[a,n]),u=(0,i.useCallback)((e,t)=>{let{reverseOrder:a=!1,gutter:s=8,defaultPosition:o}=t||{},i=r.filter(t=>(t.position||o)===(e.position||o)&&t.height),n=i.findIndex(t=>t.id===e.id),l=i.filter((e,t)=>t<n&&e.visible).length;return i.filter(e=>e.visible).slice(...a?[l+1]:[0,l]).reduce((e,t)=>e+(t.height||0)+s,0)},[r]);return(0,i.useEffect)(()=>{r.forEach(e=>{if(e.dismissed)o(e.id,e.removeDelay);else{let t=s.get(e.id);t&&(clearTimeout(t),s.delete(e.id))}})},[r,o]),{toasts:r,handlers:{updateHeight:c,startPause:l,endPause:d,calculateOffset:u}}},U=w`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,Z=w`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,W=w`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,Y=j("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${U} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${Z} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${e=>e.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${W} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,q=w`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,V=j("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${q} 1s linear infinite;
`,J=w`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,G=w`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,K=j("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${J} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${G} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${e=>e.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,Q=j("div")`
  position: absolute;
`,X=j("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,ee=w`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,et=j("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${ee} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,er=({toast:e})=>{let{icon:t,type:r,iconTheme:a}=e;return void 0!==t?"string"==typeof t?i.createElement(et,null,t):t:"blank"===r?null:i.createElement(X,null,i.createElement(V,{...a}),"loading"!==r&&i.createElement(Q,null,"error"===r?i.createElement(Y,{...a}):i.createElement(K,{...a})))},ea=e=>`
0% {transform: translate3d(0,${-200*e}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,es=e=>`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${-150*e}%,-1px) scale(.6); opacity:0;}
`,eo=j("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,ei=j("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,en=(e,t)=>{let r=e.includes("top")?1:-1,[a,s]=C()?["0%{opacity:0;} 100%{opacity:1;}","0%{opacity:1;} 100%{opacity:0;}"]:[ea(r),es(r)];return{animation:t?`${w(a)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${w(s)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}},el=i.memo(({toast:e,position:t,style:r,children:a})=>{let s=e.height?en(e.position||t||"top-center",e.visible):{opacity:0},o=i.createElement(er,{toast:e}),n=i.createElement(ei,{...e.ariaProps},k(e.message,e));return i.createElement(eo,{className:e.className,style:{...s,...r,...e.style}},"function"==typeof a?a({icon:o,message:n}):i.createElement(i.Fragment,null,o,n))});o=i.createElement,m.p=void 0,x=o,y=void 0,v=void 0;var ec=({id:e,className:t,style:r,onHeightUpdate:a,children:s})=>{let o=i.useCallback(t=>{if(t){let r=()=>{a(e,t.getBoundingClientRect().height)};r(),new MutationObserver(r).observe(t,{subtree:!0,childList:!0,characterData:!0})}},[e,a]);return i.createElement("div",{ref:o,className:t,style:r},s)},ed=(e,t)=>{let r=e.includes("top"),a=e.includes("center")?{justifyContent:"center"}:e.includes("right")?{justifyContent:"flex-end"}:{};return{left:0,right:0,display:"flex",position:"absolute",transition:C()?void 0:"all 230ms cubic-bezier(.21,1.02,.73,1)",transform:`translateY(${t*(r?1:-1)}px)`,...r?{top:0}:{bottom:0},...a}},eu=b`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`,em=({reverseOrder:e,position:t="top-center",toastOptions:r,gutter:a,children:s,toasterId:o,containerStyle:n,containerClassName:l})=>{let{toasts:c,handlers:d}=H(r,o);return i.createElement("div",{"data-rht-toaster":o||"",style:{position:"fixed",zIndex:9999,top:16,left:16,right:16,bottom:16,pointerEvents:"none",...n},className:l,onMouseEnter:d.startPause,onMouseLeave:d.endPause},c.map(r=>{let o=r.position||t,n=ed(o,d.calculateOffset(r,{reverseOrder:e,gutter:a,defaultPosition:t}));return i.createElement(ec,{id:r.id,key:r.id,onHeightUpdate:d.updateHeight,className:r.visible?eu:"",style:n},"custom"===r.type?k(r.message,r):s?s(r):i.createElement(el,{toast:r,position:o}))}))},ep=z}},function(e){e.O(0,[54,115,835,744],function(){return e(e.s=4962)}),_N_E=e.O()}]);