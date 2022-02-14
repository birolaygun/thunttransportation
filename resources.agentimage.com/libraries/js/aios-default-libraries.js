"use strict";function _toConsumableArray(e){if(Array.isArray(e)){for(var t=0,r=Array(e.length);t<e.length;t++)r[t]=e[t];return r}return Array.from(e)}function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}var _createClass=function(){function e(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}return function(t,r,n){return r&&e(t.prototype,r),n&&e(t,n),t}}();Document.prototype.aiosLoad=function(e){e&&"function"==typeof e&&window.addEventListener("load",function(){if("interactive"===document.readyState||"complete"===document.readyState)return e()})},Document.prototype.aiosReady=function(e){e&&"function"==typeof e&&document.addEventListener("DOMContentLoaded",function(){if("interactive"===document.readyState||"complete"===document.readyState)return e()})};var aiosAddStylesheetRules=function(){function e(t){_classCallCheck(this,e),this.rules=t,this.render()}return _createClass(e,[{key:"render",value:function(){var e=document.createElement("style");document.head.appendChild(e);for(var t=e.sheet,r=0;r<this.rules.length;r++){var n=1,a=this.rules[r],o=a[0],i="";Array.isArray(a[1][0])&&(a=a[1],n=0);for(var s=a.length;n<s;n++){var c=a[n];i+=c[0]+": "+c[1]+" "+(c[2]?" !important":"")+";\n"}t.insertRule(o+" {"+i+"}",t.cssRules.length)}}}]),e}(),aiosResponsiveImages=function(){function e(t){_classCallCheck(this,e),this.element=t,this.src="",this.defaultSrc=this.element.getAttribute("data-bg-src"),this.regexRemoveSpaces=/[\s\t]+/g,this.regexGetImageUrlFromString=/(http)?s?:?(\/\/[^"']*\.(?:png|jpg|jpeg|gif|png|svg))/g,this.viewportWidth=window.innerWidth,this.ready()}return _createClass(e,[{key:"ready",value:function(){var e=this.element.getAttribute("data-bg-srcset");this.update(e.split(","))}},{key:"update",value:function(e){if(Array.isArray(e)){e=e.reverse();for(var t=void 0,r=0;r<e.length;r++){var n=e[r],a=(n=n.replace(this.regexRemoveSpaces,"")).replace(this.regexGetImageUrlFromString,"");a=a.replace("w","");var o=n.match(this.regexGetImageUrlFromString);if(this.viewportWidth<=a){t=o;break}}this.render(t)}}},{key:"render",value:function(e){var t=this.defaultSrc;void 0!==e&&(t=e),this.element.style.backgroundImage='url("'+t+'")'}}]),e}();document.aiosReady(function(){for(var e=document.querySelectorAll(".responsive-background-image"),t=0;t<e.length;t++)!function(t){var r=e[t].className;(r=r.split(" ")).indexOf("lazyloaded")>0?document.aiosLoad(function(){setTimeout(function(){new aiosResponsiveImages(e[t])},100*t)}):new aiosResponsiveImages(e[t])}(t)});var aiosMobileDoubleTap=function(){function e(t){var r=this;_classCallCheck(this,e),this.element=t,this.ctrlActive=!1,this.ready(),this.element.addEventListener("touchstart",function(e){r.touchGesture(e)}),this.element.addEventListener("mousedown",function(e){r.mouseGestures(e)}),document.addEventListener("keydown",function(e){17==e.which&&(r.ctrlActive=!0)}),document.addEventListener("keyup",function(e){17==e.which&&(r.ctrlActive=!1)}),this.element.addEventListener("click",function(e){r.openUrl(e,e.target.closest("a"))}),document.body.addEventListener("click",function(e){r.reset()})}return _createClass(e,[{key:"ready",value:function(){this.element.className+=" mobile-anchor-pointer"}},{key:"touchGesture",value:function(e){e.stopPropagation(),document.body.style.cursor="pointer",document.body.style.webkitTapHighlightColor="transparent",[].forEach.call(document.querySelectorAll(".mobile-anchor-pointer"),function(e,t){e.addEventListener("click",function(){for(var t=[].concat(_toConsumableArray(document.querySelectorAll(".mobile-anchor-pointer"))).filter(function(t){return t!==e}),r=0;r<t.length;r++)t[r].classList.remove("mobile-anchor-redirect","mobile-anchor-active","mobile-anchor-touchstart")})}),e.target.closest("a").classList.add("mobile-anchor-touchstart"),e.target.closest("a").classList.contains("mobile-anchor-active")?e.target.closest("a").classList.add("mobile-anchor-redirect"):e.target.closest("a").classList.add("mobile-anchor-active")}},{key:"mouseGestures",value:function(e){e.target.closest("a").classList.contains("mobile-anchor-touchstart")||e.target.closest("a").classList.add("mobile-anchor-redirect")}},{key:"openUrl",value:function(e,t){if(e.preventDefault(),e.stopPropagation(),e.target.closest("a").classList.contains("mobile-anchor-redirect")&&0==e.target.closest("a").classList.contains("aios-initial-setup-dead-link")){var r=e.target.closest("a").getAttribute("href"),n=null===e.target.closest("a").getAttribute("target")?"_self":e.target.closest("a").getAttribute("target");if(null==r)return!1;if("#"==r)return!1;this.ctrlActive&&(n="_blank"),window.open(r,n)}}},{key:"reset",value:function(){document.body.style.cursor="auto",document.body.style.webkitTapHighlightColor="inherit",this.element.classList.remove("mobile-anchor-redirect","mobile-anchor-active","mobile-anchor-touchstart")}}]),e}();document.aiosReady(function(){for(var e=document.querySelectorAll(".mobile-hover"),t=0;t<e.length;t++)new aiosMobileDoubleTap(e[t])}),new aiosAddStylesheetRules([[".mobile-hover",["-webkit-user-select","none"],["-webkit-touch-callout","none"]]]);