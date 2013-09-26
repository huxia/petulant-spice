
(function(){var async={};var root,previous_async;root=this;if(root!=null){previous_async=root.async}async.noConflict=function(){root.async=previous_async;return async};function only_once(fn){var called=false;return function(){if(called)throw new Error("Callback was already called.");called=true;fn.apply(root,arguments)}}var _each=function(arr,iterator){if(arr.forEach){return arr.forEach(iterator)}for(var i=0;i<arr.length;i+=1){iterator(arr[i],i,arr)}};var _map=function(arr,iterator){if(arr.map){return arr.map(iterator)}var results=[];_each(arr,function(x,i,a){results.push(iterator(x,i,a))});return results};var _reduce=function(arr,iterator,memo){if(arr.reduce){return arr.reduce(iterator,memo)}_each(arr,function(x,i,a){memo=iterator(memo,x,i,a)});return memo};var _keys=function(obj){if(Object.keys){return Object.keys(obj)}var keys=[];for(var k in obj){if(obj.hasOwnProperty(k)){keys.push(k)}}return keys};if(typeof process==='undefined'||!(process.nextTick)){if(typeof setImmediate==='function'){async.nextTick=function(fn){setImmediate(fn)};async.setImmediate=async.nextTick}else{async.nextTick=function(fn){setTimeout(fn,0)};async.setImmediate=async.nextTick}}else{async.nextTick=process.nextTick;if(typeof setImmediate!=='undefined'){async.setImmediate=setImmediate}else{async.setImmediate=async.nextTick}}async.each=function(arr,iterator,callback){callback=callback||function(){};if(!arr.length){return callback()}var completed=0;_each(arr,function(x){iterator(x,only_once(function(err){if(err){callback(err);callback=function(){}}else{completed+=1;if(completed>=arr.length){callback(null)}}}))})};async.forEach=async.each;async.eachSeries=function(arr,iterator,callback){callback=callback||function(){};if(!arr.length){return callback()}var completed=0;var iterate=function(){iterator(arr[completed],function(err){if(err){callback(err);callback=function(){}}else{completed+=1;if(completed>=arr.length){callback(null)}else{iterate()}}})};iterate()};async.forEachSeries=async.eachSeries;async.eachLimit=function(arr,limit,iterator,callback){var fn=_eachLimit(limit);fn.apply(null,[arr,iterator,callback])};async.forEachLimit=async.eachLimit;var _eachLimit=function(limit){return function(arr,iterator,callback){callback=callback||function(){};if(!arr.length||limit<=0){return callback()}var completed=0;var started=0;var running=0;(function replenish(){if(completed>=arr.length){return callback()}while(running<limit&&started<arr.length){started+=1;running+=1;iterator(arr[started-1],function(err){if(err){callback(err);callback=function(){}}else{completed+=1;running-=1;if(completed>=arr.length){callback()}else{replenish()}}})}})()}};var doParallel=function(fn){return function(){var args=Array.prototype.slice.call(arguments);return fn.apply(null,[async.each].concat(args))}};var doParallelLimit=function(limit,fn){return function(){var args=Array.prototype.slice.call(arguments);return fn.apply(null,[_eachLimit(limit)].concat(args))}};var doSeries=function(fn){return function(){var args=Array.prototype.slice.call(arguments);return fn.apply(null,[async.eachSeries].concat(args))}};var _asyncMap=function(eachfn,arr,iterator,callback){var results=[];arr=_map(arr,function(x,i){return{index:i,value:x}});eachfn(arr,function(x,callback){iterator(x.value,function(err,v){results[x.index]=v;callback(err)})},function(err){callback(err,results)})};async.map=doParallel(_asyncMap);async.mapSeries=doSeries(_asyncMap);async.mapLimit=function(arr,limit,iterator,callback){return _mapLimit(limit)(arr,iterator,callback)};var _mapLimit=function(limit){return doParallelLimit(limit,_asyncMap)};async.reduce=function(arr,memo,iterator,callback){async.eachSeries(arr,function(x,callback){iterator(memo,x,function(err,v){memo=v;callback(err)})},function(err){callback(err,memo)})};async.inject=async.reduce;async.foldl=async.reduce;async.reduceRight=function(arr,memo,iterator,callback){var reversed=_map(arr,function(x){return x}).reverse();async.reduce(reversed,memo,iterator,callback)};async.foldr=async.reduceRight;var _filter=function(eachfn,arr,iterator,callback){var results=[];arr=_map(arr,function(x,i){return{index:i,value:x}});eachfn(arr,function(x,callback){iterator(x.value,function(v){if(v){results.push(x)}callback()})},function(err){callback(_map(results.sort(function(a,b){return a.index-b.index}),function(x){return x.value}))})};async.filter=doParallel(_filter);async.filterSeries=doSeries(_filter);async.select=async.filter;async.selectSeries=async.filterSeries;var _reject=function(eachfn,arr,iterator,callback){var results=[];arr=_map(arr,function(x,i){return{index:i,value:x}});eachfn(arr,function(x,callback){iterator(x.value,function(v){if(!v){results.push(x)}callback()})},function(err){callback(_map(results.sort(function(a,b){return a.index-b.index}),function(x){return x.value}))})};async.reject=doParallel(_reject);async.rejectSeries=doSeries(_reject);var _detect=function(eachfn,arr,iterator,main_callback){eachfn(arr,function(x,callback){iterator(x,function(result){if(result){main_callback(x);main_callback=function(){}}else{callback()}})},function(err){main_callback()})};async.detect=doParallel(_detect);async.detectSeries=doSeries(_detect);async.some=function(arr,iterator,main_callback){async.each(arr,function(x,callback){iterator(x,function(v){if(v){main_callback(true);main_callback=function(){}}callback()})},function(err){main_callback(false)})};async.any=async.some;async.every=function(arr,iterator,main_callback){async.each(arr,function(x,callback){iterator(x,function(v){if(!v){main_callback(false);main_callback=function(){}}callback()})},function(err){main_callback(true)})};async.all=async.every;async.sortBy=function(arr,iterator,callback){async.map(arr,function(x,callback){iterator(x,function(err,criteria){if(err){callback(err)}else{callback(null,{value:x,criteria:criteria})}})},function(err,results){if(err){return callback(err)}else{var fn=function(left,right){var a=left.criteria,b=right.criteria;return a<b?-1:a>b?1:0};callback(null,_map(results.sort(fn),function(x){return x.value}))}})};async.auto=function(tasks,callback){callback=callback||function(){};var keys=_keys(tasks);if(!keys.length){return callback(null)}var results={};var listeners=[];var addListener=function(fn){listeners.unshift(fn)};var removeListener=function(fn){for(var i=0;i<listeners.length;i+=1){if(listeners[i]===fn){listeners.splice(i,1);return}}};var taskComplete=function(){_each(listeners.slice(0),function(fn){fn()})};addListener(function(){if(_keys(results).length===keys.length){callback(null,results);callback=function(){}}});_each(keys,function(k){var task=(tasks[k]instanceof Function)?[tasks[k]]:tasks[k];var taskCallback=function(err){var args=Array.prototype.slice.call(arguments,1);if(args.length<=1){args=args[0]}if(err){var safeResults={};_each(_keys(results),function(rkey){safeResults[rkey]=results[rkey]});safeResults[k]=args;callback(err,safeResults);callback=function(){}}else{results[k]=args;async.setImmediate(taskComplete)}};var requires=task.slice(0,Math.abs(task.length-1))||[];var ready=function(){return _reduce(requires,function(a,x){return(a&&results.hasOwnProperty(x))},true)&&!results.hasOwnProperty(k)};if(ready()){task[task.length-1](taskCallback,results)}else{var listener=function(){if(ready()){removeListener(listener);task[task.length-1](taskCallback,results)}};addListener(listener)}})};async.waterfall=function(tasks,callback){callback=callback||function(){};if(tasks.constructor!==Array){var err=new Error('First argument to waterfall must be an array of functions');return callback(err)}if(!tasks.length){return callback()}var wrapIterator=function(iterator){return function(err){if(err){callback.apply(null,arguments);callback=function(){}}else{var args=Array.prototype.slice.call(arguments,1);var next=iterator.next();if(next){args.push(wrapIterator(next))}else{args.push(callback)}async.setImmediate(function(){iterator.apply(null,args)})}}};wrapIterator(async.iterator(tasks))()};var _parallel=function(eachfn,tasks,callback){callback=callback||function(){};if(tasks.constructor===Array){eachfn.map(tasks,function(fn,callback){if(fn){fn(function(err){var args=Array.prototype.slice.call(arguments,1);if(args.length<=1){args=args[0]}callback.call(null,err,args)})}},callback)}else{var results={};eachfn.each(_keys(tasks),function(k,callback){tasks[k](function(err){var args=Array.prototype.slice.call(arguments,1);if(args.length<=1){args=args[0]}results[k]=args;callback(err)})},function(err){callback(err,results)})}};async.parallel=function(tasks,callback){_parallel({map:async.map,each:async.each},tasks,callback)};async.parallelLimit=function(tasks,limit,callback){_parallel({map:_mapLimit(limit),each:_eachLimit(limit)},tasks,callback)};async.series=function(tasks,callback){callback=callback||function(){};if(tasks.constructor===Array){async.mapSeries(tasks,function(fn,callback){if(fn){fn(function(err){var args=Array.prototype.slice.call(arguments,1);if(args.length<=1){args=args[0]}callback.call(null,err,args)})}},callback)}else{var results={};async.eachSeries(_keys(tasks),function(k,callback){tasks[k](function(err){var args=Array.prototype.slice.call(arguments,1);if(args.length<=1){args=args[0]}results[k]=args;callback(err)})},function(err){callback(err,results)})}};async.iterator=function(tasks){var makeCallback=function(index){var fn=function(){if(tasks.length){tasks[index].apply(null,arguments)}return fn.next()};fn.next=function(){return(index<tasks.length-1)?makeCallback(index+1):null};return fn};return makeCallback(0)};async.apply=function(fn){var args=Array.prototype.slice.call(arguments,1);return function(){return fn.apply(null,args.concat(Array.prototype.slice.call(arguments)))}};var _concat=function(eachfn,arr,fn,callback){var r=[];eachfn(arr,function(x,cb){fn(x,function(err,y){r=r.concat(y||[]);cb(err)})},function(err){callback(err,r)})};async.concat=doParallel(_concat);async.concatSeries=doSeries(_concat);async.whilst=function(test,iterator,callback){if(test()){iterator(function(err){if(err){return callback(err)}async.whilst(test,iterator,callback)})}else{callback()}};async.doWhilst=function(iterator,test,callback){iterator(function(err){if(err){return callback(err)}if(test()){async.doWhilst(iterator,test,callback)}else{callback()}})};async.until=function(test,iterator,callback){if(!test()){iterator(function(err){if(err){return callback(err)}async.until(test,iterator,callback)})}else{callback()}};async.doUntil=function(iterator,test,callback){iterator(function(err){if(err){return callback(err)}if(!test()){async.doUntil(iterator,test,callback)}else{callback()}})};async.queue=function(worker,concurrency){if(concurrency===undefined){concurrency=1}function _insert(q,data,pos,callback){if(data.constructor!==Array){data=[data]}_each(data,function(task){var item={data:task,callback:typeof callback==='function'?callback:null};if(pos){q.tasks.unshift(item)}else{q.tasks.push(item)}if(q.saturated&&q.tasks.length===concurrency){q.saturated()}async.setImmediate(q.process)})}var workers=0;var q={tasks:[],concurrency:concurrency,saturated:null,empty:null,drain:null,push:function(data,callback){_insert(q,data,false,callback)},unshift:function(data,callback){_insert(q,data,true,callback)},process:function(){if(workers<q.concurrency&&q.tasks.length){var task=q.tasks.shift();if(q.empty&&q.tasks.length===0){q.empty()}workers+=1;var next=function(){workers-=1;if(task.callback){task.callback.apply(task,arguments)}if(q.drain&&q.tasks.length+workers===0){q.drain()}q.process()};var cb=only_once(next);worker(task.data,cb)}},length:function(){return q.tasks.length},running:function(){return workers}};return q};async.cargo=function(worker,payload){var working=false,tasks=[];var cargo={tasks:tasks,payload:payload,saturated:null,empty:null,drain:null,push:function(data,callback){if(data.constructor!==Array){data=[data]}_each(data,function(task){tasks.push({data:task,callback:typeof callback==='function'?callback:null});if(cargo.saturated&&tasks.length===payload){cargo.saturated()}});async.setImmediate(cargo.process)},process:function process(){if(working)return;if(tasks.length===0){if(cargo.drain)cargo.drain();return}var ts=typeof payload==='number'?tasks.splice(0,payload):tasks.splice(0);var ds=_map(ts,function(task){return task.data});if(cargo.empty)cargo.empty();working=true;worker(ds,function(){working=false;var args=arguments;_each(ts,function(data){if(data.callback){data.callback.apply(null,args)}});process()})},length:function(){return tasks.length},running:function(){return working}};return cargo};var _console_fn=function(name){return function(fn){var args=Array.prototype.slice.call(arguments,1);fn.apply(null,args.concat([function(err){var args=Array.prototype.slice.call(arguments,1);if(typeof console!=='undefined'){if(err){if(console.error){console.error(err)}}else if(console[name]){_each(args,function(x){console[name](x)})}}}]))}};async.log=_console_fn('log');async.dir=_console_fn('dir');async.memoize=function(fn,hasher){var memo={};var queues={};hasher=hasher||function(x){return x};var memoized=function(){var args=Array.prototype.slice.call(arguments);var callback=args.pop();var key=hasher.apply(null,args);if(key in memo){callback.apply(null,memo[key])}else if(key in queues){queues[key].push(callback)}else{queues[key]=[callback];fn.apply(null,args.concat([function(){memo[key]=arguments;var q=queues[key];delete queues[key];for(var i=0,l=q.length;i<l;i++){q[i].apply(null,arguments)}}]))}};memoized.memo=memo;memoized.unmemoized=fn;return memoized};async.unmemoize=function(fn){return function(){return(fn.unmemoized||fn).apply(null,arguments)}};async.times=function(count,iterator,callback){var counter=[];for(var i=0;i<count;i++){counter.push(i)}return async.map(counter,iterator,callback)};async.timesSeries=function(count,iterator,callback){var counter=[];for(var i=0;i<count;i++){counter.push(i)}return async.mapSeries(counter,iterator,callback)};async.compose=function(){var fns=Array.prototype.reverse.call(arguments);return function(){var that=this;var args=Array.prototype.slice.call(arguments);var callback=args.pop();async.reduce(fns,args,function(newargs,fn,cb){fn.apply(that,newargs.concat([function(){var err=arguments[0];var nextargs=Array.prototype.slice.call(arguments,1);cb(err,nextargs)}]))},function(err,results){callback.apply(that,[err].concat(results))})}};var _applyEach=function(eachfn,fns){var go=function(){var that=this;var args=Array.prototype.slice.call(arguments);var callback=args.pop();return eachfn(fns,function(fn,cb){fn.apply(that,args.concat([cb]))},callback)};if(arguments.length>2){var args=Array.prototype.slice.call(arguments,2);return go.apply(this,args)}else{return go}};async.applyEach=doParallel(_applyEach);async.applyEachSeries=doSeries(_applyEach);async.forever=function(fn,callback){function next(err){if(err){if(callback){return callback(err)}throw err}fn(next)}next()};if(typeof define!=='undefined'&&define.amd){define([],function(){return async})}else if(typeof module!=='undefined'&&module.exports){module.exports=async}else{root.async=async}}());
var _appAsyncCallback = {};
var _appAsyncCount = 0;
function $asyncCB(o){
if(!o)return;
var id = o['async_id'];
var cb = _appAsyncCallback[id];
if(!_appAsyncCallback[id]){
return;
}
_appAsyncCallback[id] = null;
delete _appAsyncCallback[id];
cb.apply(o['async_this'] || document, o['async_arguments'] || []);
}
document.addEventListener('asyncDone', function(e){
if(!e || !e.detail || !e.detail){
return;
}
$asyncCB(e.detail);
}, false);
var appClient = {
debug: function(str){
if(/AppDebug/i.test(navigator.userAgent))
alert(str);
},
ajax: function(request, callback){
if(typeof request == 'string')
request = {'url': request};
var method = request.method || 'GET';
if(method == 'GET' && request.data){
if(request.url.indexOf('?')< 0)
request.url += "?";
if(typeof request.data == 'string'){
if(!request.url.match(/[\?\&]$/))
request.url += "&";
request.url += request.data;
}else{
for(var k in request.data){
if(!request.url.match(/[\?\&]$/))
request.url += "&";
request.url += encodeURIComponent(k)+ "=" + encodeURIComponent(request.data[k]);
}
}
request.data = null;
delete request['data'];
}
if (request.url.indexOf("/")== 0 || request.url.indexOf(location.protocol + "//" + location.host + "/")== 0){
appClient._ajax_XMLHttpRequest(request, callback);
} else {
appClient._ajax_native(request, callback);
}
},
_ajax_native: function(request, callback){
appClient.async('ajax', request, callback);
},
_ajax_XMLHttpRequest: function(request, callback){
var req = new XMLHttpRequest();
var method = request.method || 'GET';
req.open(method, request.url, true);
var headers = request.headers || {};
if(window.authString)
req.setRequestHeader('Authorization', window.authString);
for(var k in headers)
req.setRequestHeader(k, headers[k]);
var body = null;
if(request.data){
if(typeof request.data == 'object'){
req.setRequestHeader("Content-type","application/x-www-form-urlencoded");
var pairs = [];
for(var k in request.data)
pairs.push(encodeURIComponent(k)+ '=' + encodeURIComponent(request.data[k]));
body = pairs.join('&');
}else if(typeof request.data == 'string'){
req.setRequestHeader("Content-type","application/x-www-form-urlencoded");
body = request.data
}else{
body = request.data;
}
}
req.onreadystatechange = function(){
if (req.readyState == 4){
var responseHeaders = {};
var hs = req.getAllResponseHeaders().split("\n");
for(var i in hs){
var h = hs[i];
var name = h.split(":")[0];
responseHeaders[name] = req.getResponseHeader(name);
}
var response = {
statusCode: req.status,
statusMessage: req.statusText,
string: req.responseText,
headers: responseHeaders
}
callback(response, request);
}
}
req.send(body);
},
paramsToQueryString: function (params){
var result = "";
for(var i in params)
result += (result ? "&" : "")+ encodeURIComponent(i)+ "=" + encodeURIComponent(params[i]);
return result;
},
async: function(name, data, callback){
var p = appClient.getPlatform();
if (p == 'ios'){
var id = ++_appAsyncCount;
_appAsyncCallback[id] = callback;
location.href = "app://async-" + name + "?" + appClient.paramsToQueryString({
"async_data": JSON.stringify(data),
"async_id": id
});
} else if (p == 'android'){
} else {
alert(JSON.stringify({
'name': name
}));
}
},
read: function(name, callback){
appClient.async('read', {
'name': name
}, callback);
},
write: function(name, value, callback){
appClient.async('write', {
'name': name,
'value': value
}, callback);
},
readTmp: function(name, callback){
appClient.async('read', {
'name': name,
'tmp': true
}, callback);
},
writeTmp: function(name, value, callback){
appClient.async('write', {
'name': name,
'value': value,
'tmp': true
}, callback);
},
sign: function(method, valueFormat, keyFormat, callback){
appClient.async('sign', {
'method': method,
'key': keyFormat,
'value': valueFormat
}, callback);
},
test: function(test, callback){
appClient.async('test', {
'test': test
}, callback);
},
queue: function(func){
if(!window.funcQueue){
window.funcQueue = [];
}
window.funcQueue.push(func);
},
executeQueue: function(){
if(!window.funcQueue || window.funcQueue.length == 0)
return;
var f = window.funcQueue.shift();
f.call(null);
},
toast: function(str){
var p = appClient.getPlatform();
if (p == 'ios'){
location.href = 'app://toast?description=' + encodeURIComponent(str);
} else if (p == 'android'){
commonHook.toast(str);
} else {
alert(str);
}
},
finish: function(){
var p = appClient.getPlatform();
if (p == 'ios'){
location.href = "app://go-back";
} else if (p == 'android'){
commonHook.closeWeb();
} else {
alert("finish");
}
},
openSystem: function(url){
var p = appClient.getPlatform();
if (p == 'ios'){
location.href = "sys-" + url;
} else if (p == 'android'){
commonHook.openSystemUrl(url);
} else {
alert(url);
}
},
getPlatform: function(){
var regex = /.*[&\?]platform=([^\d&]*)/i;
if(window.location.href.match(regex)){
var p = window.location.href.replace(regex, '$1');
if (p.indexOf("android")!= -1)
return "android";
else if (p.indexOf("ios")!= -1)
return 'ios';
else return 'others'
} else {
if (navigator.userAgent.toLowerCase().indexOf('iphone')!= -1 || navigator.userAgent.toLowerCase().indexOf('ipad')!= -1){
return 'ios';
} else if (navigator.userAgent.toLowerCase().indexOf('android')!= -1){
return 'android';
} else {
return 'others';
}
}
},
fetchDone: function(count, error){
var p = appClient.getPlatform();
if (p == 'ios'){
location.href = 'app://fetchdone?' + appClient.paramsToQueryString({
'count': parseInt(count),
'error': error || ""
});
}else{
alert('fetch done:' + count + ' ' + error);
}
},
registerFetchFunction: function(name, func){
self.fetchFunction = self.fetchFunction || {};
self.fetchFunction[name] = func;
},
beginFetch: function(name, config){
if(!self.fetchFunction && !self.fetchFunction[name])
throw 'no such func';
self.fetchFunction[name](config);
}
};
window.appClient = appClient;


var userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_5)AppleWebKit/537.36 (KHTML, like Gecko)Chrome/27.0.1453.93 Safari/537.36';
function _addPictures(pics, cb){
appClient.async('pictureadd', pics, cb);
}
function _fetchDuowanTu(callback, config){
appClient.ajax({
method: 'GET',
url: config.url,
headers: {
'User-Agent': userAgent,
}
}, function(response, request){
if(response.statusCode / 100 != 2){
callback(0, 'error: code ' + response.statusCode);
return;
}
var reLink = /<em><a href="([^"]*)" target="_blank">/ig;
var match;
var funcs = [];
var totalNewPicturesFetched = 0;
while(match = reLink.exec(response.string)){
(function(){
var link = match[1];
funcs.unshift(function(cb){
appClient.ajax({
method: 'GET',
url: link,
headers: {
'User-Agent': userAgent
}
}, function(response, request){
var match = /var galleryId = "(\d+)";/.exec(response.string);
if(!match){
cb(null, {'error': 'content mismatch'});
return;
}
appClient.ajax({
method: 'GET',
url: 'http://tu.duowan.com/index.php?r=show/getByGallery/&gid=' + match[1],
headers: {
'User-Agent': userAgent,
'Refer': 'http://tu.duowan.com/gallery/' + match[1] + '.html'
}
}, function(response, request){
var json = JSON.parse(response.string);
var picInfo = json && json.picInfo || [];
var pictures = [];
for (var i = picInfo.length - 1; i >= 0; i--){
var p = picInfo[i];
var pUrl = p.url || p.source;
if(!config.allowGif){
if(/\.gif$/i.test(pUrl))
continue;
}
pictures.push({
request: {
url: pUrl,
headers: {
'User-Agent': userAgent,
'Refer': 'http://tu.duowan.com/gallery/' + match[1] + '.html'
}
},
title: p.add_intro
});
};
_addPictures(pictures, function(newPicturesCountAdded){
totalNewPicturesFetched += newPicturesCountAdded;
if(config.maxFetchCount && config.maxFetchCount > 0 && totalNewPicturesFetched > config.maxFetchCount){
cb('maxFetchCount reached', {
"new": newPicturesCountAdded,
"total": pictures.length
});
return;
}
cb(null, {
"new": newPicturesCountAdded,
"total": pictures.length
});
});
});
});
});
})();
}
async.series(funcs, function(err, results){
var totalFetched = 0;
var totalFetchedNew = 0;
for (var i = 0; i < results.length; i++){
totalFetched += results[i]["total"] || 0;
totalFetchedNew += results[i]["new"] || 0;
err = err || results[i]['error'];
}
if(err){
callback(totalFetchedNew, totalFetched == 0 ? err : null);
return;
}
callback(totalFetchedNew, null);
});
});
}
appClient.registerFetchFunction('name.huizhe.leiz', function(config){
_fetchDuowanTu(function(totalFetchedNew, error){
appClient.fetchDone(totalFetchedNew, error)
}, config);
});
appClient.registerFetchFunction('name.huizhe.manz', function(config){
_fetchDuowanTu(function(totalFetchedNew, error){
appClient.fetchDone(totalFetchedNew, error)
}, config);
});
appClient.registerFetchFunction('name.huizhe.dongz', function(config){
_fetchDuowanTu(function(totalFetchedNew, error){
appClient.fetchDone(totalFetchedNew, error)
}, config);
});
	
	appClient.beginFetch('name.huizhe.dongz', {
		url: 'http://tu.duowan.com/m/bxgif',
		allowGif: true,
		maxFetchCount: 300
	});

	window.fetchJSLoaded = window.fetchJSLoaded || {};
window.fetchJSLoaded['name.huizhe.dongz'] = true;
