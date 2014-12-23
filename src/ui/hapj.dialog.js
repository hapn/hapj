/** 
 * Copyright (c) 2014, Jiehun.com.cn Inc. All Rights Reserved
 * @author dengxiaolong@jiehun.com.cn
 * @date 2014-12-22
 * @version 2.0 
 * @namespace jQuery.dialog
 * @description 日历控件 
 */
!(function($, H, me, undefined){
	"use strict";
	
	var dlg,
		inited = false,
		_cb,
		_mask,
		_maskClick=false,
		_sized = false,
		_d = $(document),
		_dlg, 
		isIE6 = H.browser.type == 'msie' && H.browser.version < 7,
		_close = function() {
			hide(true);
			return false;
		},
		_enableEnter = false,
		_lastFocus = null;
		
	function init(){
		if (document.activeElement !== document.body) {
			_lastFocus = document.activeElement;
			_lastFocus.blur();
		}
		
		if (inited) {
			setTitle('');
			hideAllBtns();
			return;
		}
		inited = true;
		_dlg = $('<div class="alert alert-warning alert-dismissible"></div>');
		dlg = _dlg[0];
		_dlg.css({
			display:'none',
			position: 'absolute',
			'z-index': 10000
		}).html('<div class="hd"><p class="title"></p><a class="close" title="关闭"></a></div><div class="content"></div><div class="text-center"><input type="button" class="btn btn-confirm" value="确定"/><input type="button" value="取消" class="btn btn-danger"/></div>')
		.appendTo(document.body);
		
		$.each(_dlg[0].childNodes[2].childNodes, function(){
			this.onclick = _close;
		});
		_dlg[0].childNodes[0].childNodes[1].onclick = _close;
		
		
		// 全局快捷键
		_d.bind('keydown', function (event) {
			var target = event.target,
				nodeName = target.nodeName,
				rinput = /^INPUT|TEXTAREA$/,
				keyCode = event.keyCode;
		
			if ( rinput.test(nodeName) ) return;
			if (keyCode === 27) {
				_dlg.hide();
				undefined !== _mask && $(_mask).hide();
			} else if (keyCode == 13 && _enableEnter) {
				_close();
				_enableEnter = false;
			}
		});
		
	}
	
	function getContentNode(name, attr) {
		attr = attr || {};
		$.extend(attr, {'class': 'bd'});
		var node;
		switch (name) {
			case 'DIV':
				node = $('<div></div>').attr(attr);
				break;
			case 'IFRAME':
				var a = {
					frameBorder:'no',
					scrolling:'auto',
					marginwidth:'0',
					marginheight:'0'
				};
				$.extend(a, attr);
				node = $('<iframe></iframe>').attr(a);
				break;
			case 'FORM':
				node = $('<form method="post"></form');
				break;
		}
		return node;
	}
	
	function setTitle(title) {
		dlg.childNodes[0].childNodes[0].innerHTML = title;
	}
	
	function setContent(content) {
		$(dlg.childNodes[1]).html(content);
	}
	
	function changeDlgNodeName(name) {
		name = name || 'div';
		name = name.toUpperCase();		
		if (dlg.childNodes[1].tagName != name) {
			if( dlg.childNodes[1].tagName == 'div'){
				dlg.replaceChild(getContentNode(name, {'class':'bd'}), dlg.childNodes[1]);
			}else{
				dlg.replaceChild(getContentNode(name), dlg.childNodes[1]);
			}
		}
	}
	
	function enableOkBtn(){
		dlg.childNodes[2].style.display = '';
		dlg.childNodes[2].childNodes[0].style.display = '';
	}
	
	
	function hideAllBtns(){
		dlg.childNodes[2].style.display = 'none';
		$.each(dlg.childNodes[2].getElementsByTagName('input'), function() {
			this.style.display = 'none';
		});
	}
	
	function show() {
		dlg.style.display = 'block';
		if (!_sized) {
			dlg.childNodes[1].style.height = 'auto';
			
			// 调整高度
			var height = 0;
			$.each(dlg.childNodes, function() {
				height += $(this).outerHeight();
			});
			dlg.style.height = height + 'px';
		} else {
			_sized = false;
		}
		
		move();
		window.onresize = function(){
			move();
		}
	}
	
	function staymiddle(){
		// 总是显示在屏幕正中央		
		$(window).bind('resize', function(){
			//move();
		});
		$(window).bind('scroll',function(){
			//move();
		});
	}
	
	function move() {
		// 显示到屏幕正中央
		_dlg.css({
			left: _d.scrollLeft() + (_d.width() - _dlg.outerWidth())/2,
			top: _d.scrollTop() + (_d.height() - _dlg.outerHeight())/2
		});
	}
	
	function resizeBody() {
		dlg.childNodes[1].style.width = '100%';
		dlg.childNodes[1].style.height = ($(dlg).height() - $(dlg.childNodes[0]).height() - $(dlg.childNodes[2]).height()) + 'px';
	}
	
	function hide(hideMask) {
		if (dlg) {
			dlg.style.display = 'none';
			
			if (typeof _cb == 'function') {
				_cb.call();
			}
		}
		if (hideMask && _mask && _mask.style.display != 'none') {
			_mask.style.display = 'none';
			
			// 显示select控件
			if (isIE6) {
				$('select').each(function(){
					if (!this.getAttribute('ignoreHidden')) {
						this.style.visibility = 'visible';
					}
				});
			}
		}
		if (_lastFocus != null) {
			setTimeout(function(){
				_lastFocus.focus();
				_lastFocus = null;
			}, 0);
		}
		return false;
	}
	
	function registCallback(callback) {
		if (undefined === callback) {
			_cb = null;
		}
		switch(typeof callback) {
			case 'string':
				_cb = function(){
					window.location = callback;
					_cb = null;
				};
				break;
			case 'function':				
				_cb = function(){
					callback.call();
					_cb = null;
				}
				break;
		}
	}

	// 拖拽事件
	var _dragEvent, _drag,
		_window = $(window),
		_document = $(document);

	var DragEvent = function () {
		var that = this,
			proxy = function (name) {
				var fn = that[name];
				that[name] = function () {
					return fn.apply(that, arguments);
				};
			};
		proxy('start');
		proxy('move');
		proxy('end');
	};
	
	DragEvent.prototype = {
		// 开始拖拽
		start: function (event) {
			_document
			.bind('mousemove', this.move)
			.bind('mouseup', this.end);
			this._sClientX = event.clientX;
			this._sClientY = event.clientY;
			this.onstart(event.clientX, event.clientY);
			return false;
		},
		// 正在拖拽
		move: function (event) {		
			this._mClientX = event.clientX;
			this._mClientY = event.clientY;
			this.onmove(
				event.clientX - this._sClientX,
				event.clientY - this._sClientY
			);
			return false;
		},
		// 结束拖拽
		end: function () {
			_document
			.un('mousemove', this.move)
			.un('mouseup', this.end);
			return false;
		}
		
	};
	_drag = function (event) {
		var limit, startLeft, startTop,
			wrap = $(event.target),
			offset = wrap.offset();
		// 对话框准备拖动
		_dragEvent.onstart = function () {
			startLeft = offset.left;
			startTop = offset.top;
		};
		
		// 对话框拖动进行中
		_dragEvent.onmove = function (x, y) {
			var style = dlg.style,
				left = Math.max(limit.minX, Math.min(limit.maxX, x + startLeft)),
				top = Math.max(limit.minY, Math.min(limit.maxY, y + startTop));

			style.left = left  + 'px';
			style.top = top + 'px';
		};
		
		limit = (function () {
			var maxX, maxY,
				ow = wrap.parent().width(),
				oh = wrap.parent().height(),
				ww = _window.width(),
				wh = _window.height(),
				dl = _document.offset().left,
				dt = _document.offset().top;
			// 坐标最大值限制
			maxX = ww - ow + dl;
			maxY = wh - oh + dt;
			return {
				minX: dl,
				minY: dt,
				maxX: maxX,
				maxY: maxY
			};
		})();
		_dragEvent.start(event);
	};
	
	me = {
		/**
		 * 设置标题
		 * @param {Object} title
		 */
		title:function(title){
			if (!dlg) {
				return;
			}
			setTitle(title);
			return me;
		},
		/**
		 * 设置主体内容
		 * @param {Object} ctx
		 * @param {Function} callback
		 */
		content: function(ctx, callback) {
			init(false);
			changeDlgNodeName('div');
			setContent(ctx);
			resizeBody();
			show();
			
			registCallback(callback);
			$.dialog.callback();
			return me;
		},
		/**
		 * 设置对话框的大小
		 * @param {Object} w
		 * @param {Object} h
		 */
		size: function(w, h) {
			_sized = true;
			init();
			dlg.childNodes[0].style.width = dlg.childNodes[2].style.width = w + 'px';
			dlg.childNodes[1].style.width = parseInt(w, 10) + 'px';
			dlg.childNodes[0].childNodes[0].style.width = parseInt(w-40, 10)+'px';
			dlg.style.height = h + 'px';
			dlg.style.width = w + 'px';
			move();
			return me;
		},
		/**
		 * 显示OK对话框
		 * @param {Object} msg
		 * @param {Object} callback
		 */
		ok:function(msg, callback, resize){
			_enableEnter = true;
			init();
			if (undefined === resize || resize) {
				me.size(250, 125);
			}
			changeDlgNodeName('div');
			setContent('<span class="ok">' + msg + '</span>');
			enableOkBtn();
			show();
			
			registCallback(callback);
			me.mask();
			me.middle();
			me.title('提示');
			return me;
		},
		/**
		 * 隐藏对话框
		 * @param {Boolean} hideMask 是否隐藏mask
		 */
		hide: function(hideMask) {
			if (undefined === hideMask) {
				hideMask = true;
			}
			hide(hideMask);
			return me;
		},
		/**
		 * 显示错误对话框
		 * @param {Object} msg
		 * @param {Object} callback
		 */
		error:function(msg, callback, resize){
			_enableEnter = true;
			init();
			if (undefined === resize || resize) {
				me.size(250, 135);
			}
			changeDlgNodeName('div');
			setContent('<span class="err">' + msg + '</span>');
			enableOkBtn();
			show();
			
			registCallback(callback);
			me.mask();
			me.middle();
			me.title('提示');
			return me;
		},
		/**
		 * 显示框架对话框
		 * @param {Object} url
		 */
		iframe: function(url) {
			url = url ? url : '';
			if (!url) {
				H.log.error('hapj.lib.dialog url is not supplied');
			}
			init(); 
			changeDlgNodeName('iframe');
			show();
			resizeBody();
			dlg.childNodes[1].setAttribute('src', url);
			$.dialog.callback();
			me.mask();			
			return me;
		},
		/**
		 * 通过ajax获取一个页面，然后将内容填充到内容区
		 * @param {String} url
		 * @param {Function} onSuccess
		 * @param {Function} onClose
		 */
		ajax: function(url, onSuccess, onClose) {
			init();
			changeDlgNodeName('div');
			show();
			resizeBody();
			H.ajax({
				url: url,
				type: 'get',
				dataType: 'html',
				success: function(html) {
					setContent(html);
					onSuccess && onSuccess();
				}
			});
			if (onClose) {
				registCallback(onClose);
			}
			$.dialog.mask();
			$.dialog.callback();
			return me;
		},
		mask: function(isclick) {
			if (!_mask) {
				_mask = $('<div></div>')[0];
				var css = {
					position:'fixed',
					left:0,
					top:0,
					zIndex:9995,
					width:'100%',
					height:'100%',
					backgroundColor: '#999',
					opacity: 0.3,
					filter: 'Alpha(Opacity=30)'
				};
				if (isIE6) {
					$.extend(css, {
						position:'absolute',
						height: $(document).outerHeight()
					});
					$('select').each(function(){
						if (this.style.visibility == 'hidden' || this.style.display == 'none') {
							this.setAttribute('ignoreHidden', 1);
						}
					});
				}
				$(_mask).css(css).bind('click', function(e) {
					if(isclick){
						_maskClick = true;
						_close();
					}
					e.stopPropagation();
					return false;
				});
				if(isclick){
					// 需要绑定点击隐藏dialog事件
					$(_mask).bind('click', _close);
					_maskClick = true;
				}
				document.body.appendChild(_mask);
			}
			// 隐藏select控件
			if (isIE6) {
				$('select').each(function(){
					if (!this.getAttribute('ignoreHidden')) {
						this.style.visibility = 'hidden';
					}
				});
			}
			// 需要绑定点击隐藏dialog事件但是未绑定，则绑定
			if(isclick && _maskClick === false){
				$(_mask).bind('click', _close);
				_maskClick=true;
			}
			// 不需要绑定点击隐藏dialog事件，但已经绑定了，则解除绑定
			if(isclick === undefined && _maskClick === true){
				$(_mask).unbind('click', _close);
				_maskClick=false;
			}
			_mask.style.display = 'block';
			return me;
		},
		drag: function(){
			dlg.childNodes[0].childNodes[0].style.cursor = 'move';
			dlg.childNodes[0].childNodes[0].style.width = (parseInt(dlg.style.width, 10)-40, 10)+'px';
			$(dlg.childNodes[0].childNodes[0]).bind('mousedown', function (event) {
				if(event.target.nodeName == 'A'){
					return;
				}
				_dragEvent = _dragEvent || new DragEvent();
				_drag(event);
				return false;
			});
		},
		middle: function(){
			staymiddle();
			return me;
		},
		callback: function(){
			if(!!arguments[0]){
				arguments[0].call(dlg);
			}
		},
		time:function(time){
			window.setTimeout(function(){
				hide(true);
			},time)
		}
	};
	$.dialog = me;
})(jQuery, hapj);