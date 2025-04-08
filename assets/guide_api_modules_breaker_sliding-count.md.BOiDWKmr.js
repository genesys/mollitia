import{_ as B}from"./chunks/circuit-breaker-diagram.Dq1YQUwR.js";import{D as f,a as T,V}from"./chunks/theme.CFNbPdFi.js";import{C as N,N as h}from"./chunks/circuit.y_FAFz-t.js";import{P as R}from"./chunks/progress-bar.DdOpSzUH.js";import{d as P,p as i,q as r,v as I,x as M,c as F,o as A,G as a,k as H,w as S,j as t,N as q,t as W,_ as U,C as z,a2 as L,a as j}from"./chunks/framework.DYiJ1WDi.js";const G={class:"sliding-count"},J={class:"content"},$={class:"form"},K={class:"row"},Q={class:"row"},X={class:"row"},Y={class:"row"},Z={class:"row"},ss={class:"row"},ts={class:"row"},es={class:"row"},is={class:"visualization"},as={class:"row state"},ls={class:"row"},ns=P({__name:"sliding-count",setup(_){const D=i(null),n=i(4),d=i(2),c=i(60),k=i(1e3),u=i(50),g=i(2),o=i(3e3),p=i(6e3),E=i(0),m=i(o.value),w=i(0),v=i(0),y=i("var(--vp-c-green-2)"),C=i(f.CLOSED),l=new T({slidingWindowSize:n.value,minimumNumberOfCalls:d.value,failureRateThreshold:c.value,slowCallDurationThreshold:k.value,slowCallRateThreshold:u.value,permittedNumberOfCallsInHalfOpenState:g.value,openStateDelay:o.value,halfOpenStateMaxDelay:p.value,prometheus:{name:"sliding_count_module"}}),O=new V({options:{modules:[l],prometheus:{name:"sliding_count_circuit"}}});r([n],()=>{l.slidingWindowSize=n.value}),r([d],()=>{l.minimumNumberOfCalls=d.value}),r([c],()=>{l.failureRateThreshold=c.value}),r([k],()=>{l.slowCallDurationThreshold=k.value}),r([u],()=>{l.slowCallRateThreshold=u.value}),r([g],()=>{l.permittedNumberOfCallsInHalfOpenState=g.value}),r([o],()=>{l.openStateDelay=o.value}),r([p],()=>{l.halfOpenStateMaxDelay=p.value});function x(b){switch(clearInterval(v.value),E.value=0,C.value=b,b){case f.CLOSED:{y.value="var(--vp-c-green-2)";break}case f.HALF_OPENED:{m.value=p.value,y.value="var(--vp-c-yellow-2)";break}case f.OPENED:{m.value=o.value,y.value="var(--vp-c-red-2)";break}}w.value=Date.now(),C.value!==f.CLOSED?v.value=window.setInterval(()=>{E.value=Date.now()-w.value,E.value>=m.value&&clearInterval(v.value)},100):E.value=0}return I(()=>{l.on("state-changed",x)}),M(()=>{l.off("state-changed",x)}),(b,s)=>(A(),F("div",G,[a(N,{ref_key:"circuitRef",ref:D,circuit:H(O)},{default:S(()=>[t("div",J,[t("div",$,[t("div",K,[a(h,{modelValue:n.value,"onUpdate:modelValue":s[0]||(s[0]=e=>n.value=e),label:"Window Size:"},null,8,["modelValue"])]),t("div",Q,[a(h,{modelValue:d.value,"onUpdate:modelValue":s[1]||(s[1]=e=>d.value=e),label:"Minimum number of calls:"},null,8,["modelValue"])]),t("div",X,[a(h,{modelValue:c.value,"onUpdate:modelValue":s[2]||(s[2]=e=>c.value=e),label:"Failure Rate Threshold (in %):"},null,8,["modelValue"])]),t("div",Y,[a(h,{modelValue:k.value,"onUpdate:modelValue":s[3]||(s[3]=e=>k.value=e),label:"Slow Call Duration Threshold (in ms):"},null,8,["modelValue"])]),t("div",Z,[a(h,{modelValue:u.value,"onUpdate:modelValue":s[4]||(s[4]=e=>u.value=e),label:"Slow Call Rate Threshold (in %):"},null,8,["modelValue"])]),t("div",ss,[a(h,{modelValue:g.value,"onUpdate:modelValue":s[5]||(s[5]=e=>g.value=e),label:"Number of calls in Half Open State:"},null,8,["modelValue"])]),t("div",ts,[a(h,{modelValue:o.value,"onUpdate:modelValue":s[6]||(s[6]=e=>o.value=e),label:"Delay to stay in Open State (in ms):"},null,8,["modelValue"])]),t("div",es,[a(h,{modelValue:p.value,"onUpdate:modelValue":s[7]||(s[7]=e=>p.value=e),label:"Max Delay to stay in Half Open State (in ms):"},null,8,["modelValue"])])]),t("div",is,[t("div",as,[s[8]||(s[8]=t("label",null,"State:",-1)),t("div",{class:"bullet",style:q({backgroundColor:y.value})},null,4),t("span",null,W(C.value),1)]),t("div",ls,[a(R,{class:"internal",modelValue:E.value,color:y.value,max:m.value,label:"Breaker Duration:"},null,8,["modelValue","color","max"])])])])]),_:1},8,["circuit"])]))}}),hs=U(ns,[["__scopeId","data-v-e97ac7b4"]]),us=JSON.parse('{"title":"Sliding Count","description":"","frontmatter":{},"headers":[],"relativePath":"guide/api/modules/breaker/sliding-count.md","filePath":"guide/api/modules/breaker/sliding-count.md"}'),rs={name:"guide/api/modules/breaker/sliding-count.md"},gs=Object.assign(rs,{setup(_){return(D,n)=>{const d=z("ClientOnly");return A(),F("div",null,[n[0]||(n[0]=t("h1",{id:"sliding-count",tabindex:"-1"},[j("Sliding Count "),t("a",{class:"header-anchor",href:"#sliding-count","aria-label":'Permalink to "Sliding Count"'},"​")],-1)),a(d,null,{default:S(()=>[a(hs)]),_:1}),n[1]||(n[1]=L(`<h2 id="usage" tabindex="-1">Usage <a class="header-anchor" href="#usage" aria-label="Permalink to &quot;Usage&quot;">​</a></h2><p>The Circuit Breaker has 3 possible states:</p><ul><li><code>CLOSED</code></li><li><code>OPEN</code></li><li><code>HALF_OPEN</code></li></ul><p>When the circuit is opened, all the iterations are failing fast</p><p>When the circuit is half opened, a certain number of iterations are authorized. When this number is reached, the failure and slow call rate thresholds are checked to see if the circuit should be opened or closed.</p><p>When the circuit is closed, a sliding window is used to store the outcome of calls. The count-based sliding window calculates the outcome of the last N calls, and decides if the circuit should be opened (if the failure or slow call rate thresholds are exceeded) For example, if the count window size is 10, the circular array has always 10 measurements.</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> *</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> as</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Mollitia </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;mollitia&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Creates a circuit</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> circuit</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Mollitia.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Circuit</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  name: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;my-circuit&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  options: {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    modules: [</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">			// Creates Sliding Count Breaker Module</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">			new</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Mollitia.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">SlidingCountBreaker</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">				name: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;my-sliding-count-breaker&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">				slidingWindowSize: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">6</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Failure Rate Calculation is done on the last 6 iterations</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">				minimumNumberOfCalls: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 3 iterations are needed to start calculating the failure rate, and see if circuit should be opened or not</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">				failureRateThreshold: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">50</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// If half of the iterations or more are failing, the circuit is switched to Opened state.</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">				slowCallDurationThreshold: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1000</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// An iteration is considered as being slow if the iteration lasts more than 1s</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">				slowCallRateThreshold: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">80</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// If at least 80% of the iterations are considered as being slow, the circuit is switched to Opened state.</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">				permittedNumberOfCallsInHalfOpenState: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// When the circuit is in Half Opened state, the circuit accepts 2 iterations in this state.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">				// Once these 2 iterations are received, failure rate is calculated on these iterations.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">				// If failure rate is lower than failureRateThreshold, the circuit is switched to Closed state.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">				// If the failure rate is higher or equal to failureRateThreshold, the circuit is switched to Opened state.</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">				openStateDelay: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">10000</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // The circuit stays in Opened state for 10s</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">			})</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">		]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">});</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">await</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> circuit.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">fn</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(myFunction).</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">execute</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">await</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> circuit.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">fn</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(myFunction2).</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">execute</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// When this 3rd iteration is received, failureRate and slowCallRate is calculated</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// If the 3 iterations lasts less than 1s and are all success, then the circuit is still closed</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// The circuit is opened if:</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">//   - at least 2 iterations failed (failure rate is 66% (2 iterations failing) or 100% (3 iterations failing), which is &gt; 50 (failureRateThreshold))</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">//   - or all the iterations are slow (as slowCallRateThreshold is 80%)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">await</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> circuit.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">fn</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(myFunction3).</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">execute</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// If</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">//   - circuit is still closed, then the failure rate and slow call rate threshold will be calculated when a new iteration is received</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">//   - circuit is opened, then the iterations are failing fast</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Here, 4th iteration received. Calculation will be done on the 4th iterations</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">await</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> circuit.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">fn</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(myFunction4).</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">execute</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Here, 5th iteration received. Calculation will be done on the 4 iterations</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">await</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> circuit.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">fn</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(myFunction5).</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">execute</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Here, 6th iteration received. Calculation will be done on the 6 iterations</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">await</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> circuit.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">fn</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(myFunction6).</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">execute</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Here, number of iterations is 7. So, the 1st iteration is no longer taken into account and the calculation is done on iterations 2 to 7 </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">await</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> circuit.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">fn</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(myFunction7).</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">execute</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span></code></pre></div><p><img src="`+B+'" alt="Circuit Breaker - Diagram"></p><h2 id="api-reference" tabindex="-1">API Reference <a class="header-anchor" href="#api-reference" aria-label="Permalink to &quot;API Reference&quot;">​</a></h2><h3 id="options" tabindex="-1">Options <a class="header-anchor" href="#options" aria-label="Permalink to &quot;Options&quot;">​</a></h3><table tabindex="0"><thead><tr><th style="text-align:left;">Name</th><th style="text-align:left;">Description</th><th style="text-align:left;">Default</th></tr></thead><tbody><tr><td style="text-align:left;"><code>state</code></td><td style="text-align:left;">Specifies the circuit state</td><td style="text-align:left;"><code>CLOSED</code></td></tr><tr><td style="text-align:left;"><code>failureRateThreshold</code></td><td style="text-align:left;">Specifies the failure rate threshold in percentage</td><td style="text-align:left;"><code>50</code></td></tr><tr><td style="text-align:left;"><code>slowCallRateThreshold</code></td><td style="text-align:left;">Specifies the slow duration threshold. A call is considered <strong>slow</strong> when duration <code>&gt;=</code> than <code>slowCallDurationThreshold</code></td><td style="text-align:left;"><code>100</code></td></tr><tr><td style="text-align:left;"><code>slowCallDurationThreshold</code></td><td style="text-align:left;">Specifies the duration (in ms) threshold above which calls are considered as slow</td><td style="text-align:left;"><code>60000</code></td></tr><tr><td style="text-align:left;"><code>permittedNumberOfCallsInHalfOpenState</code></td><td style="text-align:left;">Specifies the number of permitted calls when the circuit is half open</td><td style="text-align:left;"><code>2</code></td></tr><tr><td style="text-align:left;"><code>halfOpenStateMaxDelay</code></td><td style="text-align:left;">Specifies the maximum wait (in ms) in Half Open State, before switching back to open. 0 deactivates this</td><td style="text-align:left;"><code>0</code></td></tr><tr><td style="text-align:left;"><code>slidingWindowSize</code></td><td style="text-align:left;">Specifies the maximum number of calls used to calculate failure and slow call rate percentages</td><td style="text-align:left;"><code>10</code></td></tr><tr><td style="text-align:left;"><code>minimumNumberOfCalls</code></td><td style="text-align:left;">Specifies the minimum number of calls used to calculate failure and slow call rate percentages</td><td style="text-align:left;"><code>10</code></td></tr><tr><td style="text-align:left;"><code>openStateDelay</code></td><td style="text-align:left;">Specifies the time (in ms) the circuit stay opened before switching to half-open</td><td style="text-align:left;"><code>60000</code></td></tr><tr><td style="text-align:left;"><code>onError</code></td><td style="text-align:left;">Allows filtering of the error to report as a failure or not.</td><td style="text-align:left;"><code>None</code></td></tr></tbody></table><h3 id="methods" tabindex="-1">Methods <a class="header-anchor" href="#methods" aria-label="Permalink to &quot;Methods&quot;">​</a></h3><table tabindex="0"><thead><tr><th style="text-align:left;">Name</th><th style="text-align:left;">Description</th><th style="text-align:left;">Returns</th></tr></thead><tbody><tr><td style="text-align:left;"><code>getExecParams()</code></td><td style="text-align:left;">Returns the circuit function parameters.</td><td style="text-align:left;"><code>any[]</code> <strong>params</strong></td></tr></tbody></table><h3 id="events" tabindex="-1">Events <a class="header-anchor" href="#events" aria-label="Permalink to &quot;Events&quot;">​</a></h3><table tabindex="0"><thead><tr><th style="text-align:left;">Name</th><th style="text-align:left;">Description</th><th style="text-align:left;">Params</th></tr></thead><tbody><tr><td style="text-align:left;"><code>execute</code></td><td style="text-align:left;">Called when the module is executed.</td><td style="text-align:left;"><code>Mollitia.Circuit</code> <strong>circuit</strong>, <code>Promise&lt;T&gt;</code> <strong>promise</strong>, <code>any[]</code> <strong>params</strong></td></tr><tr><td style="text-align:left;"><code>state-changed</code></td><td style="text-align:left;">Called when the breaker state changes.</td><td style="text-align:left;"><code>Mollitia.BreakerState</code> <strong>state</strong></td></tr></tbody></table>',15))])}}});export{us as __pageData,gs as default};
