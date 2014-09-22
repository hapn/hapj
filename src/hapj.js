/** 
 * Copyright (c) 2014, Jiehun.com.cn Inc. All Rights Reserved
 * @author dengxiaolong@jiehun.com.cn
 * @date 2014-09-22
 * @version 1.0
 * @class hapj
 * @description hapj全新的1.0版，该版本保留了向下兼容性，并将UI组件转变为基于jQuery实现。鼓励使用jQuery来实现基础功能<br/>
 * hapj微内核，下面的闭包需要放置在页面开始处执行
 * <script>(function(d){var h=hapj=function(u){if(typeof u=='string'){var n=d.createElement('script'),s=d.getElementsByTagName('script')[0];n.async=n.defer=true;n.src=u;s.parentNode.insertBefore(n, s);}else{h.c.apply(null, arguments)}};h.a=[];h.c=function(){h.a.push(arguments)};})(document);</script>
 **/
// 如果在页面上没有检测到hapj，则重新初始化
if (!('hapj' in window)) {
	var hapj;
	!function(d){
		'use strict';
		hapj = function(u){
			if (typeof u == 'string') {
				var n = d.createElement('script'), s = d.getElementsByTagName('script')[0];
				n.async = true;
				n.src = u;
				s.parentNode.insertBefore(n, s);
			} else {
				hapj.c.apply(null, arguments);
			}
		};
		var h = hapj;
		h.a = [];
		h.c = function(){
			h.a.push(arguments);
		};
	}(document);
}

// DOM加载完毕处理的事件
!function(H){
	'use strict';
	
	H.__version = 1.0;
	
	var _w = window,
	_d = document,
	_h = hapj,
	_isReady = false,
	//参考jquery的ready函数
	_bindReady = function() {
		if (_d.readyState == 'complete') {
			return setTimeout(_ready, 1);
		}

		if (_d.addEventListener) {
			_d.addEventListener('DOMContentLoaded', _onDOMContentLoaded, false);
			_w.addEventListener('load', _ready, false);
		} else if (_d.attachEvent) {
			_d.attachEvent('onreadystatechange', _onDOMContentLoaded);
			_w.attachEvent('onload', _ready);
		  	
			var toplevel = false;
		    try {
		    	toplevel = (_w.frameElement == null);
		    } catch (e) {}
		
		    if (_d.documentElement.doScroll && toplevel) {
				_doScrollCheck();
			}
		}
	},
	//滚动检查
	_doScrollCheck = function() {
		if (_isReady) {
			return;
		}

		try {
			_d.documentElement.doScroll('left');
		} catch (e) {
			return setTimeout(_doScrollCheck, 1);
		}

		_ready();
	},
	//页面准备好了的事件
	_ready = function() {
		if (_isReady) {
			return;
		}
		_isReady = true;
		
		var f;
		while(_h.a.length) {
			if ( (f = _h.a.shift()) ) {
				_callFunc(f);
			}
		}
		
		delete _h.a;
		delete _h.start;
		// 更改hapj.c函数
		_h.c = function(){
			_callFunc.call(null, arguments);
		};
	},
	//页面载入完成后的事件
	_onDOMContentLoaded = (_d.addEventListener ? function() {
	  _d.removeEventListener('DOMContentLoaded', _onDOMContentLoaded, false);
		_ready();
	} : (_d.attachEvent ? function(){
		if (_d.readyState == 'complete') {
			_d.detachEvent('onreadystatechange', _onDOMContentLoaded);
			_ready();
		}
	} : null)),
	_callFunc = function(f) {
		return _wrapFunc(f[0]).call(null, _h);
	},
	_wrapFunc = function(closure){
		if (typeof closure != 'object') return closure;
		
		if (closure._tag) {
			return function() {
				var ctx = closure._tag;
				var elems = [];
				if (typeof ctx == 'string') {
					elems = _h.ui._tag(ctx);
				} else if (_h.array.isArray(ctx)) {
					_h.array.each(ctx, function(i, t) {
						_h.array.merge(elems, _h.ui._tag(t));
					});
				}
				
				delete closure._tag;
				
				_h.object.each(closure, function(k, c) {
					if (typeof c != 'function') {
						return;
					}
					var ce = new RegExp('(^|[\\s])_j' + k + '([\\s]|$)');
					_h.array.each(elems, function(i, e) {
						if (ce.test(e.className)) {
							var node = new _h.ui(e);
							c.call(null, node, e);
						}
					});
				});
			};
		} else {
			return function(){
				_h.object.each(closure, function(k, c){
					if (typeof c != 'function') {
						return;
					}
					var es = _h.ui._cls('_j' + k).length > 0 ? _h.ui._cls('_j' + k) : hapj.ui.elem($('._j' + k));
					if (es) {
						if (es.length == 1) {
							c.call(null, _h.ui(es), es[0]);
						} else {
							c.call(null, _h.ui(es), es);
						}
					}
				});
			};
		}
	};
	
	// hapj的启动函数，启动之后该函数就会消失
	hapj.start = function(){
		// 先将要求立即执行的函数执行完毕
		var i = 0;
		while(i < _h.a.length) {
			if (_h.a[i].length > 1 && !hapj.a[i][1]) {
				_callFunc(_h.a[i]);
				_h.a[i] = null;
			}
			i++;
		}
		_bindReady();
	};
}(hapj);

/**
 * hook机制
 */
!function(H){
	'use strict';
	
	var hooks = {};
	/**
	 * @class hapj.hook
	 * @memberof hapj
	 * @description 钩子
	 */
	H.hook = /** @lends hapj.hook */{
		/**
		 * 设置钩子
		 * @param {String} name 名称
		 * @param {Function} h 函数
		 */
		set:function(name, h) {
			if (!(name in hooks)) {
				hooks[name] = [];
			}
			hooks[name].push(h);
		},
		/**
		 * 获取一个钩子
		 * @param {String} name 名称
		 */
		get: function(name) {
			if (!(name in hooks)) {
				return null;
			}
			return hooks[name][0];
		},
		/**
		 * 获取多个钩子
		 * @param {String} name 名称
		 */
		gets: function(name) {
			if (!(name in hooks)) {
				return [];
			}
			return hooks[name];
		},
		/**
		 * 删除掉指定名称的所有钩子
		 * @param {String} name 名称
		 */
		remove: function(name) {
			if (name in hooks) {
				delete hooks[name];
			}
		}
	};
}(hapj);
// lib
hapj.lib = {};
hapj.ext = {};


!function(H, undefined){
	'use strict';
	
	var _e = encodeURIComponent,
	_d = decodeURIComponent,
	r20 = /%20/g,
	tos = {
		/**
		 * 转化为json格式的字符串
		 * @param {Mixed} from
		 */
		toJsonFormatString: function(from) {
			if (undefined !== window.JSON) {
				return JSON.stringify(from);
			}
			var results = [], v;
			if (H.isArray(from)) {
				for(var i = 0, l = from.length; i < l; i++){
					v = this.toJsonFormatString(from[i]);
					if (v !== undefined) {
						results.push(v);
					}
				}
				return '[' + results.join(',') + ']';
			} else {
				switch (typeof from) {
					case 'undefined':
					case 'unknown': 
						return '';
					case 'function':
					case 'boolean':
					case 'regexp':
						return from.toString();
					case 'number':
						return isFinite(from) ? from.toString() : 'null';
					case 'string':
						return '"' +
						from.replace(/(\\|\")/g, "\\$1").replace(/\n|\r|\t/g, function(){
							var a = arguments[0];
							return (a == '\n') ? '\\n' : (a == '\r') ? '\\r' : (a == '\t') ? '\\t' : "";
						}) +
						'"';
					case 'object':
					 	if (from=== null) return 'null';
					    results = [];
					    for (var p in from) {
					      v = this.toJsonFormatString(from[p]);
					      if (v !== undefined) {
						  	results.push(this.toJsonFormatString(p) + ':' + v);
						  }
					    }
					    return '{' + results.join(',') + '}';
				}
			}
		},
		/**
		 * 转化为键值对的字符串
		 * @param {Object} from
		 */
		toPairFormatString: function(from) {
			if (typeof from != 'object') {
				throw new Error('serial.u_wrongTypeForPariString');
			}
			var ret = [];
			for(var key in from) {
				var v = from[key];
				key = _e(key);
				if (typeof v == 'function') {
					v = v.call(null);
				} else if (H.isArray(v)) {
					for(var i = 0, l = v.length; i < l; i++) {
						ret.push(key + '=' + _e(v[i]));
					}
					continue;
				}
				ret.push(key + '=' + _e(v));
			}
			return ret.join('&').replace( r20, '+' );
		},
		/**
		 * 转化成md5格式的字符串
		 * @param {String} from
		 */
		toMd5FormatString: function(from) {
			return H.lib.md5(from.toString());
		},
		/**
		 * 转化成cookie格式的字符串
		 * @param {Object} from
		 */
		toCookieFormatString:function(from) {
			if (typeof from != 'object') {
				throw new Error('serial.u_wrongTypeForCookieFormatString');
			}
			if (!('name' in from)) {
				throw new Error('serial.u_keyOfNameLost');
			}
			var name = _e(from.name), value;
			if (!('value' in from) || from.value === null) {
				value = '';
				from.expires = -1;
			} else {
				value = _e(from.value);
			}
			var expires = '';
			if (from.expires
					&& (typeof from.expires == 'number' || from.expires.toUTCString)) {
				var date;
				if (typeof from.expires == 'number') {
					date = new Date();
					date.setTime(date.getTime()
							+ (from.expires * 24 * 60 * 60 * 1000));
				} else {
					date = from.expires;
				}
				expires = '; expires=' + date.toUTCString();
			}
			var path = from.path ? '; path=' + (from.path) : '',
			domain = from.domain ? '; domain=' + (from.domain) : '',
			secure = from.secure ? '; secure' : '';
			return [ name, '=', value, expires, path, domain, secure ].join('');
		}
	},
	getKeyValue = function(from, elemTag, kvTag, key) {
		var arr = from.split(elemTag), i, l, ret = {};
		for(i = 0, l = arr.length; i < l; i++ ) {
			var tmp = arr[i].split(kvTag), k = _d(H.trim(tmp[0]));
			if (!k) continue;
			if (k in ret) {
				if (!H.isArray(ret[k])) {
					ret[k] = [ret[k]];
				}
				ret[k].push(_d(tmp[1]));
			} else {
				ret[k] = _d(tmp[1]);
			}
		}
		if (key) {
			return key in ret ? ret[key] : null;
		}
		return ret;
	}
	;
		
	H.lib.serial = {
		toString:function(from, format) {
			if (!from){
				return '';
			}
			switch(format) {
				case 'md5':
					return tos.toMd5FormatString(from);
				case 'json':
					return tos.toJsonFormatString(from);
				case 'pair':
					return tos.toPairFormatString(from);
				case 'cookie':
					return tos.toCookieFormatString(from);
				default:
					throw new Error('serial.u_formatNotImplemented');
			}
		},
		/**
		 * 获取json对象
		 * @param {Object} from
		 */
		getJson:function(from) {
			if (undefined !== window.JSON) {
				return JSON.parse(from);
			}
			/* jshint ignore:start */
			return eval('(' + from + ')');
			/* jshint ignore:end */
		},
		/**
		 * 获取cookie值
		 * @param {Object} from
		 * @param {Object} key
		 */
		getCookie: function(from, key) {
			return getKeyValue(from, ';', '=', key);
		},
		/**
		 * 获取键值对
		 * @param {Object} from
		 */
		getPair: function(from, key) {
			return getKeyValue(from, '&', '=', key);
		}
	};
}(hapj);

