(()=>{var k=Object.defineProperty;var w=Object.getOwnPropertySymbols;var P=Object.prototype.hasOwnProperty,j=Object.prototype.propertyIsEnumerable;var v=(t,e,o)=>e in t?k(t,e,{enumerable:!0,configurable:!0,writable:!0,value:o}):t[e]=o,c=(t,e)=>{for(var o in e||(e={}))P.call(e,o)&&v(t,o,e[o]);if(w)for(var o of w(e))j.call(e,o)&&v(t,o,e[o]);return t};var I={eventPath:"/_edgee/event",fullClientSide:!1,methods:["identify","track","page"]},i=I;var C=t=>{let e=window.location.search;return new URLSearchParams(e).get(t)},_=()=>{let t=C("_edgeedebug");if(t!==null){if(t==="true")return localStorage.setItem("_edgeedebug",!0),!0;if(t==="false")return localStorage.setItem("_edgeedebug",!1),!1}let e=localStorage.getItem("_edgeedebug");return e===null?!1:e==="true"},l=(...t)=>{typeof t!="object"&&(t=[t]),console&&typeof console.log=="function"&&_()&&console.log("%cEDGEE","display: inline-block; color: #61d2a3; background: #231A26; padding: 1px 4px; border-radius: 3px;",...t)},s=(...t)=>{typeof t!="object"&&(t=[t]),console&&typeof console.error=="function"&&_()&&console.error("%cEDGEE","display: inline-block; color: #CB134A; background: #231A26; padding: 1px 4px; border-radius: 3px;",...t)};function A(t){let e=i.eventPath;i.fullClientSide&&typeof localStorage!="undefined"&&localStorage.getItem("_edgee")&&(e=e+"?e="+localStorage.getItem("_edgee"));let o=JSON.stringify(t);if(typeof localStorage!="undefined"){let n=localStorage.getItem("_edgee_last_event");if(n){let a=JSON.parse(n);if(a.payload&&a.payload===o&&new Date().getTime()-a.date<1e3)return}localStorage.setItem("_edgee_last_event",JSON.stringify({payload:o,date:new Date().getTime()}))}l(t.type+" event:",t),fetch(e,{method:"POST",headers:{"Content-Type":"application/json"},body:o}).then(n=>{n.status!==200&&n.status!==204?s("Failed to send event to "+i.eventPath+": "+n.status):(l("Event sent to "+i.eventPath),i.fullClientSide&&typeof localStorage!="undefined"&&n.status===200&&n.json().then(a=>{a.e&&localStorage.setItem("_edgee",a.e)}).catch(a=>{s("Failed to parse response: "+a)}))}).catch(n=>{s("Failed to send event to "+i.eventPath+": "+n)})}var p=A;var b=0;function u(){let t=document.getElementById("__EDGEE_CONTEXT__");t===null&&b<1&&document.readyState!=="complete"&&(l("Edgee context not found, waiting for it to be added to the page"),b++,document.onreadystatechange=()=>{if(document.readyState==="complete")return u()});let e={};if(t!==null){let x=t.textContent;e=JSON.parse(x)}let o=Intl.DateTimeFormat().resolvedOptions().timeZone;o&&(e.client={},e.client.timezone=o);let n=window.screen?window.screen.width:0,a=window.screen?window.screen.height:0;n&&a&&(e.client=e.client||{},e.client.screenWidth=n,e.client.screenHeight=a);let d=window.devicePixelRatio;d&&(e.client=e.client||{},e.client.screenDensity=d);let r=new URLSearchParams(window.location.search);return r.has("utm_campaign")&&(e.campaign=e.campaign||{},e.campaign.name=r.get("utm_campaign")),r.has("utm_source")&&(e.campaign=e.campaign||{},e.campaign.source=r.get("utm_source")),r.has("utm_medium")&&(e.campaign=e.campaign||{},e.campaign.medium=r.get("utm_medium")),r.has("utm_term")&&(e.campaign=e.campaign||{},e.campaign.term=r.get("utm_term")),r.has("utm_content")&&(e.campaign=e.campaign||{},e.campaign.content=r.get("utm_content")),r.has("utm_creative_format")&&(e.campaign=e.campaign||{},e.campaign.creativeFormat=r.get("utm_creative_format")),r.has("utm_marketing_tactic")&&(e.campaign=e.campaign||{},e.campaign.marketingTactic=r.get("utm_marketing_tactic")),e}function O(t){let e=g();if(e.type="page",t.length!==0){let[o,n]=t;typeof o=="string"?e.page.name=o:typeof o=="object"&&(e.page=c(c({},e.page),o)),typeof n=="object"&&(e.destinations=c(c({},e.destinations),n))}p(e)}function g(){let t=u(),e;document.querySelector('link[rel="canonical"]')&&document.querySelector('link[rel="canonical"]').getAttribute("href")&&(e=document.querySelector('link[rel="canonical"]').getAttribute("href"),!e.startsWith("https://")&&!e.startsWith("http://")&&!e.startsWith("^//")&&(e=window.location.protocol+"//"+window.location.host+e));let o;if(e){o=e.replace(/^https?:\/\//,"");let n=o.split("/")[0];o=o.replace(n,""),o=o.split("?")[0]}if(t.page=t.page||{},t.page.url||(e?t.page.url=e:t.page.url=window.location.protocol+"//"+window.location.host+window.location.pathname+window.location.search),t.page.path||(o?t.page.path=o:t.page.path=window.location.pathname),!t.page.search&&window.location.search!==""&&(t.page.search=window.location.search),t.page.title||(t.page.title=document.title),!t.page.keywords){let n=document.querySelector('meta[name="keywords"]');if(n){let a=n.getAttribute("content");t.page.keywords=a.split(",").map(d=>d.trim())}}return document.referrer&&(t.page.referrer=document.referrer),t}var h=O;function D(t){let e="Event name is required to track an event";if(t.length===0){s(e);return}let o=g();o.type="track",o.track={};let[n,a]=t;if(typeof n=="string")o.track.name=n;else if(typeof n=="object"){if(!n.name){s(e);return}o.track=n}if(n.name===""){s(e);return}typeof a=="object"&&(o.destinations=c(c({},o.destinations),a)),p(o)}var S=D;function T(t){let e=g();if(e.type="identify",t.length!==0){let[o,n]=t;typeof o=="string"?e.identify.userId=o:typeof o=="object"&&(e.identify=c(c({},e.identify),o)),typeof n=="object"&&(e.destinations=c(c({},e.destinations),n))}p(e)}var E=T;var f=window.edgee=window.edgee||[];if(!f.load){for(f.load=!0,f.factory=function(n){return function(){let a=Array.prototype.slice.call(arguments);return W(n,a),f}},m=0;m<i.methods.length;m++)y=i.methods[m],f[y]=f.factory(y);let t=document.currentScript,e=t.getAttribute("data-event-path");if(e)l("Event path set to "+e),i.eventPath=e;else{i.fullClientSide=!0;let n=t.src;if(n&&(n.startsWith("http://")||n.startsWith("https://")||n.startsWith("//"))){n=n.replace("https://",""),n=n.replace("http://",""),n=n.replace("^//","");let a=n.split("/")[0];i.eventPath=`https://${a}/_edgee/csevent`,l("Event path set to "+i.eventPath)}}let o=t.getAttribute("data-page-event");!o||o!=="false"?(l("Collecting page event client side",i.fullClientSide&&"(full client side)"),h([])):l("Page event collected at the edge"),window.dispatchEvent(new Event("edgee:loaded"))}var y,m;function W(t,e){t==="page"?h(e):t==="track"?S(e):t==="identify"&&E(e)}})();
