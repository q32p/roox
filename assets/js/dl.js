(function(gl){
var dl = gl.dl = {},
is_object = gl.is_object = function(v){return v === null ? 0 : ((typeof v) == 'object');},
is_array = gl.is_array = function(v){return ( v instanceof Array );},
is_vector = gl.is_vector = is_array,
is_number = gl.is_number = function(v){return (typeof v) == 'number';},
is_numeric = gl.is_numeric = function(v){return (!isNaN(parseFloat(v)) && isFinite(v));},
is_func = gl.is_func = function(v){return (typeof v) == 'function';},
is_string = gl.is_string = function(v){return (typeof v) == 'string';},
is_scalar = gl.is_scalar = function(v){return (/string|number|boolean/).test(typeof v);},
is_empty = gl.is_empty = function(m){
	if(!is_object(m))return !m;
	if(is_vector(m))return m.length < 1;
	for(var k in m)return 0;
	return 1;
},
merge = dl.merge = function(b,l){
	var a = b;
	if(is_array(a)){l = intval(l);}else{a = arguments; l = 0;}
	var t,i,j = a.length;
	for(i = j - 1; i > -1; i--){
	    if((t = a[i]) !== undefined)break;
	}
	if(l < 0 || !is_object(t) || is_array(t))return t;
	l--;
	var d = {},i,k;
	for(i = 0; i < j; i++){
		if(!is_object(t = a[i]) || is_array(t))continue;
		for(k in t)d[k] = merge([ d[k], t[k] ],l);
	}
    return d;
},
compare = dl.compare = function(d,s){
    if(d === s)return 1;
    var a = is_object(d), b = is_object(s);
	if(a){if(b){for(var k in d){if(!compare(d[k],s[k]))return 0;}return 1;}return 0;}
	if(b)return 0;
	return d == s;
},
intval = (function(z){
	function g(m){
		function f(n,d){ var t = typeof n;
			return t == 'number' ? n : (t == 'boolean' ? (n ? 1 : 0) : (t == 'string' ? ( isNaN(n = m(n)) ? d||0 : n ) : d||0 ) );
		}
		return function(v,d,n){return (v = f(v,d)) < 0 && n !== undefined ? n : v;};
	}
	z.floatval = g(parseFloat)
	return z.intval = g(parseInt);
})(gl),
objectval = gl.objectval = function(v,d){return is_object(v) ? v : (d === undefined ? {} : d);},
arrayval = gl.arrayval = function(v,d){return is_array(v) ? v : (d === undefined ? (v === undefined ? [] : [ v ]) : d);},
clone = dl.clone = function(s,l,a){
    if(!is_object(s))return s;
	if(is_array(s))return array_clone(s,l,a);
	if((l = intval(l)) < 0)return s;
    var d = {}, k, v;
    l--;
    if(is_vector(a)){
        for(var i = 0; i < a.length; i++){
            k = a[i];
            if( (v = s[k]) === undefined)continue;
			if(!is_object(v)){d[k] = v;continue;}
			if(is_vector(v)){d[k] = array_clone(v,l,a);continue;}
            d[k] = clone(v,l,a);
        }
        return d;
    }
    for(k in s){
		if(!is_object(v = s[k])){d[k] = v;continue;}
        if(is_vector(v)){d[k] = array_clone(v,l,a);continue;}
        d[k] = clone(v,l,a);
    }
    return d; 
},
array_clone = dl.array_clone = function(s,l,a){
	if( (l = intval(l)) < 0)return s;
    var d = [];
    if(l){l--;for(var i = 0; i < s.length; i++)d.push(clone(s[i],l,a));return d;}
    for(var i = 0; i < s.length; i++)d.push(s[i]);
    return d;
},
proto = function(t,p,f){t.prototype[p] = t.prototype[p] || f;};
/* prototype */
proto(Array,'clone',function(l,a){return array_clone(this,l,a);});
proto(Array,'indexOf',function(v){for(var i = 0; i < this.length; i++){if(this[i] === v)return i;}return -1;});
proto(Array,'removeOf',function(v){
    var i = this.length - 1, s = 0;
    while(i > -1){if(this[i] === v){this.splice(i,1);s = 1;}i--;}
    return s;
});
proto(Array,'setOf',function(v){if(this.indexOf(v) > -1)return 0;this.push(v);return 1;});
proto(Array,'pushBy',function(a,s){
    if(!is_object(s))return 0;
	var i,e = 0;
    if(is_vector(s)){for(i = 0; i < s.length; i++)e = this.pushBy(a,s[i])||e; return e;}
    if(!is_vector(a))a = [ a ];
    var k,j,b,o = is_object(s);
    for(i = 0; i < this.length; i++){
		b = this[i]; e = 1;
        for(j = 0; j < a.length; j++){if(b[ k = a[j] ] != (o ? s[k] : s)){e = 0;break;}}
        if(e)return this[i] = s;
    }
    this.push(s);
    return 1;
});
proto(Array,'removeBy',function(a,s){
    var i,e = 0;
    if(is_vector(s)){for(i = s.length - 1;  i > -1; i--)e = this.removeBy(a,s[i])||e;return e;}
    if(!is_vector(a))a = [ a ];
	var k,j,b,c,o = is_object(s);
    for(var i = this.length - 1;  i > -1; i--){
		b = this[i]; c = 0;
        for(j = 0; j < a.length; j++){if(b[ k = a[j] ] != (o ? s[k] : s)){c = 1;break;}}
        if(c)continue;
        this.splice(i,1);
        e = 1;
    }
    return e;
});
proto(Array,'getBy',function(a,s){
	var i,b,j,c,o = is_object(s), d = [];
	if(!is_vector(a))a = [ a ];
    if(is_vector(s)){	
		var t = [],v,h;
		for(i = 0;  i < this.length; i++)t.push(this[i]);
		for(i = 0;  i < s.length; i++){
			v = s[i]
			for(h = 0; h < t.length; h++){
				b = t[h]; c = 0;
				for(j = 0; j < a.length; j++){if(b[ k = a[j] ] != (is_object(v) ? v[k] : v)){c = 1;break;}}
				if(c)continue;
				d.concat(t.splice(h,1));
			}
		}
		return d;
    }
    for(i = 0; i < this.length; i++){
		b = this[i]; c = 0;
		for(j = 0; j < a.length; j++){if(b[ k = a[j] ] != (o ? s[k] : s)){c = 1;break;}}
		if(c)continue;
		d.push(b);
    }
	return d;
});
proto(Array,'resetAll',function(s){
	var v,k,i;
	if(is_object(s)){
		for(i = 0; i < this.length; i++){
			if( !is_object(v = this[i]) )v = this[i] = {};
			for(k in s)v[k] = s[k];
		}
		return this;
	}
    for(i = 0; i < this.length; i++)this[i] = s;
	return this;
});
proto(String,'fromJSON',function(){
	try{ return JSON.parse(this); }catch(e){}
	return null;
});

proto(Array,'syncBy',function(key,s,nocopy,ret,copy){
    if(this === s || !is_object(s))return 0;
	var i;
	if(!is_vector(key))key = [ key ];
    if(is_array(s)){
		var t = [];
		for(i = 0; i < this.length; i++)t.push(this[i]);			
        for(i = 0; i < s.length; i++)t.removeBy(key, this.syncBy(key,s[i],nocopy,0,copy) );
		if(ret)return t;
		for(i = 0; i < t.length; i++)this.removeBy(key,t[i]);
        return t;
    }
    var k,j,b,m,o = is_object(s);
    for(i = 0; i < this.length; i++){
		m = this[i];
        b = 1;
        for(j = 0; j < key.length; j++){
            if(m[k = key[j]] != (o ? s[k] : s)){b = 0;break;}
        }
        if(b)return this[i] = object_sync(this[i],s,nocopy,copy);
    }
    this.push(s);
    return s;
});
var Timeout = dl.Timeout = function(o){
	var s = this,c,r = function(){var a = o.callback;if(is_func(a))a();};
	o = s.options = objectval(o);
    s.run = function(d){
		if(is_func(c))c();
		if((d = intval(d)) < 1)d = intval(o.delay);
		if(d < 1){r();return;}
		var z = 0;
		c = function(){z = 1;};
		setTimeout(function(){if(z)return;r();},d);
	};
	s.force = function(){if(is_func(c))c();r();};
	s.cancel = function(){if(is_func(c))c();};
},
srorage_set = gl.srorage_set = function(s,a,v){
    if(!is_object(v))return s[a] = v;
    var d = s[a];
    if(d === v)return d;
    if(!is_object(d))d = s[a] = {};
    var k,w;
    for(k in v){
		if(!is_object(w = v[k])){d[k] = w;continue;}
		if(is_vector(w)){d[k] = w;continue;}
        srorage_set(d,k,w);        
    }
    return d;
},
object_rewrite = gl.object_rewrite = function(d,s){
    var k;
    if(!is_object(d))d = {};
    for(k in d)delete d[k];
    if(!is_object(s))return d;
    for(k in s)d[k] = s[k];
    return d;
},
// dst,src,nocopy,copy
object_sync = gl.object_sync = function(d,s,a,b){
    if(!is_object(d))d = {};
    if(d === s || !is_object(s))return d;
    if(is_string(a))a = [ a ];
    var k,i,t = 0;
    if(is_vector(a)){ t = {};
        for(i = 0; i < a.length; i++){
            if(d[k = a[i]] === undefined)continue;
			t[k] = d[k];
        }     
    }
	if(is_string(b))b = [ b ];
    if(is_vector(b)){
        for(i = 0; i < b.length; i++){
            if(s[k = b[i]] === undefined)continue;
			d[k] = s[k];
        }
    }else for(k in s)d[k] = s[k];
	if(t){for(k in t)d[k] = t[k]; return d;}
    if(is_object(a)){for(k in a)d[k] = a[k];}
    return d;
};

(function(){
var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, reg = /[-[\]{}()*+?.,\\^$|#\s]/g;
//экранирование спец.символов в регулярном выражении
dl.regesc = function(s){return is_scalar(s) ? String(s).replace(reg,"\\$&") : '';};
proto(String,'trim',function(){return this.replace(rtrim,'');});
proto(String,'regesc',function(){return this.replace(reg,"\\$&");});
})();

})(window);


(function(angular){
'use strict';
angular = (angular && angular.module ) ? angular : window.angular;
return angular.module('dlStorage', [])
.provider('$paramStorage', _storageProvider('paramStorage'))
.provider('$localStorage', _storageProvider('localStorage'))
.provider('$sessionStorage', _storageProvider('sessionStorage'));
function _storageProvider(storageType) {
	return function(){
	  var storageKeyPrefix = 'dlStorage-';  
	  this.setKeyPrefix = function (prefix) {
		if (typeof prefix !== 'string') {
		  throw new TypeError('[dlStorage] - ' + storageType + 'Provider.setKeyPrefix() expects a String.');
		}
		storageKeyPrefix = prefix;
	  };

	  var serializer = angular.toJson;
	  var deserializer = angular.fromJson;
		if(storageType == 'paramStorage')storageKeyPrefix = '';

	  this.setSerializer = function (s) {
		if (!is_func(s)){
		  throw new TypeError('[dlStorage] - ' + storageType + 'Provider.setSerializer expects a function.');
		}

		serializer = s;
	  };

	  this.setDeserializer = function (d) {
		if(!is_func(s)){
		  throw new TypeError('[dlStorage] - ' + storageType + 'Provider.setDeserializer expects a function.');
		}

		deserializer = d;
	  };

	  // Note: This is not very elegant at all.
	  this.get = function (key) {
		return deserializer(window[storageType].getItem(storageKeyPrefix + key));
	  };

	  // Note: This is not very elegant at all.
	  this.set = function (key, value) {
		return window[storageType].setItem(storageKeyPrefix + key, serializer(value));
	  };

	  this.$get = [
		  '$rootScope',
		  '$window',
		  '$log',
		  '$timeout',
		  '$document',
		  '$location',    
			
		  function(
			  $rootScope,
			  $window,
			  $log,
			  $timeout,
			  $document,
			  $location
		  ){
			if(!is_object(window.paramStorage)){
				var ParamStorage = function(src){
					var self = this;
					var data = self.data = {};
					var keys = self.keys = [];
					var prevData = {};
					var reset = self.reset = function(src){
						if(!is_object(src))src = {};
						keys = self.keys = [];
						data = self.data = angular.merge(src,$location.search());
						var v,retkeys = [];
						for(var k in data){
							if(data[k] !== prevData[k])retkeys.push(k);
							prevData[k] = data[k];
							keys.push(k);
						}
						return retkeys;
					};
					reset(src);
					self.clear = function(){
						keys = self.keys = [];
						data = self.data = {}; 
						$location.search(data).replace();
					};
					self.__defineSetter__('length', function(l){
						l = intval(l,keys.length,0);
						while(keys.length > l)delete data[keys.pop()];
						return keys.length;
					});
					self.__defineGetter__('length', function(){return keys.length;});
					self.key = function(i){return keys[i];};
					var setItem = self.setItem = function(name,value){
						if(value === undefined)value = null;
						if(value){
							data[name] = value;
							keys.setOf(name);
						}else{
							if(data[name] === undefined)return;
							delete data[name];
							keys.removeOf(name);
						}
						$location.search(data).replace();
					};
					self.getItem = function(name){return data[name];};
					self.removeItem = function(name){setItem(name,null);};
				}; 
				var paramStorage = window.paramStorage = new ParamStorage();
			}
			function isStorageSupported(storageType){
				var supported;
				try {
					supported = $window[storageType];
				}
				catch (err) {
					supported = false;
				}
				if (supported && storageType === 'localStorage') {
					var key = '__' + Math.round(Math.random() * 1e7);

					try {
						localStorage.setItem(key, key);
						localStorage.removeItem(key);
					}
					catch (err) {
						supported = false;
					}
				}

				return supported;
			}
			
			var prefixLength = storageKeyPrefix.length;
			var callbacks = [];
			var webStorage = isStorageSupported(storageType) || ($log.warn('This browser does not support Web Storage!'), {setItem: angular.noop, getItem: angular.noop, removeItem: angular.noop}),
				$storage = {
					$default: function(items) {
						for(var k in items)angular.isDefined($storage[k]) || ($storage[k] = angular.copy(items[k]) );
						$storage.$sync();
						return $storage;
					},
					$reset: function(items) {
						for (var k in $storage)'$' === k[0] || (delete $storage[k] && webStorage.removeItem(storageKeyPrefix + k));
						return $storage.$default(items);
					},
					$sync: function () {
						for (var i = 0, l = webStorage.length, k; i < l; i++) {
							(k = webStorage.key(i)) && storageKeyPrefix === k.slice(0, prefixLength) && srorage_set($storage,k.slice(prefixLength),deserializer(webStorage.getItem(k)));
						}
					},
					$apply: function() {
						var temp$storage;
						_debounce = null;
						if(angular.equals($storage, _last$storage))return;
						temp$storage = angular.copy(_last$storage);
						angular.forEach($storage, function(v, k) {
							if(angular.isDefined(v) && '$' !== k[0]){
								v = is_empty(v) ? v = null : v = serializer(v);
								webStorage.setItem(storageKeyPrefix + k, v);
								delete temp$storage[k];
							}
						});
						for(var k in temp$storage)webStorage.removeItem(storageKeyPrefix + k);
						_last$storage = angular.copy($storage);
					},
					$bind: function(key,callback){ if(is_func(callback))callbacks.syncBy(['cb','k'],{cb:callback,k:key}); },
					$unbind: function(key,callback){ callbacks.removeBy(['cb','k'],{cb:callback,k:key}); },
					$render: function(key){ 
						for(var i = 0; i < callbacks.length; i++){
							if(callbacks[i].k == key)callbacks[i].cb();
						}
					}
				},
				
				_last$storage,
				_debounce;

			$storage.$sync();

			_last$storage = angular.copy($storage);
			
			$rootScope.$watch(function(){
				_debounce || (_debounce = $timeout($storage.$apply, 100, false));
			});
			var paramTimeout;
			if(storageType == 'localStorage'){
				$window.addEventListener && $window.addEventListener('storage', function(event) {
					if (!event.key) {
					  return;
					}
					var doc = $document[0];
					var v = event.newValue;
					
					if(is_string(v) && v[0] === '_')return;
					if ( (!doc.hasFocus || !doc.hasFocus()) && storageKeyPrefix === event.key.slice(0, prefixLength) ) {
						var k = event.key.slice(prefixLength);
						if(!is_string(v))return;
						$rootScope.$apply(function(){
							v ? srorage_set($storage,k,deserializer(v)) : delete $storage[k];
							_last$storage = angular.copy($storage);
							$storage.$render(k);
						});
					}
				});
			}
			if(storageType == 'paramStorage'){
				var paramCallback = function(){
					var keys = window.paramStorage.reset();
					$storage.$sync();
					_last$storage = angular.copy($storage);
					for(var i = 0; i < keys.length; i++)$storage.$render(keys[i]);
				};
				paramTimeout = new dl.Timeout({
					delay:100,
					callback:function(){
						$rootScope.$apply(paramCallback);
					}
				});
				var isFirstRender = 1;
				var listenerCancel = $rootScope.$on('$locationChangeSuccess',function(e,newUrl,oldUrl){
					if(isFirstRender){
						isFirstRender = 0;
						return;
					}
					paramTimeout.run();
				});
			}
			return $storage;
		  }
	  ];
  };
}

})(angular);


(function(angular){
'use strict';
dl.factories = function(a,f){return dl.drv = function(n,c){
	a.directive(n,f.concat(function(){
		var m = {};
		for(var i = 0; i < f.length; i++)m[f[i]] = arguments[i];
		var b = c(m);
		return { restrict: 'A', link: function(s,e,a){
			var exp = a[n], l = a.dlModel, r = a.dlCollection;
			b({ $s:s, $e:e, a:a, n:n, $m:m, exp:exp,
				$options:function(o,k){return dl.merge([ o, objectval(s.$eval(a[k||(n+'Options')])) ]);},
				$val:function(n){return s.$eval(n||l);},
				$item:function(n){return s.$eval(n||q);},
				$collection:function(n){return s.$eval(n||r);},
				$w:function(c,n,z){return (z||s).$watch(n||l,function(v,w){angular.equals(v,w)||c(v,w);});},
				$wc:function(c,n,z){return (z||s).$watchCollection(n||r,function(v,w){c(v,w);});}
			});
		}};
	}));
};};

})(angular);

var $window = $(window), $body = $('body'), $document = $(document);
(function($){
dl.create = function(s){
	s = objectval(s);
	var d = document.createElement(s.name || 'x'), e = $(d);
	if(is_string(s.src))d.src = s.src;
	if(is_object(s.attr))e.attr(s.attr);
	if(is_object(s.css))e.css(s.css);
	if(is_string(s.html))e.html(s.html);
	if(is_string(s.text))e.text(s.text);
	if(is_string(s['class']))e.addClass(s['class']);
	return e;
}; 
$.fn.less = function(){
	less.render($(this).text(),function(e,s){
		$body.append(dl.create({name:'style',text:s.css}));
	});
};
})(jQuery);