//兼容性函数
!function(H){
	'use strict';
	
	var ts = Object.prototype.toString;
	/**
	 * @class hapj.string
	 * @memberof hapj
	 * 
	 */
	H.string = /**@lends hapj.string */{
		/**
	  	 * 返回去掉前后空格的字符串
	  	 * @param {String} str 字符串
	  	 */
	  	trim: function(str) {
	  		return str ? str.replace(/(^[ \t\n\r]+)|([ \t\n\r]+$)/g, '') : '';
	  	},
	  	/**
	  	 * 返回去掉右侧空格的字符串
	  	 * @param {String} str 字符串
	  	 */
		rtrim: function(str) {
			return str ? str.replace(/[ \t\n\r]+$/, '') : '';
		},
		/**
	  	 * 返回去掉左侧空格的字符串
	  	 * @param {String} str 字符串
	  	 */
		ltrim: function(str) {
			return str ? str.replace(/^[ \t\n\r]+/, '') : '';
		},
		/**
	  	 * 将字符串用md5算法加密
	  	 * @param {String} str 字符串
	  	 */
		toMd5: function(str) {
			return hapj.lib.serial.toString(str, 'md5');
		},
		/**
	  	 * 将字符串用json方式还原
	  	 * @param {String} str 字符串
	  	 * @returns mixed
	  	 */
		toJson: function(str) {
			return hapj.lib.serial.toString(str, 'json');
		},
		/**
		 * 将字符串转化对对象
		 * @param {String} str 字符串
		 * @returns {Object}
		 */
		toParam: function(str) {
			return hapj.lib.serial.getPair(str);
		},
		/**
		 * 去掉html标志
		 * @param {String} str
		 */
		stripTags : function(str) {
	        return (str || '').replace(/<[^>]+>/g, '');
	    }
	};
	/**
	 * @class hapj.array
	 * @memberof hapj
	 * 
	 */
	H.array = /**@lends hapj.array */{
		/**
		 * 是否为数组
		 * @param {Mixed} arr 对象
		 * @returns {Boolean}
		 */
		isArray: function(arr) {
			return ts.call(arr) == '[object Array]';
		},
		/**
		 * 循环数组
		 * @param {Array} obj 数组
		 * @param {Function} func 函数
		 * @param {Mixed} me this指针
		 */
		each:function(obj, func, me) {
			for(var i = 0, l = obj.length; i < l; i++) {
				if (obj[i] === null) continue;
				if (func.call(me || obj[i], i, obj[i]) === false) {
					break;
				}
			}
		},
		/**
		 * 合并两个数组，将arr2合并到arr1
		 * @param {Array} arr1
		 * @param {Array} arr2
		 */
		merge: function(arr1, arr2) {
			for(var i = 0, l = arr2.length; i < l; i++) {
				arr1.push(arr2[i]);
			}
			return arr1;
		}
	};
	/**
	 * @class hapj.object
	 * @memberof hapj
	 * 
	 */
	H.object =  /**@lends hapj.object */{
		/**
		 * a是否包含属性b
		 * @param {Object} a
		 * @param {Object} b
		 */
		has: function(a, b) {
			return a.hasOwnProperty(b);
		},
		/**
		 * 循环对象
		 * @param {Array} obj 数组
		 * @param {Function} func 函数
		 * @param {Mixed} [me=null] this指针
		 */
		each: function(obj, func, me){
			for (var k in obj) {
				if (!this.has(obj, k) || obj[k] === null) continue;
				if (func.call(me || obj[k], k, obj[k]) === false) {
					break;
				}
			}
		},
		/**
		 * 将对象b的属性继承到a对象
		 * @param {Object} a
		 * @param {Object} b
		 * @returns {Object} 返回修改的a
		 */
		extend: function(a, b) {
			if (typeof a == 'undefined') {
				a = {};
			}
			for(var k in b) {
				a[k] = b[k];
			}
			return a;
		},
		/**
		 * 转化为参数形式
		 * @param {Object}
		 */
		toString: function(from) {
			return hapj.lib.serial.toString(from, 'pair');
		},
		/**
		 * 判断是否为空对象
		 */
		isEmpty: function(obj) {
			for(var k in obj) {
				if (this.has(obj, k)) {
					return false;
				}
			}
			return true;
		}
	};
	
	/**
	 * JSON处理
	 * @class hapj.json
	 */
	H.json = /**@lends hapj.json */{
		/**
		 * 将对象编码成json字符串
		 * @method
		 * @memberof hapj.json
		 * @param {Mixed} from 对象
		 * @returns {String} 
		 * @example hapj.json.encode({a:'b'} // 返回字符串{"a":"b"} 
		 */
		encode: function(from) {
			return H.lib.serial.toString(from, 'json');
		},
		/**
		 * 将字符串用json格式还原
		 * @method
		 * @memberof hapj.json
		 * @param {String} from
		 * @returns {Mixed}
		 */
		decode: function(from) {
			return H.lib.serial.getJson(from);
		}
	};
	
	/**
	 * @class hapj.date
	 * @memberof hapj
	 */
	H.date = /**@lends hapj.date*/{
		/**
		 * 格式化日期
		 * @param {String} format 
		 * <dl>
		 *  <dt>Y</dt>
		 *  <dd>年份</dd>
		 *  <dt>m</dt>
		 *  <dd>月份</dd>
		 *  <dt>d</dt>
		 *  <dd>日期</dd>
		 *  <dt>H</dt>
		 *  <dd>时钟</dd>
		 *  <dt>i</dt>
		 *  <dd>分钟</dd>
		 *  <dt>s</dt>
		 *  <dd>秒钟</dd>
		 * </dl>
		 * @param {Date} date 必须是日期，不提供则使用当前时间
		 * @return {String}
		 * @example
		 * hapj.date.format('Y-m-d')  // rutrn 2014-06-15
		 */
		format: function(format, date) {
			date = date || new Date();
			var t,dates = {
				Y: date.getFullYear(),
				m: (t = date.getMonth() + 1) < 10 ? '0' + t : t,						
				d: (t = date.getDate()) < 10 ? '0' + t : t,						
				H: (t = date.getHours()) < 10 ? '0' + t : t,						
				i: (t = date.getMinutes()) < 10 ? '0' + t : t,
				s: (t = date.getSeconds()) < 10 ? '0' + t : t
			};
			return format.replace(/(([YmdHis]))/g, function(m, i, k){
				return dates[k];
			});
		}
	};
	
	/**
	 * @method hapj.isArray
	 * @alias hapj.array.isArray
	 */
	H.isArray = H.array.isArray;
	/**
	 * @method hapj.extend
	 * @alias hapj.object.extend
	 */
	H.extend = H.object.extend;
	/**
	 * @method hapj.trim
	 * @alias hapj.string.trim
	 */
	H.trim = H.string.trim;
	
	/**
	 * @method hapj.each
	 */
	H.each = function(obj, func, me) {
		if (!obj) return;
		if ('length' in obj) {
			return H.array.each(obj, func, me);
		} else {
			return H.object.each(obj, func, me);
		}
	};
	
	var ps = null,cs = null;
	/**
	 * 页面相关的内容
	 * @class hapj.page
	 */
	H.page = /**@lends hapj.page */{
		/**
		 * 获取页面url参数
		 * @param {String} key 指定键
		 * @return {String}
		 */
		getParam: function(key) {
			if (!ps) {
				ps = H.page.getParams();
			} 
			return ps[key];
		},
		/**
		 * 获取所有网页参数
		 * @return {Object}
		 */
		getParams:function(){
			return ps ? ps : (ps = H.lib.serial.getPair(location.search ? location.search.substr(1) : ''));
		},
		/**
		 * 设置cookie值
		 * @param {String} key  cookie名称
		 * @param {String} value cookie 值
		 * @param {Date | Number} [expire=null] 过期时间，单位：s
		 * @param {String} [path=null] 存储路径，默认为null 
		 * @param {String} domain cookie域
		 * @param {Boolean} secure 
		 */
		setCookie: function(key, value, expire, path, domain, secure) {
			document.cookie = H.lib.serial.toString({
				name: key,
				value: value,
				expires: expire,
				path: path,
				domain: domain,
				secure: secure
			}, 'cookie');
		},
		/**
		 * 获取cookie值
		 * @param {String} key cookie名称
		 * @return {String} 
		 */
		getCookie: function(key) {
			if (!cs) {
				cs = H.page.getCookies();
			}
			return cs[key];
		},
		/**
		 * 获取cookie所有值
		 * @returns {Object}
		 */
		getCookies: function() {
			return cs ? cs : (cs = H.lib.serial.getCookie(document.cookie));
		}
	};
}(hapj);

