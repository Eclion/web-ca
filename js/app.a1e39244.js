(function(t){function e(e){for(var a,r,s=e[0],l=e[1],c=e[2],p=0,d=[];p<s.length;p++)r=s[p],Object.prototype.hasOwnProperty.call(i,r)&&i[r]&&d.push(i[r][0]),i[r]=0;for(a in l)Object.prototype.hasOwnProperty.call(l,a)&&(t[a]=l[a]);u&&u(e);while(d.length)d.shift()();return o.push.apply(o,c||[]),n()}function n(){for(var t,e=0;e<o.length;e++){for(var n=o[e],a=!0,s=1;s<n.length;s++){var l=n[s];0!==i[l]&&(a=!1)}a&&(o.splice(e--,1),t=r(r.s=n[0]))}return t}var a={},i={app:0},o=[];function r(e){if(a[e])return a[e].exports;var n=a[e]={i:e,l:!1,exports:{}};return t[e].call(n.exports,n,n.exports,r),n.l=!0,n.exports}r.m=t,r.c=a,r.d=function(t,e,n){r.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:n})},r.r=function(t){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},r.t=function(t,e){if(1&e&&(t=r(t)),8&e)return t;if(4&e&&"object"===typeof t&&t&&t.__esModule)return t;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var a in t)r.d(n,a,function(e){return t[e]}.bind(null,a));return n},r.n=function(t){var e=t&&t.__esModule?function(){return t["default"]}:function(){return t};return r.d(e,"a",e),e},r.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},r.p="/web-ca/";var s=this["webpackJsonp"]=this["webpackJsonp"]||[],l=s.push.bind(s);s.push=e,s=s.slice();for(var c=0;c<s.length;c++)e(s[c]);var u=l;o.push([0,"chunk-vendors"]),n()})({0:function(t,e,n){t.exports=n("cd49")},"0ffa":function(t,e,n){"use strict";var a=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("v-card",{attrs:{color:"primary"}},[n("v-col",[n("v-row",{attrs:{justify:"end"}},[n("v-btn-toggle",[n("v-btn",{attrs:{color:"primary",depressed:""},on:{click:function(e){return t.updateStatus("running")}}},[n("v-icon",[t._v("mdi-play")])],1),n("v-btn",{attrs:{color:"primary",depressed:""},on:{click:function(e){return t.updateStatus("stopped")}}},[n("v-icon",[t._v("mdi-stop")])],1),n("v-btn",{attrs:{color:"primary",depressed:""},on:{click:function(e){return t.updateStatus("init")}}},[n("v-icon",[t._v("mdi-replay")])],1)],1)],1),n("v-row",[n("v-divider")],1),n("v-row",{attrs:{justify:"center"}},[n("Dish")],1)],1)],1)},i=[],o=n("d4ec"),r=n("bee2"),s=n("262e"),l=n("2caf"),c=n("9ab4"),u=n("60a3"),p=n("5fc4"),d=n("4bb5"),f=function(t){Object(s["a"])(n,t);var e=Object(l["a"])(n);function n(){return Object(o["a"])(this,n),e.apply(this,arguments)}return Object(r["a"])(n,[{key:"updateStatus",value:function(t){this.$store.commit("simulation/setStatus",t)}}]),n}(u["d"]);Object(c["a"])([Object(d["b"])("status",{namespace:"simulation"})],f.prototype,"status",void 0),f=Object(c["a"])([Object(u["a"])({components:{Dish:p["a"]}})],f);var v=f,b=v,m=n("2877"),h=n("6544"),y=n.n(h),j=n("8336"),O=n("a609"),C=n("b0af"),g=n("62ad"),x=n("ce7e"),k=n("132d"),w=n("0fd9"),V=Object(m["a"])(b,a,i,!1,null,null,null);e["a"]=V.exports;y()(V,{VBtn:j["a"],VBtnToggle:O["a"],VCard:C["a"],VCol:g["a"],VDivider:x["a"],VIcon:k["a"],VRow:w["a"]})},"1ff0":function(t,e,n){"use strict";(function(t){var a=n("d4ec"),i=n("bee2"),o=n("262e"),r=n("2caf"),s=n("9ab4"),l=n("60a3"),c=n("b156"),u=n("0ffa"),p=n("5fc4"),d=n("4bb5"),f=function(e){Object(o["a"])(s,e);var n=Object(r["a"])(s);function s(){var e;return Object(a["a"])(this,s),e=n.apply(this,arguments),e.worker=new Worker(t,void 0),e}return Object(i["a"])(s,[{key:"resetSimulation",value:function(){this.init()}},{key:"init",value:function(){this.worker.postMessage(JSON.stringify({action:"init",params:{dishDimensions:this.dimensions,cellTypes:this.cellTypes}})),this.$store.commit("simulation/setStatus","")}},{key:"runSimulation",value:function(){this.$store.commit("simulation/setStatus","running"),this.worker.postMessage(JSON.stringify({action:"run"}))}},{key:"stopSimulation",value:function(){this.$store.commit("simulation/status","stopped")}},{key:"beforeDestroy",value:function(){this.worker.terminate()}},{key:"watchStatus",value:function(){switch(this.status){case"running":this.runSimulation();break;case"init":this.init();break;default:break}}},{key:"mounted",value:function(){var t=this;this.worker.onmessage=function(e){void 0!==e.data&&(t.$store.commit("displayedCells/update",e.data.cells),"running"===t.status&&(t.$store.commit("simulation/decrementStepCount"),t.worker.postMessage(JSON.stringify({action:"run"}))))},this.init()}}]),s}(l["d"]);Object(s["a"])([Object(d["b"])("status",{namespace:"simulation"})],f.prototype,"status",void 0),Object(s["a"])([Object(d["b"])("remainingStepCount",{namespace:"simulation"})],f.prototype,"remainingStepCount",void 0),Object(s["a"])([Object(d["a"])("dimensions",{namespace:"dish"})],f.prototype,"dimensions",void 0),Object(s["a"])([Object(d["a"])("all",{namespace:"cellTypes"})],f.prototype,"cellTypes",void 0),Object(s["a"])([Object(l["e"])("dimensions"),Object(l["e"])("cellTypes")],f.prototype,"resetSimulation",null),Object(s["a"])([Object(l["e"])("status")],f.prototype,"watchStatus",null),f=Object(s["a"])([Object(l["a"])({components:{Parameters:c["a"],Dish:p["a"],SimulationDisplay:u["a"]}})],f),e["a"]=f}).call(this,n("8806"))},"5fc4":function(t,e,n){"use strict";var a=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("canvas",{ref:"dish"})},i=[],o=n("d4ec"),r=n("bee2"),s=n("262e"),l=n("2caf"),c=n("9ab4"),u=n("60a3"),p=n("4bb5"),d=function(t){Object(s["a"])(n,t);var e=Object(l["a"])(n);function n(){return Object(o["a"])(this,n),e.apply(this,arguments)}return Object(r["a"])(n,[{key:"draw",value:function(){var t=this.dimensions.width,e=this.dimensions.height,n=this.$refs.dish,a=n.getContext("2d");if(null!==n.parentElement&&null!==a){var i=Math.max(1,Math.floor(n.parentElement.clientWidth/t));n.width=t*i,n.height=e*i;for(var o=0;o<t;o++)for(var r=0;r<e;r++){a.fillStyle=this.colorMap[this.displayedCells[o][r]];var s=o*i,l=r*i;a.fillRect(s,l,i,i)}}else console.error("dish has no parent or no context !!!")}},{key:"mounted",value:function(){this.draw()}}]),n}(u["d"]);Object(c["a"])([Object(p["a"])("colorMap",{namespace:"cellTypes"})],d.prototype,"colorMap",void 0),Object(c["a"])([Object(p["a"])("get",{namespace:"displayedCells"})],d.prototype,"displayedCells",void 0),Object(c["a"])([Object(p["a"])("dimensions",{namespace:"dish"})],d.prototype,"dimensions",void 0),Object(c["a"])([Object(u["e"])("colorMap"),Object(u["e"])("displayedCells")],d.prototype,"draw",null),d=Object(c["a"])([u["a"]],d);var f=d,v=f,b=n("2877"),m=Object(b["a"])(v,a,i,!1,null,null,null);e["a"]=m.exports},8806:function(t,e,n){t.exports=n.p+"js/0.e725f1c9.worker.js"},b156:function(t,e,n){"use strict";var a=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("v-card",{attrs:{color:"primary"}},[n("v-card-title",[t._v("Parameters")]),n("v-divider"),n("v-expansion-panels",{attrs:{multiple:""}},[n("DishPanel"),n("CellTypesPanel"),n("SimulationPanel")],1)],1)},i=[],o=n("d4ec"),r=n("262e"),s=n("2caf"),l=n("9ab4"),c=n("60a3"),u=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("v-expansion-panel",[n("v-expansion-panel-header",{attrs:{color:"primary"}},[n("v-row",[n("v-col",{attrs:{cols:"6"}},[t._v("Cells types")]),n("v-spacer"),n("v-col",{attrs:{cols:"2"}},[n("v-btn",{attrs:{color:"primary",depressed:""},on:{click:[function(t){t.stopPropagation()},function(e){return t.add()}]}},[n("v-icon",[t._v("mdi-plus")])],1)],1)],1)],1),n("v-expansion-panel-content",{attrs:{color:"primary"}},[n("v-expansion-panels",{attrs:{multiple:""}},t._l(t.cellTypes,(function(t){return n("CellTypeConfig",{key:t.id,attrs:{name:t.name,id:t.id,color:t.color,initialCount:t.initialCount,distribution:t.distribution}})})),1)],1)],1)},p=[],d=n("bee2"),f=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("v-expansion-panel",{attrs:{color:"primary",readonly:"Empty"===this.name}},[n("v-expansion-panel-header",{attrs:{color:"primary","expand-icon":""}},[n("v-row",{attrs:{"align-content":"end"}},[n("v-col",{staticStyle:{padding:"0"},attrs:{cols:"4"}},[n("v-text-field",{attrs:{"hide-details":"",solo:"","background-color":"primary",flat:"",disabled:"Empty"===this.name},on:{click:function(t){t.stopPropagation()}},model:{value:t.name,callback:function(e){t.name=e},expression:"name"}})],1),n("v-spacer"),"Empty"!==this.name?n("v-col",{attrs:{cols:"2"}},[n("v-btn",{attrs:{color:"secondary",depressed:""},on:{click:function(e){return t.deleteCellType()}}},[n("v-icon",[t._v("mdi-minus")])],1)],1):t._e(),n("v-col",{staticStyle:{padding:"0"},attrs:{cols:"1","align-self":"center"}},[n("ColorPickerPopup",{attrs:{color:this.color},on:{"update:color":function(e){return t.updateColor(e)}}})],1)],1)],1),"Empty"!==this.name?n("v-expansion-panel-content",{attrs:{color:"primary"}},[n("v-row",[n("v-col",{attrs:{cols:"6"}},[n("v-card-text",[t._v("Number of cells:")])],1),n("v-col",{attrs:{cols:"3"}},[n("v-text-field",{attrs:{type:"number",value:t.initialCount},on:{input:function(e){t.updateInitialCount(Number(e))}}})],1)],1),n("v-row",[n("v-col",{attrs:{cols:"6"}},[n("v-card-text",[t._v("Cell distribution:")])],1),n("v-col",{attrs:{cols:"4"}})],1)],1):t._e()],1)},v=[],b=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("v-menu",{attrs:{top:"","nudge-bottom":"105","nudge-left":"16","close-on-content-click":!1},scopedSlots:t._u([{key:"activator",fn:function(e){var a=e.on;return[n("div",t._g({style:t.swatchStyle},a))]}}]),model:{value:t.menu,callback:function(e){t.menu=e},expression:"menu"}},[n("v-card",[n("v-card-text",{staticClass:"pa-0"},[n("v-color-picker",{attrs:{flat:"","background-color":"primary","hide-inputs":""},model:{value:t.syncedColor,callback:function(e){t.syncedColor=e},expression:"syncedColor"}})],1)],1)],1)},m=[],h=function(t){Object(r["a"])(n,t);var e=Object(s["a"])(n);function n(){return Object(o["a"])(this,n),e.apply(this,arguments)}return Object(d["a"])(n,[{key:"data",value:function(){return{menu:!1}}},{key:"swatchStyle",get:function(){return{backgroundColor:this.syncedColor,cursor:"pointer",height:"30px",width:"30px",borderRadius:"4px"}}}]),n}(c["d"]);Object(l["a"])([Object(c["c"])("color",{type:String})],h.prototype,"syncedColor",void 0),h=Object(l["a"])([c["a"]],h);var y=h,j=y,O=n("2877"),C=n("6544"),g=n.n(C),x=n("b0af"),k=n("99d9"),w=n("03a4"),V=n("e449"),S=Object(O["a"])(j,b,m,!1,null,null,null),T=S.exports;g()(S,{VCard:x["a"],VCardText:k["b"],VColorPicker:w["a"],VMenu:V["a"]});var _=function(t){Object(r["a"])(n,t);var e=Object(s["a"])(n);function n(){return Object(o["a"])(this,n),e.apply(this,arguments)}return Object(d["a"])(n,[{key:"updateColor",value:function(t){this.$store.commit("cellTypes/updateColor",{id:this.id,color:t})}},{key:"updateInitialCount",value:function(t){this.$store.commit("cellTypes/updateInitialCount",{id:this.id,initialCount:t})}},{key:"deleteCellType",value:function(){this.$store.commit("cellTypes/delete",this.id)}}]),n}(c["d"]);Object(l["a"])([Object(c["b"])()],_.prototype,"id",void 0),Object(l["a"])([Object(c["b"])()],_.prototype,"name",void 0),Object(l["a"])([Object(c["b"])()],_.prototype,"color",void 0),Object(l["a"])([Object(c["b"])()],_.prototype,"initialCount",void 0),_=Object(l["a"])([Object(c["a"])({components:{ColorPickerPopup:T}})],_);var P=_,$=P,E=n("8336"),F=n("62ad"),D=n("cd55"),M=n("49e2"),I=n("c865"),A=n("132d"),H=n("0fd9"),B=n("2fa4"),N=n("8654"),R=Object(O["a"])($,f,v,!1,null,null,null),W=R.exports;g()(R,{VBtn:E["a"],VCardText:k["b"],VCol:F["a"],VExpansionPanel:D["a"],VExpansionPanelContent:M["a"],VExpansionPanelHeader:I["a"],VIcon:A["a"],VRow:H["a"],VSpacer:B["a"],VTextField:N["a"]});var J=n("4bb5"),L=function(t){Object(r["a"])(n,t);var e=Object(s["a"])(n);function n(){return Object(o["a"])(this,n),e.apply(this,arguments)}return Object(d["a"])(n,[{key:"add",value:function(){this.$store.commit("cellTypes/new")}}]),n}(c["d"]);Object(l["a"])([Object(J["b"])("cellTypes",{namespace:"cellTypes"})],L.prototype,"cellTypes",void 0),L=Object(l["a"])([Object(c["a"])({components:{CellTypeConfig:W}})],L);var K=L,q=K,z=n("0393"),G=Object(O["a"])(q,u,p,!1,null,null,null),Q=G.exports;g()(G,{VBtn:E["a"],VCol:F["a"],VExpansionPanel:D["a"],VExpansionPanelContent:M["a"],VExpansionPanelHeader:I["a"],VExpansionPanels:z["a"],VIcon:A["a"],VRow:H["a"],VSpacer:B["a"]});var U=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("v-expansion-panel",[n("v-expansion-panel-header",{attrs:{color:"primary"}},[t._v("Dish")]),n("v-expansion-panel-content",{attrs:{color:"primary"}},[n("v-row",[n("v-col",{attrs:{cols:"3"}},[n("v-card-text",[t._v("Dish:")])],1),n("v-col",{attrs:{cols:"3"}},[n("v-text-field",{attrs:{type:"number",label:"Height"},on:{input:function(e){t.updateHeight(Number(e))}},model:{value:t.dimensions.height,callback:function(e){t.$set(t.dimensions,"height",e)},expression:"dimensions.height"}})],1),n("v-col",{attrs:{cols:"3"}},[n("v-text-field",{attrs:{type:"number",label:"Width"},on:{input:function(e){t.updateWidth(Number(e))}},model:{value:t.dimensions.width,callback:function(e){t.$set(t.dimensions,"width",e)},expression:"dimensions.width"}})],1),n("v-col",{attrs:{cols:"3"}},[n("v-text-field",{attrs:{type:"number",label:"Depth"},on:{input:function(e){t.updateDepth(Number(e))}},model:{value:t.dimensions.depth,callback:function(e){t.$set(t.dimensions,"depth",e)},expression:"dimensions.depth"}})],1),n("v-spacer")],1)],1)],1)},X=[],Y=function(t){Object(r["a"])(n,t);var e=Object(s["a"])(n);function n(){return Object(o["a"])(this,n),e.apply(this,arguments)}return Object(d["a"])(n,[{key:"updateWidth",value:function(t){t<=0||this.$store.commit("dish/setWidth",t)}},{key:"updateHeight",value:function(t){t<=0||this.$store.commit("dish/setHeight",t)}},{key:"updateDepth",value:function(t){t<=0||this.$store.commit("dish/setDepth",t)}}]),n}(c["d"]);Object(l["a"])([Object(J["a"])("dimensions",{namespace:"dish"})],Y.prototype,"dimensions",void 0),Y=Object(l["a"])([c["a"]],Y);var Z=Y,tt=Z,et=Object(O["a"])(tt,U,X,!1,null,null,null),nt=et.exports;g()(et,{VCardText:k["b"],VCol:F["a"],VExpansionPanel:D["a"],VExpansionPanelContent:M["a"],VExpansionPanelHeader:I["a"],VRow:H["a"],VSpacer:B["a"],VTextField:N["a"]});var at=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("v-expansion-panel",[n("v-expansion-panel-header",{attrs:{color:"primary"}},[t._v("Simulation")]),n("v-expansion-panel-content",{attrs:{color:"primary"}},[n("v-row",[n("v-col",{attrs:{cols:"3"}},[n("v-card-text",[t._v("Step count:")])],1),n("v-col",{attrs:{cols:"3"}},[n("v-text-field",{attrs:{type:"number",label:"",value:t.stepCount},on:{input:function(e){t.updateStepCount(Number(e))}}})],1),n("v-spacer")],1)],1)],1)},it=[],ot=function(t){Object(r["a"])(n,t);var e=Object(s["a"])(n);function n(){return Object(o["a"])(this,n),e.apply(this,arguments)}return Object(d["a"])(n,[{key:"updateStepCount",value:function(t){t<=0||this.$store.commit("simulation/setStepCount",t)}}]),n}(c["d"]);Object(l["a"])([Object(J["b"])("stepCount",{namespace:"simulation"})],ot.prototype,"stepCount",void 0),ot=Object(l["a"])([c["a"]],ot);var rt=ot,st=rt,lt=Object(O["a"])(st,at,it,!1,null,null,null),ct=lt.exports;g()(lt,{VCardText:k["b"],VCol:F["a"],VExpansionPanel:D["a"],VExpansionPanelContent:M["a"],VExpansionPanelHeader:I["a"],VRow:H["a"],VSpacer:B["a"],VTextField:N["a"]});var ut=function(t){Object(r["a"])(n,t);var e=Object(s["a"])(n);function n(){return Object(o["a"])(this,n),e.apply(this,arguments)}return n}(c["d"]);ut=Object(l["a"])([Object(c["a"])({components:{CellTypesPanel:Q,DishPanel:nt,SimulationPanel:ct}})],ut);var pt=ut,dt=pt,ft=n("ce7e"),vt=Object(O["a"])(dt,a,i,!1,null,null,null);e["a"]=vt.exports;g()(vt,{VCard:x["a"],VCardTitle:k["c"],VDivider:ft["a"],VExpansionPanels:z["a"]})},cd49:function(t,e,n){"use strict";n.r(e);n("e260"),n("e6cf"),n("cca6"),n("a79d");var a=n("2b0e"),i=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("v-app",[n("v-app-bar",{staticStyle:{flex:"0 1 auto"}},[n("v-tabs",{model:{value:t.tab,callback:function(e){t.tab=e},expression:"tab"}},[n("v-tab",[t._v("Model")]),n("v-tab",[t._v("Papers")])],1),n("v-switch",{attrs:{"hide-details":"",inset:"",label:"Dark mode"},model:{value:t.$vuetify.theme.dark,callback:function(e){t.$set(t.$vuetify.theme,"dark",e)},expression:"$vuetify.theme.dark"}}),n("v-btn",{attrs:{href:"https://github.com/Eclion/web-ca/",target:"_blank",text:""}},[n("v-icon",{attrs:{large:""}},[t._v("mdi-github")])],1)],1),n("v-container",[n("v-tabs-items",{model:{value:t.tab,callback:function(e){t.tab=e},expression:"tab"}},[n("v-tab-item",[n("SimulationPage")],1),n("v-tab-item",[n("PapersPage")],1)],1)],1)],1)},o=[],r=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("v-container",[n("v-row",{attrs:{"align-content":"center"}},[n("v-col",{attrs:{cols:"7"}},[n("Parameters")],1),n("v-col",{attrs:{cols:"5"}},[n("SimulationDisplay")],1)],1)],1)},s=[],l=n("1ff0"),c=l["a"],u=n("2877"),p=n("6544"),d=n.n(p),f=n("62ad"),v=n("a523"),b=n("0fd9"),m=Object(u["a"])(c,r,s,!1,null,null,null),h=m.exports;d()(m,{VCol:f["a"],VContainer:v["a"],VRow:b["a"]});var y=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("v-flex",{attrs:{"d-flex":""}},[n("v-layout",{attrs:{wrap:""}},t._l(t.papers,(function(e){return n("v-flex",{key:e.title},[n("v-card",{staticClass:"card-container"},[n("v-card-title",[n("a",{attrs:{href:e.url}},[t._v(t._s(e.title))])]),n("v-card-subtitle",[t._v(t._s(e.authors.join(", ")))])],1)],1)})),1)],1)},j=[],O=(n("b0c0"),n("d4ec")),C=n("262e"),g=n("2caf"),x=n("9ab4"),k=n("60a3"),w=function(t){Object(C["a"])(n,t);var e=Object(g["a"])(n);function n(){var t;return Object(O["a"])(this,n),t=e.apply(this,arguments),t.name="PaperList",t.papers=[{title:"Defining rules for cancer cell proliferation in TRAIL stimulation",authors:["William Deveaux","Kentaro Hayashi","Kumar Selvarajoo"],publisher:"npjSystems Biology and Applications",url:"https://www.nature.com/articles/s41540-019-0084-5"}],t}return n}(k["d"]);w=Object(x["a"])([k["a"]],w);var V=w,S=V,T=n("b0af"),_=n("99d9"),P=n("0e8f"),$=n("a722"),E=Object(u["a"])(S,y,j,!1,null,null,null),F=E.exports;d()(E,{VCard:T["a"],VCardSubtitle:_["a"],VCardTitle:_["c"],VFlex:P["a"],VLayout:$["a"]});var D=a["default"].extend({name:"App",components:{SimulationPage:h,PapersPage:F},data:function(){return{tab:null}}}),M=D,I=n("7496"),A=n("40dc"),H=n("8336"),B=n("132d"),N=n("b73d"),R=n("71a3"),W=n("c671"),J=n("fe57"),L=n("aac8"),K=Object(u["a"])(M,i,o,!1,null,null,null),q=K.exports;d()(K,{VApp:I["a"],VAppBar:A["a"],VBtn:H["a"],VContainer:v["a"],VIcon:B["a"],VSwitch:N["a"],VTab:R["a"],VTabItem:W["a"],VTabs:J["a"],VTabsItems:L["a"]});var z=n("2f62"),G=(n("cb29"),{namespaced:!0,state:{displayedCells:Array(100).fill(Array(100).fill(0))},getters:{get:function(t){return t.displayedCells}},mutations:{update:function(t,e){t.displayedCells=e}}}),Q=(n("4de4"),n("c975"),n("d81d"),n("13d5"),n("a434"),n("d3b7"),n("25f0"),n("ade3")),U=n("5530"),X=n("53ca"),Y=n("bee2"),Z=(n("5db7"),n("73d9"),function(){function t(){Object(O["a"])(this,t),this.type="random"}return Object(Y["a"])(t,[{key:"apply",value:function(t,e,n){for(var a=t.length,i=t[0].length,o=t.flatMap((function(t){return t})).map((function(t){return t[0]})).filter((function(t){return 0===t})).length,r=n/o,s=0;s<a;s++)for(var l=0;l<i;l++)0===t[s][l][0]&&(t[s][l][0]=Math.random()<=r?e:0);return t}}]),t}()),tt=function(){function t(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};Object(O["a"])(this,t);var n=e.id,a=void 0===n?0:n,i=e.name,o=void 0===i?"Empty":i,r=e.color,s=void 0===r?"#333333":r,l=e.initialCount,c=void 0===l?-1:l,u=e.distribution,p=void 0===u?null:u;if(this.id=a,this.name=o,this.color=s,this.initialCount=c,null!==p&&"object"===Object(X["a"])(p))switch(p.type){case"random":this.distribution=new Z;break;default:this.distribution=null;break}else this.distribution=p}return Object(Y["a"])(t,[{key:"distribute",value:function(t){return null===this.distribution||this.initialCount<=0?t:this.distribution.apply(t,this.id,this.initialCount)}}]),t}(),et={namespaced:!0,state:{cellTypes:Array(new tt,new tt({id:1,name:"Live",color:"#FFFFFF",initialCount:100,distribution:new Z}))},getters:{all:function(t){return t.cellTypes},get:function(t){return function(e){return t.cellTypes.filter((function(t){return t.id===e}))[0]}},colorMap:function(t){return t.cellTypes.reduce((function(t,e){return Object(U["a"])(Object(U["a"])({},t),{},Object(Q["a"])({},e.id,e.color))}),{})}},mutations:{add:function(t,e){t.cellTypes.push(e)},new:function(t){var e=t.cellTypes.map((function(t){return t.id})).reduce((function(t,e){return Math.max(t,e)}))+1;t.cellTypes.push(new tt({id:e,name:"Type "+e,color:"#"+(16777216+16777215*Math.random()).toString(16).substr(1,6),initialCount:100,distribution:new Z}))},delete:function(t,e){var n=t.cellTypes.filter((function(t){return t.id===e}))[0],a=t.cellTypes.indexOf(n);t.cellTypes.splice(a,1),t.cellTypes.sort((function(t,e){return t.id-e.id}))},update:function(t,e){void 0===t.cellTypes.filter((function(t){return t.id===e.id})).map((function(t){return e}))[0]&&t.cellTypes.push(e)},updateColor:function(t,e){var n=t.cellTypes.filter((function(t){return t.id===e.id}))[0],a=t.cellTypes.indexOf(n);t.cellTypes.splice(a,1),n.color=e.color,t.cellTypes.push(n),t.cellTypes.sort((function(t,e){return t.id-e.id}))},updateInitialCount:function(t,e){var n=t.cellTypes.filter((function(t){return t.id===e.id}))[0],a=t.cellTypes.indexOf(n);t.cellTypes.splice(a,1),n.initialCount=e.initialCount,t.cellTypes.push(n),t.cellTypes.sort((function(t,e){return t.id-e.id}))}}},nt={namespaced:!0,state:{width:30,height:30,depth:1},getters:{dimensions:function(t){return{width:t.width,height:t.height,depth:t.depth}}},mutations:{setWidth:function(t,e){t.width=e},setHeight:function(t,e){t.height=e},setDepth:function(t,e){t.depth=e}}},at={namespaced:!0,state:{stepCount:20,remainingStepCount:20,status:"init"},mutations:{setStepCount:function(t,e){t.remainingStepCount+=e-t.stepCount,t.stepCount=e,t.remainingStepCount<=0&&(t.status="stopped")},setStatus:function(t,e){t.status=e,"init"===e&&(t.remainingStepCount=t.stepCount)},decrementStepCount:function(t){t.remainingStepCount-=1,t.remainingStepCount<=0&&(t.status="stopped")}}};a["default"].use(z["a"]);var it=new z["a"].Store({state:{},mutations:{},actions:{},modules:{cellTypes:et,displayedCells:G,dish:nt,simulation:at}}),ot=n("ce5b"),rt=n.n(ot),st=n("fcf4");a["default"].use(rt.a);var lt=new rt.a({theme:{themes:{light:{primary:st["a"].cyan.base,secondary:"#424242",accent:"#82B1FF",error:"#FF5252",info:"#2196F3",success:"#4CAF50",warning:"#FFC107"},dark:{primary:"#1976D2",secondary:"#424242",accent:"#82B1FF",error:"#FF5252",info:"#2196F3",success:"#4CAF50",warning:"#FFC107"}},dark:!0}});a["default"].config.productionTip=!1,new a["default"]({store:it,vuetify:lt,render:function(t){return t(q)}}).$mount("#app")}});
//# sourceMappingURL=app.a1e39244.js.map