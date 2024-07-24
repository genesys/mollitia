import{_ as s,o as a,c as n,Q as l}from"./chunks/framework.2ce6f3f6.js";const u=JSON.parse('{"title":"Redis","description":"","frontmatter":{},"headers":[],"relativePath":"guide/customization/addons/redis.md","filePath":"guide/customization/addons/redis.md"}'),e={name:"guide/customization/addons/redis.md"},o=l(`<h1 id="redis" tabindex="-1">Redis <a class="header-anchor" href="#redis" aria-label="Permalink to &quot;Redis&quot;">​</a></h1><p>The <code>Mollitia</code> <a href="https://redis.io/" target="_blank" rel="noreferrer">Redis</a> addon adds redis for some modules of every circuit. The list of modules coming with redis support are Ratelimit, SlidingCountBreaker and SlidingTimeBreaker.</p><h2 id="quick-start" tabindex="-1">Quick Start <a class="header-anchor" href="#quick-start" aria-label="Permalink to &quot;Quick Start&quot;">​</a></h2><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#6A737D;"># Install mollitia</span></span>
<span class="line"><span style="color:#B392F0;">npm</span><span style="color:#E1E4E8;"> </span><span style="color:#9ECBFF;">install</span><span style="color:#E1E4E8;"> </span><span style="color:#9ECBFF;">mollitia</span><span style="color:#E1E4E8;"> </span><span style="color:#79B8FF;">--save</span></span>
<span class="line"><span style="color:#6A737D;"># Install Redis and the Redis addon</span></span>
<span class="line"><span style="color:#B392F0;">npm</span><span style="color:#E1E4E8;"> </span><span style="color:#9ECBFF;">install</span><span style="color:#E1E4E8;"> </span><span style="color:#9ECBFF;">@mollitia/redis</span><span style="color:#E1E4E8;"> </span><span style="color:#9ECBFF;">redis</span><span style="color:#E1E4E8;"> </span><span style="color:#79B8FF;">--save</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#6A737D;"># Install mollitia</span></span>
<span class="line"><span style="color:#6F42C1;">npm</span><span style="color:#24292E;"> </span><span style="color:#032F62;">install</span><span style="color:#24292E;"> </span><span style="color:#032F62;">mollitia</span><span style="color:#24292E;"> </span><span style="color:#005CC5;">--save</span></span>
<span class="line"><span style="color:#6A737D;"># Install Redis and the Redis addon</span></span>
<span class="line"><span style="color:#6F42C1;">npm</span><span style="color:#24292E;"> </span><span style="color:#032F62;">install</span><span style="color:#24292E;"> </span><span style="color:#032F62;">@mollitia/redis</span><span style="color:#24292E;"> </span><span style="color:#032F62;">redis</span><span style="color:#24292E;"> </span><span style="color:#005CC5;">--save</span></span></code></pre></div><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#6A737D;">// Then add the addon</span></span>
<span class="line"><span style="color:#F97583;">import</span><span style="color:#E1E4E8;"> </span><span style="color:#79B8FF;">*</span><span style="color:#E1E4E8;"> </span><span style="color:#F97583;">as</span><span style="color:#E1E4E8;"> Mollitia </span><span style="color:#F97583;">from</span><span style="color:#E1E4E8;"> </span><span style="color:#9ECBFF;">&#39;mollitia&#39;</span><span style="color:#E1E4E8;">;</span></span>
<span class="line"><span style="color:#F97583;">import</span><span style="color:#E1E4E8;"> { RedisAddon } </span><span style="color:#F97583;">from</span><span style="color:#E1E4E8;"> </span><span style="color:#9ECBFF;">&#39;@mollitia/redis&#39;</span><span style="color:#E1E4E8;">;</span></span>
<span class="line"><span style="color:#6A737D;">// Adds the Redis addon to Mollitia</span></span>
<span class="line"><span style="color:#E1E4E8;">Mollitia.</span><span style="color:#B392F0;">use</span><span style="color:#E1E4E8;">(</span></span>
<span class="line"><span style="color:#E1E4E8;">  </span><span style="color:#F97583;">new</span><span style="color:#E1E4E8;"> </span><span style="color:#B392F0;">RedisAddon</span><span style="color:#E1E4E8;">({ </span></span>
<span class="line"><span style="color:#E1E4E8;">    host: &lt;</span><span style="color:#B392F0;">Redis</span><span style="color:#E1E4E8;"> </span><span style="color:#B392F0;">hostName</span><span style="color:#E1E4E8;">&gt;, </span></span>
<span class="line"><span style="color:#E1E4E8;">    port: &lt;</span><span style="color:#B392F0;">Redis</span><span style="color:#E1E4E8;"> </span><span style="color:#B392F0;">Port</span><span style="color:#E1E4E8;">&gt;,</span></span>
<span class="line"><span style="color:#E1E4E8;">    password: &lt;</span><span style="color:#B392F0;">Redis</span><span style="color:#E1E4E8;"> </span><span style="color:#B392F0;">Password</span><span style="color:#E1E4E8;">&gt; </span></span>
<span class="line"><span style="color:#E1E4E8;">  })</span></span>
<span class="line"><span style="color:#E1E4E8;">);</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#6A737D;">// Then add the addon</span></span>
<span class="line"><span style="color:#D73A49;">import</span><span style="color:#24292E;"> </span><span style="color:#005CC5;">*</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">as</span><span style="color:#24292E;"> Mollitia </span><span style="color:#D73A49;">from</span><span style="color:#24292E;"> </span><span style="color:#032F62;">&#39;mollitia&#39;</span><span style="color:#24292E;">;</span></span>
<span class="line"><span style="color:#D73A49;">import</span><span style="color:#24292E;"> { RedisAddon } </span><span style="color:#D73A49;">from</span><span style="color:#24292E;"> </span><span style="color:#032F62;">&#39;@mollitia/redis&#39;</span><span style="color:#24292E;">;</span></span>
<span class="line"><span style="color:#6A737D;">// Adds the Redis addon to Mollitia</span></span>
<span class="line"><span style="color:#24292E;">Mollitia.</span><span style="color:#6F42C1;">use</span><span style="color:#24292E;">(</span></span>
<span class="line"><span style="color:#24292E;">  </span><span style="color:#D73A49;">new</span><span style="color:#24292E;"> </span><span style="color:#6F42C1;">RedisAddon</span><span style="color:#24292E;">({ </span></span>
<span class="line"><span style="color:#24292E;">    host: &lt;</span><span style="color:#6F42C1;">Redis</span><span style="color:#24292E;"> </span><span style="color:#6F42C1;">hostName</span><span style="color:#24292E;">&gt;, </span></span>
<span class="line"><span style="color:#24292E;">    port: &lt;</span><span style="color:#6F42C1;">Redis</span><span style="color:#24292E;"> </span><span style="color:#6F42C1;">Port</span><span style="color:#24292E;">&gt;,</span></span>
<span class="line"><span style="color:#24292E;">    password: &lt;</span><span style="color:#6F42C1;">Redis</span><span style="color:#24292E;"> </span><span style="color:#6F42C1;">Password</span><span style="color:#24292E;">&gt; </span></span>
<span class="line"><span style="color:#24292E;">  })</span></span>
<span class="line"><span style="color:#24292E;">);</span></span></code></pre></div><p>Then, add <code>redis</code> options when creating modules. Redis is only available for Ratelimit, SlidingCountBreaker or SlidingTimeBreaker module.</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#F97583;">const</span><span style="color:#E1E4E8;"> </span><span style="color:#79B8FF;">rateLimitModule</span><span style="color:#E1E4E8;"> </span><span style="color:#F97583;">=</span><span style="color:#E1E4E8;"> </span><span style="color:#F97583;">new</span><span style="color:#E1E4E8;"> Mollitia.</span><span style="color:#B392F0;">Ratelimit</span><span style="color:#E1E4E8;">({</span></span>
<span class="line"><span style="color:#E1E4E8;">  name: </span><span style="color:#9ECBFF;">&#39;myRateLimitModule&#39;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">  limitForPeriod: </span><span style="color:#79B8FF;">2</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">  limitPeriod: </span><span style="color:#79B8FF;">20000</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">  redis: {</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span><span style="color:#6A737D;">// Setting redis.use to true indicates Redis should be used</span></span>
<span class="line"><span style="color:#E1E4E8;">    use: </span><span style="color:#79B8FF;">true</span></span>
<span class="line"><span style="color:#E1E4E8;">  }</span></span>
<span class="line"><span style="color:#E1E4E8;">};</span></span>
<span class="line"><span style="color:#6A737D;">// Creates a circuit</span></span>
<span class="line"><span style="color:#E1E4E8;">const myCircuit </span><span style="color:#F97583;">=</span><span style="color:#E1E4E8;"> </span><span style="color:#F97583;">new</span><span style="color:#E1E4E8;"> Mollitia.</span><span style="color:#B392F0;">Circuit</span><span style="color:#E1E4E8;">({</span></span>
<span class="line"><span style="color:#E1E4E8;">  </span><span style="color:#6A737D;">// Initializes a circuit with a handler</span></span>
<span class="line"><span style="color:#E1E4E8;">  func: yourFunction,</span></span>
<span class="line"><span style="color:#E1E4E8;">  options: {</span></span>
<span class="line"><span style="color:#E1E4E8;">    modules: [</span></span>
<span class="line"><span style="color:#E1E4E8;">      rateLimit: rateLimitModule</span></span>
<span class="line"><span style="color:#E1E4E8;">    ]</span></span>
<span class="line"><span style="color:#E1E4E8;">  }</span></span>
<span class="line"><span style="color:#E1E4E8;">});</span></span>
<span class="line"><span style="color:#6A737D;">// This will execute yourFunction(&#39;dummy&#39;)</span></span>
<span class="line"><span style="color:#F97583;">await</span><span style="color:#E1E4E8;"> myCircuit.</span><span style="color:#B392F0;">execute</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;dummy&#39;</span><span style="color:#E1E4E8;">);</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#D73A49;">const</span><span style="color:#24292E;"> </span><span style="color:#005CC5;">rateLimitModule</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">=</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">new</span><span style="color:#24292E;"> Mollitia.</span><span style="color:#6F42C1;">Ratelimit</span><span style="color:#24292E;">({</span></span>
<span class="line"><span style="color:#24292E;">  name: </span><span style="color:#032F62;">&#39;myRateLimitModule&#39;</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">  limitForPeriod: </span><span style="color:#005CC5;">2</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">  limitPeriod: </span><span style="color:#005CC5;">20000</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">  redis: {</span></span>
<span class="line"><span style="color:#24292E;">    </span><span style="color:#6A737D;">// Setting redis.use to true indicates Redis should be used</span></span>
<span class="line"><span style="color:#24292E;">    use: </span><span style="color:#005CC5;">true</span></span>
<span class="line"><span style="color:#24292E;">  }</span></span>
<span class="line"><span style="color:#24292E;">};</span></span>
<span class="line"><span style="color:#6A737D;">// Creates a circuit</span></span>
<span class="line"><span style="color:#24292E;">const myCircuit </span><span style="color:#D73A49;">=</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">new</span><span style="color:#24292E;"> Mollitia.</span><span style="color:#6F42C1;">Circuit</span><span style="color:#24292E;">({</span></span>
<span class="line"><span style="color:#24292E;">  </span><span style="color:#6A737D;">// Initializes a circuit with a handler</span></span>
<span class="line"><span style="color:#24292E;">  func: yourFunction,</span></span>
<span class="line"><span style="color:#24292E;">  options: {</span></span>
<span class="line"><span style="color:#24292E;">    modules: [</span></span>
<span class="line"><span style="color:#24292E;">      rateLimit: rateLimitModule</span></span>
<span class="line"><span style="color:#24292E;">    ]</span></span>
<span class="line"><span style="color:#24292E;">  }</span></span>
<span class="line"><span style="color:#24292E;">});</span></span>
<span class="line"><span style="color:#6A737D;">// This will execute yourFunction(&#39;dummy&#39;)</span></span>
<span class="line"><span style="color:#D73A49;">await</span><span style="color:#24292E;"> myCircuit.</span><span style="color:#6F42C1;">execute</span><span style="color:#24292E;">(</span><span style="color:#032F62;">&#39;dummy&#39;</span><span style="color:#24292E;">);</span></span></code></pre></div><h2 id="api-reference" tabindex="-1">API Reference <a class="header-anchor" href="#api-reference" aria-label="Permalink to &quot;API Reference&quot;">​</a></h2><h3 id="options" tabindex="-1">Options <a class="header-anchor" href="#options" aria-label="Permalink to &quot;Options&quot;">​</a></h3><h4 id="when-addon-is-created" tabindex="-1">When Addon is created <a class="header-anchor" href="#when-addon-is-created" aria-label="Permalink to &quot;When Addon is created&quot;">​</a></h4><table><thead><tr><th style="text-align:left;">Name</th><th style="text-align:left;">Description</th><th style="text-align:left;">Default</th></tr></thead><tbody><tr><td style="text-align:left;"><code>getMaxDelay</code></td><td style="text-align:left;">Specifies the maximum time, in milliseconds,to get data from Redis</td><td style="text-align:left;"><code>500</code></td></tr><tr><td style="text-align:left;"><code>setMaxDelay</code></td><td style="text-align:left;">Specifies the maximum time, in milliseconds,to set data to Redis</td><td style="text-align:left;"><code>500</code></td></tr><tr><td style="text-align:left;"><code>ttl</code></td><td style="text-align:left;">Specifies the maximum duration, in milliseconds, the data stays in Redis</td><td style="text-align:left;"><code>0</code></td></tr></tbody></table><h4 id="at-module-level" tabindex="-1">At module level <a class="header-anchor" href="#at-module-level" aria-label="Permalink to &quot;At module level&quot;">​</a></h4><table><thead><tr><th style="text-align:left;">Name</th><th style="text-align:left;">Description</th><th style="text-align:left;">Default</th></tr></thead><tbody><tr><td style="text-align:left;"><code>use</code></td><td style="text-align:left;">Specifies if the redis is used for the module</td><td style="text-align:left;"><code>false</code></td></tr><tr><td style="text-align:left;"><code>getMaxDelay</code></td><td style="text-align:left;">Specifies the maximum time, in milliseconds,to get data from Redis</td><td style="text-align:left;"><code>500</code></td></tr><tr><td style="text-align:left;"><code>setMaxDelay</code></td><td style="text-align:left;">Specifies the maximum time, in milliseconds,to set data to Redis</td><td style="text-align:left;"><code>500</code></td></tr><tr><td style="text-align:left;"><code>ttl</code></td><td style="text-align:left;">Specifies the maximum duration, in milliseconds, the data stays in Redis</td><td style="text-align:left;"><code>0</code></td></tr></tbody></table><h4 id="option-priority" tabindex="-1">Option priority <a class="header-anchor" href="#option-priority" aria-label="Permalink to &quot;Option priority&quot;">​</a></h4><p>When an option is defined both at Addon level and at module level, the option value is taken from module</p><p>Example:</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#E1E4E8;">Mollitia.</span><span style="color:#B392F0;">use</span><span style="color:#E1E4E8;">(</span><span style="color:#F97583;">new</span><span style="color:#E1E4E8;"> </span><span style="color:#B392F0;">RedisAddon</span><span style="color:#E1E4E8;">({ host: &lt;</span><span style="color:#B392F0;">Redis</span><span style="color:#E1E4E8;"> </span><span style="color:#B392F0;">hostName</span><span style="color:#E1E4E8;">&gt;, port: &lt;</span><span style="color:#B392F0;">Redis</span><span style="color:#E1E4E8;"> </span><span style="color:#B392F0;">Port</span><span style="color:#E1E4E8;">&gt;, password: &lt;</span><span style="color:#B392F0;">Redis</span><span style="color:#E1E4E8;"> </span><span style="color:#B392F0;">Password</span><span style="color:#E1E4E8;">&gt;, getMaxDelay: </span><span style="color:#79B8FF;">1000</span><span style="color:#E1E4E8;">, setMaxDelay: </span><span style="color:#79B8FF;">1000</span><span style="color:#E1E4E8;"> }));</span></span>
<span class="line"><span style="color:#F97583;">const</span><span style="color:#E1E4E8;"> </span><span style="color:#79B8FF;">rateLimitModule</span><span style="color:#E1E4E8;"> </span><span style="color:#F97583;">=</span><span style="color:#E1E4E8;"> </span><span style="color:#F97583;">new</span><span style="color:#E1E4E8;"> Mollitia.</span><span style="color:#B392F0;">Ratelimit</span><span style="color:#E1E4E8;">({</span></span>
<span class="line"><span style="color:#E1E4E8;">  name: </span><span style="color:#9ECBFF;">&#39;myRateLimitModule&#39;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">  limitForPeriod: </span><span style="color:#79B8FF;">2</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">  limitPeriod: </span><span style="color:#79B8FF;">20000</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">  redis: {</span></span>
<span class="line"><span style="color:#E1E4E8;">    use: </span><span style="color:#79B8FF;">true</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">    getMaxDelay: </span><span style="color:#79B8FF;">500</span></span>
<span class="line"><span style="color:#E1E4E8;">  }</span></span>
<span class="line"><span style="color:#E1E4E8;">};</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292E;">Mollitia.</span><span style="color:#6F42C1;">use</span><span style="color:#24292E;">(</span><span style="color:#D73A49;">new</span><span style="color:#24292E;"> </span><span style="color:#6F42C1;">RedisAddon</span><span style="color:#24292E;">({ host: &lt;</span><span style="color:#6F42C1;">Redis</span><span style="color:#24292E;"> </span><span style="color:#6F42C1;">hostName</span><span style="color:#24292E;">&gt;, port: &lt;</span><span style="color:#6F42C1;">Redis</span><span style="color:#24292E;"> </span><span style="color:#6F42C1;">Port</span><span style="color:#24292E;">&gt;, password: &lt;</span><span style="color:#6F42C1;">Redis</span><span style="color:#24292E;"> </span><span style="color:#6F42C1;">Password</span><span style="color:#24292E;">&gt;, getMaxDelay: </span><span style="color:#005CC5;">1000</span><span style="color:#24292E;">, setMaxDelay: </span><span style="color:#005CC5;">1000</span><span style="color:#24292E;"> }));</span></span>
<span class="line"><span style="color:#D73A49;">const</span><span style="color:#24292E;"> </span><span style="color:#005CC5;">rateLimitModule</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">=</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">new</span><span style="color:#24292E;"> Mollitia.</span><span style="color:#6F42C1;">Ratelimit</span><span style="color:#24292E;">({</span></span>
<span class="line"><span style="color:#24292E;">  name: </span><span style="color:#032F62;">&#39;myRateLimitModule&#39;</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">  limitForPeriod: </span><span style="color:#005CC5;">2</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">  limitPeriod: </span><span style="color:#005CC5;">20000</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">  redis: {</span></span>
<span class="line"><span style="color:#24292E;">    use: </span><span style="color:#005CC5;">true</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">    getMaxDelay: </span><span style="color:#005CC5;">500</span></span>
<span class="line"><span style="color:#24292E;">  }</span></span>
<span class="line"><span style="color:#24292E;">};</span></span></code></pre></div><p>With such configuration, getMaxDelay is 500, setMaxDelay is 1000 and ttl is 0 (not set, so using default value)</p><h4 id="additional-information-related-to-the-options" tabindex="-1">Additional information related to the options <a class="header-anchor" href="#additional-information-related-to-the-options" aria-label="Permalink to &quot;Additional information related to the options&quot;">​</a></h4><ul><li>getMaxDelay and setMaxDelay</li></ul><p>These options are available to avoid blocking the operations for a long time when Redis is slow or unavailable.</p><ul><li>ttl</li></ul><p>This option could be used to avoid keeping some keys in Redis for a long duration. Setting ttl to 0 deactivate the ttl.</p><p>Please note that this option is only applicable when Redis is used with SlidingCountBreaker module, as SlidingTimeBreaker module and Ratelimit module come with existing ttl (slidingWindowSize for SlidingCountBreaker, limitPeriod for Ratelimit).</p><p>This option is converted to a number of seconds, and rounded to the next integer.</p>`,25),t=[o];function p(i,c,r,y,d,E){return a(),n("div",null,t)}const h=s(e,[["render",p]]);export{u as __pageData,h as default};