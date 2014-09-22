/** 
 * Copyright (c) 2014, Jiehun.com.cn Inc. All Rights Reserved
 * @author ronnie<dengxiaolong@jiehun.com.cn>
 * @date 2014-09-12
 * @version 2.0 
 * @class hapj
 * @description hapj 主类
 */
!function(){
	"use strict";
	
	if ('hapj' in window) {
		window.__hapj = window.hapj;
	}
	window.hapj = {
		lib:{}
	};
}();
var hapj = window.hapj;

!function(H){
	"use strict";
	/**
	 * @class hapj.image
	 * @name hapj.image
	 * @memberof hapj
	 * @description 图片
	 */
	H.image = {
		/**
		 * 加载图片
		 * @function
		 * @memberof hapj.image
		 * @param {string} url 图片地址
		 * @param {function} [onsuccess=null] 加载成功后调用
		 * @param {function} [onerror=null] 当加载失败后调用
		 */
		load:function(url, onsuccess, onerror) {
			var img = new Image();
			if (typeof onerror == 'function') {
				img.onerror = onerror;
			}
			img.src = url;
			// 如果图片已经缓存，则直接调用成功的函数
			if (img.complete) {
				if(!!onsuccess) {
					return onsuccess.call(img);
				}
				return;
			}
			// 没有缓存的图片会调用onload事件
			img.onload = function() {
				if (!!onsuccess) {
					onsuccess.call(this);
				}
				img.onload = null;
				if (img.onerror) {
					img.onerror = null;
				}
			};
		}
	};
}(hapj);

!function(H, undefined){
	"use strict";
	
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
					H.each(v, function(i) {
						ret.push(key + '=' + _e(v[i]));
					});
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
			return eval('(' + from + ')');
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
	"use strict";
	
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
	 * 
	 */
	H.date = {
		/**
		 * 格式化日期
		 * @param string format 
		 * Y 年份
		 * m 月份
		 * d 日期
		 * H 时钟
		 * i 分钟
		 * s 秒钟
		 * @param Date date 必须是日期，不提供则使用当前时间
		 * @return string
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
	
	H.isArray = H.array.isArray;
	H.extend = H.object.extend;
	H.trim = H.string.trim;
	
	H.each = function(obj, func, me) {
		if (!obj) return;
		if ('length' in obj) {
			return H.array.each(obj, func, me);
		} else {
			return H.object.each(obj, func, me);
		}
	};
	
	var ps = null,cs = null;
	H.page = {
		/**
		 * 获取页面url参数
		 * @param {String} key
		 */
		getParam: function(key) {
			if (!ps) {
				ps = H.page.getParams();
			} 
			return ps[key];
		},
		/**
		 * 获取所有网页参数
		 */
		getParams:function(){
			return ps ? ps : (ps = H.lib.serial.getPair(location.search ? location.search.substr(1) : ''));
		},
		/**
		 * 设置cookie值
		 * @param {String} key
		 * @param {String} value
		 * @param {Date | Number} expire
		 * @param {String} path
		 * @param {String} domain
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
		 * @param {String} key
		 */
		getCookie: function(key) {
			if (!cs) {
				cs = H.page.getCookies();
			}
			return cs[key];
		},
		getCookies: function() {
			return cs ? cs : (cs = H.lib.serial.getCookie(document.cookie));
		}
	};
}(hapj);


!function(H){
	"use strict";
	
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

// hapjId
!function(H){
	"use strict";
	
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

!function(H){
	"use strict";
	/**
	 * @class hapj.ui
	 * @memberof hapj
	 * @description 页面元素
	 */
	H.ui = {
		
	};
}(hapj);

!function(H){
	"use strict";
	
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

//基本错误处理逻辑
!function(H){
	"use strict";
	
	var _we = window.onerror;
	onerror = function(msg, url, line) {
		if (line == 0) return;
		if (_we) {
			_we.call(null, msg, url, line);
		}
		var fs = H.hook.gets('hapj.error');
		H.object.each(fs, function(){
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
 */
!function(H, _d){
	var _img = null,
	log = null,
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
	H.log = {
		DEVELOP_MODE:1, // 开发模式
		ONLINE_MODE: 2, // 在线模式
		mode: this.DEVELOP_MODE,
		url : '',
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
		H.object.extend(H.log, {
			debug: function(msg){
				if (this.mode != this.ONLINE_MODE) {
					console.log.apply(console, arguments);
				}
			},
			warn: function(msg) {
				if (this.mode != this.ONLINE_MODE) {
					console.warn.apply(console, arguments);
				}
			},
			error: function(msg) {
				if (this.url) {
					this.server(toString(msg));
				}
				if (this.mode != this.ONLINE_MODE) {
					console.error.apply(console, arguments);
					alert(toString(msg, false));
				}
			}
		});
	} else {
		var log,getElem = function(){
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
		H.object.extend(H.log, {
			debug: function(msg) {
				if (this.mode != this.ONLINE_MODE) {
					showMsg(toString(msg), 'DEBUG');
				}
			},
			warn: function(msg) {
				if (this.mode != this.ONLINE_MODE) {
					showMsg(toString(msg), 'WARN');
				}
			},
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
					alert(m);
				}
			}
		});
	}
}(hapj, document);

// hapj conf 配置
(function(undefined){
	var option = {};
	hapj.conf = {
		// 设置选项，如果有，则会覆盖
		set:function(key, value) {
			if (undefined === value && typeof key == 'object') {
				hapj.object.each(key, function(k, v){
					option[k] = v;
				})
			} else {
				option[key] = value;
			}
		},
		// 获取选项
		get:function(key, def) {
			if (hapj.object.has(option, key)) {
				return option[key];
			}
			if (undefined === def) {
				def = null;
			}
			return def;
		},
		/**
		 * 更新配置项中的值（慎用）
		 * @param {Object} key
		 * @param {Object} prefix
		 * @param {Object} value
		 */
		update: function(key, prefix, value) {
			if (!key in option) {
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
				eval(exp);
			}
		},
		// 删除指定选项
		remove:function(key) {
			if (hapj.object.has(option, key)) {
				delete option[key];
			}
		},
		// 获取所有
		all:function() {
			return option;
		}
	};
})();
