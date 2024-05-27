import{t as v,V as F,N as u,C}from"./chunks/circuit.96ad7feb.js";import{B as f}from"./chunks/bullets.5c04df7c.js";import{d as q,h as t,x as d,j as A,z as k,o as m,c as g,H as n,w as b,k as s,l as B,_ as D,C as w,a as i,Q as V}from"./chunks/framework.b96a75df.js";import"./chunks/theme.a2ff1341.js";const M={class:"bulkhead"},P={class:"content"},S={class:"form"},T={class:"row"},z={class:"row"},Q={class:"row"},W={class:"visualization"},N={class:"row"},O={class:"row"},j=q({__name:"bulkhead",setup(_){const y=t(null),a=t(5),o=t(4),p=t(3e3),E=t([]),h=t([]),e=new v({concurrentSize:a.value,queueSize:o.value,maxQueueWait:p.value}),x=new F({options:{modules:[e]}});d([a],()=>{e.concurrentSize=a.value}),d([a],()=>{e.queueSize=a.value}),d([p],()=>{e.maxQueueWait=p.value});function c(){E.value=e.concurrentBuffer.map(()=>"var(--vp-c-brand-2)"),h.value=e.queueBuffer.map(()=>"var(--vp-c-green-2)")}return A(()=>{e.on("update-concurrent-buffer",c),e.on("update-queue-buffer",c)}),k(()=>{e.off("update-concurrent-buffer",c),e.off("update-queue-buffer",c)}),(H,l)=>(m(),g("div",M,[n(C,{ref_key:"circuitRef",ref:y,circuit:B(x),duration:2e3},{default:b(()=>[s("div",P,[s("div",S,[s("div",T,[n(u,{modelValue:a.value,"onUpdate:modelValue":l[0]||(l[0]=r=>a.value=r),label:"Concurrent Size:"},null,8,["modelValue"])]),s("div",z,[n(u,{modelValue:o.value,"onUpdate:modelValue":l[1]||(l[1]=r=>o.value=r),label:"Queue Size:"},null,8,["modelValue"])]),s("div",Q,[n(u,{modelValue:p.value,"onUpdate:modelValue":l[2]||(l[2]=r=>p.value=r),label:"Max Wait (in ms):"},null,8,["modelValue"])])]),s("div",W,[s("div",N,[n(f,{class:"concurrent",modelValue:E.value,label:"Concurrent:"},null,8,["modelValue"])]),s("div",O,[n(f,{class:"queue",modelValue:h.value,label:"Queue:"},null,8,["modelValue"])])])])]),_:1},8,["circuit"])]))}});const I=D(j,[["__scopeId","data-v-291e1154"]]),R=s("h1",{id:"bulkhead",tabindex:"-1"},[i("Bulkhead "),s("a",{class:"header-anchor",href:"#bulkhead","aria-label":'Permalink to "Bulkhead"'},"​")],-1),U=s("p",null,[i("The "),s("code",null,"Bulkhead"),i(" module allows you to "),s("strong",null,"limit"),i(" concurrent executions of your circuit.")],-1),$=V(`<h2 id="usage" tabindex="-1">Usage <a class="header-anchor" href="#usage" aria-label="Permalink to &quot;Usage&quot;">​</a></h2><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#F97583;">import</span><span style="color:#E1E4E8;"> </span><span style="color:#79B8FF;">*</span><span style="color:#E1E4E8;"> </span><span style="color:#F97583;">as</span><span style="color:#E1E4E8;"> Mollitia </span><span style="color:#F97583;">from</span><span style="color:#E1E4E8;"> </span><span style="color:#9ECBFF;">&#39;mollitia&#39;</span><span style="color:#E1E4E8;">;</span></span>
<span class="line"><span style="color:#6A737D;">// Creates a circuit</span></span>
<span class="line"><span style="color:#F97583;">const</span><span style="color:#E1E4E8;"> </span><span style="color:#79B8FF;">circuit</span><span style="color:#E1E4E8;"> </span><span style="color:#F97583;">=</span><span style="color:#E1E4E8;"> </span><span style="color:#F97583;">new</span><span style="color:#E1E4E8;"> Mollitia.</span><span style="color:#B392F0;">Circuit</span><span style="color:#E1E4E8;">({</span></span>
<span class="line"><span style="color:#E1E4E8;">  options: {</span></span>
<span class="line"><span style="color:#E1E4E8;">    modules: [</span></span>
<span class="line"><span style="color:#E1E4E8;">      </span><span style="color:#6A737D;">// Creates a bulkhead module</span></span>
<span class="line"><span style="color:#E1E4E8;">      </span><span style="color:#F97583;">new</span><span style="color:#E1E4E8;"> Mollitia.</span><span style="color:#B392F0;">Bulkhead</span><span style="color:#E1E4E8;">({</span></span>
<span class="line"><span style="color:#E1E4E8;">        concurrentSize: </span><span style="color:#79B8FF;">2</span><span style="color:#E1E4E8;">, </span><span style="color:#6A737D;">// Allows 2 concurrent requests, if reached, goes in a queue.</span></span>
<span class="line"><span style="color:#E1E4E8;">        queueSize: </span><span style="color:#79B8FF;">2</span><span style="color:#E1E4E8;">, </span><span style="color:#6A737D;">// Allows 2 requests to be in queue, if reached, it will be rejected with a BulkheadOverloadError.</span></span>
<span class="line"><span style="color:#E1E4E8;">        maxQueueWait: </span><span style="color:#79B8FF;">30000</span><span style="color:#E1E4E8;"> </span><span style="color:#6A737D;">// After 30 seconds waiting, a queued request will be rejected with a BulkheadQueueWaitError.</span></span>
<span class="line"><span style="color:#E1E4E8;">      })</span></span>
<span class="line"><span style="color:#E1E4E8;">    ]</span></span>
<span class="line"><span style="color:#E1E4E8;">  }</span></span>
<span class="line"><span style="color:#E1E4E8;">});</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6A737D;">// Let&#39;s say this function is running multiple times in a relatively short amount of time</span></span>
<span class="line"><span style="color:#E1E4E8;">circuit.</span><span style="color:#B392F0;">fn</span><span style="color:#E1E4E8;">(myFunction).</span><span style="color:#B392F0;">execute</span><span style="color:#E1E4E8;">()</span></span>
<span class="line"><span style="color:#E1E4E8;">  .</span><span style="color:#B392F0;">then</span><span style="color:#E1E4E8;">(() </span><span style="color:#F97583;">=&gt;</span><span style="color:#E1E4E8;"> {</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span><span style="color:#6A737D;">// The succeed normally (directly, or has been in a queue)</span></span>
<span class="line"><span style="color:#E1E4E8;">  })</span></span>
<span class="line"><span style="color:#E1E4E8;">  .</span><span style="color:#B392F0;">catch</span><span style="color:#E1E4E8;">((</span><span style="color:#FFAB70;">err</span><span style="color:#E1E4E8;">) </span><span style="color:#F97583;">=&gt;</span><span style="color:#E1E4E8;"> {</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span><span style="color:#F97583;">if</span><span style="color:#E1E4E8;"> (err </span><span style="color:#F97583;">instanceof</span><span style="color:#E1E4E8;"> </span><span style="color:#B392F0;">Mollitia</span><span style="color:#E1E4E8;">.</span><span style="color:#B392F0;">BulkheadOverloadError</span><span style="color:#E1E4E8;">) {</span></span>
<span class="line"><span style="color:#E1E4E8;">      </span><span style="color:#6A737D;">// When the function has been called, the concurrent methods are at maximum, and the queue is full.</span></span>
<span class="line"><span style="color:#E1E4E8;">    } </span><span style="color:#F97583;">else</span><span style="color:#E1E4E8;"> </span><span style="color:#F97583;">if</span><span style="color:#E1E4E8;"> (err </span><span style="color:#F97583;">instanceof</span><span style="color:#E1E4E8;"> </span><span style="color:#B392F0;">Mollitia</span><span style="color:#E1E4E8;">.</span><span style="color:#B392F0;">BulkheadQueueWaitError</span><span style="color:#E1E4E8;">) {</span></span>
<span class="line"><span style="color:#E1E4E8;">      </span><span style="color:#6A737D;">// The function has been waiting too long in queue (more than 30 seconds).</span></span>
<span class="line"><span style="color:#E1E4E8;">    }</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span><span style="color:#6A737D;">// It failed normally (directly, or has been in a queue)</span></span>
<span class="line"><span style="color:#E1E4E8;">  });</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#D73A49;">import</span><span style="color:#24292E;"> </span><span style="color:#005CC5;">*</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">as</span><span style="color:#24292E;"> Mollitia </span><span style="color:#D73A49;">from</span><span style="color:#24292E;"> </span><span style="color:#032F62;">&#39;mollitia&#39;</span><span style="color:#24292E;">;</span></span>
<span class="line"><span style="color:#6A737D;">// Creates a circuit</span></span>
<span class="line"><span style="color:#D73A49;">const</span><span style="color:#24292E;"> </span><span style="color:#005CC5;">circuit</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">=</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">new</span><span style="color:#24292E;"> Mollitia.</span><span style="color:#6F42C1;">Circuit</span><span style="color:#24292E;">({</span></span>
<span class="line"><span style="color:#24292E;">  options: {</span></span>
<span class="line"><span style="color:#24292E;">    modules: [</span></span>
<span class="line"><span style="color:#24292E;">      </span><span style="color:#6A737D;">// Creates a bulkhead module</span></span>
<span class="line"><span style="color:#24292E;">      </span><span style="color:#D73A49;">new</span><span style="color:#24292E;"> Mollitia.</span><span style="color:#6F42C1;">Bulkhead</span><span style="color:#24292E;">({</span></span>
<span class="line"><span style="color:#24292E;">        concurrentSize: </span><span style="color:#005CC5;">2</span><span style="color:#24292E;">, </span><span style="color:#6A737D;">// Allows 2 concurrent requests, if reached, goes in a queue.</span></span>
<span class="line"><span style="color:#24292E;">        queueSize: </span><span style="color:#005CC5;">2</span><span style="color:#24292E;">, </span><span style="color:#6A737D;">// Allows 2 requests to be in queue, if reached, it will be rejected with a BulkheadOverloadError.</span></span>
<span class="line"><span style="color:#24292E;">        maxQueueWait: </span><span style="color:#005CC5;">30000</span><span style="color:#24292E;"> </span><span style="color:#6A737D;">// After 30 seconds waiting, a queued request will be rejected with a BulkheadQueueWaitError.</span></span>
<span class="line"><span style="color:#24292E;">      })</span></span>
<span class="line"><span style="color:#24292E;">    ]</span></span>
<span class="line"><span style="color:#24292E;">  }</span></span>
<span class="line"><span style="color:#24292E;">});</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6A737D;">// Let&#39;s say this function is running multiple times in a relatively short amount of time</span></span>
<span class="line"><span style="color:#24292E;">circuit.</span><span style="color:#6F42C1;">fn</span><span style="color:#24292E;">(myFunction).</span><span style="color:#6F42C1;">execute</span><span style="color:#24292E;">()</span></span>
<span class="line"><span style="color:#24292E;">  .</span><span style="color:#6F42C1;">then</span><span style="color:#24292E;">(() </span><span style="color:#D73A49;">=&gt;</span><span style="color:#24292E;"> {</span></span>
<span class="line"><span style="color:#24292E;">    </span><span style="color:#6A737D;">// The succeed normally (directly, or has been in a queue)</span></span>
<span class="line"><span style="color:#24292E;">  })</span></span>
<span class="line"><span style="color:#24292E;">  .</span><span style="color:#6F42C1;">catch</span><span style="color:#24292E;">((</span><span style="color:#E36209;">err</span><span style="color:#24292E;">) </span><span style="color:#D73A49;">=&gt;</span><span style="color:#24292E;"> {</span></span>
<span class="line"><span style="color:#24292E;">    </span><span style="color:#D73A49;">if</span><span style="color:#24292E;"> (err </span><span style="color:#D73A49;">instanceof</span><span style="color:#24292E;"> </span><span style="color:#6F42C1;">Mollitia</span><span style="color:#24292E;">.</span><span style="color:#6F42C1;">BulkheadOverloadError</span><span style="color:#24292E;">) {</span></span>
<span class="line"><span style="color:#24292E;">      </span><span style="color:#6A737D;">// When the function has been called, the concurrent methods are at maximum, and the queue is full.</span></span>
<span class="line"><span style="color:#24292E;">    } </span><span style="color:#D73A49;">else</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">if</span><span style="color:#24292E;"> (err </span><span style="color:#D73A49;">instanceof</span><span style="color:#24292E;"> </span><span style="color:#6F42C1;">Mollitia</span><span style="color:#24292E;">.</span><span style="color:#6F42C1;">BulkheadQueueWaitError</span><span style="color:#24292E;">) {</span></span>
<span class="line"><span style="color:#24292E;">      </span><span style="color:#6A737D;">// The function has been waiting too long in queue (more than 30 seconds).</span></span>
<span class="line"><span style="color:#24292E;">    }</span></span>
<span class="line"><span style="color:#24292E;">    </span><span style="color:#6A737D;">// It failed normally (directly, or has been in a queue)</span></span>
<span class="line"><span style="color:#24292E;">  });</span></span></code></pre></div><h2 id="api-reference" tabindex="-1">API Reference <a class="header-anchor" href="#api-reference" aria-label="Permalink to &quot;API Reference&quot;">​</a></h2><h3 id="options" tabindex="-1">Options <a class="header-anchor" href="#options" aria-label="Permalink to &quot;Options&quot;">​</a></h3><table><thead><tr><th style="text-align:left;">Name</th><th style="text-align:left;">Description</th><th style="text-align:left;">Default</th></tr></thead><tbody><tr><td style="text-align:left;"><code>concurrentSize</code></td><td style="text-align:left;">The number of concurrent requests that can be running in parallel.</td><td style="text-align:left;"><code>10</code></td></tr><tr><td style="text-align:left;"><code>queueSize</code></td><td style="text-align:left;">The number of requests that can be queued.</td><td style="text-align:left;"><code>10</code></td></tr><tr><td style="text-align:left;"><code>maxQueueWait</code></td><td style="text-align:left;">The amount of time before a queued request is rejected.</td><td style="text-align:left;"><code>60000</code></td></tr></tbody></table><h3 id="methods" tabindex="-1">Methods <a class="header-anchor" href="#methods" aria-label="Permalink to &quot;Methods&quot;">​</a></h3><table><thead><tr><th style="text-align:left;">Name</th><th style="text-align:left;">Description</th><th style="text-align:left;">Returns</th></tr></thead><tbody><tr><td style="text-align:left;"><code>getExecParams()</code></td><td style="text-align:left;">Returns the circuit function parameters.</td><td style="text-align:left;"><code>any[]</code> <strong>params</strong></td></tr></tbody></table><h3 id="events" tabindex="-1">Events <a class="header-anchor" href="#events" aria-label="Permalink to &quot;Events&quot;">​</a></h3><table><thead><tr><th style="text-align:left;">Name</th><th style="text-align:left;">Description</th><th style="text-align:left;">Params</th></tr></thead><tbody><tr><td style="text-align:left;"><code>execute</code></td><td style="text-align:left;">Called when the module is executed.</td><td style="text-align:left;"><code>Mollitia.Circuit</code> <strong>circuit</strong>, <code>Promise&lt;T&gt;</code> <strong>promise</strong>, <code>any[]</code> <strong>params</strong></td></tr><tr><td style="text-align:left;"><code>update-concurrent-buffer</code></td><td style="text-align:left;">Called when the concurrent buffer is updated.</td><td style="text-align:left;"><code>Mollitia.Circuit</code> <strong>circuit</strong>, <code>BufferedPromise[]</code> <strong>buffer</strong></td></tr><tr><td style="text-align:left;"><code>update-queue-buffer</code></td><td style="text-align:left;">Called when the queue buffer is updated.</td><td style="text-align:left;"><code>Mollitia.Circuit</code> <strong>circuit</strong>, <code>BufferedPromise[]</code> <strong>buffer</strong></td></tr></tbody></table>`,9),Y=JSON.parse('{"title":"Bulkhead","description":"","frontmatter":{},"headers":[],"relativePath":"guide/api/modules/bulkhead.md","filePath":"guide/api/modules/bulkhead.md"}'),L={name:"guide/api/modules/bulkhead.md"},Z=Object.assign(L,{setup(_){return(y,a)=>{const o=w("ClientOnly");return m(),g("div",null,[R,U,n(o,null,{default:b(()=>[n(I)]),_:1}),$])}}});export{Y as __pageData,Z as default};