!function(H){
	'use strict';
	
	var LS;
   	try {
		// 禁用cookie时会导致安全访问问题
		LS   = window.localStorage;
	} catch(e) {
		LS = false;
	}
	var	prefix = 'HAPJ_';
	/**
	 * 本地缓存
	 * @class hapj.cache
	 * @memberof hapj
	 */
	H.cache = /**@lends hapj.cache*/{
		/**
		 * 是否支持缓存
		 */
		enable: !!LS,
		/**
		 * 设置缓存
		 * @param {String} key 键
		 * @param {String} value 值，必须是字符串
		 * @param {Int} expire 过期时间，单位为ms。可以为空，默认为24个小时
		 * @return {Boolean} 存储是否成功
		 */
		set: function(key, value, expire) {
			key = prefix + key;
			expire = expire || 24*3600*1000;
			if (expire > 0) {
				expire = new Date().getTime() + expire;
			}
			value = expire + "\n" + hapj.json.encode(value);
			LS.setItem(key, value);
		},
		/**
		 * 获取缓存
		 * @param {String} key 键
		 * @return null | string 获取失败返回false，其他返回字符串
		 */
		get: function(key) {
			key = prefix + key;
			var item = LS.getItem(key);
			if (!item) return null;
			var pos = item.indexOf("\n");
			if (pos < 0) {
				throw new Error('cache.u_valueTypeErrorForRead');
			}
			var expire = item.substring(0, pos), value = hapj.json.decode(item.substring(pos+1)); 
			
			if (expire > 0 && expire < new Date().getTime()) {
				LS.removeItem(key);
				return null;
			}
			return value;
		},
		/**
		 * 删除指定的缓存
		 * @param {String} key 键
		 */
		del: function(key) {
			key = prefix + key;
			LS.removeItem(key);
			return true;
		},
		/**
		 * 清理缓存，将过期缓存释放掉
		 */
		clean: function() {
			var key, item, pos, expire;
			for(var i = 0, l = localStorage.length; i < l; i++) {
				key = localStorage.key(0);
				if (key.indexOf(prefix) !== 0) {
					continue;
				}
				item = LS.getItem(key);
				pos = item.indexOf("\n");
				if (pos < 0) {
					continue;
				}
				expire = item.substring(0, pos);
				if (expire > 0 && expire < new Date().getTime()) {
					LS.removeItem(key);
				}
			}
		}
	};
	if (H.cache.enable) {
		// 自动清理。1/10的概率清理
		var i = Math.ceil(Math.random()*10);
		if (i == 20) {
			setTimeout(function(){
				H.cache.clean();
			}, 10000);
		}
	}
}(hapj);

//hapjId
!function(H){
	'use strict';
	
	var _hapjIdCount = 0, _hapjId = null;
	/**
	 * 获取或设置hapjId，注意，同一个页面只能设置一次，后面的设置不再起作用
	 * @method
	 * @memberof hapj
	 * @param {String} id
	 * @return {String} hapjId
	 */
	H.id = function(id) {
		if (id && _hapjIdCount === 0) {
			_hapjId = id;
			_hapjIdCount++;
		}
		if (!_hapjId) {
			_hapjId = new Date().getTime()*1000 + parseInt(Math.random()*899 + 100, 10);
		}
		return _hapjId;
	};
}(hapj);

// module 机制
!function(H){
	'use strict';
	
	var _modules = {};
	/**
	 * 获取模块
	 * @method
	 * @param {String} moduleName
	 */
	H.get = function(moduleName){
		return H.object.has(_modules, moduleName) ? _modules[moduleName] : null;
	};
	/**
	 * 设置模块
	 * @method hapj.set
	 * @param {String} moduleName 必须是以字母开头，后面是字母数字或者.、_。
	 * @param {Function} module 必须是函数
	 */
	H.set = function(moduleName, module) {
		if (!moduleName || !/[a-z][a-z0-9\._]+/i.test(moduleName)) {
			throw new Error('hapj.u_wrongModuleNameFormat moduleName=' + moduleName);
		}
		var type = typeof module;
		if (type != 'function' && type != 'object' ) {
			throw new Error('hapj.u_wrongModuleType type=' + type);
		}
		var parent = _modules;
		
		var nss = moduleName.split('.'), ns, fn = function(){return function(){};};
		while(nss.length > 1) {
			ns = nss.shift();
			if (!hapj.object.has(_modules, ns)) {
				parent = parent.ns = fn();
			} else {
				parent = parent.ns;
			}
		}
		ns = nss.shift();
		parent[ns] = module;
	};
}(hapj);

// 基本错误处理逻辑
!function(H){
	'use strict';
	
	var _we = window.onerror;
	onerror = function(msg, url, line) {
		if (line === 0)  {
			return;
		}
		if (_we) {
			_we.call(null, msg, url, line);
		}
		var fs = H.hook.gets('hapj.error');
		H.each(fs, function(){
			this.call(null, msg, url, line);
		});
	};
}(hapj);

//浏览器
!function(H){
	"use strict";
	/**
	 * 浏览器属性
	 * @class hapj.browser
	 * @memberof hapj
	 * @example 
	 * if (hapj.browser.mobile) {
	 * 	window.location.href = 'http://m.xxx.com';
	 * }
	 */
	H.browser = (function(){
		var ua = navigator.userAgent.toLowerCase(),
		rwebkit = /(webkit)[ \/]([\w.]+)/,
		ropera = /(opera)(?:.*version)?[ \/]([\w.]+)/,
		rmsie = /(msie) ([\w.]+)/,
		rmozilla = /(mozilla)(?:.*? rv:([\w.]+))?/,
		match = rwebkit.exec( ua ) ||
			ropera.exec( ua ) ||
			rmsie.exec( ua ) ||
			ua.indexOf('compatible') < 0 && rmozilla.exec( ua ) ||
			[];
		return /** @lends hapj.browser */{
			/**
			 * 浏览器类别
			 */
			type: match[1] || '',
			/**
			 * 浏览器版本号
			 */
			version: match[2] || '0',
			/**
			 * 是否为移动浏览器
			 */
			mobile: /(MIDP|WAP|UP\.Browser|Smartphone|Obigo|AU\.Browser|wxd\.Mms|WxdB\.Browser|CLDC|UP\.Link|KM\.Browser|UCWEB|SEMC\-Browser|Mini|Symbian|Palm|Nokia|Panasonic|MOT|SonyEricsson|NEC|Alcatel|Ericsson|BENQ|BenQ|Amoisonic|Amoi|Capitel|PHILIPS|SAMSUNG|Lenovo|Mitsu|Motorola|SHARP|WAPPER|LG|EG900|CECT|Compal|kejian|Bird|BIRD|G900\/V1\.0|Arima|CTL|TDG|Daxian|DAXIAN|DBTEL|Eastcom|EASTCOM|PANTECH|Dopod|Haier|HAIER|KONKA|KEJIAN|LENOVO|Soutec|SOUTEC|SAGEM|SEC|SED|EMOL|INNO55|ZTE|iPhone|Android|Windows CE|BlackBerry|MicroMessenger)/i.test(navigator.userAgent) 
		};
	})();
}(hapj);

/**
 * hapj 日志
 * @class hapj.log
 * @author ronnie<dengxiaolong@jiehun.com.cn>
 * @version 1.0
 */
!function(H, _d){
	'use strict';
	
	var _img = null,
	_en = encodeURIComponent,
	_firebug = (window.console && window.console.trace),
	toString = function(msg, encode) {
		if (undefined === encode) {
			encode = true;
		}
		if (typeof msg == 'object') {
			var ret = [];
			for(var p in msg) {
				ret.push(p + '=' + (encode ? _en(msg[p]) : msg[p])); 
			}
			return ret.join('&');
		}
		return msg;
	}
	;
	H.log = /**@lends hapj.log*/{
		/**
		 * 开发模式 1
		 */
		DEVELOP_MODE:1, // 开发模式
		/**
		 * 在线模式 2
		 */
		ONLINE_MODE: 2, // 在线模式
		/**
		 * 目前所处的模式，默认为开发模式。在开发模式和在线模式两种情况下，调试和报错的情况都会不一样。如果检测到浏览器支持firebug，则会启用firebug来进行相关信息的调试。
		 */
		mode: this.DEVELOP_MODE,
		/**
		 * 指定发生严重错误时会将错误信息作为参数访问到的url，该url会将js的错误信息报告给服务器端。
		 */
		url : '',
		/**
		 * 将错误信息发送给服务器。如果指定了hapj.log.url，则会将信息发送到该url。
		 * @param {String} msg
		 */
		server: function(msg){
			if (!this.url) {
				return this.warn('hapj.log.server url is not defined');
			}
			var self = hapj.log;
			
			hapj(function(){
				if (!_img) {
					_img = hapj.ui._node('img', {width:0, height:0, style:'position:absolute;left:-999px;top:-999px;'});
					document.body.appendChild(_img);
				}
				_img.setAttribute('src', self.url + '?' + msg.toString());
			}, true);
		}
	};
	if (_firebug) {
		hapj.object.extend(hapj.log, {
			debug: function(){
				if (this.mode != this.ONLINE_MODE) {
					window.console.log.apply(window.console, arguments);
				}
			},
			warn: function() {
				if (this.mode != this.ONLINE_MODE) {
					window.console.warn.apply(window.console, arguments);
				}
			},
			error: function(msg) {
				if (this.url) {
					this.server(toString(msg));
				}
				if (this.mode != this.ONLINE_MODE) {
					window.console.error.apply(window.console, arguments);
					window.alert(toString(msg, false));
				}
			}
		});
	} else {
		var log  = null, getElem = function(){
			if (!log) {
				var node = hapj.ui._node('textarea', {'style':'position:absolute;top:0;right:0;width:400px;height:200px;font-size:12px;font-family:verdana;padding:2px;border:solid 1px #FF0;background:#FFF;z-index:9999;'});
				_d.body.appendChild(node);
				log = node;
			}
			return log;
		}, getTime = function() {
			var now = new Date();
			return '[' + [now.getFullYear(), now.getMonth() + 1, now.getDate()].join('-') + ' ' + [now.getHours(),now.getMinutes(),now.getSeconds()].join(':') + ']';
		}, showMsg = function(msg, type) {
			hapj(function(){
				var el = getElem();
				el.value += (getTime() + ' ' + type + ' ' + decodeURIComponent(msg) + "\n");
			});
		};
		H.object.extend(H.log, /** @lends hapj.log */{
			/**
			 * 测试
			 * @param {String} msg
			 */
			debug: function(msg) {
				if (this.mode != this.ONLINE_MODE) {
					showMsg(toString(msg), 'DEBUG');
				}
			},
			/**
			 * 警告
			 * @param {String} msg
			 */
			warn: function(msg) {
				if (this.mode != this.ONLINE_MODE) {
					showMsg(toString(msg), 'WARN');
				}
			},
			/**
			 * 显示错误信息
			 * @param {String} msg
			 */
			error: function(msg) {
				var m = toString(msg, false);
				if (typeof msg == 'string') {
					msg = 'msg=' + _en(msg);
				} else {
					msg = m;
				}
				if (this.url) {
					this.server(msg);
				}
				if (this.mode != this.ONLINE_MODE) {
					showMsg(m, 'ERROR');
					window.alert(m);
				}
			}
		});
	}
}(hapj, document);

