__NUXT_JSONP__("/api/create-module", (function(a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,_,$,aa,ab,ac,ad,ae){return {data:[{article:{title:"Mollitia - API - Create a module",toc:[],body:{type:B,children:[{type:b,tag:"h1",props:{id:"create-a-module"},children:[{type:b,tag:"a",props:{ariaHidden:"true",href:"#create-a-module",tabIndex:-1},children:[{type:b,tag:c,props:{className:["icon","icon-link"]},children:[]}]},{type:a,value:J}]},{type:a,value:i},{type:b,tag:C,props:{},children:[{type:a,value:"You want to create your own module in order to customize your circuit."}]},{type:a,value:i},{type:b,tag:C,props:{},children:[{type:a,value:"You need to create a new class that extends the base "},{type:b,tag:"strong",props:{},children:[{type:a,value:"Mollitia.Module"}]},{type:a,value:" class and implement the "},{type:b,tag:K,props:{},children:[{type:a,value:D}]},{type:a,value:" method."}]},{type:a,value:i},{type:b,tag:C,props:{},children:[{type:a,value:"In the example below, the module just logs a message everytime the circuit is executed.\nYou can use it as a template for your own module."}]},{type:a,value:i},{type:b,tag:"div",props:{className:["nuxt-content-highlight"]},children:[{type:b,tag:"pre",props:{className:["language-javascript","line-numbers"]},children:[{type:b,tag:K,props:{},children:[{type:b,tag:c,props:{className:[d,g]},children:[{type:a,value:"\u002F\u002F Imports the library"}]},{type:a,value:i},{type:b,tag:c,props:{className:[d,h]},children:[{type:a,value:L}]},{type:a,value:f},{type:b,tag:c,props:{className:[d,e]},children:[{type:a,value:o}]},{type:a,value:f},{type:b,tag:c,props:{className:[d,M]},children:[{type:a,value:N}]},{type:b,tag:c,props:{className:[d,e]},children:[{type:a,value:x}]},{type:a,value:f},{type:b,tag:c,props:{className:[d,M]},children:[{type:a,value:O}]},{type:a,value:f},{type:b,tag:c,props:{className:[d,e]},children:[{type:a,value:l}]},{type:a,value:f},{type:b,tag:c,props:{className:[d,m]},children:[{type:a,value:E}]},{type:a,value:f},{type:b,tag:c,props:{className:[d,q]},children:[{type:a,value:"require"}]},{type:b,tag:c,props:{className:[d,e]},children:[{type:a,value:j}]},{type:b,tag:c,props:{className:[d,u]},children:[{type:a,value:"'mollitia'"}]},{type:b,tag:c,props:{className:[d,e]},children:[{type:a,value:k}]},{type:b,tag:c,props:{className:[d,e]},children:[{type:a,value:p}]},{type:a,value:y},{type:b,tag:c,props:{className:[d,g]},children:[{type:a,value:"\u002F\u002F Creates a class"}]},{type:a,value:i},{type:b,tag:c,props:{className:[d,h]},children:[{type:a,value:"class"}]},{type:a,value:f},{type:b,tag:c,props:{className:[d,w]},children:[{type:a,value:P}]},{type:a,value:f},{type:b,tag:c,props:{className:[d,h]},children:[{type:a,value:"extends"}]},{type:a,value:f},{type:b,tag:c,props:{className:[d,w]},children:[{type:a,value:O}]},{type:a,value:f},{type:b,tag:c,props:{className:[d,e]},children:[{type:a,value:o}]},{type:a,value:r},{type:b,tag:c,props:{className:[d,g]},children:[{type:a,value:"\u002F\u002F Should implement the constructor, and call super(options)"}]},{type:a,value:r},{type:b,tag:c,props:{className:[d,q]},children:[{type:a,value:"constructor"}]},{type:a,value:f},{type:b,tag:c,props:{className:[d,e]},children:[{type:a,value:j}]},{type:b,tag:c,props:{className:[d,Q]},children:[{type:a,value:R}]},{type:b,tag:c,props:{className:[d,e]},children:[{type:a,value:k}]},{type:a,value:f},{type:b,tag:c,props:{className:[d,e]},children:[{type:a,value:o}]},{type:a,value:n},{type:b,tag:c,props:{className:[d,h]},children:[{type:a,value:"super"}]},{type:b,tag:c,props:{className:[d,e]},children:[{type:a,value:j}]},{type:a,value:R},{type:b,tag:c,props:{className:[d,e]},children:[{type:a,value:k}]},{type:b,tag:c,props:{className:[d,e]},children:[{type:a,value:p}]},{type:a,value:n},{type:b,tag:c,props:{className:[d,h]},children:[{type:a,value:S}]},{type:b,tag:c,props:{className:[d,e]},children:[{type:a,value:s}]},{type:b,tag:c,props:{className:[d,t]},children:[{type:a,value:F}]},{type:a,value:f},{type:b,tag:c,props:{className:[d,m]},children:[{type:a,value:E}]},{type:a,value:" options"},{type:b,tag:c,props:{className:[d,e]},children:[{type:a,value:s}]},{type:b,tag:c,props:{className:[d,t]},children:[{type:a,value:F}]},{type:b,tag:c,props:{className:[d,e]},children:[{type:a,value:p}]},{type:a,value:r},{type:b,tag:c,props:{className:[d,e]},children:[{type:a,value:l}]},{type:a,value:r},{type:b,tag:c,props:{className:[d,g]},children:[{type:a,value:"\u002F\u002F Should implement the execute method"}]},{type:a,value:r},{type:b,tag:c,props:{className:[d,h]},children:[{type:a,value:"async"}]},{type:a,value:f},{type:b,tag:c,props:{className:[d,q]},children:[{type:a,value:D}]},{type:a,value:f},{type:b,tag:c,props:{className:[d,e]},children:[{type:a,value:j}]},{type:b,tag:c,props:{className:[d,Q]},children:[{type:a,value:T},{type:b,tag:c,props:{className:[d,e]},children:[{type:a,value:x}]},{type:a,value:" promise"},{type:b,tag:c,props:{className:[d,e]},children:[{type:a,value:x}]},{type:a,value:f},{type:b,tag:c,props:{className:[d,U,m]},children:[{type:a,value:V}]},{type:a,value:W}]},{type:b,tag:c,props:{className:[d,e]},children:[{type:a,value:k}]},{type:a,value:f},{type:b,tag:c,props:{className:[d,e]},children:[{type:a,value:o}]},{type:a,value:n},{type:b,tag:c,props:{className:[d,g]},children:[{type:a,value:"\u002F\u002F circuit: Circuit being executed"}]},{type:a,value:n},{type:b,tag:c,props:{className:[d,g]},children:[{type:a,value:"\u002F\u002F promise: The Circuit Function being used"}]},{type:a,value:n},{type:b,tag:c,props:{className:[d,g]},children:[{type:a,value:"\u002F\u002F params[]: The list of parameters that needs to be passed to the promise"}]},{type:a,value:n},{type:b,tag:c,props:{className:[d,g]},children:[{type:a,value:"\u002F\u002F Uncomment the line below to get the parameters that have been passed to the execute() function"}]},{type:a,value:n},{type:b,tag:c,props:{className:[d,g]},children:[{type:a,value:"\u002F\u002F const _params = this.getExecParams(circuit, params);"}]},{type:a,value:n},{type:b,tag:c,props:{className:[d,X,w]},children:[{type:a,value:X}]},{type:b,tag:c,props:{className:[d,e]},children:[{type:a,value:s}]},{type:b,tag:c,props:{className:[d,G,q,t]},children:[{type:a,value:"info"}]},{type:b,tag:c,props:{className:[d,e]},children:[{type:a,value:j}]},{type:b,tag:c,props:{className:[d,"template-string"]},children:[{type:b,tag:c,props:{className:[d,Y,u]},children:[{type:a,value:Z}]},{type:b,tag:c,props:{className:[d,_]},children:[{type:b,tag:c,props:{className:[d,z,e]},children:[{type:a,value:$}]},{type:a,value:T},{type:b,tag:c,props:{className:[d,e]},children:[{type:a,value:s}]},{type:b,tag:c,props:{className:[d,t]},children:[{type:a,value:"name"}]},{type:b,tag:c,props:{className:[d,z,e]},children:[{type:a,value:l}]}]},{type:b,tag:c,props:{className:[d,u]},children:[{type:a,value:" - "}]},{type:b,tag:c,props:{className:[d,_]},children:[{type:b,tag:c,props:{className:[d,z,e]},children:[{type:a,value:$}]},{type:b,tag:c,props:{className:[d,h]},children:[{type:a,value:S}]},{type:b,tag:c,props:{className:[d,e]},children:[{type:a,value:s}]},{type:b,tag:c,props:{className:[d,t]},children:[{type:a,value:F}]},{type:b,tag:c,props:{className:[d,z,e]},children:[{type:a,value:l}]}]},{type:b,tag:c,props:{className:[d,Y,u]},children:[{type:a,value:Z}]}]},{type:b,tag:c,props:{className:[d,e]},children:[{type:a,value:k}]},{type:b,tag:c,props:{className:[d,e]},children:[{type:a,value:p}]},{type:a,value:f},{type:b,tag:c,props:{className:[d,g]},children:[{type:a,value:"\u002F\u002F That's some useful stuff"}]},{type:a,value:n},{type:b,tag:c,props:{className:[d,h,aa]},children:[{type:a,value:ab}]},{type:a,value:f},{type:b,tag:c,props:{className:[d,q]},children:[{type:a,value:"promise"}]},{type:b,tag:c,props:{className:[d,e]},children:[{type:a,value:j}]},{type:b,tag:c,props:{className:[d,U,m]},children:[{type:a,value:V}]},{type:a,value:W},{type:b,tag:c,props:{className:[d,e]},children:[{type:a,value:k}]},{type:b,tag:c,props:{className:[d,e]},children:[{type:a,value:p}]},{type:a,value:f},{type:b,tag:c,props:{className:[d,g]},children:[{type:a,value:"\u002F\u002F This just executes normally the method"}]},{type:a,value:r},{type:b,tag:c,props:{className:[d,e]},children:[{type:a,value:l}]},{type:a,value:i},{type:b,tag:c,props:{className:[d,e]},children:[{type:a,value:l}]},{type:a,value:y},{type:b,tag:c,props:{className:[d,g]},children:[{type:a,value:"\u002F\u002F Let's use our new module"}]},{type:a,value:i},{type:b,tag:c,props:{className:[d,h]},children:[{type:a,value:L}]},{type:a,value:" circuit "},{type:b,tag:c,props:{className:[d,m]},children:[{type:a,value:E}]},{type:a,value:f},{type:b,tag:c,props:{className:[d,h]},children:[{type:a,value:ac}]},{type:a,value:f},{type:b,tag:c,props:{className:[d,w]},children:[{type:a,value:N}]},{type:b,tag:c,props:{className:[d,e]},children:[{type:a,value:j}]},{type:b,tag:c,props:{className:[d,e]},children:[{type:a,value:o}]},{type:a,value:"\n  name"},{type:b,tag:c,props:{className:[d,m]},children:[{type:a,value:A}]},{type:a,value:f},{type:b,tag:c,props:{className:[d,u]},children:[{type:a,value:"'UselessCircuit'"}]},{type:b,tag:c,props:{className:[d,e]},children:[{type:a,value:x}]},{type:a,value:"\n  options"},{type:b,tag:c,props:{className:[d,m]},children:[{type:a,value:A}]},{type:a,value:f},{type:b,tag:c,props:{className:[d,e]},children:[{type:a,value:o}]},{type:a,value:"\n    modules"},{type:b,tag:c,props:{className:[d,m]},children:[{type:a,value:A}]},{type:a,value:f},{type:b,tag:c,props:{className:[d,e]},children:[{type:a,value:"["}]},{type:a,value:ad},{type:b,tag:c,props:{className:[d,h]},children:[{type:a,value:ac}]},{type:a,value:f},{type:b,tag:c,props:{className:[d,w]},children:[{type:a,value:P}]},{type:b,tag:c,props:{className:[d,e]},children:[{type:a,value:j}]},{type:b,tag:c,props:{className:[d,e]},children:[{type:a,value:o}]},{type:a,value:"\n        message"},{type:b,tag:c,props:{className:[d,m]},children:[{type:a,value:A}]},{type:a,value:f},{type:b,tag:c,props:{className:[d,u]},children:[{type:a,value:"'Hello World!'"}]},{type:a,value:ad},{type:b,tag:c,props:{className:[d,e]},children:[{type:a,value:l}]},{type:b,tag:c,props:{className:[d,e]},children:[{type:a,value:k}]},{type:a,value:n},{type:b,tag:c,props:{className:[d,e]},children:[{type:a,value:"]"}]},{type:a,value:r},{type:b,tag:c,props:{className:[d,e]},children:[{type:a,value:l}]},{type:a,value:i},{type:b,tag:c,props:{className:[d,e]},children:[{type:a,value:l}]},{type:b,tag:c,props:{className:[d,e]},children:[{type:a,value:k}]},{type:b,tag:c,props:{className:[d,e]},children:[{type:a,value:p}]},{type:a,value:y},{type:b,tag:c,props:{className:[d,g]},children:[{type:a,value:"\u002F\u002F Execute the circuit"}]},{type:a,value:"\ncircuit"},{type:b,tag:c,props:{className:[d,e]},children:[{type:a,value:s}]},{type:b,tag:c,props:{className:[d,G,q,t]},children:[{type:a,value:"fn"}]},{type:b,tag:c,props:{className:[d,e]},children:[{type:a,value:j}]},{type:b,tag:c,props:{className:[d,e]},children:[{type:a,value:j}]},{type:b,tag:c,props:{className:[d,e]},children:[{type:a,value:k}]},{type:a,value:f},{type:b,tag:c,props:{className:[d,"arrow",m]},children:[{type:a,value:"=\u003E"}]},{type:a,value:f},{type:b,tag:c,props:{className:[d,e]},children:[{type:a,value:o}]},{type:a,value:f},{type:b,tag:c,props:{className:[d,h,aa]},children:[{type:a,value:ab}]},{type:b,tag:c,props:{className:[d,e]},children:[{type:a,value:p}]},{type:a,value:f},{type:b,tag:c,props:{className:[d,e]},children:[{type:a,value:l}]},{type:b,tag:c,props:{className:[d,e]},children:[{type:a,value:k}]},{type:b,tag:c,props:{className:[d,e]},children:[{type:a,value:s}]},{type:b,tag:c,props:{className:[d,G,q,t]},children:[{type:a,value:D}]},{type:b,tag:c,props:{className:[d,e]},children:[{type:a,value:j}]},{type:b,tag:c,props:{className:[d,e]},children:[{type:a,value:k}]},{type:b,tag:c,props:{className:[d,e]},children:[{type:a,value:p}]},{type:a,value:y},{type:b,tag:c,props:{className:[d,g]},children:[{type:a,value:"\u002F\u002F Logs will be:"}]},{type:a,value:i},{type:b,tag:c,props:{className:[d,g]},children:[{type:a,value:"\u002F\u002F UselessCircuit - Hello World!"}]},{type:a,value:i}]}]}]}]},dir:"\u002Fapi",path:ae,extension:H,slug:"create-module",createdAt:v,updatedAt:v,navbar:{links:[{title:"Home",path:I}],github:{link:"https:\u002F\u002Fgithub.com\u002Fgenesys\u002Fmollitia"},toc:[],body:{type:B,children:[]},dir:I,path:"\u002F_navbar",extension:H,slug:"_navbar",createdAt:v,updatedAt:v},sidebar:{links:[{group:"A Quick Overview",links:[{title:"Introduction",path:"\u002Foverview\u002Fintroduction"},{title:"Getting Started",path:"\u002Foverview\u002Fgetting-started"}]},{title:"The Circuit",path:"\u002Fapi\u002Fcircuit"},{group:"Core Modules",links:[{title:"Fallback",path:"\u002Fapi\u002Fmodule\u002Ffallback"},{title:"Cache",path:"\u002Fapi\u002Fmodule\u002Fcache"},{title:"Retry",path:"\u002Fapi\u002Fmodule\u002Fretry"},{title:"Timeout",path:"\u002Fapi\u002Fmodule\u002Ftimeout"},{title:"Ratelimit",path:"\u002Fapi\u002Fmodule\u002Fratelimit"},{title:"Bulkhead",path:"\u002Fapi\u002Fmodule\u002Fbulkhead"},{title:"Count Breaker",path:"\u002Fapi\u002Fmodule\u002Fbreaker\u002Fsliding\u002Fcount"},{title:"Time Breaker",path:"\u002Fapi\u002Fmodule\u002Fbreaker\u002Fsliding\u002Ftime"}]},{group:"Core Addons",links:[{title:"Prometheus",path:"https:\u002F\u002Fgenesys.github.io\u002Fmollitia-prometheus\u002F"}]},{group:"Customization",links:[{title:J,path:ae},{title:"Create a addon",path:"\u002Fapi\u002Fcreate-addon"}]}],toc:[],body:{type:B,children:[]},dir:I,path:"\u002F_sidebar",extension:H,slug:"_sidebar",createdAt:v,updatedAt:v}}}],fetch:[],mutations:void 0}}("text","element","span","token","punctuation"," ","comment","keyword","\n","(",")","}","operator","\n    ","{",";","function","\n  ",".","property-access","string","2021-03-12T11:00:32.545Z","class-name",",","\n\n","interpolation-punctuation",":","root","p","execute","=","message","method",".md","\u002F","Create a module","code","const","maybe-class-name","Circuit","Module","UselessModule","parameter","options","this","circuit","spread","...","params","console","template-punctuation","`","interpolation","${","control-flow","return","new","\n      ","\u002Fapi\u002Fcreate-module")));