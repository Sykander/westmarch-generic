(function(){var e=Object.create,t=Object.defineProperty,n=Object.getOwnPropertyDescriptor,r=Object.getOwnPropertyNames,i=Object.getPrototypeOf,a=Object.prototype.hasOwnProperty,o=(e,t)=>()=>(t||(e((t={exports:{}}).exports,t),e=null),t.exports),s=(e,i,o,s)=>{if(i&&typeof i==`object`||typeof i==`function`)for(var c=r(i),l=0,u=c.length,d;l<u;l++)d=c[l],!a.call(e,d)&&d!==o&&t(e,d,{get:(e=>i[e]).bind(null,d),enumerable:!(s=n(i,d))||s.enumerable});return e},c=(n,r,a)=>(a=n==null?{}:e(i(n)),s(r||!n||!n.__esModule?t(a,`default`,{value:n,enumerable:!0}):a,n)),l=o(((e,t)=>{t.exports={}})),u=Object.defineProperty,d=(e,t)=>u(e,`name`,{value:t,configurable:!0}),f=(e=>typeof require<`u`?require:typeof Proxy<`u`?new Proxy(e,{get:(e,t)=>(typeof require<`u`?require:e)[t]}):e)(function(e){if(typeof require<`u`)return require.apply(this,arguments);throw Error(`Dynamic require of "`+e+`" is not supported`)}),ee=(()=>{for(var e=new Uint8Array(128),t=0;t<64;t++)e[t<26?t+65:t<52?t+71:t<62?t-4:t*4-205]=t;return t=>{for(var n=t.length,r=new Uint8Array((n-(t[n-1]==`=`)-(t[n-2]==`=`))*3/4|0),i=0,a=0;i<n;){var o=e[t.charCodeAt(i++)],s=e[t.charCodeAt(i++)],c=e[t.charCodeAt(i++)],l=e[t.charCodeAt(i++)];r[a++]=o<<2|s>>4,r[a++]=s<<4|c>>2,r[a++]=c<<6|l}return r}})();function p(e){return!isNaN(parseFloat(e))&&isFinite(e)}d(p,`_isNumber`);function m(e){return e.charAt(0).toUpperCase()+e.substring(1)}d(m,`_capitalize`);function h(e){return function(){return this[e]}}d(h,`_getter`);var g=[`isConstructor`,`isEval`,`isNative`,`isToplevel`],_=[`columnNumber`,`lineNumber`],v=[`fileName`,`functionName`,`source`],y=g.concat(_,v,[`args`],[`evalOrigin`]);function b(e){if(e)for(var t=0;t<y.length;t++)e[y[t]]!==void 0&&this[`set`+m(y[t])](e[y[t]])}for(d(b,`StackFrame`),b.prototype={getArgs:d(function(){return this.args},`getArgs`),setArgs:d(function(e){if(Object.prototype.toString.call(e)!==`[object Array]`)throw TypeError(`Args must be an Array`);this.args=e},`setArgs`),getEvalOrigin:d(function(){return this.evalOrigin},`getEvalOrigin`),setEvalOrigin:d(function(e){if(e instanceof b)this.evalOrigin=e;else if(e instanceof Object)this.evalOrigin=new b(e);else throw TypeError(`Eval Origin must be an Object or StackFrame`)},`setEvalOrigin`),toString:d(function(){var e=this.getFileName()||``,t=this.getLineNumber()||``,n=this.getColumnNumber()||``,r=this.getFunctionName()||``;return this.getIsEval()?e?`[eval] (`+e+`:`+t+`:`+n+`)`:`[eval]:`+t+`:`+n:r?r+` (`+e+`:`+t+`:`+n+`)`:e+`:`+t+`:`+n},`toString`)},b.fromString=d(function(e){var t=e.indexOf(`(`),n=e.lastIndexOf(`)`),r=e.substring(0,t),i=e.substring(t+1,n).split(`,`),a=e.substring(n+1);if(a.indexOf(`@`)===0)var o=/@(.+?)(?::(\d+))?(?::(\d+))?$/.exec(a,``),s=o[1],c=o[2],l=o[3];return new b({functionName:r,args:i||void 0,fileName:s,lineNumber:c||void 0,columnNumber:l||void 0})},`StackFrame$$fromString`),x=0;x<g.length;x++)b.prototype[`get`+m(g[x])]=h(g[x]),b.prototype[`set`+m(g[x])]=function(e){return function(t){this[e]=!!t}}(g[x]);var x;for(S=0;S<_.length;S++)b.prototype[`get`+m(_[S])]=h(_[S]),b.prototype[`set`+m(_[S])]=function(e){return function(t){if(!p(t))throw TypeError(e+` must be a Number`);this[e]=Number(t)}}(_[S]);var S;for(C=0;C<v.length;C++)b.prototype[`get`+m(v[C])]=h(v[C]),b.prototype[`set`+m(v[C])]=function(e){return function(t){this[e]=String(t)}}(v[C]);var C,w=b;function T(){var e=/^\s*at .*(\S+:\d+|\(native\))/m,t=/^(eval@)?(\[native code])?$/;return{parse:d(function(t){if(t.stack&&t.stack.match(e))return this.parseV8OrIE(t);if(t.stack)return this.parseFFOrSafari(t);throw Error(`Cannot parse given Error object`)},`ErrorStackParser$$parse`),extractLocation:d(function(e){if(e.indexOf(`:`)===-1)return[e];var t=/(.+?)(?::(\d+))?(?::(\d+))?$/.exec(e.replace(/[()]/g,``));return[t[1],t[2]||void 0,t[3]||void 0]},`ErrorStackParser$$extractLocation`),parseV8OrIE:d(function(t){return t.stack.split(`
`).filter(function(t){return!!t.match(e)},this).map(function(e){e.indexOf(`(eval `)>-1&&(e=e.replace(/eval code/g,`eval`).replace(/(\(eval at [^()]*)|(,.*$)/g,``));var t=e.replace(/^\s+/,``).replace(/\(eval code/g,`(`).replace(/^.*?\s+/,``),n=t.match(/ (\(.+\)$)/);t=n?t.replace(n[0],``):t;var r=this.extractLocation(n?n[1]:t);return new w({functionName:n&&t||void 0,fileName:[`eval`,`<anonymous>`].indexOf(r[0])>-1?void 0:r[0],lineNumber:r[1],columnNumber:r[2],source:e})},this)},`ErrorStackParser$$parseV8OrIE`),parseFFOrSafari:d(function(e){return e.stack.split(`
`).filter(function(e){return!e.match(t)},this).map(function(e){if(e.indexOf(` > eval`)>-1&&(e=e.replace(/ line (\d+)(?: > eval line \d+)* > eval:\d+:\d+/g,`:$1`)),e.indexOf(`@`)===-1&&e.indexOf(`:`)===-1)return new w({functionName:e});var t=/((.*".+"[^@]*)?[^@]*)(?:@)/,n=e.match(t),r=n&&n[1]?n[1]:void 0,i=this.extractLocation(e.replace(t,``));return new w({functionName:r,fileName:i[0],lineNumber:i[1],columnNumber:i[2],source:e})},this)},`ErrorStackParser$$parseFFOrSafari`)}}d(T,`ErrorStackParser`);var te=new T;function E(){return typeof API<`u`&&API!==globalThis.API?API.runtimeEnv:ne({IN_BUN:typeof Bun<`u`,IN_DENO:typeof Deno<`u`,IN_NODE:typeof process==`object`&&typeof process.versions==`object`&&typeof process.versions.node==`string`&&!process.browser,IN_SAFARI:typeof navigator==`object`&&typeof navigator.userAgent==`string`&&navigator.userAgent.indexOf(`Chrome`)===-1&&navigator.userAgent.indexOf(`Safari`)>-1,IN_SHELL:typeof read==`function`&&typeof load==`function`,IN_WORKERD:typeof navigator==`object`&&navigator.userAgent?.includes(`Cloudflare-Workers`)})}d(E,`getGlobalRuntimeEnv`);var D=E();function ne(e){let t=e.IN_NODE&&typeof module<`u`&&module.exports&&typeof f==`function`&&typeof __dirname==`string`,n=e.IN_NODE&&!t,r=!e.IN_NODE&&!e.IN_DENO&&!e.IN_BUN,i=r&&typeof window<`u`&&typeof window.document<`u`&&typeof document.createElement==`function`&&`sessionStorage`in window&&typeof globalThis.importScripts!=`function`,a=r&&typeof globalThis.WorkerGlobalScope<`u`&&typeof globalThis.self<`u`&&globalThis.self instanceof globalThis.WorkerGlobalScope;if(a&&re())throw Error(`Classic web workers are not supported`);let o={...e,IN_BROWSER:r,IN_BROWSER_MAIN_THREAD:i,IN_BROWSER_WEB_WORKER:a,IN_NODE_COMMONJS:t,IN_NODE_ESM:n};if(!(o.IN_BROWSER_MAIN_THREAD||o.IN_BROWSER_WEB_WORKER||o.IN_NODE||o.IN_SHELL||o.IN_WORKERD))throw Error(`Cannot determine runtime environment: ${JSON.stringify(o)}`);return o}d(ne,`calculateDerivedFlags`);function re(){try{return globalThis.importScripts(`data:text/javascript,`),!0}catch{return!1}}d(re,`isClassicWorker`);var ie,O,k,A;async function j(){if(!D.IN_NODE||(ie=(await Promise.resolve().then(()=>c(l(),1))).default,k=await Promise.resolve().then(()=>c(l(),1)),A=await Promise.resolve().then(()=>c(l(),1)),(await Promise.resolve().then(()=>c(l(),1))).default,O=await Promise.resolve().then(()=>c(l(),1)),F=O.sep,typeof f<`u`))return;let e={fs:k,crypto:await Promise.resolve().then(()=>c(l(),1)),ws:await Promise.resolve().then(()=>c(l(),1)),child_process:await Promise.resolve().then(()=>c(l(),1))};globalThis.require=function(t){return e[t]}}d(j,`initNodeModules`);function M(e,t){return O.resolve(t||`.`,e)}d(M,`node_resolvePath`);function N(e,t){return t===void 0&&(t=location),new URL(e,t).toString()}d(N,`browser_resolvePath`);var P=D.IN_NODE?M:D.IN_SHELL?d(e=>e,`resolvePath`):N,F;D.IN_NODE||(F=`/`);function I(e,t){return e.startsWith(`file://`)&&(e=e.slice(7)),e.includes(`://`)?{response:fetch(e)}:{binary:A.readFile(e).then(e=>new Uint8Array(e.buffer,e.byteOffset,e.byteLength))}}d(I,`node_getBinaryResponse`);function L(e,t){if(e.startsWith(`file://`)&&(e=e.slice(7)),e.includes(`://`))throw Error(`Shell cannot fetch urls`);return{binary:Promise.resolve(new Uint8Array(readbuffer(e)))}}d(L,`shell_getBinaryResponse`);function R(e,t){let n=new URL(e,location);return{response:fetch(n,t?{integrity:t}:{})}}d(R,`browser_getBinaryResponse`);var z=D.IN_NODE?I:D.IN_SHELL?L:R;async function B(e,t){let{response:n,binary:r}=z(e,t);if(r)return r;let i=await n;if(!i.ok)throw Error(`Failed to load '${e}': request failed.`);return new Uint8Array(await i.arrayBuffer())}d(B,`loadBinaryFile`);var ae=D.IN_NODE?V:d(async e=>await import(e),`loadScript`);async function V(e){return e.startsWith(`file://`)&&(e=e.slice(7)),e.includes(`://`)?await import(e):await import(ie.pathToFileURL(e).href)}d(V,`nodeLoadScript`);async function H(e){if(D.IN_NODE){await j();let t=await A.readFile(e,{encoding:`utf8`});return JSON.parse(t)}else if(D.IN_SHELL){let t=read(e);return JSON.parse(t)}else return await(await fetch(e)).json()}d(H,`loadLockFile`);async function U(){if(D.IN_NODE_COMMONJS)return __dirname;let e;try{throw Error()}catch(t){e=t}let t=te.parse(e)[0].fileName;if(D.IN_NODE&&!t.startsWith(`file://`)&&(t=`file://${t}`),D.IN_NODE_ESM){let e=await Promise.resolve().then(()=>c(l(),1));return(await Promise.resolve().then(()=>c(l(),1))).fileURLToPath(e.dirname(t))}let n=t.lastIndexOf(F);if(n===-1)throw Error(`Could not extract indexURL path from pyodide module location. Please pass the indexURL explicitly to loadPyodide.`);return t.slice(0,n)}d(U,`calculateDirname`);function W(e){return e.substring(0,e.lastIndexOf(`/`)+1)||globalThis.location?.toString()||`.`}d(W,`calculateInstallBaseUrl`);function G(e){let t=e.FS,n=e.FS.filesystems.MEMFS,r=e.PATH,i={DIR_MODE:16895,FILE_MODE:33279,mount:d(function(e){if(!e.opts.fileSystemHandle)throw Error(`opts.fileSystemHandle is required`);return n.mount.apply(null,arguments)},`mount`),syncfs:d(async(e,t,n)=>{try{let r=i.getLocalSet(e),a=await i.getRemoteSet(e),o=t?a:r,s=t?r:a;await i.reconcile(e,o,s),n(null)}catch(e){n(e)}},`syncfs`),getLocalSet:d(e=>{let n=Object.create(null);function i(e){return e!==`.`&&e!==`..`}d(i,`isRealDir`);function a(e){return t=>r.join2(e,t)}d(a,`toAbsolute`);let o=t.readdir(e.mountpoint).filter(i).map(a(e.mountpoint));for(;o.length;){let e=o.pop(),r=t.stat(e);t.isDir(r.mode)&&o.push.apply(o,t.readdir(e).filter(i).map(a(e))),n[e]={timestamp:r.mtime,mode:r.mode}}return{type:`local`,entries:n}},`getLocalSet`),getRemoteSet:d(async e=>{let t=Object.create(null),n=await oe(e.opts.fileSystemHandle);for(let[a,o]of n)a!==`.`&&(t[r.join2(e.mountpoint,a)]={timestamp:o.kind===`file`?new Date((await o.getFile()).lastModified):new Date,mode:o.kind===`file`?i.FILE_MODE:i.DIR_MODE});return{type:`remote`,entries:t,handles:n}},`getRemoteSet`),loadLocalEntry:d(e=>{let r=t.lookupPath(e,{}).node,i=t.stat(e);if(t.isDir(i.mode))return{timestamp:i.mtime,mode:i.mode};if(t.isFile(i.mode))return r.contents=n.getFileDataAsTypedArray(r),{timestamp:i.mtime,mode:i.mode,contents:r.contents};throw Error(`node type not supported`)},`loadLocalEntry`),storeLocalEntry:d((e,n)=>{if(t.isDir(n.mode))t.mkdirTree(e,n.mode);else if(t.isFile(n.mode))t.writeFile(e,n.contents,{canOwn:!0});else throw Error(`node type not supported`);t.chmod(e,n.mode),t.utime(e,n.timestamp,n.timestamp)},`storeLocalEntry`),removeLocalEntry:d(e=>{var n=t.stat(e);t.isDir(n.mode)?t.rmdir(e):t.isFile(n.mode)&&t.unlink(e)},`removeLocalEntry`),loadRemoteEntry:d(async e=>{if(e.kind===`file`){let t=await e.getFile();return{contents:new Uint8Array(await t.arrayBuffer()),mode:i.FILE_MODE,timestamp:new Date(t.lastModified)}}else{if(e.kind===`directory`)return{mode:i.DIR_MODE,timestamp:new Date};throw Error(`unknown kind: `+e.kind)}},`loadRemoteEntry`),storeRemoteEntry:d(async(e,n,i)=>{let a=e.get(r.dirname(n)),o=t.isFile(i.mode)?await a.getFileHandle(r.basename(n),{create:!0}):await a.getDirectoryHandle(r.basename(n),{create:!0});if(o.kind===`file`){let e=await o.createWritable();await e.write(i.contents),await e.close()}e.set(n,o)},`storeRemoteEntry`),removeRemoteEntry:d(async(e,t)=>{await e.get(r.dirname(t)).removeEntry(r.basename(t)),e.delete(t)},`removeRemoteEntry`),reconcile:d(async(e,n,a)=>{let o=0,s=[];Object.keys(n.entries).forEach(function(e){let r=n.entries[e],i=a.entries[e];(!i||t.isFile(r.mode)&&r.timestamp.getTime()>i.timestamp.getTime())&&(s.push(e),o++)}),s.sort();let c=[];if(Object.keys(a.entries).forEach(function(e){n.entries[e]||(c.push(e),o++)}),c.sort().reverse(),!o)return;let l=n.type===`remote`?n.handles:a.handles;for(let t of s){let n=r.normalize(t.replace(e.mountpoint,`/`)).substring(1);if(a.type===`local`){let e=l.get(n),r=await i.loadRemoteEntry(e);i.storeLocalEntry(t,r)}else{let e=i.loadLocalEntry(t);await i.storeRemoteEntry(l,n,e)}}for(let t of c)if(a.type===`local`)i.removeLocalEntry(t);else{let n=r.normalize(t.replace(e.mountpoint,`/`)).substring(1);await i.removeRemoteEntry(l,n)}},`reconcile`)};e.FS.filesystems.NATIVEFS_ASYNC=i}d(G,`initializeNativeFS`);var oe=d(async e=>{let t=[];async function n(e){for await(let r of e.values())t.push(r),r.kind===`directory`&&await n(r)}d(n,`collect`),await n(e);let r=new Map;r.set(`.`,e);for(let n of t){let t=(await e.resolve(n)).join(`/`);r.set(t,n)}return r},`getFsHandles`),se=ee(`AGFzbQEAAAABDANfAGAAAW9gAW8BfwMDAgECBygCE0pzdl9HZXRFcnJvcl9pbXBvcnQAAA5Kc3ZFcnJvcl9DaGVjawABChMCBwD7AQD7GwsJACAA+xr7FAAL`),ce=async function(){if(!(globalThis.navigator&&(/iPad|iPhone|iPod/.test(navigator.userAgent)||navigator.platform===`MacIntel`&&typeof navigator.maxTouchPoints<`u`&&navigator.maxTouchPoints>1)))try{let e=await WebAssembly.compile(se);return await WebAssembly.instantiate(e)}catch(e){if(e instanceof WebAssembly.CompileError)return;throw e}}();async function K(){let e=await ce;if(e)return e.exports;let t=Symbol(`error marker`);return{Jsv_GetError_import:d(()=>t,`Jsv_GetError_import`),JsvError_Check:d(e=>e===t,`JsvError_Check`)}}d(K,`getJsvErrorImport`);function q(e){let t={config:e,runtimeEnv:D},n={noImageDecoding:!0,noAudioDecoding:!0,noWasmDecoding:!1,preRun:de(e),print:e.stdout,printErr:e.stderr,onExit(e){n.exitCode=e},thisProgram:e._sysExecutable,arguments:e.args,API:t,locateFile:d(t=>e.indexURL+t,`locateFile`),instantiateWasm:fe(e.indexURL)};return n}d(q,`createSettings`);function J(e){return function(t){try{t.FS.mkdirTree(e)}catch(t){console.error(`Error occurred while making a home directory '${e}':`),console.error(t),console.error(`Using '/' for a home directory instead`),e=`/`}t.FS.chdir(e)}}d(J,`createHomeDirectory`);function Y(e){return function(t){Object.assign(t.ENV,e)}}d(Y,`setEnvironment`);function X(e){return e?[async t=>{t.addRunDependency(`fsInitHook`);try{await e(t.FS,{sitePackages:t.API.sitePackages})}finally{t.removeRunDependency(`fsInitHook`)}}]:[]}d(X,`callFsInitHook`);function le(e){let t=e.HEAPU32[e._Py_Version>>>2];return[t>>>24&255,t>>>16&255,t>>>8&255]}d(le,`computeVersionTuple`);function ue(e){let t=B(e);return async e=>{e.API.pyVersionTuple=le(e);let[n,r]=e.API.pyVersionTuple;e.FS.mkdirTree(`/lib`),e.API.sitePackages=`/lib/python${n}.${r}/site-packages`,e.FS.mkdirTree(e.API.sitePackages),e.addRunDependency(`install-stdlib`);try{let i=await t;e.FS.writeFile(`/lib/python${n}${r}.zip`,i)}catch(e){console.error(`Error occurred while installing the standard library:`),console.error(e)}finally{e.removeRunDependency(`install-stdlib`)}}}d(ue,`installStdlib`);function de(e){let t;return t=e.stdLibURL==null?e.indexURL+`python_stdlib.zip`:e.stdLibURL,[ue(t),J(e.env.HOME),Y(e.env),G,...X(e.fsInit)]}d(de,`getFileSystemInitializationFuncs`);function fe(e){if(typeof WasmOffsetConverter<`u`)return;let{binary:t,response:n}=z(e+`pyodide.asm.wasm`),r=K();return function(e,i){return async function(){let{Jsv_GetError_import:a,JsvError_Check:o}=await r;e.env.Jsv_GetError_import=a,e.env.JsvError_Check=o;try{let r;r=n?await WebAssembly.instantiateStreaming(n,e):await WebAssembly.instantiate(await t,e);let{instance:a,module:o}=r;i(a,o)}catch(e){console.warn(`wasm instantiation failed!`),console.warn(e)}}(),{}}}d(fe,`getInstantiateWasmFunc`);var pe=`314.0.0`;function Z(e){return e===void 0||e.endsWith(`/`)?e:e+`/`}d(Z,`withTrailingSlash`);var Q=pe;async function me(e={}){if(await j(),e.lockFileContents&&e.lockFileURL)throw Error(`Can't pass both lockFileContents and lockFileURL`);let t=e.indexURL||await U();if(t=Z(P(t)),e.packageBaseUrl=Z(e.packageBaseUrl),e.cdnUrl=Z(e.packageBaseUrl??`https://cdn.jsdelivr.net/pyodide/v314.0.0/full/`),!e.lockFileContents){let n=e.lockFileURL??t+`pyodide-lock.json`;e.lockFileContents=H(n),e.packageBaseUrl??=W(n)}e.indexURL=t,e.packageCacheDir&&=Z(P(e.packageCacheDir));let n={jsglobals:globalThis,stdin:globalThis.prompt?()=>globalThis.prompt():void 0,args:[],env:{},packages:[],packageCacheDir:e.packageBaseUrl,enableRunUntilComplete:!0,checkAPIVersion:!0,BUILD_ID:`2ff9f3fe6c88624a7e283d5651688da7f6169834ab51663b07be67c0bd43e53e`},r=Object.assign(n,e);return r.env.HOME??=`/home/pyodide`,r.env.PYTHONINSPECT??=`1`,r}d(me,`initializeConfiguration`);function he(e){let t=q(e),n=t.API;return n.lockFilePromise=Promise.resolve(e.lockFileContents),t}d(he,`createEmscriptenSettings`);async function ge(e){return e.createPyodideModule?e.createPyodideModule:(await ae(`${e.indexURL}pyodide.asm.mjs`)).default}d(ge,`loadWasmScript`);async function _e(e,t){if(!e._loadSnapshot)return;let n=await e._loadSnapshot,r=ArrayBuffer.isView(n)?n:new Uint8Array(n);return t.noInitialRun=!0,t.INITIAL_MEMORY=r.length,r}d(_e,`prepareSnapshot`);async function ve(e,t){let n=await e(t);if(t.exitCode!==void 0)throw new n.ExitStatus(t.exitCode);return n}d(ve,`instantiatePyodideModule`);function ye(e,t){let n=e.API;if(t.pyproxyToStringRepr&&n.setPyProxyToStringMethod(!0),t.convertNullToNone&&n.setCompatNullToNone(!0),t.toJsLiteralMap&&n.setCompatToJsLiteralMap(!0),n.version!==`314.0.0`&&t.checkAPIVersion)throw Error(`Pyodide version does not match: '${Q}' <==> '${n.version}'. If you updated the Pyodide version, make sure you also updated the 'indexURL' parameter passed to loadPyodide.`);e.locateFile=e=>{throw e.endsWith(`.so`)?Error(`Failed to find dynamic library "${e}"`):Error(`Unexpected call to locateFile("${e}")`)}}d(ye,`configureAPI`);function be(e,t,n){let r=e.API,i;return t&&(i=r.restoreSnapshot(t)),r.finalizeBootstrap(i,n._snapshotDeserializer)}d(be,`bootstrapPyodide`);async function xe(e,t){let n=e._api;return n.sys.path.insert(0,``),n._pyodide.set_excepthook(),await n.packageIndexReady,n.initializeStreams(t.stdin,t.stdout,t.stderr),e}d(xe,`finalizeSetup`);async function Se(e={}){let t=await me(e),n=he(t),r=await ge(t),i=await _e(t,n),a=await ve(r,n);return ye(a,t),await xe(be(a,i,t),t)}d(Se,`loadPyodide`);let $=self,Ce=Se({indexURL:`https://cdn.jsdelivr.net/pyodide/v${Q}/full/`});$.onmessage=async e=>{let{id:t,phase:n,source:r,functionName:i,templateId:a,args:o,previewResult:s,previewRoll:c,previewCharacter:l,rollMock:u,encounterCacheKey:d,encounterOverride:f}=e.data;try{let e=await Ce;e.globals.set(`WG_TEMPLATE_INPUT`,JSON.stringify({source:r,functionName:i,templateId:a,args:o,previewResult:s,previewRoll:c,previewCharacter:l,phase:n,rollMock:u,encounterCacheKey:d,encounterOverride:f}));let ee=await e.runPythonAsync(we);$.postMessage({id:t,...JSON.parse(String(ee))})}catch(e){$.postMessage({id:t,error:e instanceof Error?e.message:String(e)})}};let we=String.raw`
import json
from math import ceil, floor
from random import randint

payload = json.loads(WG_TEMPLATE_INPUT)
phase = payload.get("phase") or "full"
source = payload.get("source") or ""
function_name = payload.get("functionName") or ""
template_name = payload.get("templateId") or function_name
args = payload.get("args") or []
preview_result = payload.get("previewResult") or "success"
preview_roll = payload.get("previewRoll") or "15"
preview_character = payload.get("previewCharacter") or {}
roll_mock = payload.get("rollMock") or {}
encounter_cache_key = payload.get("encounterCacheKey") or ""
encounter_override = payload.get("encounterOverride")

try:
    WG_ENCOUNTER_CACHE
except NameError:
    WG_ENCOUNTER_CACHE = {}

def _arg(values, index, default=None):
    if values is None:
        return default
    try:
        if index < len(values):
            return values[index]
    except Exception:
        pass
    return default

def _text(value, default=""):
    if value is None:
        return default
    try:
        return str(value)
    except Exception:
        return default

def _int_or_text(value, default=0):
    if value is None:
        return default
    try:
        return int(value)
    except Exception:
        return value

def _is_numberish(value):
    try:
        int(value)
        return True
    except Exception:
        pass
    try:
        float(value)
        return True
    except Exception:
        return False

def _ability_for_check(check_name):
    text = _text(check_name).lower()
    key = text.replace(" ", "").replace("_", "").replace("-", "")
    ability_map = {
        "strength": "str",
        "athletics": "str",
        "dexterity": "dex",
        "initiative": "dex",
        "acrobatics": "dex",
        "sleightofhand": "dex",
        "stealth": "dex",
        "constitution": "con",
        "intelligence": "int",
        "arcana": "int",
        "history": "int",
        "investigation": "int",
        "nature": "int",
        "religion": "int",
        "wisdom": "wis",
        "animalhandling": "wis",
        "insight": "wis",
        "medicine": "wis",
        "perception": "wis",
        "survival": "wis",
        "charisma": "cha",
        "deception": "cha",
        "intimidation": "cha",
        "performance": "cha",
        "persuasion": "cha",
    }
    return ability_map.get(key, "wis")

def _ability_for_save(save_name):
    key = _text(save_name).lower().replace(" ", "").replace("_", "").replace("-", "")
    ability_map = {
        "strength": "str",
        "dexterity": "dex",
        "constitution": "con",
        "intelligence": "int",
        "wisdom": "wis",
        "charisma": "cha",
    }
    return ability_map.get(key)

def _roll(check_name, dc):
    return {
        "type": "check",
        "name": _text(check_name, "Wisdom (Survival)"),
        "ability": _ability_for_check(check_name),
        "dc": _text(dc, "12"),
    }

def _save(save_name, dc):
    result = {
        "type": "save",
        "name": _text(save_name, "Dexterity"),
        "dc": _text(dc, "12"),
    }
    ability = _ability_for_save(save_name)
    if ability is not None:
        result["ability"] = ability
    return result

def _base(name, description):
    return {
        "name": _text(name, "Encounter"),
        "description": _text(description),
    }

def _roll_field(roll, key):
    if roll is None:
        return None
    if isinstance(roll, dict):
        return roll.get(key)
    return getattr(roll, key, None)

def _first_roll_passed(ectx):
    rolls = ectx.get("rolls") if isinstance(ectx, dict) else []
    if not isinstance(rolls, list) or len(rolls) == 0:
        return False
    passed = _roll_field(rolls[0], "passed")
    if passed is None:
        passed = _roll_field(rolls[0], "success")
    return passed is True

def _display_roll(roll, show_dc=False, show_result=False):
    full = _roll_field(roll, "full") or _roll_field(roll, "total") or "0"
    name = _roll_field(roll, "name") or "Roll"
    line = f"{full} **{name}**"
    details = []
    dc = _roll_field(roll, "dc")
    if show_dc and dc not in [None, ""]:
        details.append(f"DC {dc}")
    passed = _roll_field(roll, "passed")
    if passed is None:
        passed = _roll_field(roll, "success")
    if show_result and passed is not None:
        details.append("Passed" if passed is True else "Failed")
    if details:
        line += f" ({', '.join(details)})"
    return line

def _enemy_line(enemy):
    if enemy is None:
        return None
    count = 1
    name = None
    if isinstance(enemy, dict):
        try:
            count = int(enemy.get("count") or enemy.get("qty") or 1)
        except Exception:
            count = 1
        name = enemy.get("name") or enemy.get("monster")
    else:
        name = enemy
    text = _text(name).strip()
    if text == "":
        return None
    return f"* {count}x {text}"

def _display_combat(enemies=None, surprised=None, details=None):
    lines = ["> Combat Initiated!"]
    if surprised is not None:
        surprise_list = surprised if isinstance(surprised, list) else [surprised]
        for target in surprise_list:
            text = _text(target).strip()
            if text != "":
                lines.append(f"{text} was **surprised**!")
    if details is not None:
        detail_list = details if isinstance(details, list) else [details]
        for detail in detail_list:
            text = _text(detail).strip()
            if text != "":
                lines.append(text)
    lines.append("Enemies:")
    enemy_lines = []
    if enemies is not None:
        enemy_list = enemies if isinstance(enemies, list) else [enemies]
        for enemy in enemy_list:
            line = _enemy_line(enemy)
            if line is not None:
                enemy_lines.append(line)
    if not enemy_lines:
        enemy_lines.append("* Generated enemies from target CR")
    return "\n".join(lines + enemy_lines)

def gather_item(args):
    if len(args) >= 5 and _is_numberish(_arg(args, 2)):
        name = _arg(args, 0, "Useful find")
        check_name = _arg(args, 1, "Wisdom (Survival)")
        dc = _arg(args, 2, "12")
        item = _arg(args, 3, "Supplies")
        total = _arg(args, 4, 1)
        bag = None
        desc = f"You gather **{item}** from the area."
    else:
        name = _arg(args, 0, "Useful find")
        desc = _arg(args, 1, "You find useful supplies in the wild.")
        check_name = _arg(args, 2, "Wisdom (Survival)")
        dc = _arg(args, 3, "12")
        item = _arg(args, 4, "Supplies")
        total = _arg(args, 5, 1)
        bag = _arg(args, 6)
    enc = _base(name, desc)
    enc["rolls"] = [_roll(check_name, dc)]
    outcome = {"type": "item", "name": _text(item, "Supplies"), "total": _int_or_text(total, 1)}
    if bag is not None and _text(bag).strip() != "":
        outcome["bag"] = _text(bag)
    def outcomes(ectx):
        if _first_roll_passed(ectx):
            return [outcome]
        return []
    enc["outcomes"] = outcomes
    return enc

def skill_check(args):
    enc = _base(_arg(args, 0, "Skill check"), _arg(args, 1, "A careful approach may reveal something useful."))
    enc["rolls"] = [_roll(_arg(args, 2, "Wisdom (Survival)"), _arg(args, 3, "12"))]
    return enc

def saving_throw(args):
    enc = _base(_arg(args, 0, "Saving throw"), _arg(args, 1, "A sudden threat demands quick reaction."))
    enc["rolls"] = [_save(_arg(args, 2, "Dexterity"), _arg(args, 3, "12"))]
    return enc

def story(args):
    return _base(_arg(args, 0, "Forest sign"), _arg(args, 1, "You notice a quiet detail in the wild."))

def combat_template(args):
    enc = _base(_arg(args, 0, "Hostile creatures"), _arg(args, 1, "Something dangerous moves nearby."))
    enc["cr"] = _arg(args, 2, 1)
    monsters = _arg(args, 3)
    difficulty = _arg(args, 4)
    if monsters is not None and _text(monsters).strip() != "":
        enc["monsters"] = monsters if isinstance(monsters, list) else [_text(monsters)]
    if difficulty is not None and _text(difficulty).strip() != "":
        enc["difficulty"] = _text(difficulty)
    enc["combat_text"] = _display_combat(enc.get("monsters"))
    return enc

def damage_combat(args):
    enc = combat_template(args)
    enc["outcomes"] = [{"type": "damage", "total": _int_or_text(_arg(args, 5, "1d4"), "1d4")}]
    return enc

def ambush(args):
    enc = combat_template(args)
    dc = _arg(args, 5, "12")
    enc["rolls"] = [
        _roll("Perception", dc),
        _roll("Stealth", dc),
        {"type": "passive", "name": "Perception", "ability": "wis", "dc": _text(dc, "12")},
    ]
    def combat_text(ectx):
        surprised = []
        rolls = ectx.get("rolls") if isinstance(ectx, dict) else []
        if isinstance(rolls, list) and len(rolls) > 0 and _roll_field(rolls[0], "passed") is False:
            character_obj = ectx.get("character") if isinstance(ectx, dict) else None
            surprised.append(getattr(character_obj, "name", None) or "The party")
        return _display_combat(enc.get("monsters"), surprised=surprised)
    enc["combat_text"] = combat_text
    return enc

def quest(args):
    enc = _base(_arg(args, 0, "Unfinished business"), _arg(args, 1, "A hook asks for follow-up."))
    if _arg(args, 2) is not None and _text(_arg(args, 2)).strip() != "":
        enc["reward"] = _text(_arg(args, 2))
    return enc

def gold(args):
    enc = _base(_arg(args, 0, "Treasure cache"), _arg(args, 1, "Coins glint in the dirt."))
    enc["outcomes"] = [{"type": "gold", "total": _int_or_text(_arg(args, 2, 1), 1)}]
    return enc

def healing(args):
    enc = _base(_arg(args, 0, "Restorative spring"), _arg(args, 1, "A restorative moment eases your wounds."))
    enc["outcomes"] = [{"type": "healing", "total": _int_or_text(_arg(args, 2, "1d4"), "1d4")}]
    return enc

def healing_check(args):
    enc = _base(_arg(args, 0, "Field medicine"), _arg(args, 1, "Careful treatment helps the wounded recover."))
    enc["rolls"] = [_roll(_arg(args, 2, "Medicine"), _arg(args, 3, "12"))]
    enc["outcomes"] = [{"type": "healing", "total": _int_or_text(_arg(args, 4, "1d4"), "1d4")}]
    return enc

def damage(args):
    enc = _base(_arg(args, 0, "Hazard"), _arg(args, 1, "The area turns dangerous."))
    enc["outcomes"] = [{"type": "damage", "total": _int_or_text(_arg(args, 2, "1d4"), "1d4")}]
    return enc

def raw(args):
    value = _arg(args, 0)
    if isinstance(value, dict):
        return value
    return None

def expand_builtin(template_name, args):
    key = _text(template_name).strip().lower()
    if key in ["gather_item", "gather"]:
        return gather_item(args)
    if key in ["skill_check", "check"]:
        return skill_check(args)
    if key in ["saving_throw", "save"]:
        return saving_throw(args)
    if key in ["flavour", "flavor", "static", "story"]:
        return story(args)
    if key == "combat":
        return combat_template(args)
    if key in ["damage_combat", "combat_damage", "hazard_combat"]:
        return damage_combat(args)
    if key == "ambush":
        return ambush(args)
    if key in ["quest", "hook"]:
        return quest(args)
    if key in ["gold", "gp"]:
        return gold(args)
    if key in ["healing", "heal"]:
        return healing(args)
    if key in ["healing_check", "heal_check"]:
        return healing_check(args)
    if key in ["damage", "hazard"]:
        return damage(args)
    if key in ["raw", "encounter"]:
        return raw(args)
    return None

def _media(value):
    result = _text(value).strip()
    if result == "" or result.lower() in ["none", "null", "undefined"]:
        return None
    return result

def _read_field(obj, key, default=None):
    if not isinstance(obj, dict):
        return default
    if key in obj:
        return obj.get(key)
    return default

def _encounter_context(encounter, character_obj, rolls_list):
    return {
        "character": character_obj,
        "rolls": rolls_list,
        "args": args,
        "encounter": encounter,
        "config": None,
        "activity": None,
        "biome": None,
        "location": None,
        "location_id": None,
        "current_location": None,
        "current_location_id": None,
    }

def _resolve_field(encounter, key, character_obj, rolls_list, default=None):
    value = _read_field(encounter, key, default)
    if callable(value):
        return value(_encounter_context(encounter, character_obj, rolls_list))
    return value

def process_encounter(encounter, preview_roll, preview_result, roll_mock=None):
    if encounter is None:
        return {
            "title": "Encounter",
            "name": "Encounter",
            "description": "No encounter data.",
            "desc": "No encounter data.",
            "rolls": [],
            "outcomes": [],
            "outcome_text": "",
            "footer": "Use !westmarch help for options.",
            "embed": {
                "title": "Encounter",
                "desc": "No encounter data.",
                "footer": "Use !westmarch help for options.",
            },
        }
    rolls_list = _processed_rolls(encounter.get("rolls"), preview_roll, preview_result, roll_mock)
    name = _text(_resolve_field(encounter, "name", preview_character_obj, rolls_list, "Encounter"), "Encounter").strip() or "Encounter"
    description = _text(_resolve_field(encounter, "description", preview_character_obj, rolls_list, ""))
    cr = _resolve_field(encounter, "cr", preview_character_obj, rolls_list, 0)
    difficulty = _text(_resolve_field(encounter, "difficulty", preview_character_obj, rolls_list, "medium"), "medium")
    monsters_value = _resolve_field(encounter, "monsters", preview_character_obj, rolls_list, [])
    monsters_list = monsters_value if isinstance(monsters_value, list) else ([_text(monsters_value)] if _text(monsters_value).strip() != "" else [])
    combat_text = _text(_resolve_field(encounter, "combat_text", preview_character_obj, rolls_list, ""))
    if _is_positive(cr) and combat_text.strip() == "":
        description = _append_combat_text(description, cr, difficulty, monsters_list)
    elif combat_text.strip() != "":
        description = "\n\n".join([part for part in [description.strip(), combat_text.strip()] if part != ""])
    outcomes_value = _resolve_field(encounter, "outcomes", preview_character_obj, rolls_list, [])
    outcomes_list = outcomes_value if isinstance(outcomes_value, list) else []
    outcome_text = process_outcomes(outcomes_list, preview_character_obj)
    if description.strip() == "":
        description = _fallback_description(encounter, rolls_list, preview_result)
    desc = "\n".join([part for part in [description.strip(), outcome_text.strip()] if part != ""])
    result = {
        "title": name,
        "name": name,
        "description": description.strip(),
        "desc": desc,
        "rolls": [_roll_to_json(roll) for roll in rolls_list],
        "outcomes": outcomes_list,
        "outcome_text": outcome_text,
        "footer": "Use !westmarch help for options.",
    }
    thumb_value = _resolve_field(encounter, "thumb", preview_character_obj, rolls_list)
    if thumb_value is None:
        thumb_value = _resolve_field(encounter, "thumbnail", preview_character_obj, rolls_list)
    image_value = _resolve_field(encounter, "image", preview_character_obj, rolls_list)
    if image_value is None:
        image_value = _resolve_field(encounter, "image_url", preview_character_obj, rolls_list)
    thumb = _media(thumb_value)
    image = _media(image_value)
    if thumb is not None:
        result["thumb"] = thumb
    if image is not None:
        result["image"] = image
    result["embed"] = {
        "title": name,
        "desc": desc,
        "footer": result["footer"],
    }
    if thumb is not None:
        result["embed"]["thumb"] = thumb
    if image is not None:
        result["embed"]["image"] = image
    return result

class PreviewRoll:
    def __init__(self, roll_conf, index, preview_roll, preview_result, roll_mock):
        self.type = _text(roll_conf.get("type"), "check") if isinstance(roll_conf, dict) else "check"
        self.name = _text(roll_conf.get("name"), self.type) if isinstance(roll_conf, dict) else self.type
        self.ability = _text(roll_conf.get("ability")) if isinstance(roll_conf, dict) else ""
        self.dc = _roll_total(roll_conf.get("dc")) if isinstance(roll_conf, dict) and roll_conf.get("dc") is not None else None
        self.total = _roll_total(_mock_roll_for(index, preview_roll, roll_mock))
        self.natural_roll = self.total
        self.full = _text(self.total)
        if self.dc is None:
            self.passed = None if preview_result == "neutral" else preview_result == "success"
        else:
            self.passed = self.total >= self.dc

def _roll_total(value):
    try:
        return int(value)
    except Exception:
        pass
    try:
        return int(float(value))
    except Exception:
        return 0

def _processed_rolls(rolls, preview_roll, preview_result, roll_mock=None):
    if not isinstance(rolls, list):
        return []
    return [
        PreviewRoll(roll, index, preview_roll, preview_result, roll_mock)
        for index, roll in enumerate(rolls)
        if isinstance(roll, dict)
    ]

def _roll_to_json(roll):
    result = {
        "type": roll.type,
        "name": roll.name,
        "total": roll.total,
        "full": roll.full,
        "passed": roll.passed,
    }
    if roll.dc is not None:
        result["dc"] = roll.dc
    if roll.ability != "":
        result["ability"] = roll.ability
    return result

def _is_positive(value):
    try:
        return float(value) > 0
    except Exception:
        return False

def _append_combat_text(description, cr, difficulty, monsters_list):
    combat_text = _display_combat(monsters_list)
    return "\n\n".join([part for part in [description.strip(), combat_text] if part != ""])

def _fallback_description(encounter, rolls_list, preview_result):
    parts = []
    description = _text(encounter.get("description"))
    if description.strip() != "":
        parts.append(description)
    for roll in rolls_list:
        parts.append(_display_roll(roll, show_dc=True, show_result=True))
    return "\n".join(parts)

def _mock_roll_for(index, preview_roll, roll_mock):
    if not isinstance(roll_mock, dict):
        return _text(preview_roll, "15")
    raw_values = roll_mock.get("values")
    if not isinstance(raw_values, list):
        raw_values = []
    values = [_text(value).strip() for value in raw_values]
    def _value_or_random(value):
        if value == "":
            return _text(randint(1, 20))
        return value
    primary = _value_or_random(values[0]) if values else _text(preview_roll, "15")
    fallback = _text(roll_mock.get("fallback"), _text(preview_roll, "15")).strip()
    if fallback == "":
        fallback = _text(preview_roll, "15")
    mode = _text(roll_mock.get("mode"), "mockReturns")
    if mode == "mockReturnsOnce":
        return primary if index == 0 else fallback
    if mode == "mockReturnsNTimes":
        try:
            times = int(roll_mock.get("times") or 1)
        except Exception:
            times = 1
        return primary if index < max(0, times) else fallback
    if index < len(values):
        return _value_or_random(values[index])
    return primary

def process_outcomes(outcomes, character_obj):
    lines = []
    if not isinstance(outcomes, list):
        return "\n".join(lines)
    for outcome in outcomes:
        if not isinstance(outcome, dict):
            continue
        outcome_type = _text(outcome.get("type"))
        if outcome_type == "item":
            bag = _text(outcome.get("bag"))
            lines.append(
                f"-# {character_obj.name} gained {_text(outcome.get('total'), '1')} x {_text(outcome.get('name'), 'item')}"
                + (f" in {bag}" if bag != "" else "")
                + "."
            )
        elif outcome_type == "gold":
            lines.append(f"-# {character_obj.name} gained {_text(outcome.get('total'), '1')} gp.")
        elif outcome_type == "healing":
            lines.append(f"-# {character_obj.name} recovered {_text(outcome.get('total'), '1d4')} hit points.")
        elif outcome_type == "damage":
            lines.append(f"-# {character_obj.name} took {_text(outcome.get('total'), '1d4')} damage.")
        elif outcome_type == "currency":
            lines.append(f"-# {character_obj.name} gained {_text(outcome.get('total'), '1')} {_text(outcome.get('id'), 'currency')}.")
        elif outcome_type == "quest":
            lines.append(f"-# {character_obj.name} updated quest **{_text(outcome.get('name'), 'Quest')}**.")
        elif outcome_type == "recipe":
            lines.append(f"-# {character_obj.name} learned recipe **{_text(outcome.get('name'), 'Recipe')}**.")
        elif outcome_type == "runes":
            lines.append(f"-# {character_obj.name} gained {_text(outcome.get('total'), '1')} runes.")
        elif outcome_type != "":
            lines.append(f"-# {outcome_type}: {json.dumps(outcome)}")
    return "\n".join(lines)

safe_builtins = {
    "abs": abs,
    "bool": bool,
    "dict": dict,
    "float": float,
    "int": int,
    "len": len,
    "list": list,
    "callable": callable,
    "max": max,
    "min": min,
    "range": range,
    "round": round,
    "str": str,
    "sum": sum,
}

class PreviewCharacter:
    def __init__(self, data):
        self.name = data.get("name") or "Daenerys Targaryen"
        self.level = data.get("level") or 1
        self.cvars = data.get("cvars") or {}

    def __str__(self):
        return self.name

    def get_cvar(self, key, default=None):
        return self.cvars.get(key, default)

    def cvar(self, key, default=None):
        return self.get_cvar(key, default)

    def set_cvar(self, key, value):
        self.cvars[key] = value
        return value

    def cc_exists(self, _name):
        return False

    def cc_str(self, name):
        return "0/0"

    def get_cc(self, _name):
        return 0

    def get_cc_max(self, _name):
        return 0

preview_character_obj = PreviewCharacter(preview_character)

def character():
    return preview_character_obj

namespace = {
    "__builtins__": safe_builtins,
    "_arg": _arg,
    "_text": _text,
    "_int_or_text": _int_or_text,
    "ceil": ceil,
    "floor": floor,
    "character": character,
}

def _generate_encounter():
    if source.strip() != "":
        exec(source, namespace)
        fn = namespace.get(function_name)
        if fn is None:
            candidates = []
            for key, value in namespace.items():
                if not key.startswith("_") and callable(value):
                    candidates.append(value)
            if len(candidates) == 1:
                fn = candidates[0]
        if fn is None or not callable(fn):
            raise Exception("No matching callable template function was found.")
        return fn(args)
    return expand_builtin(template_name, args)

def _clean_encounter(encounter):
    if not isinstance(encounter, dict):
        return encounter
    return {key: value for key, value in encounter.items() if str(key) != "kind"}

def _next_cache_key():
    base = _text(template_name or function_name, "encounter")
    return f"{base}:{len(WG_ENCOUNTER_CACHE) + 1}"

def _cache_encounter(encounter):
    key = encounter_cache_key or _next_cache_key()
    WG_ENCOUNTER_CACHE[key] = encounter
    return key

if phase == "process":
    if isinstance(encounter_override, dict):
        encounter = _clean_encounter(encounter_override)
        cache_key = _cache_encounter(encounter)
    elif encounter_cache_key in WG_ENCOUNTER_CACHE:
        encounter = WG_ENCOUNTER_CACHE[encounter_cache_key]
        cache_key = encounter_cache_key
    else:
        raise Exception("Generate an encounter before processing the preview.")
    display_output = process_encounter(encounter, preview_roll, preview_result, roll_mock)
    result = {
        "encounter": encounter,
        "displayOutput": display_output,
        "encounterCacheKey": cache_key,
    }
else:
    encounter = _clean_encounter(_generate_encounter())
    if not isinstance(encounter, dict):
        raise Exception("Template function did not return an encounter dict.")
    cache_key = _cache_encounter(encounter)
    result = {
        "encounter": encounter,
        "encounterCacheKey": cache_key,
    }
    if phase != "encounter":
        result["displayOutput"] = process_encounter(encounter, preview_roll, preview_result, roll_mock)

json.dumps(result, default=str)
`})();