// hapj conf 配置
!function(H, undefined){
	'use strict';
	
	var option = {};
	/**
	 * 配置
	 * @class hapj.conf
	 */
	H.conf = /**@lends hapj.conf*/{
		/**
		 * 设置选项，如果有，则会覆盖
		 * @param {String} key 
		 * @param {String} value
		 */
		set:function(key, value) {
			if (undefined === value && typeof key == 'object') {
				H.object.each(key, function(k, v){
					option[k] = v;
				});
			} else {
				option[key] = value;
			}
		},
		/**
		 * 获取选项
		 * @param {String} key 键
		 * @param {Mixed} def 没有找到时的默认值
		 */
		get:function(key, def) {
			if (H.object.has(option, key)) {
				return option[key];
			}
			if (undefined === def) {
				def = null;
			}
			return def;
		},
		/**
		 * 更新配置项中的值（慎用）
		 * @param {String} key 键
		 * @param {String} prefix 前缀
		 * @param {Mixed} value 值
		 */
		update: function(key, prefix, value) {
			if (!(key in option)) {
				return;
			}
			var o = option[key], ns = prefix.split('.'), n = ns.shift(), exp = 'option["' + key + '"]';
			while(n) {
				if (!(n in o)) return;
				o = o[n];
				exp += '["' + n + '"]';
				n = ns.shift();
			}
			if (o) {
				exp += ' = ' + value;
				/* jshint ignore:start */
				eval(exp);
				/* jshint ignore:end */
			}
		},
		/**
		 * 删除指定选项
		 * @param {String} key
		 */
		remove:function(key) {
			if (H.object.has(option, key)) {
				delete option[key];
			}
		},
		/**
		 * 获取所有配置
		 */
		all:function() {
			return option;
		}
	};
}(hapj);

// hapj ui 基本查询方法
!function(H, _d){
	'use strict';
	
	var _A = H.array,_c = _d.getElementsByClassName ? function(cls, ctx){
		ctx = ctx || _d;
		return ctx.getElementsByClassName(cls);
	} : function(cls, ctx){
		ctx = ctx || _d;
		var ae = ctx.getElementsByTagName('*'),es = [], ce = new RegExp('(^|[\\s ]+)'+cls+'([\\s ]+|$)');
		H.array.each(ae, function(i, s){
			if (ce.test(s.className)) {
				es.push(s);
			}
		});
		return es;
	},
	// 节点加载完后回调
	_nodeCallback = function(node, callback) {
		if (typeof node == 'string') {
			var img = new Image();
			if (typeof arguments[2] == 'function') {
				img.onerror = arguments[2];
			}
			img.src = node;
			if (img.complete) {
				if(!!callback)return callback.call(img);
			}
			img.onload = function() {
				!!callback && callback.call(this);
				img.onload = null;
				img.onerror && (img.onerror = null);
			};
		}
		switch(node.nodeName) {
			case 'SCRIPT':
				node.onload = node.onreadystatechange = function() {
					if( !this.readyState || this.readyState == 'loaded' || this.readyState=='complete') {
						(typeof callback == 'function') && callback.call(null);
					}
				};
				break;
		}
	},
	_head = _d.getElementsByTagName('head')[0],
	getDomNode = function(node, func, tagName) {
		var t = node[func];
		if (!tagName) {
			while(t && !t.tagName) {
				t = t[func];
			}
		} else {
			tagName = tagName.toUpperCase();
			while(t && t.tagName != tagName) {
				t = t[func];
			}
			if (!t || t.tagName != tagName) {
				t = null;
			}
		}
		return t;
	}
	;
	
	/**
	 * 获取静态文件的host
	 */
	H.staticHost = (function(){
		var ss = _d.getElementsByTagName('script');
		for(var i = 0, l = ss.length; i < l; i++){
			var s = ss[i];
			if (!s.src) continue;
			if (/\/hapj\./.test(s.src)) {
				if (s.src.indexOf('http://') !== 0) {
					return location.host;
				}
				return /^http\:\/\/([^\/]+)\//.exec(s.src)[1];
			}
		}
		return location.host;
	})();
	
	/**
	 * @class jQuery
	 * 
	 */
	
	/**
	 * @class jQuery.fn
	 */
	
	
	/**
	 * 
	 * @class hapj.ui
	 * @param {String} selector 
	 * @param {Doc} [ctx=document] 文档对象
	 * @description 处理和界面相关的模块。
	 * 如果为字符串，根据字符串前缀寻找匹配的元素，返回这些元素构成的hapj.ui.node对象。具体而言：
1) 以#开头，返回指定id的元素
2) 以.开头，返回指定类别的元素
3) 其他，返回指定标签名的元素
如果为一个dom节点，会构建一个包含该节点的hapj.ui.node对象。
如果为一个包含length的对象，会将其每一个元素放到hapj.ui.node对象中并返回。如果为一个hapj.ui.node对象，则直接返回该对象。
	 * @update 2014/1/13 chengyuanhao@jiehun.com.cn
	 * 支持更多的对象表达式
	 * 示例：
	 * hapj.ui('input[type=radio]') 获取input标签中type是radio的对象集合，支持标签中的所有属性
	 * hapj.ui('input[value=111],div[class=test]') 获取input中value等于111的和DIV中class等于test的
	 * hapj.ui(':checkbox') 获取input中type等于checkbox的，也就是获取所有多选框。此表达式等同于hapj.ui('input[type=checkbox]')
	 * hapj.ui(':checkbox,#id,.class,div') 多表达式
	 */
	H.ui = function(selector, ctx){
		if (typeof selector == 'string') {
			var selectorArr = [];
			if(selector.indexOf(',')>0){
				selectorArr = selector.split(',');
			}else{
				selectorArr[0] = selector;
			}
			var objArr = new H.ui.node();
			for(var i in selectorArr){
				switch (selectorArr[i].charAt(0)) {
					case '#':
						objArr = objArr.concat(H.ui.id(selectorArr[i].substring(1), ctx));
						break;
					case '.':
						objArr = objArr.concat(H.ui.cls(selectorArr[i].substring(1), ctx));
						break;
					default:
						objArr = objArr.concat(H.ui.tag(selectorArr[i], ctx));
						break;
				}
			}
			return objArr;
		}
		return H.ui.elem(selector);
	};
	
	H.object.extend(H.ui, /** @lends hapj.ui */{
		/**
		 * 检查指定元素是否为dom节点
		 * @param {Mixed} obj 
		 * @returns {Boolean}
		 */
		isDom: function(obj) {
			return typeof obj == 'object' && obj.nodeType == 1;
		},
		/**
		 * 检查指定元素是否为document节点
		 * @param {Mixed} obj
		 * @returns {Boolean}
		 */
		isDoc: function(obj) {
			return typeof obj == 'object' && obj.nodeType == 9;
		},
		/**
		 * 返回指定元素的集合
		 * @param {Object} elem
		 * @return hapj.ui.node
		 */
		elem: function(elem) {
			if (elem) {
				var node = new H.ui.node();
				if (elem === window || elem == _d) {
					node.push(elem);
				} else if (elem.nodeName) {
					node.push(elem);
				} else if ('length' in elem) {
					node.concat(elem);
				}
				return node;
			}
			return null;
		},
		/**
		 * 返回指定的id元素的集合
		 * @param {String} id
		 * @return hapj.ui.node
		 */
		id: function(id, ctx) {
			var node = new H.ui.node();
			var elem = this._id(id, ctx);
			if (elem) {
				node.push(elem);
			}
			return node;
		},
		/**
		 * 返回指定的类别的元素集合
		 * @param {String} cls
		 * @param {Dom} ctx
		 * @return hapj.ui.node
		 */
		cls: function(cls, ctx) {
			var node = new H.ui.node();
			return node.concat(this._cls(cls, ctx));
		},
		/**
		 * 返回指定的tag元素的集合
		 * @param {String} tag
		 * @param {Dom} ctx
		 * @return hapj.ui.node
		 */
		tag: function(tag, ctx) {
			var node = new H.ui.node();
			return node.concat(this._tag(tag, ctx));
		},
		/**
		 * 返回指定的id的元素的DOM节点
		 * @param {String} id 元素的id
		 * @param {Dom} ctx document文档
		 * @return {HTMLElement}
		 */
		_id: function(id, ctx) {
			return (ctx || _d).getElementById(id);
		},
		/**
		 * 返回指定的tag的元素的DOM节点
		 * @param {String} tag
		 * @param {Dom} ctx
		 * @return {HTMLElement}
		 */
		_tag: function(tag, ctx) {
			ctx = ctx || _d;
			var tagArr = [];
			var findArr = [];
			if(tag.indexOf('[')>0&&tag.indexOf(']')>0){
				tagArr = tag.split('[');
				tag = tagArr[0];
				findArr = tagArr[1].replace(']','').split('=');
			}
			if(tag.indexOf(':')===0){
				tagArr[0] = 'input';
				findArr[0] = 'type';
				findArr[1] = tag.replace(':','');
				tag = tagArr[0];
			}
			var obj = ctx.getElementsByTagName(tag);
			if(tagArr.length===0) return obj;
			if(findArr.length<=1) return false;
			var newObj = [];
			var i = 0;
			if(obj){
				H.each(obj,function(k,v){
					if(v[findArr[0]]==findArr[1]){
						newObj[i] = v;
						i++;
					}
				});
			}
			return newObj;
		},
		/**
		 * 返回指定的类别的元素的DOM节点
		 * @param {String} cls
		 * @param {String | Array | Dom} ctx
		 * @return {HTMLElement} 
		 */
		_cls: _c,
		/**
		 * a 是否包含 b
		 * @param {Dom} a
		 * @param {Dom} b
		 * @return {Boolean}
		 */
		contains: (function() {
			if (_d.documentElement.contains) {
				return function(a, b) {
					return a !== b && (a.contains ? a.contains(b) : true);
				};
			} else if (_d.documentElement.compareDocumentPosition) {
				return function(a, b) {
					return !!(a.compareDocumentPosition(b) & 16);
				};
			} else {
				return function() {
					return false;
				};
			}
		})(),
		/**
		 * 创建一个指定名称的节点 
		 * @param {Object} name 节点名称
		 * @param {Object} attr 节点属性
		 * @return {HTMLElement}
		 */
		_node: function(name, attr) {
			var node = _d.createElement(name);
			for(var i in attr) {
				if (i && H.object.has(attr, i)) {
					if (i == 'class'){
						node.className = attr[i];
					}else{
						node.setAttribute(i, attr[i]);
					}
				}
			}
			return node;
		},
		/**
		 * 载入url
		 * @param {String} url
		 * @param {Function} callback
		 */
		load:function(url, callback) {
			var matches, type, node;
			if (!(matches = /.+\.([a-z0-9]+)(?:\?\d*|$)/i.exec(url)) ) {
				throw new Error('ui.u_wrongUrlFormat');
			}
			if (url.charAt(0) == '/') {
				url = 'http://' + H.staticHost + url;
			}
			type = matches[1].toLowerCase();
			switch(type) {
				case 'js':
					var attrs = {type:'text/javascript', src:url, defer: true};
					if (arguments.length > 2 && typeof arguments[2] == 'object') {
						H.object.extend(attrs, arguments[2]);
					}
					node = H.ui._node('script', attrs);
					_nodeCallback(node, callback);
					_head.appendChild(node);
					break;
				case 'css':
					node = H.ui._node('link', {rel:'stylesheet', type: 'text/css', href: url});
					_head.appendChild(node);
					break;
				case 'jpg':
				case 'jpeg':
				case 'bmp':
				case 'gif':
				case 'png':
					_nodeCallback(url, callback, typeof arguments[2] == 'function' ? arguments[2] : null);
					break;
				default:
					H.log.warn('this type(' + type + ') is not supported now.');
					break;
			}
			return node;
		}
	});
	
	/**
	 * @constructor hapj.ui.node
	 * @description 通过hapj.ui.id和hapj.ui.tag等方法，会返回一个这样的实例，用这个实例来进行相关的操作。hapj.ui.node对象支持push操作，有length对象，能像数组一样通过下标访问。
	 * hapj.ui.node的原型为hapj.ui.fn，所以hapj.ui.fn的所有属性都能通过hapj.ui.node的实例调用到。
	 */
	H.ui.node = function() {
		this.length = 0;
	};
	H.ui.fn = H.ui.node.prototype;
	var ap = Array.prototype;
	H.object.extend(H.ui.fn, /** @lends hapj.ui.node*/{
		/**
		 * 添加一个元素节点
		 * @param {Object} node
		 */
		push: function(elem) {
			ap.push.call(this, elem);
			return this;
		},
		/**
		 * 将当前node对象的元素和另外一组节点组合
		 * @param {Object} node
		 */
		concat: function(elems) {
			_A.each(elems, function(i,s){
				ap.push.call(this, s);
			}, this);
			return this;
		},
		/**
		 * 循环每一个元素节点
		 * @param {Object} func
		 */
		each: function(func) {
			_A.each(this, func);
			return this;
		},
		/**
		 * 返回某元素内指定标签的元素
		 * @param {String} tag 
		 * @return hapj.ui.node
		 */
		tag: function(tag) {
			var ret = new H.ui.node();
			this.each(function(){
				ret.concat(H.ui.tag(tag, this));
			});
			return ret;
		},
		/**
		 * 返回某元素内指定类别的元素
		 * @param {String} cls
		 * @return hapj.ui.node
		 */
		cls: function(cls) {
			var ret = new H.ui.node();
			this.each(function(){
				ret.concat(H.ui.cls(cls, this));
			});
			return ret;
		},
		/**
		 * 获取当前元素内所有的子元素
		 * @param {String} tag 子节点中的元素，如果指定，则返回子节点中的tagName为tag的元素
		 * @return {hapj.ui.node}
		 */
		childs:function(tag){
			var ret = new H.ui.node();
			tag = (tag || '').toUpperCase();
			this.each(function(){
				var childs = this.childNodes;
				for (var i = 0, l = childs.length; i < l; i++) {
					if (undefined === childs[i].tagName) 
						continue;
					if (!tag || childs[i].tagName == tag) {
						ret.push(childs[i]);
					}
				}
			});
			return ret;
		},
		/**
		 * 获取下一个节点
		 * @param {String} tag 不指定则返回元素的下一个节点。否则依次往后找到标签名称为tag的元素。
		 */
		next: function(tag) {
			var node = new H.ui.node();
			this.each(function(){
				node.push(getDomNode(this, 'nextSibling', tag));
			});
			return node;
		},
		/**
		 * 获取上一个节点
		 * @param {String} tag 不指定则返回元素的上一个节点。否则依次往前找到标签名称为tag的元素。
		 */
		prev: function(tag) {
			var node = new H.ui.node();
			this.each(function(){
				node.push(getDomNode(this, 'previousSibling', tag));
			});
			return node;
		},
		/**
		 * 获取元素的父节点
		 * @param {String} tag 不指定则返回元素的直接父节点。否则会网上回溯直到找到标签名称为tag的元素。
		 */
		parent: function(tag) {
			var node = new H.ui.node();
			this.each(function(){
				node.push(getDomNode(this, 'parentNode', tag));
			});
			return node;
		}
	});
	
	H.load = H.ui.load;
}(hapj, document);

