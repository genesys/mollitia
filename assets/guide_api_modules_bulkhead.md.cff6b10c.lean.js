import{t as v,V as F,N as u,C}from"./chunks/circuit.96ad7feb.js";import{B as f}from"./chunks/bullets.5c04df7c.js";import{d as q,h as t,x as d,j as A,z as k,o as m,c as g,H as n,w as b,k as s,l as B,_ as D,C as w,a as i,Q as V}from"./chunks/framework.b96a75df.js";import"./chunks/theme.a2ff1341.js";const M={class:"bulkhead"},P={class:"content"},S={class:"form"},T={class:"row"},z={class:"row"},Q={class:"row"},W={class:"visualization"},N={class:"row"},O={class:"row"},j=q({__name:"bulkhead",setup(_){const y=t(null),a=t(5),o=t(4),p=t(3e3),E=t([]),h=t([]),e=new v({concurrentSize:a.value,queueSize:o.value,maxQueueWait:p.value}),x=new F({options:{modules:[e]}});d([a],()=>{e.concurrentSize=a.value}),d([a],()=>{e.queueSize=a.value}),d([p],()=>{e.maxQueueWait=p.value});function c(){E.value=e.concurrentBuffer.map(()=>"var(--vp-c-brand-2)"),h.value=e.queueBuffer.map(()=>"var(--vp-c-green-2)")}return A(()=>{e.on("update-concurrent-buffer",c),e.on("update-queue-buffer",c)}),k(()=>{e.off("update-concurrent-buffer",c),e.off("update-queue-buffer",c)}),(H,l)=>(m(),g("div",M,[n(C,{ref_key:"circuitRef",ref:y,circuit:B(x),duration:2e3},{default:b(()=>[s("div",P,[s("div",S,[s("div",T,[n(u,{modelValue:a.value,"onUpdate:modelValue":l[0]||(l[0]=r=>a.value=r),label:"Concurrent Size:"},null,8,["modelValue"])]),s("div",z,[n(u,{modelValue:o.value,"onUpdate:modelValue":l[1]||(l[1]=r=>o.value=r),label:"Queue Size:"},null,8,["modelValue"])]),s("div",Q,[n(u,{modelValue:p.value,"onUpdate:modelValue":l[2]||(l[2]=r=>p.value=r),label:"Max Wait (in ms):"},null,8,["modelValue"])])]),s("div",W,[s("div",N,[n(f,{class:"concurrent",modelValue:E.value,label:"Concurrent:"},null,8,["modelValue"])]),s("div",O,[n(f,{class:"queue",modelValue:h.value,label:"Queue:"},null,8,["modelValue"])])])])]),_:1},8,["circuit"])]))}});const I=D(j,[["__scopeId","data-v-291e1154"]]),R=s("h1",{id:"bulkhead",tabindex:"-1"},[i("Bulkhead "),s("a",{class:"header-anchor",href:"#bulkhead","aria-label":'Permalink to "Bulkhead"'},"​")],-1),U=s("p",null,[i("The "),s("code",null,"Bulkhead"),i(" module allows you to "),s("strong",null,"limit"),i(" concurrent executions of your circuit.")],-1),$=V("",9),Y=JSON.parse('{"title":"Bulkhead","description":"","frontmatter":{},"headers":[],"relativePath":"guide/api/modules/bulkhead.md","filePath":"guide/api/modules/bulkhead.md"}'),L={name:"guide/api/modules/bulkhead.md"},Z=Object.assign(L,{setup(_){return(y,a)=>{const o=w("ClientOnly");return m(),g("div",null,[R,U,n(o,null,{default:b(()=>[n(I)]),_:1}),$])}}});export{Y as __pageData,Z as default};
