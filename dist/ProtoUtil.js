define(function(){Date.prototype.format=function(t){var r={"M+":this.getMonth()+1,"d+":this.getDate(),"h+":this.getHours(),"m+":this.getMinutes(),"s+":this.getSeconds(),"q+":Math.floor((this.getMonth()+3)/3),S:this.getMilliseconds()};for(var n in/(y+)/.test(t)&&(t=t.replace(RegExp.$1,this.getFullYear().toString().substr(4-RegExp.$1.length))),r)new RegExp("("+n+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?r[n]:("00"+r[n]).substr(r[n].toString().length)));return t},String.prototype.stripLineBreaks||(String.prototype.stripLineBreaks=function(){return this?this.replace(/(\r\n|\n|\r)/gm,""):this}),String.prototype.format||(String.prototype.format=function(){var n=arguments;return this.replace(/\{(\d+)\}/g,function(t,r){return n[r]})}),String.prototype.startsWith||(String.prototype.startsWith=function(t){return 0===this.indexOf(t)}),String.prototype.endsWith||(String.prototype.endsWith=function(t,r){var n=this.toString();(void 0===r||r>n.length)&&(r=n.length),r-=t.length;var e=n.indexOf(t,r);return-1!==e&&e===r}),String.prototype.padding||(String.prototype.padding=function(t,r){return r=r||"0",this.length<t?r+this.padding(t-1,r):this}),String.prototype.htmlEntityToUnicode||(String.prototype.htmlEntityToUnicode=function(){return this.replace(/&#(([0-9]{1,7})|(x[0-9a-f]{1,6}));?/gi,function(t,r,n,e,i,o){return String.fromCharCode(n||"0"+e)})}),Array.prototype.findByProperty=function(r,n){return this.find(function(t){for(;t[r]===n;)return t})},Array.prototype.clone=function(){return this.slice(0)}});