/**
 * hapj ui 样式处理
 * @class hapj.ui.node
 */
!function(H, _w, _d, undefined){
	'use strict';
	
	var body = _d.compatMode == 'BackCompat' ? _d.body : _d.documentElement,
		/**
	 * 将html封装成节点，以数组形式返回
	 * @param {Object} html
	 */
	wrapHtml = function(html) {
		var ms = rtagName.exec(html), elems = [], depth = 0,div = H.ui._node('div');
		if (ms && ms[1] && wrapMap[ms[1]]) {
			var wrap = wrapMap[ms[1]];
			html = wrap[1] + html + wrap[2];
			depth = wrap[0];
		}
		div.innerHTML = html;
		while(depth--) {
			div = div.lastChild;
		}
		H.array.each(div.childNodes, function(){
			if (this.nodeName) {
				elems.push(this);
			}
		});
		return elems;
	},
	rCRLF = /\r?\n/g,
	rtagName = /<([\w:]+)/,
	wrapMap = {
		option: [ 1, '<select multiple="multiple">', '</select>' ],
		legend: [ 1, '<fieldset>', '</fieldset>' ],
		thead: [ 1, '<table>', '</table>' ],
		tr: [ 2, '<table><tbody>', '</tbody></table>' ],
		td: [ 3, '<table><tbody><tr>', '</tr></tbody></table>' ],
		col: [ 2, '<table><tbody></tbody><colgroup>', '</colgroup></table>' ],
		area: [ 1, '<map>', '</map>' ],
		_default: [ 0, '', '' ]
	},
	cssreg = /([A-Z])/g,
	getStyle = (function(){
		if (_w.getComputedStyle) {
			return function(elem, name) {
				name = name.replace(cssreg, '-$1').toLowerCase();
				var cs = _w.getComputedStyle(elem, null);
				return cs.getPropertyValue(name);
			};
		} else if (_d.documentElement.currentStyle) {
			return function(elem, name) {
				var ret = elem.currentStyle[name];
				return ret == 'auto' ? 0 : ret;
			};
		} else {
			return function() {
				return null;
			};
		}
	})(),
	indexOf = function(arr, val) {
		for(var i = 0, l = arr.length; i < l; i++) {
			if (arr[i] == val) {
				return i;
			}
		}
		return -1;
	}
	;
	wrapMap.optgroup = wrapMap.option;
	wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
	wrapMap.th = wrapMap.td;
	H.object.extend(H.ui.fn, /** @lends hapj.ui.node */{
		/**
		 * 设置元素的属性，支持链式操作
		 * @param {String|Object} 样式名或样式集合
	  	 * @param {String} 样式值
	  	 * @return  {hapj.ui.node}
		 */
		attr: function(attr, value) {
			if (typeof attr == 'string' && undefined === value) {
				if (attr == 'class') {
					return this.length ? this[0].className : null;
				}
				return this.length ? ( attr in this[0] ? this[0][attr] : this[0].getAttribute(attr) ) : null;
			}
			if (typeof attr == 'string') {
				var a = {};
				a[attr] = value;
				attr = a;
			}
			this.each(function(){
				var self = this;
				H.object.each(attr, function(a, v){
					var k = a == 'class' ? 'className' : a;
					if (k in self) {
						self[k] = v;
					} else {
						self.setAttribute(k, v);
					}
				});
			});
			return this;
		},
		/**
	  	 * 设置样式 支持链式操作
	  	 * @param {String|Object} 样式名或样式集合
	  	 * @param {String} 样式值
	  	 * @return  {hapj.ui.node}
	  	 */
	  	css: function(prop, value) {
			if (typeof prop == 'string' && undefined === value) {
				if (this[0]) {
					return getStyle(this[0], prop);
				}
				return null;
			}
	  		if (typeof prop == 'string') {
	  			var p = {};
	  			p[prop] = value;
	  			prop = p;
	  		}
	  		this.each(function(){
				var self = this;
				H.object.each(prop, function(p, v) {
					self.style[p] = v;
				});
	  		});
			
			return this;
	  	},
	  	/**
	  	 * 设置或者获取元素的html
	  	 * @param {String} html html代码
	  	 * @param {Boolean} enableScript 是否支持js，默认为false
	  	 * @return  {hapj.ui.node}
	  	 */
	  	html: function(html, enableScript) {
			enableScript = !!enableScript;
	  		if (undefined === html) {
	  			if (this.length) {
	  				return this[0].innerHTML;
	  			}
	  			return null;
	  		}
	  		var isScript = false;
	  		if (H.browser.type == 'msie' && typeof html == 'string' && /^\s*<script /.test(html)) {
				isScript = true;
				html = '<div>&nbsp;</div>' + html;
			}
			var scripts = [];
  			this.each(function(){
				//清除所有节点
				while (this.firstChild) {
					this.removeChild(this.firstChild);
				}
				var elems = wrapHtml(html), self = this.tagName == 'TABLE' ? 
					(this.getElementsByTagName('tbody')[0] || this.appendChild(this.ownerDocument.createElement('tbody'))) 
					: this;	
				H.array.each(elems, function(i){
					if (isScript && i === 0) return;
					if (!enableScript) {
						self.appendChild(this);
					} else {
						if (this.nodeName == 'SCRIPT' && (!this.type || this.type.toLowerCase() == 'text/javascript')) {
							scripts.push(this);
						} else {
							if (this.nodeType == 1) {
								var ss = this.getElementsByTagName('script');
								var arr = [];
								H.array.each(ss, function(){
									arr.push(this);	
								});
								H.array.each(arr, function(){
									if (!this.type || this.type.toLowerCase() == 'text/javascript') {
										scripts.push(this.parentNode.removeChild(this));
									}
								});
							}
							self.appendChild(this);
						}
					}
				});
			});
			if (enableScript && scripts.length) {
				H.array.each(scripts, function(){
					var text = ( this.text || this.textContent || this.innerHTML || "" ).replace( /^\s*<!(?:\[CDATA\[|\-\-)/, "/*$0*/" );
					if ( text && /\S/.test( text ) ) {
						/* jshint ignore:start */
						( window.execScript || function( text ) {
							eval.call( window, text );
						} )( text );
						/* jshint ignore:end */
					}
				});
			}
	  		return this;
	  	},
		/**
		 * 追加html代码或者元素到另外一个元素下
		 * @param {String} html
		 * @return  {hapj.ui.node}
		 */
		append: function(html){
			if (html === undefined) {
				return;
			}
			var elem = null;
			if (typeof html != 'string') {
				if (H.ui.isDom(html)) {
					this.length && this[0].appendChild(html);
					return this;
				} else if ('length' in html) {
					if (this.length) {
						elem = this[0];
						H.array.each(html, function(){
							elem.appendChild(this);
						});
					}
					return this;
				}
			}
			var isScript = false;
			// ie浏览器需要做一些兼容，比如<script标签，不能直接光有script标签，否则会报错
			if (H.browser.type == 'msie' && typeof html == 'string' && /^\s*<script /.test(html)) {
				isScript = true;
				html = '<div>&nbsp;</div>' + html;
			}
			this.each(function(){
				if (typeof html == 'string') {
					var elems = wrapHtml(html), self = this;
					H.array.each(elems, function(i) {
						if (isScript && i === 0) return;
						self.appendChild(this);
					});
				} else if (html.length && html.length > 0) {
					H.array.each(html, function(){
						if (this.nodeType && this.nodeType == 1 && elem) {
							elem.appendChild(this);
						}
					});
				} else if (html.nodeType && html.nodeType == 1) {
					this.appendChild(html);
				}
			});
			return this;
		},
		/**
		 * 显示
		 * @return  {hapj.ui.node}
		 */
		show: function() {
			this.css('display', 'block');
			return this;
		},
		/**
		 * 隐藏
		 * @return  {hapj.ui.node}
		 */
		hide:function() {
			this.css('display', 'none');
			return this;
		},
		/**
		 * 增加类别
		 * @param {Object} cls 样式名
		 * @return hapj.ui.node
		 */
		addClass: function(cls) {
			this.each(function(){
				var cs = this.className ? this.className.split(' ') : [];
				if (indexOf(cs, cls) == -1) {
					cs.push(cls);
				}
				this.className = cs.join(' ');
			});
			return this;
		},
		/**
		 * 是否存在指定的类别
		 * @param {String} cls
		 * @return hapj.ui.node
		 */
		hasClass: function(cls) {
			if (!this.length) return false;
			var cs = this[0].className ? this[0].className.split(' ') : [];
			return indexOf(cs, cls) > -1;
		},
		/**
		 * 去掉某个类
		 * @param {Object} cls
		 * @return  {hapj.ui.node}
		 */
		removeClass: function(cls) {
			this.each(function(){
				var cs = this.className ? this.className.split(' ') : [],
					pos = indexOf(cs, cls);
				if (pos > -1) {
					cs.splice(pos, 1);
				}				
				this.className = cs.join(' ');
			});
			return this;
		},
		/**
		 * 获取第一个元素的高度（包括margin）
		 * @param {Boolean} [margin=undefine] 是否包括外围高度。有三种情况：
		 * <dl>
		 *  <dt>true</dt>
		 *  <dd>offsetHeight+marginTop+marginBottom</dd>
		 *  <dt>false</dt>
		 *  <dd>clientHeight</dd>
		 *  <dt>undefined</dt>
		 *  <dd>offsetHeight</dd>
		 * </dl>
		 * @return {Int}
		 */
		height:function(margin) {
			var elem = this[0];
			if (!elem) {
				return null;
			}
			if (elem === _w) {
				return margin ? elem.screen.height : elem.screen.availHeight;
			} else if( elem.nodeType == 9) {
				return margin ? body.scrollHeight : body.clientHeight;
			}
			if (margin === false) {
				return elem.clientHeight;
			}
			return margin ? elem.offsetHeight + parseFloat(getStyle(elem, 'marginTop')) + parseFloat(getStyle(elem, 'marginBottom')) : elem.offsetHeight;
		},
		/**
		 * 获取第一个元素的宽度（包括margin的宽度）
		 * @param {Boolean} [margin=undefined] 是否包括外围高度。有三种情况：
		 * <dl>
		 *  <dt>true</dt>
		 *  <dd>offsetHeight+marginTop+marginBottom</dd>
		 *  <dt>false</dt>
		 *  <dd>clientHeight</dd>
		 *  <dt>undefined</dt>
		 *  <dd>offsetHeight</dd>
		 * </dl>
		 * @return {Int}
		 */
		width: function(margin) {
			var elem = this[0];
			if (!elem) {
				return null;
			}
			if (elem === _w) {
				return margin ? elem.screen.width : elem.screen.availWidth;
			} else if (elem.nodeType == 9) {
				return margin ? body.offsetWidth : body.clientWidth;
			}
			if (margin === false) {
				return elem.clientWidth;
			}
			return margin ? elem.offsetWidth + parseFloat(getStyle(elem, 'marginLeft')) + parseFloat(getStyle(elem, 'marginRight')) : elem.offsetWidth;
		},
		/**
		 * 获取元素的左边距和上边距
		 * @return {Object} 返回值包含top和left：
		 * <dl>
		 *  <dt>top</dt>
		 *  <dd>上边距</dd>
		 *  <dt>left</dt>
		 *  <dd>左边距</dd>
		 * </dl>
		 */
		offset: function() {
			var elem = this[0];
			if (!elem) {
				return null;
			}
			if (elem.nodeType == 9 || elem === _w) {
				return {left:body.scrollLeft || _d.body.scrollLeft, top:body.scrollTop || _d.body.scrollTop};
			}
			
			if (elem.getBoundingClientRect) {
				var pos = elem.getBoundingClientRect();
				return {
					left: pos.left + (body.scrollLeft || _d.body.scrollLeft),
					top: pos.top + (body.scrollTop || _d.body.scrollTop)
				};
			}
			
			var left = elem.offsetLeft, top = elem.offsetTop, current = elem.offsetParent;
			while(current) {
				left += current.offsetLeft;
				top += current.offsetTop;
				current = current.offsetParent;
			}
			return {left:left, top: top};
		},
		/**
		 * 将表单序列化成一个对象
		 * @return {Object}
		 */
		params: function() {
			var elements = null;
			this.each(function(){
				if (this.elements) {
					elements = this.elements;
					return false;
				}
			});
			if (!elements) {
				return null;
			}
			var params = {};
			for(var i = 0, l = elements.length; i < l; i++) {
				var f = elements[i];
				if (!f.name || f.disabled || f.nodeName == 'OBJECT') continue;
				var name = f.name, multi = true;
				switch(f.type) {
					case 'select-one':
						/* jshint ignore:start */
						multi = false;
						/* jshint ignore:end */
            		case 'select-multiple':
						if (multi) {
							params[name] = [];
						}
		                for (var j = 0, m = f.options.length; j < m; j++) {
		                    var option = f.options[j], val = (undefined === option.value ? option.text : option.value);
		                    
		                    if (option.selected) {
								if (!multi) {
									params[name] = val;
									break;
								} else {
									params[name].push(val);
								}
		                    }
		                }
	                	break;
					case undefined:
		            case 'file':
		            case 'submit':
		            case 'reset':
		            case 'button':
						break;
					case 'radio':
						/* jshint ignore:start */
						multi = false;
						/* jshint ignore:end */
		            case 'checkbox':
						if (f.checked) {
							if (multi) {
								if (!(name in params)) {
									params[name] = [];
								}
								params[name].push(f.value);
							} else { 
								params[name] = f.value;
							}
						}
	                    break;
					default:
						if (name in params) {
							if (!H.array.isArray(params[name])) {
								params[name] = [params[name]];
							}
							params[name].push(f.value.replace(rCRLF, "\r\n"));
						} else {
							params[name] = f.value.replace(rCRLF, "\r\n");
						}
						break;
				}
			}
			return params;
		},
		/**
		 * 动画
		 * @param {String} type 类型
		 * @param {Int} from 开始值
		 * @param {Int} to   结束值
		 * @param {Int} total 总共进行的时间
		 * @param {Int} step 每次变化的值
		 * @return {hapj.ui.node}
		 */
		animate: function(type, from, to, total, step) {
			total = total || 500;
			step = step || 100;
		    type = 'alpha';
		    var setVal = function(v) {
				self.css({
					opacity: v/100,
					filter:'Alpha(Opacity=' + v + ')'
				});
			}, curVal = from,
			toFunc = function() {
				if ( (offset > 0 && curVal >= to) || (offset < 0 && curVal <= to)) {
					setVal(curVal);
					curVal -= offset;
					setTimeout(toFunc, timeSize);
				}
			}, timeSize = Math.ceil(total / step),
			offset = (from - to)/ step,
			self = this;
				
			toFunc();
			return this;
		},
		/**
		 * 聚焦到对象
		 * @param num 第几个字符串
		 * @returns {hapj.ui.node}
		 */
		focus: function(num){
			var elem = this[0];
			if (!elem) {
				return null;
			}
			elem.focus() ;
			var len = elem.value.length;
			if(len > 0){
				if(num && num < len) {
					len = num;
				}
				if (document.selection) {
					var sel = elem.createTextRange();
					sel.moveStart('character', len);
					sel.collapse();
					sel.select();
				} else if (typeof elem.selectionStart == 'number' && typeof elem.selectionEnd == 'number') {
					elem.selectionStart = elem.selectionEnd = len;
				}
			}
			return this;
		}
	});
}(hapj, window, document);

/** 
 * Ajax请求
 * @class hapj.ajax 
 * @description 利用XmlHttpRequest发出请求，并进行相应处理的组件。接口实现和jQuery的很类似，但是代码更轻巧，且内置对ajax请求串行化的支持。
 * @example 
 * 示例
// 队列方法1
for(var i = 0; i < 1000; i++) {
	hapj.ajax({
		url:'/foo.php?i=' + i,
		method:'post',
		queue:true,
		success:function(ret) {
			alert(ret);
		}
	});
}
// 开始处理队列请求
hapj.ajax.endQueue();

// 队列方法2
hapj.ajax.startQueue();
for(var i = 0; i < 1000; i++) {
	hapj.ajax({
		url:'/foo.php?i=' + i,
		method:'post',
		success:function(ret) {
			alert(ret);
		}
	});
}
// 开始处理队列请求
hapj.ajax.endQueue();

 **/
(function(H){
	'use strict';
	
	var getRequest = function () {
		if (typeof XMLHttpRequest !== 'undefined') {
			return new XMLHttpRequest();
		}
		try {
			return new window.ActiveXObject('Msxml2.XMLHTTP');
		} catch(ex1) {
			try {
				return new window.ActiveXObject('Microsoft.XMLHTTP');
			} catch(ex2) {
				return false;
			}
		}
	},
	defaults = {
		type:'get',
		async:true,
		dataType:'json',
		queue: false,
		timeout: 0,
		cache: true
	},
	headers = {
		'X-Requested-With': 'XMLHttpRequest'
	},
	doQueue = false,
	queue = [],
	count = 0,
	handlerNextReq = function() {
		var ajax = queue.shift();
		ajax && ajax._doSend();
	}
	;
	
	/**
	 * @constructor hapj.ajax
	 * @param {Object} options 配置参数，包括如下参数<br/>
	 * <dl>
	 * 	<dt>url</dt>
	 *  <dd>网址</dd>
	 * 	<dt>type</dt>
	 *  <dd>网络请求方法，如get、post等，默认为get。</dd>
	 * 	<dt>data</dt>
	 *  <dd>发送的数据，如果为get方法，将会串行化数据附加到url里边作为参数发送。如果为post方法，则直接将数据post到服务器。可以是字符串或对象。</dd>
	 * 	<dt>dataType</dt>
	 *  <dd>接收的数据的格式，可以是html、json等。默认为json</dd>
	 * 	<dt>success(ret)</dt>
	 *  <dd>请求成功后将调用的方法。</dd>
	 * 	<dt>error(code)</dt>
	 *  <dd>请求失败后将调用的方法。其中code为http状态码，如404等。</dd>
	 * 	<dt>queue</dt>
	 *  <dd>是否启用队列支持。默认为false。</dd>
	 * 	<dt>async</dt>
	 *  <dd>是否发出异步请求。默认为true。如果为false，则只有等到页面请求完毕后才会执行后面的代码。</dd>
	 * </dl>
	 * @returns {Object} 返回一个对象，该对象包含的内容如下：
	 *  <h4>属性</h4>
	 *  <dl>
	 * 	<dt>req</dt>
	 *  <dd>XmlHttpRequest对象</dd>
	 * 	<dt>id</dt>
	 *  <dd>在页面中ajax请求时分配的id</dd>
	 * 	<dt>options</dt>
	 *  <dd>请求的参数配置</dd>
	 *  </dl>
	 *  <h4>方法</h4>
	 *  <dl>
	 * 	<dt>stop</dt>
	 *  <dd>中断请求</dd>
	 * </dl>
	 */
	H.ajax = function(options){
		var hs = H.extend({}, headers), cfg = H.extend({}, defaults);
		H.extend(cfg, options);
		H.extend(hs, cfg.headers || {});
		cfg.headers = hs;
		if (!cfg.url) {
			throw new Error('ajax.u_urlIsRequired');
		}
		var req = getRequest(), type = cfg.type.toLowerCase(), ajax = new Ajax();
		if (type == 'get') {
			if (cfg.data) {
				var qs = '';
				if (typeof cfg.data == 'object') {
					qs = H.object.toString(cfg.data);
				} else {
					qs = cfg.data.toString();
				}
				if (qs) {
					if (cfg.url.indexOf('?') > -1) {
						cfg.url += ('&' + qs);
					} else {
						cfg.url += ('?' + qs);
					}
				}
			}
			ajax.data = null;
		} else if (type == 'post') {
			if (typeof cfg.data == 'object') {
				cfg.data = H.object.toString(cfg.data);
			} 
		}
		
		if (!cfg.cache) {
			cfg.url += (cfg.url.indexOf('?') > -1 ? '&' : '?');
			cfg.url += new Date().getTime() + Math.random().toFixed(3);
		}
		
		cfg.type = type;
		ajax.id = count;
		ajax.req = req;
		ajax.options = cfg;
		ajax.bindEvent();
		ajax.start();
		return ajax;
	};
	
	var Ajax = function() {};
	Ajax.prototype = {
		success: false,
		bindEvent: function() {
			// ie6 执行onreadystatechangte时，没有指向req
			var self = this, options = this.options, req = this.req;
			req.onreadystatechange = function() {
				if (req.readyState == 4) {
					if (queue.length) {
						handlerNextReq();
					}
					switch(req.status) {
						case 200:
							if (self.success) return;
							self.success = true;
							var code = req.responseText, pass;
							if (options.dataType == 'json') {
								try {
									/* jshint ignore:start */
									code = eval('(' + code + ')');
									/* jshint ignore:end */
								} catch(e) {
									var fs = H.hook.gets('ajax.error');
									H.each(fs, function(i, f){
										f.call(self.req, 'parse');
									});
									return;
								}
								// 设置一个json格式的钩子
								var fs = H.hook.gets('ajax.jsonParser');
								H.each(fs, function(i, f) {
									pass = f.call(req, code);
									if (pass === false) {
										options.failure && options.failure.call(req, code);
										return false;
									}
								});
							}
							
							if (pass !== false && options.success) {
								options.success.call(req, code);
							}
							break;
						default:
							if (req.status == 1223) {
								req.status = 204;
							}
							if (options.error) {
								options.error.call(req, req.status);
							}
							break;
					}
				}
			};
			// req.onload 用来解决firefox 3.x 版本里边 同步模式 的bug
			if (this.options.async === false && H.browser.type == 'mozilla') {
				req.onload = req.onreadystatechange; 
			}
		},
		start:function() {
			var req = this.req, options = this.options;
			req.open(options.type, options.url, options.async);
			
			if (options.type == 'post') {
				req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
			}
			for(var i in options.headers) {
				req.setRequestHeader(i, options.headers[i]);
			}
		
			if (options.queue || doQueue) {
				queue.push(this);
			} else {
				this._doSend();
			}
		},
		_doSend: function() {
			count++;
			this.id = count;
			
			var f = H.hook.get('ajax.beforeSend');
			if (f) {
				var ret = f.call(null, this.options);
				if (ret === false) {
					return;
				}
			}
			this.req.send(this.options.data);
			
			if (this.options.timeout > 0) {
				var self = this;
				setTimeout(function(){
					if (self.success) {
						return;
					}
					self.abort();
					if (self.options.error) {
						self.options.error.call(self.req, 'timeout');
					} else {
						var fs = H.hook.gets('ajax.error');
						H.each(fs, function(i, f){
							f.call(self.req, 'timeout');
						});
					}
				}, this.options.timeout);
			}
		},
		abort: function() {
			this.req.abort();
		}
	};
	H.object.extend(H.ajax, /**@lends hapj.ajax */{
		/**
		 * 开始将ajax请求加入到队列。
		 */
		startQueue: function() {
			doQueue = true;
		},
		/**
		 * 结束ajax请求加入到队列的操作，并开始一次执行ajax请求。
		 */
		endQueue: function() {
			doQueue = false;
			handlerNextReq();
		}
	});
	H.lib.ajax = H.ajax;
})(hapj);

// 模板
(function(H){
	'use strict';
	
	var re = /\{([\w\-]+)(?:\:([\w\.]*)(?:\((.*?)?\))?)?\}/g, 
	compileARe = /\\/g, 
	/* jshint ignore:start */
	compileBRe = /(\r\n|\n)/g,
	compileCRe = /'/g,
	/* jshint ignore:end */
	/**
	 * 将内容作为模板进行编译，返回编译后的结果
	 * @param {Object} values 用来进行编译的变量。 如果不传入任何参数，则会返回编译后的函数
	 * @return {Mixed}
	 */
	tmpl = function(content, values) {
		if (content.indexOf('{') < 0) {
			if (undefined === values) {
				return function(){
					return content;
				};
			} else {
				return content;
			}
		}
		if (undefined === values) {
			/* jshint ignore:start */
            var bodyReturn = content.replace(compileARe, '\\\\').replace(compileBRe, '\\n').replace(compileCRe, "\\'").replace(re, function (m, name, format){
                format = "(values['" + name + "'] == undefined ? '' : ";
                return "'," + format + "values['" + name + "']) ,'";
            }),
            body = "var ret = function(values){ return ['" + bodyReturn + "'].join('');};";
            eval(body);
            return ret;
            /* jshint ignore:end */
		}
		
		return content.replace(compileARe, '\\\\').replace(re, function (m, name){
            return values[name] !== undefined ? values[name] : '';
        });
	}, compile_foreach = function(content, values) {
		var pos = content.indexOf('{#foreach ');
		if (pos == -1) {
			return tmpl(content, values);
		}
		var epos,ret = '';
		while(pos > -1) {
			var sepos = content.indexOf('}', pos);
			if (sepos == -1) {
				break;
			}
			var varname = H.string.trim(content.substr(pos + 10, sepos - pos - 10));
			if (!varname || !values[varname] || typeof values[varname] != 'object') {
				break;
			}
			epos = content.indexOf('{#endforeach}', sepos);
			if (epos == -1) {
				break;
			}
			
			ret += tmpl(content.substr(0, pos), values);
			
			var fc = tmpl(content.substr(sepos + 1, epos - sepos - 1));
			for(var i = 0, l = values[varname].length; i < l; i++) {
				ret += fc(values[varname][i]);
			}
			
			content = content.substr(epos + 13);
			pos = content.indexOf('{#foreach ');
		}
		if (content) {
			ret += tmpl(content, values);
		}
		return ret;
	}, compile_if = function(content, values) {
		var pos = content.indexOf('{#if ');
		if (pos == -1) {
			return tmpl(content, values);
		}
		
		var ret = '',epos;
		while(pos > -1) {

			var sepos = content.indexOf('}', pos);
			if (sepos == -1) {
				break;
			}
			var varname = H.string.trim(content.substr(pos + 5, sepos - pos - 5));
			if (!varname) {
				break;
			}
			epos = content.indexOf('{#endif}', sepos);
			if (epos == -1) {
				break;
			}
			
			ret += tmpl(content.substr(0, pos), values);
			if(values[varname]){
				if(typeof values[varname] != 'object'){
					ret += tmpl(content.substr(sepos + 1, epos - sepos - 1),values);
				}else if(!H.object.isEmpty(values[varname])){
					ret += tmpl(content.substr(sepos + 1, epos - sepos - 1),values);
				}
			}
			content = content.substr(epos + 8);
			pos = content.indexOf('{#if ');
		}
		if (content) {
			ret += tmpl(content, values);
		}
		return ret;
	}, 
	/**
	 * 编译
	 * @method compile
	 * @memberof hapj.tmpl
	 * @param {String} content
	 * @param {Object} values
	 */
	compile = function(content, values) {
		//处理foreach循环
		var ret = compile_foreach(content,values);
		if(typeof ret != 'function'){
			ret = compile_if(ret, values);
		}
		return ret;
	},render = function(url, id, packer, callback) {
		var tmpl = null;
		if (!H.ui._id(id)) {
			url += url.indexOf('?') > -1 ? '&' : '?';
			url += '_tmpl_id=' + id;
		} else {
			tmpl = H.ui._id(id).innerHTML;
		}
		H.lib.ajax({
			url: url,
			type: 'get',
			dataType: 'json',
			success: function(ret){
				if (ret.data._tmpl) {
					tmpl = ret.data._tmpl;
					delete ret.data._tmpl;
					H.ui(document.body).append(tmpl);
				}
				if (!tmpl) {
					throw new Error('tmpl.u_tmplNotFound');
				}
				var data = (packer && packer.call(null, ret.data)) || ret.data;
				callback && callback(compile(H.ui._id(id).innerHTML, data),data);
			}
		});
	};
	
	/**
	 * 将dom节点当成模板容器渲染数据
	 * @class hapj.ui.node.tmpl
	 */
	H.ui.fn.tmpl = function(values) {
		if (!this.length) return '';
		return compile(this[0].innerHTML, values);
	};
	
	
	/**
	 * 将dom
	 * @class hapj.ui.node.render
	 */
	H.ui.fn.render = function(url, id, packer, callback) {
		var self = this;
		render(url, id, packer, function(html,data){
			self.html(html);
			callback && callback(data);
		});
		return this;
	};
	
	H.tmpl = {
		compile:compile,
		render:render
	};
})(hapj);

/**
 * hapj ui 事件
 */
!function(H, _d, undefined){
	'use strict';
	
	var _O = H.object,
	_wrapEvent = function(e){
		if (!e.target) {
			e.target = e.srcElement;
			e.preventDefault = function(){
				e.returnValue = false;
			};
			e.stopPropagation = function() {
				e.cancelBubble = true;
			};
			e.relatedTarget = e.relatedTarget || e.fromElement || e.toElement;
			
			// 设置pageX和pageY
			if ( e.pageX == null && e.clientX !=  null ) {
				var doc = document.documentElement, body = document.body;
				e.pageX = e.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft  || body && body.clientLeft || 0);
				e.pageY = e.clientY + (doc && doc.scrollTop  ||  body && body.scrollTop  || 0) - (doc && doc.clientTop  || body && body.clientTop  || 0);
			}
		}
		
		return e;
	},
	EVENT_ID_KEY = '__EVENT_ID__',
	eventId = 0,
	elemEventId = 0,
	eventQueue = {},
	onEventFunc = (function(){
		return _d.addEventListener ? function(elem, event, handler) {
			elem.addEventListener(event, handler, false);
		} : function(elem, event, handler){
			elem.attachEvent('on' + event, handler);
		};
	})(),
	unEventFunc = (function() {
		return _d.addEventListener ? function(elem, event, handler){
			elem.removeEventListener(event, handler, false);
		} : function(elem, event, handler){
			elem.detachEvent('on' + event, handler);
		};
	})(),
	specialEvents = {
		mouseenter: {
			event :'mouseover'
		},
		mouseleave: {
			event: 'mouseout'
		}
	};
	
	_O.each(specialEvents, function(k, v) {
		v.handler = function(e) {
			var rt = e.relatedTarget;
			if (rt !== this && !H.ui.contains(this, rt) ) {
				return true;
			}
			return false;
		};
	});
	
	_O.extend(H.ui, /**@lends hapj.ui */{
		/**
		 * 绑定事件
		 * @function
		 * @param {HTMLElement} elem
		 * @param {String} event
		 * @param {Function} handler
		 */
		on: (function(){
			var eh = function(elem, tag, handler, event){
				return function(e, params){
					var t = e.target;
					
					if (tag) {
						if (e.target.tagName != tag) {
							if (typeof handler != 'object' && !('default' in handler)) {
								return;
							}
						} else {
							t = e.target;
						}
					}
					if (handler[EVENT_ID_KEY][event].length > 1 && handler[EVENT_ID_KEY][event][1] in specialEvents) {
						var nEvent = specialEvents[handler[EVENT_ID_KEY][event][1]];
						if (!nEvent.handler.call(elem, e)) {
							return;
						}
					}
					
					var ret;
					if (typeof handler == 'object') {
						var c = t.className;
						if ( !(c in handler) ) {
							c = 'default';
						}
						if (c in handler) {
							ret = handler[c].call(elem, e, params);
						}
					} else {
						ret = handler.call(elem, e, params);
					}
					if (false === ret) {
						e.preventDefault();
					}
					return ret;
				}
			};
			
			return function(elem, event, handler) {
				if (!handler) {
					throw new Error('ui.u_eventHandlerIsNull');
				}
				var tag = '', params;
				if (typeof handler == 'string') {
					tag = event.toUpperCase();
					event = handler;
					handler = arguments[3];
					params = undefined === arguments[4] ? null : arguments[4]
				} else {
					params = undefined === arguments[3] ? null : arguments[3];
				}
				
				var oriEvent;
				if (elem.addEventListener && event in specialEvents) {
					oriEvent = event;
					event = specialEvents[event].event;
				}
				
				var eeid = elem[EVENT_ID_KEY];
				if (!handler[EVENT_ID_KEY]) {
					handler[EVENT_ID_KEY] = {};
					eventId++;
				} else if (!handler[EVENT_ID_KEY][event]) {
					eventId++;
				} else {
					eventId = handler[EVENT_ID_KEY][event][0];
				}
				
				if (!eeid) {
					elemEventId++;
					eeid = elemEventId;
					elem[EVENT_ID_KEY] = elemEventId;
					eventQueue[eeid] = {};
				}
				var eq = eventQueue[eeid];
				if (! (event in eq) ) {
					eq[event] = function(e) {
						e = _wrapEvent(e || window.event);
						// 禁止某些浏览器的鼠标右键点击判断失误
						if ( (event == 'click' || event == 'dblclick') && e.button && e.button == 2) {
							return;
						}
						for(var p in eq[event]) {
							if (!eq[event].hasOwnProperty(p)) {
								continue;
							}
							if (eq[event][p]) {
								var eobj = eq[event][p][EVENT_ID_KEY];
								eq[event][p].call(eobj.elem, e, eobj.params);
							}
						}
					};
					onEventFunc(elem, event, eq[event]);
				}
				var newHandler = eh(elem, tag, handler, event);
				if (oriEvent) {
					handler[EVENT_ID_KEY][event] = [eventId, oriEvent];
				} else {
					handler[EVENT_ID_KEY][event] = [eventId];
				}
				newHandler[EVENT_ID_KEY] = {
					elem: elem,
					params: params
				};
				eq[event][eventId] = newHandler;
			};
		})(),
		/**
		 * 取消绑定事件
		 * @method
		 * @param {HtmlElement} elem
		 * @param {String} event
		 * @param {Function} handler
		 */
		un: (function(){
			return function(elem, event, handler) {
				var eeid = elem[EVENT_ID_KEY];
				if (!eeid || !(eeid in eventQueue) || !(event in eventQueue[eeid])) {
					return;
				}
				
				if (elem.addEventListener && event in specialEvents) {
					event = specialEvents[event].event;
				}
				
				var handlers = eventQueue[eeid][event],eventId = handler[EVENT_ID_KEY][event][0];
				delete eventQueue[eeid][event][eventId];
				
				var i = 0;
				_O.each(handlers, function(){
					i++;
				});
				if (i === 0) {
					unEventFunc(elem, event, handlers);
					delete eventQueue[eeid][event];
					handlers = undefined;
				}
			};
		})(),
		/**
		 * 引发对象的指定事件
		 * @method
		 * @param {HTMLElement} elem
		 * @param {String} event 事件名称
		 */
		fire: (_d.createEvent ? function(elem, event) {
			var evt = _d.createEvent('HTMLEvents');
			evt.initEvent(event, true, true);
			elem.dispatchEvent(evt);
		} : function(elem, event) {
			elem.fireEvent('on' + event);
		})
	});
	
	_O.extend(H.ui.fn, /**@lends hapj.ui.node */{
		/**
		 * 绑定事件
		 * @param {String} event
		 * @param {Function} handler
		 */
		on: function(event, handler) {
			var tag = '';
			if (typeof handler == 'string') {
				tag = event;
				event = handler;
				handler = arguments[2];
			}
			this.each(function(i, v){
				tag ? H.ui.on.call(v, v, tag, event, handler, i) : H.ui.on.call(v, v, event, handler, i);
			});
			return this;
		},
		/**
		 * 绑定当鼠标经过元素或者离开元素时引起的事件。注意，这里绑定的时间是mouseenter和mouseleave事件，而不是mouseover和mouseout事件。
		 * @param {Function} hover 鼠标经过时的事件
		 * @param {Function} out 鼠标离开时的事件
		 * @returns hapj.ui.node
		 */
		hover: function(hover, out) {
			if (typeof hover == 'function') {
				this.on('mouseenter', hover);
			}
			if (typeof out == 'function') {
				this.on('mouseleave', out);
			}
			return this;
		},
		/**
		 * 取消对事件的绑定
		 * @param {String} event 事件名称，不要用on开头，小写
		 * @param {Function} handler 处理事件的函数
		 */
		un: function(event, handler) {
			this.each(function(){
				H.ui.un.call(this, this, event, handler);
			});
			return this;
		},
		/**
		 * 引起某个事件
		 * @param {String} event
		 */
		fire: function(event) {
			this.each(function() {
				H.ui.fire.call(this, this, event);
			});
			return this;
		}
	});
}(hapj, document);

// hapj com 模块
!function(H){
	'use strict';
	
	var conf = null,modules = {};
	/**
	 * 获取一个com模块
	 * @method hapj.com
	 * @memberof hapj
	 * @param string moduleName
	 * @param array options 可选，如果填写，则会覆盖在配置文件中的内容
	 */
	H.com = function(moduleName, options){
		if (conf == null) {
			conf = H.conf.get('hapj.com');
		}
		if (moduleName in modules) {
			if (undefined !== options) {
				var _cfg = H.object.extend({}, conf[moduleName]);
				H.object.extend(_cfg, options);
				modules[moduleName].init.call(null, _cfg);
			}
			return modules[moduleName];
		}
		if (!conf[moduleName]) {
			throw new Error('com.u_moduleNotDefined moduleName=' + moduleName);
		}
		if (!conf[moduleName]._link) {
			throw new Error('com.u_linkModuleNotDefined');
		}
		// 通过_link找到对应的对象
		var link = conf[moduleName]._link, arr = link.split('.'), ns = arr.shift(), l = window;
		if (ns == '_hapj') {
			l = H.get(arr.join('.'));
			if (!l) {
				throw new Error('com.u_linkModuleNotFound moduleName=' + moduleName);
			}
		} else {
			while(ns) {
				if (!(ns in l)) {
					throw new Error('com.u_linkModuleNotFound moduleName=' + moduleName);
				}
				l = l[ns];
				ns = arr.shift();
			}
		}
		if (!l.init) {
			throw new Error('com.u_initMethodNotDefined moduleName='.moduleName);
		}
		var cfg = conf[moduleName];
		delete cfg._link;
		if (undefined !== options) {
			H.extend(cfg, options);
		}
		l.init.call(null, cfg);
		modules[moduleName] = l;
		return l;
	};
}(hapj);

// 注意，最后需要调用hapj.start()方法启动所有函数的初始化。
// 取消 hapj.hook.set('dom.ready')的做法
//hapj.start();