(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[451],{82380:function(e,t,a){Promise.resolve().then(a.bind(a,43366))},43366:function(e,t,a){"use strict";a.r(t),a.d(t,{default:function(){return p}});var r=a(37821),s=a(58078),o=a(46179),n=a(96871),i=a.n(n),l=a(97485),c=a(10808),d=a(26200),u=a(16717);let m=s.forwardRef(function({title:e,titleId:t,...a},r){return s.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:r,"aria-labelledby":t},a),e?s.createElement("title",{id:t},e):null,s.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"}))}),f=s.forwardRef(function({title:e,titleId:t,...a},r){return s.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:r,"aria-labelledby":t},a),e?s.createElement("title",{id:t},e):null,s.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"}))});function p(){let e=(0,o.useRouter)(),[t,a]=(0,s.useState)(null),[n,p]=(0,s.useState)({}),[h,g]=(0,s.useState)({}),[x,b]=(0,s.useState)(!1),[y,v]=(0,s.useState)(!1),[w,j]=(0,s.useState)(null);(0,s.useEffect)(()=>{let t=localStorage.getItem("gfm_extracted_draft");if(t)try{let e=JSON.parse(t);a(e),b(e.consentToPublish||!1)}catch(e){console.error("Error parsing draft:",e),l.default.error("Error loading draft data")}else l.default.error("No draft data found. Please start from the beginning."),e.push("/gfm/extract")},[e]);let N=e=>e>.7?(0,r.jsx)(c.Z,{className:"w-5 h-5 text-green-500"}):e>.4?(0,r.jsx)(d.Z,{className:"w-5 h-5 text-yellow-500"}):(0,r.jsx)(u.Z,{className:"w-5 h-5 text-red-500"}),k=e=>e>.7?"High confidence":e>.4?"Medium confidence":"Low confidence - please review",E=e=>e>.7?"text-green-600 bg-green-50":e>.4?"text-yellow-600 bg-yellow-50":"text-red-600 bg-red-50",C=(e,t)=>{p({...n,[e]:!0}),g({...h,[e]:String(t||"")})},O=e=>{if(!t)return;let r={...t},s=r[e],o=h[e];if("goalAmount"===e&&isNaN(o=parseFloat(h[e].replace(/[^\d.]/g,"")))){l.default.error("Please enter a valid number for goal amount");return}s&&"object"==typeof s&&"value"in s&&(s.value=o,s.confidence=1,s.source="manual"),a(r),p({...n,[e]:!1}),localStorage.setItem("gfm_extracted_draft",JSON.stringify(r)),l.default.success("Field updated successfully")},_=e=>{p({...n,[e]:!1});let t={...h};delete t[e],g(t)},S=function(e,t,a){let s=arguments.length>3&&void 0!==arguments[3]?arguments[3]:"text",o=arguments.length>4?arguments[4]:void 0,i=n[e],l=(null==a?void 0:a.value)||"Not specified";return(0,r.jsxs)("div",{className:"border rounded-lg p-4 hover:shadow-md transition-shadow",children:[(0,r.jsxs)("div",{className:"flex justify-between items-start mb-2",children:[(0,r.jsx)("h4",{className:"font-semibold text-gray-900",children:t}),(0,r.jsxs)("div",{className:"flex items-center space-x-2",children:[a&&(0,r.jsxs)("div",{className:"px-2 py-1 rounded text-xs ".concat(E(a.confidence)),children:[N(a.confidence),(0,r.jsxs)("span",{className:"ml-1",children:[Math.round(100*a.confidence),"%"]})]}),!i&&(0,r.jsx)("button",{onClick:()=>C(e,l),className:"text-blue-600 hover:text-blue-700 transition-colors","aria-label":"Edit ".concat(t),children:(0,r.jsx)(m,{className:"w-4 h-4"})})]})]}),i?(0,r.jsxs)("div",{children:["textarea"===s?(0,r.jsx)("textarea",{value:h[e]||"",onChange:t=>g({...h,[e]:t.target.value}),className:"w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500","aria-label":t,placeholder:t,rows:4}):"select"===s&&o?(0,r.jsxs)("select",{value:h[e]||"",onChange:t=>g({...h,[e]:t.target.value}),className:"w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500","aria-label":t,children:[(0,r.jsx)("option",{value:"",children:"Please select..."}),o.map(e=>(0,r.jsx)("option",{value:e,children:e},e))]}):(0,r.jsx)("input",{type:"number"===s?"number":"text",value:h[e]||"",onChange:t=>g({...h,[e]:t.target.value}),className:"w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500",placeholder:"Enter ".concat(t.toLowerCase())}),(0,r.jsxs)("div",{className:"flex space-x-2 mt-2",children:[(0,r.jsx)("button",{onClick:()=>O(e),className:"px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors",children:"Save"}),(0,r.jsx)("button",{onClick:()=>_(e),className:"px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400 transition-colors",children:"Cancel"})]})]}):(0,r.jsxs)("div",{children:[(0,r.jsx)("p",{className:"text-gray-800",children:"goalAmount"===e&&(null==a?void 0:a.value)?"$".concat(Number(a.value).toLocaleString()):String(l)}),a&&a.confidence<.7&&(0,r.jsxs)("p",{className:"text-sm text-gray-500 mt-1",children:[k(a.confidence)," - Consider reviewing this field"]})]})]})},L=async()=>{var e;if(!(null==t?void 0:null===(e=t.name)||void 0===e?void 0:e.value)){l.default.error("Please provide a name for the campaign first");return}try{let e=t.name.value.toLowerCase().replace(/[^a-z0-9]/g,"-").replace(/-+/g,"-"),a=await fetch("".concat("https://api.care2connects.org","/api/qr/donation-page"),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({publicSlug:e})}),r=await a.json();r.success?(j(r.data.qrCodeUrl),l.default.success("QR code generated successfully!")):l.default.error("Failed to generate QR code")}catch(e){console.error("QR generation error:",e),l.default.error("Failed to generate QR code")}},D=async()=>{if(t){v(!0);try{var e,a;let r=await fetch("".concat("https://api.care2connects.org","/api/exports/gofundme-docx"),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({draft:t,filename:"GoFundMe_Draft_".concat((null===(e=t.name)||void 0===e?void 0:e.value)||"Untitled",".docx")})});if(r.ok){let e=await r.blob(),s=window.URL.createObjectURL(e),o=document.createElement("a");o.style.display="none",o.href=s,o.download="GoFundMe_Draft_".concat((null===(a=t.name)||void 0===a?void 0:a.value)||"Untitled",".docx"),document.body.appendChild(o),o.click(),window.URL.revokeObjectURL(s),l.default.success("Document downloaded successfully!")}else l.default.error("Failed to generate document")}catch(e){console.error("Document generation error:",e),l.default.error("Failed to generate document")}finally{v(!1)}}};return t?(0,r.jsx)("div",{className:"min-h-screen bg-gray-50 py-8",children:(0,r.jsxs)("div",{className:"max-w-4xl mx-auto px-4 sm:px-6 lg:px-8",children:[(0,r.jsxs)("div",{className:"text-center mb-8",children:[(0,r.jsx)("h1",{className:"text-3xl font-bold text-gray-900 mb-4",children:"Review Your GoFundMe Campaign"}),(0,r.jsx)("p",{className:"text-lg text-gray-600",children:"Review and edit the auto-filled information. Fields with low confidence should be checked carefully."})]}),(0,r.jsxs)("div",{className:"grid lg:grid-cols-2 gap-8",children:[(0,r.jsxs)("div",{className:"space-y-6",children:[(0,r.jsxs)("div",{className:"bg-white rounded-lg shadow p-6",children:[(0,r.jsx)("h2",{className:"text-xl font-semibold mb-4",children:"Campaign Details"}),(0,r.jsxs)("div",{className:"space-y-4",children:[S("title","Campaign Title",t.title,"text"),S("category","Category",t.category,"select",["Medical","Emergency","Memorial","Education","Nonprofit","Housing","Animal","Environment","Community","Sports","Creative","Travel","Family","Business","Dreams","Faith","Competitions","Other"]),S("goalAmount","Goal Amount ($)",t.goalAmount,"number"),S("name","Your Name",t.name,"text"),S("dateOfBirth","Date of Birth (MM/DD/YYYY)",t.dateOfBirth,"text")]})]}),(0,r.jsxs)("div",{className:"bg-white rounded-lg shadow p-6",children:[(0,r.jsx)("h2",{className:"text-xl font-semibold mb-4",children:"Story Content"}),(0,r.jsxs)("div",{className:"space-y-4",children:[S("storyBody","Campaign Story",t.storyBody,"textarea"),S("shortSummary","Short Summary",t.shortSummary,"textarea")]})]})]}),(0,r.jsxs)("div",{className:"space-y-6",children:[(0,r.jsxs)("div",{className:"bg-white rounded-lg shadow p-6",children:[(0,r.jsx)("h2",{className:"text-xl font-semibold mb-4",children:"Consent & Privacy"}),(0,r.jsx)("div",{className:"space-y-4",children:(0,r.jsxs)("label",{className:"flex items-start space-x-3 cursor-pointer",children:[(0,r.jsx)("input",{type:"checkbox",checked:x,onChange:e=>b(e.target.checked),className:"mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"}),(0,r.jsx)("span",{className:"text-sm text-gray-700",children:"I consent to publish this campaign information and understand that it will be publicly visible. I confirm that all information provided is accurate to the best of my knowledge."})]})})]}),(0,r.jsxs)("div",{className:"bg-white rounded-lg shadow p-6",children:[(0,r.jsx)("h2",{className:"text-xl font-semibold mb-4",children:"QR Code for Donations"}),w?(0,r.jsxs)("div",{className:"text-center",children:[(0,r.jsx)("img",{src:w,alt:"Donation QR Code",className:"mx-auto mb-4 border rounded"}),(0,r.jsx)("p",{className:"text-sm text-gray-600 mb-4",children:"People can scan this QR code to donate directly via debit/credit card"}),(0,r.jsx)("button",{onClick:L,className:"btn-secondary text-sm",children:"Regenerate QR Code"})]}):(0,r.jsxs)("div",{className:"text-center",children:[(0,r.jsx)("p",{className:"text-gray-600 mb-4",children:"Generate a QR code that links to your donation page"}),(0,r.jsx)("button",{onClick:L,disabled:!x,className:"btn-primary disabled:bg-gray-300 disabled:cursor-not-allowed",children:"Generate QR Code"})]})]}),(0,r.jsxs)("div",{className:"bg-white rounded-lg shadow p-6",children:[(0,r.jsx)("h2",{className:"text-xl font-semibold mb-4",children:"GoFundMe Draft Package"}),(0,r.jsx)("p",{className:"text-gray-600 mb-4",children:"Download a Word document with your complete campaign details and step-by-step GoFundMe setup instructions."}),(0,r.jsxs)("button",{onClick:D,disabled:!x||y,className:"btn-primary w-full disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2",children:[(0,r.jsx)(f,{className:"w-5 h-5"}),(0,r.jsx)("span",{children:y?"Generating...":"Download Word Document"})]})]})]})]}),(0,r.jsxs)("div",{className:"mt-8 flex justify-between",children:[(0,r.jsx)(i(),{href:"/gfm/extract",className:"btn-secondary",children:"← Back to Extraction"}),(0,r.jsx)(i(),{href:"/",className:"btn-secondary",children:"Complete & Go Home"})]})]})}):(0,r.jsx)("div",{className:"min-h-screen bg-gray-50 flex items-center justify-center",children:(0,r.jsxs)("div",{className:"text-center",children:[(0,r.jsx)("div",{className:"animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"}),(0,r.jsx)("p",{className:"text-gray-600",children:"Loading draft data..."})]})})}},8489:function(e,t,a){"use strict";var r=a(58078),s=Symbol.for("react.element"),o=Symbol.for("react.fragment"),n=Object.prototype.hasOwnProperty,i=r.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,l={key:!0,ref:!0,__self:!0,__source:!0};function c(e,t,a){var r,o={},c=null,d=null;for(r in void 0!==a&&(c=""+a),void 0!==t.key&&(c=""+t.key),void 0!==t.ref&&(d=t.ref),t)n.call(t,r)&&!l.hasOwnProperty(r)&&(o[r]=t[r]);if(e&&e.defaultProps)for(r in t=e.defaultProps)void 0===o[r]&&(o[r]=t[r]);return{$$typeof:s,type:e,key:c,ref:d,props:o,_owner:i.current}}t.Fragment=o,t.jsx=c,t.jsxs=c},37821:function(e,t,a){"use strict";e.exports=a(8489)},96871:function(e,t,a){e.exports=a(92054)},46179:function(e,t,a){e.exports=a(85353)},10808:function(e,t,a){"use strict";var r=a(58078);let s=r.forwardRef(function({title:e,titleId:t,...a},s){return r.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:s,"aria-labelledby":t},a),e?r.createElement("title",{id:t},e):null,r.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"}))});t.Z=s},26200:function(e,t,a){"use strict";var r=a(58078);let s=r.forwardRef(function({title:e,titleId:t,...a},s){return r.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:s,"aria-labelledby":t},a),e?r.createElement("title",{id:t},e):null,r.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"}))});t.Z=s},16717:function(e,t,a){"use strict";var r=a(58078);let s=r.forwardRef(function({title:e,titleId:t,...a},s){return r.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:s,"aria-labelledby":t},a),e?r.createElement("title",{id:t},e):null,r.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"}))});t.Z=s},97485:function(e,t,a){"use strict";let r,s;a.r(t),a.d(t,{CheckmarkIcon:function(){return V},ErrorIcon:function(){return Q},LoaderIcon:function(){return Y},ToastBar:function(){return el},ToastIcon:function(){return ea},Toaster:function(){return em},default:function(){return ef},resolveValue:function(){return k},toast:function(){return B},useToaster:function(){return H},useToasterStore:function(){return F}});var o,n=a(58078);let i={data:""},l=e=>{if("object"==typeof window){let t=(e?e.querySelector("#_goober"):window._goober)||Object.assign(document.createElement("style"),{innerHTML:" ",id:"_goober"});return t.nonce=window.__nonce__,t.parentNode||(e||document.head).appendChild(t),t.firstChild}return e||i},c=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,d=/\/\*[^]*?\*\/|  +/g,u=/\n+/g,m=(e,t)=>{let a="",r="",s="";for(let o in e){let n=e[o];"@"==o[0]?"i"==o[1]?a=o+" "+n+";":r+="f"==o[1]?m(n,o):o+"{"+m(n,"k"==o[1]?"":t)+"}":"object"==typeof n?r+=m(n,t?t.replace(/([^,])+/g,e=>o.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,t=>/&/.test(t)?t.replace(/&/g,e):e?e+" "+t:t)):o):null!=n&&(o=/^--/.test(o)?o:o.replace(/[A-Z]/g,"-$&").toLowerCase(),s+=m.p?m.p(o,n):o+":"+n+";")}return a+(t&&s?t+"{"+s+"}":s)+r},f={},p=e=>{if("object"==typeof e){let t="";for(let a in e)t+=a+p(e[a]);return t}return e},h=(e,t,a,r,s)=>{var o;let n=p(e),i=f[n]||(f[n]=(e=>{let t=0,a=11;for(;t<e.length;)a=101*a+e.charCodeAt(t++)>>>0;return"go"+a})(n));if(!f[i]){let t=n!==e?e:(e=>{let t,a,r=[{}];for(;t=c.exec(e.replace(d,""));)t[4]?r.shift():t[3]?(a=t[3].replace(u," ").trim(),r.unshift(r[0][a]=r[0][a]||{})):r[0][t[1]]=t[2].replace(u," ").trim();return r[0]})(e);f[i]=m(s?{["@keyframes "+i]:t}:t,a?"":"."+i)}let l=a&&f.g?f.g:null;return a&&(f.g=f[i]),o=f[i],l?t.data=t.data.replace(l,o):-1===t.data.indexOf(o)&&(t.data=r?o+t.data:t.data+o),i},g=(e,t,a)=>e.reduce((e,r,s)=>{let o=t[s];if(o&&o.call){let e=o(a),t=e&&e.props&&e.props.className||/^go/.test(e)&&e;o=t?"."+t:e&&"object"==typeof e?e.props?"":m(e,""):!1===e?"":e}return e+r+(null==o?"":o)},"");function x(e){let t=this||{},a=e.call?e(t.p):e;return h(a.unshift?a.raw?g(a,[].slice.call(arguments,1),t.p):a.reduce((e,a)=>Object.assign(e,a&&a.call?a(t.p):a),{}):a,l(t.target),t.g,t.o,t.k)}x.bind({g:1});let b,y,v,w=x.bind({k:1});function j(e,t){let a=this||{};return function(){let r=arguments;function s(o,n){let i=Object.assign({},o),l=i.className||s.className;a.p=Object.assign({theme:y&&y()},i),a.o=/ *go\d+/.test(l),i.className=x.apply(a,r)+(l?" "+l:""),t&&(i.ref=n);let c=e;return e[0]&&(c=i.as||e,delete i.as),v&&c[0]&&v(i),b(c,i)}return t?t(s):s}}var N=e=>"function"==typeof e,k=(e,t)=>N(e)?e(t):e,E=(r=0,()=>(++r).toString()),C=()=>{if(void 0===s&&"u">typeof window){let e=matchMedia("(prefers-reduced-motion: reduce)");s=!e||e.matches}return s},O="default",_=(e,t)=>{let{toastLimit:a}=e.settings;switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,a)};case 1:return{...e,toasts:e.toasts.map(e=>e.id===t.toast.id?{...e,...t.toast}:e)};case 2:let{toast:r}=t;return _(e,{type:e.toasts.find(e=>e.id===r.id)?1:0,toast:r});case 3:let{toastId:s}=t;return{...e,toasts:e.toasts.map(e=>e.id===s||void 0===s?{...e,dismissed:!0,visible:!1}:e)};case 4:return void 0===t.toastId?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(e=>e.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let o=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(e=>({...e,pauseDuration:e.pauseDuration+o}))}}},S=[],L={toasts:[],pausedAt:void 0,settings:{toastLimit:20}},D={},R=(e,t=O)=>{D[t]=_(D[t]||L,e),S.forEach(([e,a])=>{e===t&&a(D[t])})},M=e=>Object.keys(D).forEach(t=>R(e,t)),P=e=>Object.keys(D).find(t=>D[t].toasts.some(t=>t.id===e)),$=(e=O)=>t=>{R(t,e)},I={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},F=(e={},t=O)=>{let[a,r]=(0,n.useState)(D[t]||L),s=(0,n.useRef)(D[t]);(0,n.useEffect)(()=>(s.current!==D[t]&&r(D[t]),S.push([t,r]),()=>{let e=S.findIndex(([e])=>e===t);e>-1&&S.splice(e,1)}),[t]);let o=a.toasts.map(t=>{var a,r,s;return{...e,...e[t.type],...t,removeDelay:t.removeDelay||(null==(a=e[t.type])?void 0:a.removeDelay)||(null==e?void 0:e.removeDelay),duration:t.duration||(null==(r=e[t.type])?void 0:r.duration)||(null==e?void 0:e.duration)||I[t.type],style:{...e.style,...null==(s=e[t.type])?void 0:s.style,...t.style}}});return{...a,toasts:o}},T=(e,t="blank",a)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...a,id:(null==a?void 0:a.id)||E()}),A=e=>(t,a)=>{let r=T(t,e,a);return $(r.toasterId||P(r.id))({type:2,toast:r}),r.id},B=(e,t)=>A("blank")(e,t);B.error=A("error"),B.success=A("success"),B.loading=A("loading"),B.custom=A("custom"),B.dismiss=(e,t)=>{let a={type:3,toastId:e};t?$(t)(a):M(a)},B.dismissAll=e=>B.dismiss(void 0,e),B.remove=(e,t)=>{let a={type:4,toastId:e};t?$(t)(a):M(a)},B.removeAll=e=>B.remove(void 0,e),B.promise=(e,t,a)=>{let r=B.loading(t.loading,{...a,...null==a?void 0:a.loading});return"function"==typeof e&&(e=e()),e.then(e=>{let s=t.success?k(t.success,e):void 0;return s?B.success(s,{id:r,...a,...null==a?void 0:a.success}):B.dismiss(r),e}).catch(e=>{let s=t.error?k(t.error,e):void 0;s?B.error(s,{id:r,...a,...null==a?void 0:a.error}):B.dismiss(r)}),e};var Z=1e3,H=(e,t="default")=>{let{toasts:a,pausedAt:r}=F(e,t),s=(0,n.useRef)(new Map).current,o=(0,n.useCallback)((e,t=Z)=>{if(s.has(e))return;let a=setTimeout(()=>{s.delete(e),i({type:4,toastId:e})},t);s.set(e,a)},[]);(0,n.useEffect)(()=>{if(r)return;let e=Date.now(),s=a.map(a=>{if(a.duration===1/0)return;let r=(a.duration||0)+a.pauseDuration-(e-a.createdAt);if(r<0){a.visible&&B.dismiss(a.id);return}return setTimeout(()=>B.dismiss(a.id,t),r)});return()=>{s.forEach(e=>e&&clearTimeout(e))}},[a,r,t]);let i=(0,n.useCallback)($(t),[t]),l=(0,n.useCallback)(()=>{i({type:5,time:Date.now()})},[i]),c=(0,n.useCallback)((e,t)=>{i({type:1,toast:{id:e,height:t}})},[i]),d=(0,n.useCallback)(()=>{r&&i({type:6,time:Date.now()})},[r,i]),u=(0,n.useCallback)((e,t)=>{let{reverseOrder:r=!1,gutter:s=8,defaultPosition:o}=t||{},n=a.filter(t=>(t.position||o)===(e.position||o)&&t.height),i=n.findIndex(t=>t.id===e.id),l=n.filter((e,t)=>t<i&&e.visible).length;return n.filter(e=>e.visible).slice(...r?[l+1]:[0,l]).reduce((e,t)=>e+(t.height||0)+s,0)},[a]);return(0,n.useEffect)(()=>{a.forEach(e=>{if(e.dismissed)o(e.id,e.removeDelay);else{let t=s.get(e.id);t&&(clearTimeout(t),s.delete(e.id))}})},[a,o]),{toasts:a,handlers:{updateHeight:c,startPause:l,endPause:d,calculateOffset:u}}},z=w`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,U=w`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,G=w`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,Q=j("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${z} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${U} 0.15s ease-out forwards;
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
    animation: ${G} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,W=w`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,Y=j("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${W} 1s linear infinite;
`,J=w`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,q=w`
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
}`,V=j("div")`
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
    animation: ${q} 0.2s ease-out forwards;
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
`,K=j("div")`
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
`,ea=({toast:e})=>{let{icon:t,type:a,iconTheme:r}=e;return void 0!==t?"string"==typeof t?n.createElement(et,null,t):t:"blank"===a?null:n.createElement(X,null,n.createElement(Y,{...r}),"loading"!==a&&n.createElement(K,null,"error"===a?n.createElement(Q,{...r}):n.createElement(V,{...r})))},er=e=>`
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
`,en=j("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,ei=(e,t)=>{let a=e.includes("top")?1:-1,[r,s]=C()?["0%{opacity:0;} 100%{opacity:1;}","0%{opacity:1;} 100%{opacity:0;}"]:[er(a),es(a)];return{animation:t?`${w(r)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${w(s)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}},el=n.memo(({toast:e,position:t,style:a,children:r})=>{let s=e.height?ei(e.position||t||"top-center",e.visible):{opacity:0},o=n.createElement(ea,{toast:e}),i=n.createElement(en,{...e.ariaProps},k(e.message,e));return n.createElement(eo,{className:e.className,style:{...s,...a,...e.style}},"function"==typeof r?r({icon:o,message:i}):n.createElement(n.Fragment,null,o,i))});o=n.createElement,m.p=void 0,b=o,y=void 0,v=void 0;var ec=({id:e,className:t,style:a,onHeightUpdate:r,children:s})=>{let o=n.useCallback(t=>{if(t){let a=()=>{r(e,t.getBoundingClientRect().height)};a(),new MutationObserver(a).observe(t,{subtree:!0,childList:!0,characterData:!0})}},[e,r]);return n.createElement("div",{ref:o,className:t,style:a},s)},ed=(e,t)=>{let a=e.includes("top"),r=e.includes("center")?{justifyContent:"center"}:e.includes("right")?{justifyContent:"flex-end"}:{};return{left:0,right:0,display:"flex",position:"absolute",transition:C()?void 0:"all 230ms cubic-bezier(.21,1.02,.73,1)",transform:`translateY(${t*(a?1:-1)}px)`,...a?{top:0}:{bottom:0},...r}},eu=x`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`,em=({reverseOrder:e,position:t="top-center",toastOptions:a,gutter:r,children:s,toasterId:o,containerStyle:i,containerClassName:l})=>{let{toasts:c,handlers:d}=H(a,o);return n.createElement("div",{"data-rht-toaster":o||"",style:{position:"fixed",zIndex:9999,top:16,left:16,right:16,bottom:16,pointerEvents:"none",...i},className:l,onMouseEnter:d.startPause,onMouseLeave:d.endPause},c.map(a=>{let o=a.position||t,i=ed(o,d.calculateOffset(a,{reverseOrder:e,gutter:r,defaultPosition:t}));return n.createElement(ec,{id:a.id,key:a.id,onHeightUpdate:d.updateHeight,className:a.visible?eu:"",style:i},"custom"===a.type?k(a.message,a):s?s(a):n.createElement(el,{toast:a,position:o}))}))},ef=B}},function(e){e.O(0,[54,115,835,744],function(){return e(e.s=82380)}),_N_E=e.O()}]);