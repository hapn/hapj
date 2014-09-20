!function($){
	var lazyTag = 'hll',
	defaults = {
		onComplete:null,
		minLoadOffset:30,// 开始加载图片的最小时间间隔
		minExecTime:300, // 每次执行载入图片的最小间隔
		docTopRange:200, // 文档顶部距离
		docBottomRange:800 // 文档底部距离
	},
	_docTopRange = H.browser.mobile ? 20 : 200,
	_docBottomRange = H.browser.mobile ? 80 : 800,
	_d = H.ui.elem(document), 
	getDocPos = function() {
		var offset = _d.offset();
		// 顶部和底部都增加200px
		return {
			left: offset.left,
			top: offset.top - _docTopRange,
			width: _d.width(),
			height: _d.height() + _docBottomRange
		};
	}, docPos
	;
	$.fn.lazyload = function(options) {
		var cfg = {}, imgs = this.find('img');
		$.extend(cfg, defaults);
		if (!imgs.length) {
			return;
		}
		$.extend(cfg, options);
		
		var queue = new LLQueue(cfg);
		
		imgs.each(function() {
			if ($(this).attr('src') || !this.getAttribute(lazyTag)) return;
			
			var ll = new Lazyload(this);
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
	}
	LLQueue.prototype = {
		loadsInterval:null,
		init: function() {
			var self = this, nextTime = new Date().getTime() + this.options.minExecTime;
			this.loadsFunc = function() {
				var now = new Date().getTime();
				if (now > nextTime) {
					nextTime = new Date().getTime() +  self.options.minExecTime;
				}
			}
			
			H(function() {
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
					docPos = getDocPos();
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
			docPos = getDocPos();
			
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
			for(var i = start; func.call(null, i, end) == end;i = i + step ) {
				v = this[i];
				if (v &&  v.needLoad()) {
					// 每次图片加载间隔不能低于30ms，防止一个区域的小图片过多引起加载阻塞
					var now = new Date().getTime(),offset = self.lastLoadTime + self.options.minLoadOffset - now;
					if (offset > 0) {
						v.load(function(ll){
							self.onLoadComplete(ll);
						}, offset);
						
						self.lastLoadTime += self.options.minLoadOffset;
					} else {
						self.lastLoadTime = now;
						v.load(function(ll){
							self.onLoadComplete(ll);
						});
					}
				}
			}
		}
	};
	
	
	
	function Lazyload(img) {
		this.img = img;
		this.src = img.getAttribute(lazyTag);
		this.lock = false;
	};
	
	
	Lazyload.prototype = {
		size: function(w, h) {
			this.width = w;
			this.height = h;
		},
		/**
		 * 检测是否需要载入
		 */
		needLoad: function() {
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
			var img = this.img, self = this;
			if (offset > 0) {
				setTimeout(function(){
					// 检查当前是否要载入
					if (self.needLoad()) {
						H.load(self.src, function(){
							self.onLoad(this.src, callback);
						}, function() {
							self.onLoad('', callback);
						});
					}
				}, offset);
			} else {
				H.load(this.src, function(){
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
		unsetLoading:function(src) {
			if (this.oldBgStyle !== null) {
				this.img.style.background = this.oldBgStyle;
			}
		},
		onLoad: function(src, callback) {
			if (src) {
				this.img.src = src;
			}
			this.img.removeAttribute(lazyTag);
			this.unsetLoading();
			if (callback) {
				callback.call(null, this);
			}
			this.lock = false;
		}
	};
}(jQuery);