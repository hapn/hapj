/** 
 * Copyright (c) 2012, Jiehun.com.cn Inc. All Rights Reserved
 * @class jQuery.fn.switchable
 * @author dengxiaolong@jiehun.com.cn
 * @date 2011-12-30
 * @version 1.0 
 * @description 使几组相互联动的元素能互相切换 <br/>
 * 详见{@link http://dxl.hapn.cc/grunt/examples/switchable.html|例子}
 * @example 
var sw = $('#cycle').switchable({
	method:'hover',
	cycleTime: 2000,
	map:function(){
		return $(this.getAttribute('href').substr(1) + 'List')[0];
	},
	trigger: function(triggers) {
		triggers.css('color', '');
		this.style.color = 'red';
	},
	target: function(targets) {
		targets.css('display', 'none');
		this.style.display = 'block';
	}
});
sw.rand();

 
$('#sortUl').switchable({
	tag:'li',
	method:'scroll', 
	map:$('#relateUl > div'),
	trigger:function(ts) {
		ts.removeClass('on');
		this.className = 'on';
	},
	stopTop:-20, // 停留在顶部时的上边距，仅在scroll模式下启用
	disableClick:false // 是否禁用click，默认为false，表示点击trigger的时候会自动滚动到对应位置
});
 **/
!function($){
	"use strict";
	
	var METHOD_CLICK = 'click', METHOD_HOVER = 'hover', MOTHOD_SCROLL = 'scroll',
	_getTarget = function(trigger, options, i) {
		if (options.map) {
			var target = null;
			switch(typeof options.map) {
				case 'string':
					target = $(options.map)[0];
					break;
				case 'function':
					target = options.map.call(trigger, i);
					break;
				default:
					target = options.map;
					break;
			} 
			if (!target) {
				throw new Error('hapj.ui.switchable the target is not found.');
			}
			return target;
		}
		return null;
	},
	_switch = function(trigger, options, i) {
		var target = _getTarget(trigger, options, i);
		if (target) {	
			options.trigger && options.trigger.call(trigger, options.triggers, i);
			options.target && options.target.call(target, options.targets, i, trigger);
		}
	};
	
	/**
	 * @description switchable的构造函数
	 * @constructor jQuery.fn.switchable
	 * @param {Object} opt 选项
	 * <dl>
	 * 	<dt>method<dt>
	 * 	<dd>触发的方法 可选值为hover、click、scroll，默认为click</dd>
	 * 	<dt>map<dt>
	 * 	<dd>实现将触发元素关联到目标元素的映射函数</dd>
	 * 	<dt>trigger<dt>
	 * 	<dd>触发后触发元素做出的响应函数</dd>
	 * 	<dt>target<dt>
	 * 	<dd>触发后目标元素做出的响应函数</dd>
	 * 	<dt>cycleTime<dt>
	 * 	<dd>自动循环的时间，默认为0</dd>
	 * 	<dt>tag<dt>
	 * 	<dd>使用当前元素的指定标签的元素作为触发元素</dd>
	 * 	<dt>stopTop<dt>
	 * 	<dd>停留在顶部时的上边距，仅在scroll模式下启用</dd>
	 * 	<dt>endTop<dt>
	 * 	<dd>点击后定位到触发元素时偏移的距离，仅在scroll模式下启用</dd>
	 * 	<dt>disableClick<dt>
	 * 	<dd>是否禁用click，默认为false，表示点击trigger的时候会自动滚动到对应位置</dd>
	 * </dl>
	 */
	$.fn.switchable = function(opt) {
		var self = this, 
		targets = $(''),
		triggers = $(''),
		options = {
			method:METHOD_CLICK, 
			map:null, 
			trigger: null, 
			target: null, 
			cycleTime: 0,
			tag: '',
			stopTop: 0,
			endTop: 0,
			noSwitchClass:'',
			disableClick: false // 只有在scroll方式下才有用
		},
		_scrollToTarget = function(i) {
			return function(){
				var target = _getTarget(this, options, i);
				if (!target) {
					return false;
				}
				var top = $(target).offset().top;
				window.scrollTo(0, top - options.endTop);
				return false;
			};
		};
		$.extend(options, opt);
		
		var me = new Me();
		me.ui = this;
		var tag = options.tag ? options.tag.toUpperCase() : '', oldPosition = this.css('position');
		function initTriggers() {
			if (tag) {
				if (options.noSwitchClass) {
					var node = $('');
					me.ui.find(tag).each(function() {
						if (this.className != options.noSwitchClass) {
							node.add(this);
						}
					});
					triggers = node;
				} else {
					triggers = me.ui.find(tag);
				}
			} else {
				triggers = me.ui;
			}
			if (typeof options.map == 'function') {
				targets = $('');
				triggers.each(function(i){
					var node = $(options.map.call(this, i));
					targets = targets.add(node[0]);
					if (options.method == MOTHOD_SCROLL) {
						var p = node.offset();
						node.data('pos', {
							top: p.top,
							height: node.height()
						});
					}
				});
			} else {
				if (options.method == MOTHOD_SCROLL) {
					targets.each(function(i, e) {
						var node = $(e);
						var p = node.offset();
						node.data('pos', {
							top: p.top,
							height: node.height()
						});
					});
				}
			}
		}
		
		initTriggers();
		
		if (typeof options.map == 'function') {
			triggers.each(function(i){
				targets.add(options.map.call(this, i));
			});
		} else {
			targets = $(options.map);
		}
		
		$.extend(options, {triggers: triggers, targets: targets});
		
		me.initTriggers = function() {
			initTriggers();
			this.options.triggers = triggers;
			this.options.targets = targets;
		};
		switch(options.method) {
			case METHOD_CLICK:
				triggers.on('click', function(){
					var i = me.current = triggers.index(this);
					_switch(triggers[i], options, i);
					me.stopCycle();
					return false;
				});
				
				targets.on('mouseleave', function() {
					me.startCycle();
				});
				targets.on('mouseenter', function(e) {
					if (targets.length > 1 && me.current != targets.index(e.target)) {
						return;
					}
					me.stopCycle();
				});
				
				break;
			case METHOD_HOVER:
				triggers.on('mouseenter', function(e) {
					if (tag && e.target.tagName != tag) {
						return;
					}
					var i = me.current = triggers.index(e.target);
					_switch(triggers[i], options, i);
					
					return false;
				});
				targets.on('mouseleave', function() {
					me.startCycle();
				});
				targets.on('mouseenter', function(e) {
					if (targets.length > 1 && me.current != targets.index(e.target)) {
						return;
					}
					me.stopCycle();
				});
				break;
			case MOTHOD_SCROLL: // 滚动时触发对应事件
				var tpos = this.offset(),h = this.height(),_d = $(document), keepTop = false, curTarget = null;
				var clone = $('<div>');
				clone.css({
					width: this.width() + 'px',
					height:h + 'px',
					display: 'none'
				}).insertBefore(self);
				
				if (options.tag) {
					if (!options.disableClick) {
						self.find(options.tag).each(function(i, e) {
							$(e).on('click', _scrollToTarget(i));
						});
					}
				} else {
					triggers.on('click', function(e, i){
						// 调整target位置
						var top = $(targets[i]).offset().top;
						window.scrollTo(0, top - options.endTop);
						return false;
					});
				}
				
				
				// 通过屏幕的滚动来触发各种事件
				if (!oldPosition) {
					oldPosition = 'static';
				}
				$(window).on('scroll', function() {
					var dtop = _d.scrollTop();
					if (!keepTop && dtop > tpos.top) {
						keepTop = true;
						self.css({
							position:'fixed',
							top:options.stopTop
						});
						clone.show();
					}
					if (keepTop && dtop < tpos.top + h) {
						keepTop = false;
						clone.hide();
						self.css({
							position:oldPosition
						});
					}
					if (keepTop && !$.support.leadingWhitespace) {
						self.css({
							position:'absolute',
							top:0
						});
					}
					me.initTriggers();
					targets.each(function(i){
						var basePos = dtop + 200;
						var pos = $(this).data('pos');
						if (curTarget !== this && basePos > pos.top && basePos < pos.top + pos.height) {
							curTarget = this;
							me.current = i;
							_switch(triggers[i], options, i);
							
							// 替换clone对象的html
							clone.html(self[0].innerHTML);
							
							me.stopCycle();
							return false;
						}
					});
				});
				break;
		}
		if (options.cycleTime > 0) {
			this.on('mouseleave', function() {
				me.startCycle();
			});
			targets.on('mouseleave', function(e, i) {
				if (targets.length > 1 && me.current != i) {
					return;
				}
				me.startCycle();
			});
			setTimeout(function(){
				me.startCycle();
			}, 0);
		}
		
		
		me.options = options;
		me.total = options.triggers.length;
		
		return me;
	};

	var Me = function(){};
	Me.prototype = {
		// 元素总数
		total:0,
		// 当前所在元素数
		current:0,
		// 轮播顺序 1:正序；0:倒序
		order: 1 ,
		/**
		 * 切换到下一组元素
		 * @param {Function} onLast 如果传入一个函数，当轮换到最后一张时会调用此函数，如果返回false，则不会继续切换
		 * @return this
		 */
		next: function(onLast) {
			if (typeof onLast == 'function' && this.current + 1 == this.total) {
				var ret = onLast.call(null);
				if (false === ret) {
					return;
				}
			}
			this.current++;
			this.order = 1;
			if (this.current >= this.total) {
				this.current = 0;
			}
			return this.to(this.current);
		},
		/**
		 * 切换到上一组元素
		 * @param {Function} onFirst 如果传入一个函数，当轮换到第一张时会调用此函数，如果返回false，则不会继续切换
		 * @return this
		 */
		prev: function(onFirst) {
			if (typeof onFirst == 'function' && this.current === 0) {
				var ret = onFirst.call(null, this.current);
				if (false === ret) {
					return;
				}
			}
			
			this.current--;
			this.order = 0;
			if (this.current < 0) {
				this.current = this.total - 1;
			}
			return this.to(this.current);
		},
		/**
		 * 随机切换到一个触发器
		 */
		rand: function() {
			var i = Math.ceil(Math.random() * this.total) - 1;
			return this.to(i);
		},
		/**
		 * 切换到指定的位置
		 * @param {Number} index
		 * @return this
		 */
		to: function(index) {
			if (index < 0 || index >= this.total) {
				throw new Error('hapj.ui.switchable wrong index');
			}
			this.current = index;
			var trigger = this.options.triggers[index];
			_switch(trigger, this.options, this.current);
			return this;
		},
		/**
		 * 移动到第一个元素
		 */
		first: function(){
			return this.to(0);
		},
		/**
		 * 移动到最后一个元素
		 * @return this
		 */
		last: function() {
			return this.to(this.total);
		},
		__interval: null,
		/**
		 * 开始轮播
		 * @param {Number} ms 毫秒 
		 * @return this
		 */
		startCycle: function(ms){
			var self = this;
			if (undefined === ms) {
				if (this.options.cycleTime <= 0) {
					return;
				}
				
				ms = this.options.cycleTime;
			}
			this.stopCycle();
			this.__interval = setInterval(function(){
				if(self.order==1){
					self.next();
				}else{
					self.prev();
				}
			}, ms);
		},
		/**
		 * 停止轮播
		 * @return this
		 */
		stopCycle: function() {
			if (this.__interval) {
				clearInterval(this.__interval);
				this.__interval = null;
			}
		}
	};
}(jQuery);