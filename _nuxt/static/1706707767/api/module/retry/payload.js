__NUXT_JSONP__("/api/module/retry", (function(a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,_,$,aa,ab,ac,ad,ae,af,ag,ah,ai,aj,ak,al,am,an,ao,ap,aq,ar,as,at,au,av,aw,ax,ay,az,aA,aB,aC,aD,aE,aF,aG,aH,aI,aJ,aK,aL,aM,aN,aO,aP,aQ,aR,aS,aT){return {data:[{article:{title:"Mollitia - API - Module - Retry",toc:[{id:ar,depth:Q,text:as},{id:at,depth:Q,text:au},{id:av,depth:3,text:aw},{id:ax,depth:Q,text:ay},{id:az,depth:Q,text:aA}],body:{type:aa,children:[{type:b,tag:"h1",props:{id:R},children:[{type:b,tag:q,props:{href:"#retry",ariaHidden:r,tabIndex:s},children:[{type:b,tag:c,props:{className:[t,u]},children:[]}]},{type:a,value:J}]},{type:a,value:e},{type:b,tag:"pg-retry",props:{},children:[{type:a,value:e}]},{type:a,value:e},{type:b,tag:S,props:{id:ar},children:[{type:b,tag:q,props:{href:"#usage",ariaHidden:r,tabIndex:s},children:[{type:b,tag:c,props:{className:[t,u]},children:[]}]},{type:a,value:as}]},{type:a,value:e},{type:b,tag:k,props:{},children:[{type:a,value:"The "},{type:b,tag:g,props:{},children:[{type:a,value:J}]},{type:a,value:" module allows you to "},{type:b,tag:o,props:{},children:[{type:a,value:R}]},{type:a,value:" a function when it fails.\nYou can configure:"}]},{type:a,value:e},{type:b,tag:ab,props:{},children:[{type:a,value:e},{type:b,tag:m,props:{},children:[{type:a,value:"the interval between attemps"}]},{type:a,value:e},{type:b,tag:m,props:{},children:[{type:a,value:"if the first retry should be done without delay"}]},{type:a,value:e},{type:b,tag:m,props:{},children:[{type:a,value:"the default interval between retry"}]},{type:a,value:e},{type:b,tag:m,props:{},children:[{type:a,value:"the factor to be applied for the retry interval (applicable if mode is LINEAR, EXPONENTIAL or JITTER)"}]},{type:a,value:e},{type:b,tag:m,props:{},children:[{type:a,value:"the mode to be used for the retry. Mode could be:\n"},{type:b,tag:ab,props:{},children:[{type:a,value:e},{type:b,tag:m,props:{},children:[{type:a,value:"CONSTANT: The interval between each retry is always the one configured with the interval option"}]},{type:a,value:e},{type:b,tag:m,props:{},children:[{type:a,value:"LINEAR: The interval between each retry grows linearly, based on interval and factor configuration"}]},{type:a,value:e},{type:b,tag:m,props:{},children:[{type:a,value:"EXPONENTIAL: The interval between each retry grows exponentially, based on interval and factor configuration"}]},{type:a,value:e},{type:b,tag:m,props:{},children:[{type:a,value:"JITTER: The interval between each retry uses a Jitter calculation to distribute the retries randomly and avoid peaks of retries. See "},{type:b,tag:q,props:{href:aB},children:[{type:a,value:"Jitter Mode"}]}]},{type:a,value:e}]},{type:a,value:e}]},{type:a,value:e},{type:b,tag:m,props:{},children:[{type:a,value:"the jitter adjustment value (if jitter mode is used)"}]},{type:a,value:e},{type:b,tag:m,props:{},children:[{type:a,value:"if retry should be done, depending on the error"}]},{type:a,value:e}]},{type:a,value:e},{type:b,tag:T,props:{className:[U]},children:[{type:b,tag:V,props:{className:[W,"language-javascript"]},children:[{type:b,tag:g,props:{},children:[{type:b,tag:c,props:{className:[d,n]},children:[{type:a,value:"\u002F\u002F Imports needed components"}]},{type:a,value:e},{type:b,tag:c,props:{className:[d,p]},children:[{type:a,value:aC}]},{type:a,value:h},{type:b,tag:c,props:{className:[d,j]},children:[{type:a,value:y}]},{type:a,value:h},{type:b,tag:c,props:{className:[d,X]},children:[{type:a,value:aD}]},{type:b,tag:c,props:{className:[d,j]},children:[{type:a,value:C}]},{type:a,value:h},{type:b,tag:c,props:{className:[d,X]},children:[{type:a,value:J}]},{type:b,tag:c,props:{className:[d,j]},children:[{type:a,value:C}]},{type:a,value:h},{type:b,tag:c,props:{className:[d,X]},children:[{type:a,value:aE}]},{type:a,value:h},{type:b,tag:c,props:{className:[d,j]},children:[{type:a,value:z}]},{type:a,value:h},{type:b,tag:c,props:{className:[d,v]},children:[{type:a,value:aF}]},{type:a,value:h},{type:b,tag:c,props:{className:[d,aG]},children:[{type:a,value:"require"}]},{type:b,tag:c,props:{className:[d,j]},children:[{type:a,value:D}]},{type:b,tag:c,props:{className:[d,"string"]},children:[{type:a,value:"'mollitia'"}]},{type:b,tag:c,props:{className:[d,j]},children:[{type:a,value:A}]},{type:b,tag:c,props:{className:[d,j]},children:[{type:a,value:K}]},{type:a,value:e},{type:b,tag:c,props:{className:[d,n]},children:[{type:a,value:"\u002F\u002F Creates a circuit"}]},{type:a,value:e},{type:b,tag:c,props:{className:[d,p]},children:[{type:a,value:aC}]},{type:a,value:" circuit "},{type:b,tag:c,props:{className:[d,v]},children:[{type:a,value:aF}]},{type:a,value:h},{type:b,tag:c,props:{className:[d,p]},children:[{type:a,value:aH}]},{type:a,value:h},{type:b,tag:c,props:{className:[d,Y]},children:[{type:a,value:aD}]},{type:b,tag:c,props:{className:[d,j]},children:[{type:a,value:D}]},{type:b,tag:c,props:{className:[d,j]},children:[{type:a,value:y}]},{type:a,value:"\n  options"},{type:b,tag:c,props:{className:[d,v]},children:[{type:a,value:E}]},{type:a,value:h},{type:b,tag:c,props:{className:[d,j]},children:[{type:a,value:y}]},{type:a,value:"\n    modules"},{type:b,tag:c,props:{className:[d,v]},children:[{type:a,value:E}]},{type:a,value:h},{type:b,tag:c,props:{className:[d,j]},children:[{type:a,value:"["}]},{type:a,value:ac},{type:b,tag:c,props:{className:[d,n]},children:[{type:a,value:"\u002F\u002F Creates a retry module"}]},{type:a,value:ac},{type:b,tag:c,props:{className:[d,p]},children:[{type:a,value:aH}]},{type:a,value:h},{type:b,tag:c,props:{className:[d,Y]},children:[{type:a,value:J}]},{type:b,tag:c,props:{className:[d,j]},children:[{type:a,value:D}]},{type:b,tag:c,props:{className:[d,j]},children:[{type:a,value:y}]},{type:a,value:"\n        attempts"},{type:b,tag:c,props:{className:[d,v]},children:[{type:a,value:E}]},{type:a,value:h},{type:b,tag:c,props:{className:[d,B]},children:[{type:a,value:ad}]},{type:b,tag:c,props:{className:[d,j]},children:[{type:a,value:C}]},{type:a,value:h},{type:b,tag:c,props:{className:[d,n]},children:[{type:a,value:"\u002F\u002F Will retry two times"}]},{type:a,value:"\n        interval"},{type:b,tag:c,props:{className:[d,v]},children:[{type:a,value:E}]},{type:a,value:h},{type:b,tag:c,props:{className:[d,B]},children:[{type:a,value:"500"}]},{type:b,tag:c,props:{className:[d,j]},children:[{type:a,value:C}]},{type:a,value:"\n        mode"},{type:b,tag:c,props:{className:[d,v]},children:[{type:a,value:E}]},{type:a,value:h},{type:b,tag:c,props:{className:[d,X]},children:[{type:a,value:aE}]},{type:b,tag:c,props:{className:[d,j]},children:[{type:a,value:"."}]},{type:b,tag:c,props:{className:[d,"constant"]},children:[{type:a,value:"LINEAR"}]},{type:b,tag:c,props:{className:[d,j]},children:[{type:a,value:C}]},{type:a,value:"\n        factor"},{type:b,tag:c,props:{className:[d,v]},children:[{type:a,value:E}]},{type:a,value:h},{type:b,tag:c,props:{className:[d,B]},children:[{type:a,value:L}]},{type:b,tag:c,props:{className:[d,j]},children:[{type:a,value:C}]},{type:a,value:h},{type:b,tag:c,props:{className:[d,n]},children:[{type:a,value:"\u002F\u002F With interval=500, mode=LINEAR and factor 1, the interval between attempts will grow linearly (500ms before 1st retry, then 1000ms before 2nd retry)"}]},{type:a,value:aI},{type:b,tag:c,props:{className:[d,"function-variable",aG]},children:[{type:a,value:aJ}]},{type:b,tag:c,props:{className:[d,v]},children:[{type:a,value:E}]},{type:a,value:h},{type:b,tag:c,props:{className:[d,j]},children:[{type:a,value:D}]},{type:b,tag:c,props:{className:[d,"parameter"]},children:[{type:a,value:"err"},{type:b,tag:c,props:{className:[d,j]},children:[{type:a,value:C}]},{type:a,value:" attempt"}]},{type:b,tag:c,props:{className:[d,j]},children:[{type:a,value:A}]},{type:a,value:h},{type:b,tag:c,props:{className:[d,"arrow",v]},children:[{type:a,value:"=\u003E"}]},{type:a,value:h},{type:b,tag:c,props:{className:[d,j]},children:[{type:a,value:y}]},{type:a,value:h},{type:b,tag:c,props:{className:[d,n]},children:[{type:a,value:"\u002F\u002F Can help filtering error and modifying the retry behavior"}]},{type:a,value:w},{type:b,tag:c,props:{className:[d,n]},children:[{type:a,value:"\u002F\u002F Second parameter represent the current attempt"}]},{type:a,value:w},{type:b,tag:c,props:{className:[d,n]},children:[{type:a,value:"\u002F\u002F In this example, onRejection will be called 3 times"}]},{type:a,value:w},{type:b,tag:c,props:{className:[d,n]},children:[{type:a,value:"\u002F\u002F attempt = 0: first failure"}]},{type:a,value:w},{type:b,tag:c,props:{className:[d,n]},children:[{type:a,value:"\u002F\u002F attempt = 1: first retry failure"}]},{type:a,value:w},{type:b,tag:c,props:{className:[d,n]},children:[{type:a,value:"\u002F\u002F attempt = 2: second retry failure"}]},{type:a,value:w},{type:b,tag:c,props:{className:[d,p,F]},children:[{type:a,value:aK}]},{type:a,value:h},{type:b,tag:c,props:{className:[d,j]},children:[{type:a,value:D}]},{type:a,value:aL},{type:b,tag:c,props:{className:[d,p]},children:[{type:a,value:aM}]},{type:a,value:h},{type:b,tag:c,props:{className:[d,Y]},children:[{type:a,value:"BrokenError"}]},{type:b,tag:c,props:{className:[d,j]},children:[{type:a,value:A}]},{type:a,value:h},{type:b,tag:c,props:{className:[d,j]},children:[{type:a,value:y}]},{type:a,value:ae},{type:b,tag:c,props:{className:[d,p,F]},children:[{type:a,value:af}]},{type:a,value:h},{type:b,tag:c,props:{className:[d,aN]},children:[{type:a,value:aO}]},{type:b,tag:c,props:{className:[d,j]},children:[{type:a,value:K}]},{type:a,value:h},{type:b,tag:c,props:{className:[d,n]},children:[{type:a,value:"\u002F\u002F Returning false will cancel the retry attempt"}]},{type:a,value:w},{type:b,tag:c,props:{className:[d,j]},children:[{type:a,value:z}]},{type:a,value:h},{type:b,tag:c,props:{className:[d,p,F]},children:[{type:a,value:aP}]},{type:a,value:h},{type:b,tag:c,props:{className:[d,p,F]},children:[{type:a,value:aK}]},{type:a,value:h},{type:b,tag:c,props:{className:[d,j]},children:[{type:a,value:D}]},{type:a,value:aL},{type:b,tag:c,props:{className:[d,p]},children:[{type:a,value:aM}]},{type:a,value:h},{type:b,tag:c,props:{className:[d,Y]},children:[{type:a,value:"BusyError"}]},{type:b,tag:c,props:{className:[d,j]},children:[{type:a,value:A}]},{type:a,value:h},{type:b,tag:c,props:{className:[d,j]},children:[{type:a,value:y}]},{type:a,value:ae},{type:b,tag:c,props:{className:[d,p,F]},children:[{type:a,value:af}]},{type:a,value:h},{type:b,tag:c,props:{className:[d,B]},children:[{type:a,value:"1000"}]},{type:b,tag:c,props:{className:[d,j]},children:[{type:a,value:K}]},{type:a,value:h},{type:b,tag:c,props:{className:[d,n]},children:[{type:a,value:"\u002F\u002F Returning a number will modify the interval time, and wait for that time before retry"}]},{type:a,value:w},{type:b,tag:c,props:{className:[d,j]},children:[{type:a,value:z}]},{type:a,value:h},{type:b,tag:c,props:{className:[d,p,F]},children:[{type:a,value:aP}]},{type:a,value:h},{type:b,tag:c,props:{className:[d,j]},children:[{type:a,value:y}]},{type:a,value:ae},{type:b,tag:c,props:{className:[d,p,F]},children:[{type:a,value:af}]},{type:a,value:h},{type:b,tag:c,props:{className:[d,aN]},children:[{type:a,value:r}]},{type:b,tag:c,props:{className:[d,j]},children:[{type:a,value:K}]},{type:a,value:h},{type:b,tag:c,props:{className:[d,n]},children:[{type:a,value:"\u002F\u002F Returning true will retry, using the configured interval value"}]},{type:a,value:w},{type:b,tag:c,props:{className:[d,j]},children:[{type:a,value:z}]},{type:a,value:aI},{type:b,tag:c,props:{className:[d,j]},children:[{type:a,value:z}]},{type:a,value:ac},{type:b,tag:c,props:{className:[d,j]},children:[{type:a,value:z}]},{type:b,tag:c,props:{className:[d,j]},children:[{type:a,value:A}]},{type:a,value:"\n    "},{type:b,tag:c,props:{className:[d,j]},children:[{type:a,value:"]"}]},{type:a,value:"\n  "},{type:b,tag:c,props:{className:[d,j]},children:[{type:a,value:z}]},{type:a,value:e},{type:b,tag:c,props:{className:[d,j]},children:[{type:a,value:z}]},{type:b,tag:c,props:{className:[d,j]},children:[{type:a,value:A}]},{type:b,tag:c,props:{className:[d,j]},children:[{type:a,value:K}]},{type:a,value:e}]}]}]},{type:a,value:e},{type:b,tag:S,props:{id:at},children:[{type:b,tag:q,props:{href:"#options",ariaHidden:r,tabIndex:s},children:[{type:b,tag:c,props:{className:[t,u]},children:[]}]},{type:a,value:au}]},{type:a,value:"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n"},{type:b,tag:ag,props:{},children:[{type:b,tag:ah,props:{},children:[{type:b,tag:l,props:{},children:[{type:b,tag:x,props:{align:f},children:[{type:a,value:ai}]},{type:b,tag:x,props:{align:f},children:[{type:a,value:aj}]},{type:b,tag:x,props:{align:f},children:[{type:a,value:"Default"}]}]}]},{type:b,tag:ak,props:{},children:[{type:b,tag:l,props:{},children:[{type:b,tag:i,props:{align:f},children:[{type:b,tag:g,props:{},children:[{type:a,value:al}]}]},{type:b,tag:i,props:{align:f},children:[{type:a,value:"The number of retry attempts (the function will be called attempts + 1 times)."}]},{type:b,tag:i,props:{align:f},children:[{type:b,tag:g,props:{},children:[{type:a,value:ad}]}]}]},{type:b,tag:l,props:{},children:[{type:b,tag:i,props:{align:f},children:[{type:b,tag:g,props:{},children:[{type:a,value:aQ}]}]},{type:b,tag:i,props:{align:f},children:[{type:a,value:"The amount of time to wait before retrying."}]},{type:b,tag:i,props:{align:f},children:[{type:b,tag:g,props:{},children:[{type:a,value:Z}]}]}]},{type:b,tag:l,props:{},children:[{type:b,tag:i,props:{align:f},children:[{type:b,tag:g,props:{},children:[{type:a,value:"fastFirst"}]}]},{type:b,tag:i,props:{align:f},children:[{type:a,value:"The first retry is done without delay if set to true."}]},{type:b,tag:i,props:{align:f},children:[{type:b,tag:g,props:{},children:[{type:a,value:aO}]}]}]},{type:b,tag:l,props:{},children:[{type:b,tag:i,props:{align:f},children:[{type:b,tag:g,props:{},children:[{type:a,value:aR}]}]},{type:b,tag:i,props:{align:f},children:[{type:a,value:"The mode for the retry"}]},{type:b,tag:i,props:{align:f},children:[{type:b,tag:g,props:{},children:[{type:a,value:"CONSTANT"}]}]}]},{type:b,tag:l,props:{},children:[{type:b,tag:i,props:{align:f},children:[{type:b,tag:g,props:{},children:[{type:a,value:"factor"}]}]},{type:b,tag:i,props:{align:f},children:[{type:a,value:"The factor to be used for the retry (used only if retry "},{type:b,tag:g,props:{},children:[{type:a,value:aR}]},{type:a,value:" is LINEAR, EXPONENTIAL OR JITTER)"}]},{type:b,tag:i,props:{align:f},children:[{type:b,tag:g,props:{},children:[{type:a,value:L}]},{type:a,value:" if mode is LINEAR, "},{type:b,tag:g,props:{},children:[{type:a,value:ad}]},{type:a,value:" if mode is EXPONENTIAL or JITTER"}]}]},{type:b,tag:l,props:{},children:[{type:b,tag:i,props:{align:f},children:[{type:b,tag:g,props:{},children:[{type:a,value:"maxInterval"}]}]},{type:b,tag:i,props:{align:f},children:[{type:a,value:"The maximum interval between each retry."}]},{type:b,tag:i,props:{align:f},children:[{type:b,tag:g,props:{},children:[{type:a,value:"INFINITY"}]}]}]},{type:b,tag:l,props:{},children:[{type:b,tag:i,props:{align:f},children:[{type:b,tag:g,props:{},children:[{type:a,value:"jitterAdjustment"}]}]},{type:b,tag:i,props:{align:f},children:[{type:a,value:"The percentage to adjust delay randomly based on jitter retry duration"}]},{type:b,tag:i,props:{align:f},children:[{type:b,tag:g,props:{},children:[{type:a,value:"0.1"}]},{type:a,value:" (Should be between "},{type:b,tag:g,props:{},children:[{type:a,value:Z}]},{type:a,value:" and "},{type:b,tag:g,props:{},children:[{type:a,value:L}]},{type:a,value:". If set to value greater than "},{type:b,tag:g,props:{},children:[{type:a,value:L}]},{type:a,value:M},{type:b,tag:g,props:{},children:[{type:a,value:L}]},{type:a,value:" is used. If set to value lower than "},{type:b,tag:g,props:{},children:[{type:a,value:Z}]},{type:a,value:", then "},{type:b,tag:g,props:{},children:[{type:a,value:Z}]},{type:a,value:" is used)"}]}]},{type:b,tag:l,props:{},children:[{type:b,tag:i,props:{align:f},children:[{type:b,tag:g,props:{},children:[{type:a,value:aJ}]}]},{type:b,tag:i,props:{align:f},children:[{type:a,value:"A filtering callback, to modify the retry behavior."}]},{type:b,tag:i,props:{align:f},children:[{type:b,tag:g,props:{},children:[{type:a,value:"none"}]}]}]}]}]},{type:a,value:e},{type:b,tag:"h3",props:{id:av},children:[{type:b,tag:q,props:{href:"#retry-mode",ariaHidden:r,tabIndex:s},children:[{type:b,tag:c,props:{className:[t,u]},children:[]}]},{type:a,value:aw}]},{type:a,value:e},{type:b,tag:k,props:{},children:[{type:a,value:"As previously described, four possible modes could be configured for this extended retry (CONSTANT, LINEAR, EXPONENTIAL, JITTER)"}]},{type:a,value:e},{type:b,tag:_,props:{id:"constant-mode"},children:[{type:b,tag:q,props:{href:"#constant-mode",ariaHidden:r,tabIndex:s},children:[{type:b,tag:c,props:{className:[t,u]},children:[]}]},{type:a,value:"CONSTANT mode"}]},{type:a,value:e},{type:b,tag:k,props:{},children:[{type:a,value:"This is the default behaviour. In this mode, the delay between each retry is always the same: the one configured in the "},{type:b,tag:g,props:{},children:[{type:a,value:aQ}]},{type:a,value:" option."}]},{type:a,value:e},{type:b,tag:k,props:{},children:[{type:a,value:"For example, with interval=100, the retry delay will be 100, 100, 100, ..."}]},{type:a,value:e},{type:b,tag:_,props:{id:"linear-mode"},children:[{type:b,tag:q,props:{href:"#linear-mode",ariaHidden:r,tabIndex:s},children:[{type:b,tag:c,props:{className:[t,u]},children:[]}]},{type:a,value:"LINEAR mode"}]},{type:a,value:e},{type:b,tag:k,props:{},children:[{type:a,value:"In this mode, the delay between each retry grows linearly."}]},{type:a,value:e},{type:b,tag:k,props:{},children:[{type:a,value:"Let's call iteration the number of retry attemps already done. The delay calculation formula is:"}]},{type:a,value:e},{type:b,tag:T,props:{className:[U]},children:[{type:b,tag:V,props:{className:[W,am]},children:[{type:b,tag:g,props:{},children:[{type:a,value:"min(interval + (iteration * factor * interval), maxInterval)\n"}]}]}]},{type:a,value:e},{type:b,tag:k,props:{},children:[{type:a,value:"For example, with factor=3 and interval=100, the retry delay will be 100, 400, 700, 1000, 1300, ..."}]},{type:a,value:e},{type:b,tag:k,props:{className:[N],align:O},children:[{type:b,tag:P,props:{src:"\u002Fimg\u002Fretry-linear-mode.png",alt:"Retry - Linear Mode"},children:[]}]},{type:a,value:e},{type:b,tag:an,props:{},children:[{type:a,value:e},{type:b,tag:k,props:{},children:[{type:a,value:aS}]},{type:a,value:e},{type:b,tag:k,props:{},children:[{type:a,value:"For example, with factor=3, interval=100, maxInterval=800, the retry delay will be 100, 400, 700, 800, 800, ...  "}]},{type:a,value:e}]},{type:a,value:e},{type:b,tag:_,props:{id:"exponential-mode"},children:[{type:b,tag:q,props:{href:"#exponential-mode",ariaHidden:r,tabIndex:s},children:[{type:b,tag:c,props:{className:[t,u]},children:[]}]},{type:a,value:"EXPONENTIAL mode"}]},{type:a,value:e},{type:b,tag:k,props:{},children:[{type:a,value:"In this mode, the delay between each retry grows exponentially."}]},{type:a,value:e},{type:b,tag:k,props:{},children:[{type:a,value:"Let's call iteration the number of retry attemps already done. The delay calculation formula is: ("},{type:b,tag:g,props:{},children:[{type:a,value:$}]},{type:a,value:A}]},{type:a,value:e},{type:b,tag:T,props:{className:[U]},children:[{type:b,tag:V,props:{className:[W,am]},children:[{type:b,tag:g,props:{},children:[{type:a,value:"min(interval * (factor ** iteration), maxInterval)\n"}]}]}]},{type:a,value:e},{type:b,tag:k,props:{},children:[{type:a,value:"For example, with factor=2 and interval=100, the retry delay will be 100, 200, 400, 800, 1600, ..."}]},{type:a,value:e},{type:b,tag:k,props:{className:[N],align:O},children:[{type:b,tag:P,props:{src:"\u002Fimg\u002Fretry-exponential-mode.png",alt:"Retry - Exponential Mode"},children:[]}]},{type:a,value:e},{type:b,tag:an,props:{},children:[{type:a,value:e},{type:b,tag:k,props:{},children:[{type:a,value:aS}]},{type:a,value:e},{type:b,tag:k,props:{},children:[{type:a,value:"For example, with factor=3, interval=100, maxInterval=1000, the retry delay will be 100, 300, 900, 1000, 1000, ..."}]},{type:a,value:e}]},{type:a,value:e},{type:b,tag:_,props:{id:"jitter-mode"},children:[{type:b,tag:q,props:{href:aB,ariaHidden:r,tabIndex:s},children:[{type:b,tag:c,props:{className:[t,u]},children:[]}]},{type:a,value:"JITTER mode"}]},{type:a,value:e},{type:b,tag:k,props:{},children:[{type:a,value:"This mode is very close to the exponential mode, the formula is nearly the same."}]},{type:a,value:e},{type:b,tag:k,props:{},children:[{type:a,value:"The retry delay is calculated based on the exponential retry delay, with some delta around it, based on the configuration of the jitterAdjustment"}]},{type:a,value:e},{type:b,tag:k,props:{},children:[{type:a,value:"Let's call iteration the number of retry attemps already done. The jitter delay calculation formula is:"}]},{type:a,value:e},{type:b,tag:k,props:{},children:[{type:a,value:D},{type:b,tag:g,props:{},children:[{type:a,value:$}]},{type:a,value:") - (("},{type:b,tag:g,props:{},children:[{type:a,value:$}]},{type:a,value:") "},{type:b,tag:"em",props:{},children:[{type:a,value:"jitterAdjustment) + (random(0, (("},{type:b,tag:g,props:{},children:[{type:a,value:$}]},{type:a,value:A}]},{type:a,value:" jitterAdjustment) * 2))"}]},{type:a,value:e},{type:b,tag:k,props:{},children:[{type:a,value:"To be more precise, as there is a potential maxInterval duration, the exact calculation is:"}]},{type:a,value:e},{type:b,tag:T,props:{className:[U]},children:[{type:b,tag:V,props:{className:[W,am]},children:[{type:b,tag:g,props:{},children:[{type:a,value:"minValue = Math.min((interval x factor^iteration), maxInterval) * ( 1 - jitterAdjustment)\nmaxValue = Math.min((interval x factor^iteration), maxInterval) * ( 1 + jitterAdjustment)\nwaitDelay = Math.random(0, (maxValue - minValue)) + minValue\n"}]}]}]},{type:a,value:e},{type:b,tag:"h5",props:{id:"example"},children:[{type:b,tag:q,props:{href:"#example",ariaHidden:r,tabIndex:s},children:[{type:b,tag:c,props:{className:[t,u]},children:[]}]},{type:a,value:"Example"}]},{type:a,value:e},{type:b,tag:k,props:{},children:[{type:a,value:"With"}]},{type:a,value:e},{type:b,tag:ab,props:{},children:[{type:a,value:e},{type:b,tag:m,props:{},children:[{type:a,value:"factor=2"}]},{type:a,value:e},{type:b,tag:m,props:{},children:[{type:a,value:"interval=100"}]},{type:a,value:e},{type:b,tag:m,props:{},children:[{type:a,value:"jitterAdjustment=0.1"}]},{type:a,value:e}]},{type:a,value:e},{type:b,tag:k,props:{},children:[{type:a,value:"the retry delay for 1st retry will be a random value between 90 and 110, for 2nd retry a random value between 180 and 220, a random value between 360 and 440, ..."}]},{type:a,value:e},{type:b,tag:k,props:{className:[N],align:O},children:[{type:b,tag:P,props:{src:"\u002Fimg\u002Fretry-jitter-mode-adjust0.1.png",alt:ao},children:[]}]},{type:a,value:e},{type:b,tag:k,props:{className:[N],align:O},children:[{type:b,tag:P,props:{src:"\u002Fimg\u002Fretry-jitter-mode-adjust0.5.png",alt:ao},children:[]}]},{type:a,value:e},{type:b,tag:k,props:{className:[N],align:O},children:[{type:b,tag:P,props:{src:"\u002Fimg\u002Fretry-jitter-mode-adjust1.png",alt:ao},children:[]}]},{type:a,value:e},{type:b,tag:an,props:{},children:[{type:a,value:e},{type:b,tag:k,props:{},children:[{type:a,value:"As retry delay can grow fast, it's possible to configure maxInterval option to specify the maximum allowed delay used for the random value as maximum boundary."}]},{type:a,value:e},{type:b,tag:k,props:{},children:[{type:a,value:"In this case, the value is calculated between MaxValue - (jitterAdjustment * MaxValue) and MaxValue."}]},{type:a,value:e},{type:b,tag:k,props:{},children:[{type:a,value:"For example, with factor=3,interval=100,maxInterval=1000,jitterAdjustment=0.2, the retry delay will be random(80,120), random(240,360), random(720,1000), random(800,1000), random(800,1000), ..."}]},{type:a,value:e},{type:b,tag:k,props:{},children:[{type:a,value:"Note that the 3rd retry random range is between 720 and 1000 because 900 + 0.2*900 (the upper value of the random range) \u003E 1000 (maxInterval)"}]},{type:a,value:e}]},{type:a,value:e},{type:b,tag:S,props:{id:ax},children:[{type:b,tag:q,props:{href:"#events",ariaHidden:r,tabIndex:s},children:[{type:b,tag:c,props:{className:[t,u]},children:[]}]},{type:a,value:ay}]},{type:a,value:"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n"},{type:b,tag:ag,props:{},children:[{type:b,tag:ah,props:{},children:[{type:b,tag:l,props:{},children:[{type:b,tag:x,props:{align:f},children:[{type:a,value:ai}]},{type:b,tag:x,props:{align:f},children:[{type:a,value:aj}]},{type:b,tag:x,props:{align:f},children:[{type:a,value:"Params"}]}]}]},{type:b,tag:ak,props:{},children:[{type:b,tag:l,props:{},children:[{type:b,tag:i,props:{align:f},children:[{type:b,tag:g,props:{},children:[{type:a,value:"execute"}]}]},{type:b,tag:i,props:{align:f},children:[{type:a,value:"Called when the module is executed."}]},{type:b,tag:i,props:{align:f},children:[{type:b,tag:g,props:{},children:[{type:a,value:G}]},{type:a,value:h},{type:b,tag:o,props:{},children:[{type:a,value:H}]}]}]},{type:b,tag:l,props:{},children:[{type:b,tag:i,props:{align:f},children:[{type:b,tag:g,props:{},children:[{type:a,value:R}]}]},{type:b,tag:i,props:{align:f},children:[{type:a,value:"Called when retrying."}]},{type:b,tag:i,props:{align:f},children:[{type:b,tag:g,props:{},children:[{type:a,value:G}]},{type:a,value:h},{type:b,tag:o,props:{},children:[{type:a,value:H}]},{type:a,value:M},{type:b,tag:g,props:{},children:[{type:a,value:B}]},{type:a,value:h},{type:b,tag:o,props:{},children:[{type:a,value:"currentAttempt"}]}]}]},{type:b,tag:l,props:{},children:[{type:b,tag:i,props:{align:f},children:[{type:b,tag:g,props:{},children:[{type:a,value:"success-without-retry"}]}]},{type:b,tag:i,props:{align:f},children:[{type:a,value:"Called the module execution succeeds without retrying."}]},{type:b,tag:i,props:{align:f},children:[{type:b,tag:g,props:{},children:[{type:a,value:G}]},{type:a,value:h},{type:b,tag:o,props:{},children:[{type:a,value:H}]}]}]},{type:b,tag:l,props:{},children:[{type:b,tag:i,props:{align:f},children:[{type:b,tag:g,props:{},children:[{type:a,value:"success-with-retry"}]}]},{type:b,tag:i,props:{align:f},children:[{type:a,value:"Called the module execution succeeds after retrying."}]},{type:b,tag:i,props:{align:f},children:[{type:b,tag:g,props:{},children:[{type:a,value:G}]},{type:a,value:h},{type:b,tag:o,props:{},children:[{type:a,value:H}]},{type:a,value:M},{type:b,tag:g,props:{},children:[{type:a,value:B}]},{type:a,value:h},{type:b,tag:o,props:{},children:[{type:a,value:al}]}]}]},{type:b,tag:l,props:{},children:[{type:b,tag:i,props:{align:f},children:[{type:b,tag:g,props:{},children:[{type:a,value:"failure-without-retry"}]}]},{type:b,tag:i,props:{align:f},children:[{type:a,value:"Called the module execution fails without retrying."}]},{type:b,tag:i,props:{align:f},children:[{type:b,tag:g,props:{},children:[{type:a,value:G}]},{type:a,value:h},{type:b,tag:o,props:{},children:[{type:a,value:H}]}]}]},{type:b,tag:l,props:{},children:[{type:b,tag:i,props:{align:f},children:[{type:b,tag:g,props:{},children:[{type:a,value:"failure-with-retry"}]}]},{type:b,tag:i,props:{align:f},children:[{type:a,value:"Called the module execution fails after retrying."}]},{type:b,tag:i,props:{align:f},children:[{type:b,tag:g,props:{},children:[{type:a,value:G}]},{type:a,value:h},{type:b,tag:o,props:{},children:[{type:a,value:H}]},{type:a,value:M},{type:b,tag:g,props:{},children:[{type:a,value:B}]},{type:a,value:h},{type:b,tag:o,props:{},children:[{type:a,value:al}]}]}]},{type:b,tag:l,props:{},children:[{type:b,tag:i,props:{align:f},children:[{type:b,tag:g,props:{},children:[{type:a,value:"delay-before-next-retry"}]}]},{type:b,tag:i,props:{align:f},children:[{type:a,value:"Called when the delay before next retry starts."}]},{type:b,tag:i,props:{align:f},children:[{type:b,tag:g,props:{},children:[{type:a,value:G}]},{type:a,value:h},{type:b,tag:o,props:{},children:[{type:a,value:H}]},{type:a,value:M},{type:b,tag:g,props:{},children:[{type:a,value:B}]},{type:a,value:h},{type:b,tag:o,props:{},children:[{type:a,value:"waitDuration"}]}]}]}]}]},{type:a,value:e},{type:b,tag:S,props:{id:az},children:[{type:b,tag:q,props:{href:"#methods",ariaHidden:r,tabIndex:s},children:[{type:b,tag:c,props:{className:[t,u]},children:[]}]},{type:a,value:aA}]},{type:a,value:"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n"},{type:b,tag:ag,props:{},children:[{type:b,tag:ah,props:{},children:[{type:b,tag:l,props:{},children:[{type:b,tag:x,props:{align:f},children:[{type:a,value:ai}]},{type:b,tag:x,props:{align:f},children:[{type:a,value:aj}]},{type:b,tag:x,props:{align:f},children:[{type:a,value:"Returns"}]}]}]},{type:b,tag:ak,props:{},children:[{type:b,tag:l,props:{},children:[{type:b,tag:i,props:{align:f},children:[{type:b,tag:g,props:{},children:[{type:a,value:"getExecParams"}]}]},{type:b,tag:i,props:{align:f},children:[{type:a,value:"Returns the circuit function parameters."}]},{type:b,tag:i,props:{align:f},children:[{type:b,tag:g,props:{},children:[{type:a,value:"any[]"}]},{type:a,value:h},{type:b,tag:o,props:{},children:[{type:a,value:"params"}]}]}]}]}]}]},dir:"\u002Fapi\u002Fmodule",path:aT,extension:ap,slug:R,createdAt:I,updatedAt:I,navbar:{links:[{title:"Home",path:aq}],github:{link:"https:\u002F\u002Fgithub.com\u002Fgenesys\u002Fmollitia"},toc:[],body:{type:aa,children:[]},dir:aq,path:"\u002F_navbar",extension:ap,slug:"_navbar",createdAt:I,updatedAt:I},sidebar:{links:[{group:"A Quick Overview",links:[{title:"Introduction",path:"\u002Foverview\u002Fintroduction"},{title:"Getting Started",path:"\u002Foverview\u002Fgetting-started"}]},{title:"The Circuit",path:"\u002Fapi\u002Fcircuit"},{group:"Core Modules",links:[{title:"Fallback",path:"\u002Fapi\u002Fmodule\u002Ffallback"},{title:"Cache",path:"\u002Fapi\u002Fmodule\u002Fcache"},{title:J,path:aT},{title:"Timeout",path:"\u002Fapi\u002Fmodule\u002Ftimeout"},{title:"Ratelimit",path:"\u002Fapi\u002Fmodule\u002Fratelimit"},{title:"Bulkhead",path:"\u002Fapi\u002Fmodule\u002Fbulkhead"},{title:"Count Breaker",path:"\u002Fapi\u002Fmodule\u002Fbreaker\u002Fsliding\u002Fcount"},{title:"Time Breaker",path:"\u002Fapi\u002Fmodule\u002Fbreaker\u002Fsliding\u002Ftime"}]},{group:"Core Addons",links:[{title:"Prometheus",path:"https:\u002F\u002Fgenesys.github.io\u002Fmollitia-prometheus\u002F"}]},{group:"Customization",links:[{title:"Create a module",path:"\u002Fapi\u002Fcreate-module"},{title:"Create a addon",path:"\u002Fapi\u002Fcreate-addon"}]}],toc:[],body:{type:aa,children:[]},dir:aq,path:"\u002F_sidebar",extension:ap,slug:"_sidebar",createdAt:I,updatedAt:I}}}],fetch:[],mutations:void 0}}("text","element","span","token","\n","left","code"," ","td","punctuation","p","tr","li","comment","strong","keyword","a","true",-1,"icon","icon-link","operator","\n          ","th","{","}",")","number",",","(",":","control-flow","Mollitia.Circuit","circuit","2024-01-31T13:28:27.996Z","Retry",";","1",", ","flex-center-row","center","pg-img",2,"retry","h2","div","nuxt-content-highlight","pre","line-numbers","maybe-class-name","class-name","0","h4","interval x factor^iteration","root","ul","\n      ","2","\n            ","return","table","thead","Name","Description","tbody","attempts","language-text","blockquote","Retry - Jitter Mode",".md","\u002F","usage","Usage","options","Options","retry-mode","Retry mode","events","Events","methods","Methods","#jitter-mode","const","Circuit","RetryMode","=","function","new","\n        ","onRejection","if","err ","instanceof","boolean","false","else","interval","mode","As retry delay can grow fast, it's possible to configure maxInterval option to specify the maximum allowed delay.","\u002Fapi\u002Fmodule\u002Fretry")));