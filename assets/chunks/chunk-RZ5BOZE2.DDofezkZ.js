import{_ as n,d as r,e as d,l as g}from"../app.BPre3miM.js";var u=n((e,t)=>{let o;return t==="sandbox"&&(o=r("#i"+e)),(t==="sandbox"?r(o.nodes()[0].contentDocument.body):r("body")).select(`[id="${e}"]`)},"getDiagramElement"),b=n((e,t,o,i)=>{e.attr("class",o);const{width:a,height:s,x:h,y:x}=l(e,t);d(e,s,a,i);const c=w(h,x,a,s,t);e.attr("viewBox",c),g.debug(`viewBox configured: ${c} with padding: ${t}`)},"setupViewPortForSVG"),l=n((e,t)=>{var i;const o=((i=e.node())==null?void 0:i.getBBox())||{width:0,height:0,x:0,y:0};return{width:o.width+t*2,height:o.height+t*2,x:o.x,y:o.y}},"calculateDimensionsWithPadding"),w=n((e,t,o,i,a)=>`${e-a} ${t-a} ${o} ${i}`,"createViewBox");export{u as g,b as s};
