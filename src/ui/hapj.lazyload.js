/** 
 * Copyright (c) 2014, Jiehun.com.cn Inc. All Rights Reserved
 * @author dengxiaolong@jiehun.com.cn
 * @date 2014-09-24
 * @version 1.0 
 * @brief 使元素里边的图片延迟加载
 **/
!function($){
	'use strict';
	
	var defaults = {
		lazyTag:'hll',
		onComplete:null,
		minLoadOffset:30,// 开始加载图片的最小时间间隔
		minExecTime:300 // 每次执行载入图片的最小间隔
	},
	_d = $(document), 
	_w = $(window),
	_h = _w.height(),
	_docTopRange = _h/4,
	_docBottomRange = _h*3/4,
	getDocPos = function(options) {
		// 顶部和底部都增加200px
		return {
			left: _d.scrollLeft(),
			top: _d.scrollTop() - options.docTopRange,
			width: _w.width(),
			height: _w.height() + options.docBottomRange
		};
	}, docPos = null,
	/**
	 * 加载图片
	 * @param {string} url 图片地址
	 * @param {function} [onsuccess=null] 加载成功后调用
	 * @param {function} [onerror=null] 当加载失败后调用
	 */
	loadImage = function(url, onsuccess, onerror) {
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
	;
	/**
	 * @class jQuery.fn.lazyload
	 * @description 使元素内的图片元素能延迟加载
	 * @author ronnie<dengxiaolong@jiehun.com.cn>
	 * @version 2.0
	 * @param {Object} options 参数，具体如下：
	 * <dl>
	 *  <dt>lazyTag</dt>
	 *  <dd>延迟加载的标识属性，默认为hll</dd>
	 *  <dt>onComplete:<em>Function</em></dt>
	 *  <dd>当元素内所有图片加载完成时调用的方法</dd>
	 *  <dt>minLoadOffset</dt>
	 *  <dd>开始加载图片的最小时间间隔，单位：ms，默认为30</dd>
	 *  <dt>minExecTime</dt>
	 *  <dd>每次执行载入图片的最小间隔，单位：ms，默认为300</dd>
	 *  <dt>docTopRange</dt>
	 *  <dd>文档顶部距离，单位：px，默认为当前窗口高度的1/4</dd>
	 *  <dt>docBottomRange</dt>
	 *  <dd>文档顶部距离，单位：px，默认为当前浏览器窗口高度的3/4</dd>
	 *  <dt>loadSrc</dt>
	 *  <dd>等待时替换的图片</dd>
	 * </dl>
	 * @example 
详见<a href="../examples/lazyload.html" target="_blank">实例</a>
$(document).lazyload({});
	 */
	$.fn.lazyload = function(options) {
		var cfg = {}, imgs = this.find('img');
		$.extend(cfg, defaults);
		
		if (!('docTopRange' in cfg)) {
			cfg.docTopRange = _docTopRange;
		}
		if (!('docBottomRange' in cfg)) {
			cfg.docBottomRange = _docBottomRange;
		}
		if (!imgs.length) {
			return;
		}
		$.extend(cfg, options);
		
		var queue = new LLQueue(cfg);
		
		imgs.each(function() {
			var img = $(this);
			if (img.attr('src') || !img.attr(cfg.lazyTag)) {
				return;
			}
			
			var ll = new Lazyload(this, cfg.lazyTag);
			queue.push(ll);
			if (cfg.loadSrc) {
				ll.setLoading(cfg.loadSrc);
			}
		});
		
		queue.init();
	};
	
	var LLQueue = function(options) {
		this.options = options;
		this.queue = {};
		this.lockCount = this.loadCount = this.length = 0;
		this.locked = false;
		
		// 正在加载的数量，用来保护加载数量不能过多
		this.lastLoadTime = new Date().getTime();
	};
	LLQueue.prototype = {
		loadsInterval:null,
		init: function() {
			var self = this, nextTime = new Date().getTime() + this.options.minExecTime;
			this.loadsFunc = function() {
				var now = new Date().getTime();
				if (now > nextTime) {
					nextTime = new Date().getTime() +  self.options.minExecTime;
				}
			};
			
			$(function() {
				$(window).on('scroll', self.loadsFunc);
				// 用来防止firefox之外的浏览器一加载页面就下载第一屏的图片。
				setTimeout(function() {
					self.loadsFunc();
					$(window).on('resize', self.loadsFunc);
				}, 100);
				
				// 控制加载图片函数执行的次数
				self.loadsInterval = setInterval(function(){
					if (nextTime && nextTime <= new Date().getTime()) {
						self.loads();
						if (nextTime <= new Date().getTime()) {
							nextTime = 0;
						}
					}
				}, 200);
			});
		},
		push: function(ll) {
			this[this.length] = ll;
			ll.index = this.length;
			
			// 获取图片父容器的大小
			var i = $(ll.img), w = i.width(), h = i.height();
			if (!w || !h) {
				var p = i.parent();
				if (!p[0] || p[0].nodeType == 9) {
					w = h = 0;
				} else {
					docPos = getDocPos(this.options);
					w = Math.min(p.width(), docPos.width);
					h = Math.min(p.height(), docPos.height);
				}
			}
			ll.size(w, h);
			this.length ++;
		},
		onLoadComplete: function(ll) {
			this.loadCount++;
			delete this[ll.index];
			
			if (this.options.onLoad) {
				this.options.onLoad.call(ll, ll.index, this.loadCount, this.length);
			}
			
			if (this.loadCount >= this.length) {
				if (this.options.onComplete) {
					this.options.onComplete.call(this, this.length);
				}
				$(window).unbind('scroll', this.loadsFunc).unbind('resize', this.loadsFunc);
				window.clearInterval(this.loadsInterval);
			}
		},
		// 上一次距离顶部的距离
		_lastTop: 0,
		/**
		 * 载入所有图片
		 */
		loads: function() {
			var self = this, start,end,step,func;
			docPos = getDocPos(this.options);
			if (this._lastTop <= docPos.top) {//是否为向下的方向
				start = 0;
				end = this.length - 1;
				step = 1;
				func = Math.max;
			} else {
				start = this.length - 1;
				end = 0;
				step = -1;
				func = Math.min;
			}
			this._lastTop = docPos.top;
			var loadFunc = function(ll) {
				self.onLoadComplete(ll);
			};
			for(var i = start; func.call(null, i, end) == end;i = i + step ) {
				var v = this[i];
				if (v &&  v.needLoad()) {
					// 每次图片加载间隔不能低于30ms，防止一个区域的小图片过多引起加载阻塞
					var now = new Date().getTime(),offset = self.lastLoadTime + self.options.minLoadOffset - now;
					if (offset > 0) {
						v.load(loadFunc, offset);
						
						self.lastLoadTime += self.options.minLoadOffset;
					} else {
						self.lastLoadTime = now;
						v.load(loadFunc);
					}
				}
			}
		}
	};
	
	
	function Lazyload(img, lazyTag) {
		this.img = img;
		this.src = img.getAttribute(lazyTag);
		this.lock = false;
		this.lazyTag = lazyTag;
		
		$(this.img).click(function(){
			if (this.src || !this.getAttribute(lazyTag)) {
				return;
			}
			this.src = this.getAttribute(lazyTag);
			this.removeAttribute(lazyTag);
		});
	}
	
	
	Lazyload.prototype = {
		size: function(w, h) {
			this.width = w;
			this.height = h;
		},
		/**
		 * 检测是否需要载入
		 */
		needLoad: function() {
			if (this.img.src || !this.img.getAttribute(this.lazyTag)) {
				return false;
			}
			var io = $(this.img).offset();
			if (!io.width || !io.height) {
				io = $(this.img.parentNode).offset();
			}
			if (io.left + this.width < docPos.left || io.top + this.height < docPos.top || io.left > docPos.left + docPos.width || io.top > docPos.top + docPos.height) {
				return false;
			}
			return true;
		},
		load:function(callback, offset) {
			if (this.lock) {
				return;
			}
			this.lock = true;
			offset = offset || 0;
			var self = this;
			if (offset > 0) {
				setTimeout(function(){
					// 检查当前是否要载入
					if (self.needLoad()) {
						loadImage(self.src, function(){
							self.onLoad(this.src, callback);
						}, function() {
							self.onLoad('', callback);
						});
					}
				}, offset);
			} else {
				loadImage(this.src, function(){
					self.onLoad(this.src, callback);
				}, function() {
					self.onLoad('', callback);
				});
			}
		},
		setLoading:function(src) {
			this.oldBgStyle = this.img.style.background;
			if (this.oldBgStyle && this.oldBgStyle.indexOf(src) > -1) {
				this.oldBgStyle = null;
			} else {
				this.img.style.background = 'url(' + src + ') #fCfCfC no-repeat center center';
			}
		},
		unsetLoading:function() {
			if (this.oldBgStyle !== null) {
				this.img.style.background = this.oldBgStyle;
			}
		},
		onLoad: function(src, callback) {
			if (src) {
				this.img.src = src;
			}
			this.img.removeAttribute(this.lazyTag);
			this.unsetLoading();
			if (callback) {
				callback.call(null, this);
			}
			this.lock = false;
		}
	};
}(jQuery);