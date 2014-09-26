/** 
 * Copyright (c) 2012, Jiehun.com.cn Inc. All Rights Reserved
 * @author dengxiaolong@jiehun.com.cn
 * @date 2011-12-30
 * @version 1.0 
 * @description 使元素可排序
 **/
!function($){
	'use strict';
	
	var inited = false,dragElem,
	/**
	 * @class jQuery.fn.sortable.options
	 * @private
	 * @description 传入的配置项，实际上此类不存在 {@link jQuery.fn.sortable|返回}
	 */
	defaults = /**@lends jQuery.fn.sortable.options */{
		/**
		 * 拖动时元素自动追加的样式名
		 * @type {String}
		 * @defaultvalue
		 */
		dragClass:'sort_drag',
		/**
		 * 不需要拖动的元素的样式名
		 * @type {String}
		 * @defaultvalue
		 */
		noDragClass:'',
		/**
		 * 调整排序后的事件响应函数
		 * @function
		 * @param {HTMLElement} root 拖动的根元素
		 * @param {HTMLElement} dragger 拖动的元素
		 * @param {HTMLElement} replacer 被替换的元素
		 */
		onDrop:null,
		/**
		 * 与拖动元素匹配的关联对象，拖动时关联对象将做相同的移动
		 * @type {jQuery}
		 * @defaultvalue
		 */
		relate:null,
		/**
		 * 鼠标的样式
		 * @type {String}
		 * @defaultvalue
		 */
		cssCursor:'move'
	}, isIE = /(msie) ([\w.]+)/.test(window.navigator.userAgent);
	
	/**
	 * @class jQuery.fn.sortable
	 * @author dengxiaolong@jiehun.com.cn
	 * @date 2014-09-26
	 * @version 2.0 
	 * @description 使表格或者ul支持拖拽。
	 * 注意，如果数据较少，在一页就能显示完毕，可以使用这个拖拽排序来执行相关的动作。如果数据较多，则最好使用其他方法对数据进行排序。
	 * @param {Object} options 参数，具体参考：{@link jQuery.fn.sortable.options}
	 * @example 
详见<a href="../examples/sortable.html" target="_blank">具体例子</a>
$('ul').sortable({
	dragClass:'drag', 			
	noDragClass:'nodrag', 		
	onDrop:function(root, dragger, target) { 
		var arr = [];
		$.each(root.getElementsByTagName('tr'), function(k, v) {
			arr.push(v.getAttribute('id'));
		});
		alert(id.join(','));
 	},
 	relate: $('#ulList') // 关联拖动的对象
});
	 */
	$.fn.sortable = function(options) {
		options = $.extend($.extend({}, defaults), options);
		var falseFunc = function(){return false;};
		this.each(function(){
			var self = this;
			if (this.nodeName == 'TABLE') {
				self = self.getElementsByTagName('tbody')[0];
			}
			if (options.relate && options.relate[0].tagName == 'TABLE') {
				options.relate = options.relate.tag('tbody');
			}
			
			var ec = new ElemCordinate(self, options);
			// 必须有多余1个节点才需要排序
			if (ec.childs.length < 2) {
				return;
			}
			ec.childs.css('cursor', options.cssCursor);
			self.eCordinate = ec;
			if (isIE == 'msie') {
				this.on('selectstart',falseFunc);
			}
			
			$(this).on('mousedown', function(e){
				if(/^(INPUT|TEXTAREA|OBJECT|EMBED|LABEL|BUTTON|SELECT|A)$/.test(e.target.nodeName)){
					return;
				}
				if (!dragElem && jQuery.contains(self, e.target)) {
					var tn = e.target;
					while (tn.parentNode !== self ) {
						tn = tn.parentNode;
					}
					if (options.noDragClass && $(tn).hasClass(options.noDragClass)) {
						return;
					}
					dragElem = tn;
					$(tn).addClass(options.dragClass);
					
					// 初始化子节点的位置
					self.eCordinate.getChildCordinates();
					
					// 初始化document的拖放事件
					initDoc();
				}
				return false;
			});
		});
		return this;
	};
	
	var ElemCordinate = function(elem, options){
		this.elem = $(elem);
		this.options = options;
		this.loadChilds();
	};

	ElemCordinate.prototype = {
		options:{},
		cordinates:[],
		childs:[],
		loadChilds:function(){
			var childs = this.elem.children(),ret = $(''),self = this, num = 0;
			childs.each(function(){
				if (!self.options.noDragClass || !$(this).hasClass(self.options.noDragClass)) {
					ret = ret.add(this);
					this.sortIndex = num;
					num++;
				}
			});
			this.childs = ret;
			// 检查关联对象数量和子节点数量是否一致
			if (this.options.relate) {
				if (this.options.relate.children(this.relateChildTag).length != this.childs.length) {
					throw new Error('sortable.u_relateChildCountNotMatch');
				}
			}
		},
		getChildCordinates:function(){
			var self = this;
			this.loadChilds();
			
			this.childs.each(function(i){
				var e = $(this),pos = e.offset();
				self.cordinates[i] = {
					left:pos.left,
					top:pos.top,
					right:pos.left + e.width(),
					bottom:pos.top + e.height()
				};
				
				if (dragElem && dragElem === this) {
					self.dragCordinate = self.cordinates[i];
				}
			});
		},
		getChildByCordinate:function(x, y){
			var dc = this.dragCordinate, down = dc.top < y;
			for(var i = 0,l = this.cordinates.length; i < l; i++) {
				var c = this.cordinates[i];
				
				if (c.left < x && c.right > x) {
					if (down) {
						if (y > c.bottom - (dc.bottom - dc.top) && y < c.bottom) {
							return this.childs[i];
						}
					} else {
						if (y > c.top  && y < c.top + (dc.bottom - dc.top)) {
							return this.childs[i];
						}
					}
				}
			}
			return null;
		},
		exchangeChilds:function(a, b) {
			var an = $(a).next()[0],bp = b.parentNode, childs, br, ar, tmp;
			
			if (an === b) {
				bp.insertBefore(b, a);
				if (this.options.relate) {
					childs = this.options.relate.children();
					br = childs[b.sortIndex];
					ar = childs[a.sortIndex];
					br.parentNode.insertBefore(br, ar);
					tmp = b.sortIndex;
					b.sortIndex = a.sortIndex;
					a.sortIndex = tmp;
				}
			} else {
				bp.insertBefore(a, b);
				if (this.options.relate) {
					childs = this.options.relate.children();
					br = childs[b.sortIndex];
					ar = childs[a.sortIndex];
					br.parentNode.insertBefore(ar, br);
					tmp = b.sortIndex;
					b.sortIndex = a.sortIndex;
					a.sortIndex = tmp;
				}
			}
			if (this.options.onDrop) {
				this.options.onDrop.call(null, this.elem[0], a, b);
			}
		}
	};
	
	function initDoc()
	{
		if (inited) return;
		inited = true;
		$(document)
		.on('mousemove', doDocMouseMove)
		.on('mouseup', doDocMouseUp)
		.on('mouseleave', doDocMouseUp);
	}
	
	function doDocMouseUp() {
		if (dragElem) {
			$(dragElem).removeClass(dragElem.parentNode.eCordinate.options.dragClass);
		}
		dragElem = null;
		inited = false;
		$(document)
		.unbind('mousemove', doDocMouseMove)
		.unbind('mouseup', doDocMouseUp)
		.unbind('mouseleave', doDocMouseUp);
	}
	
	var curDragNode;
	function doDocMouseMove(e)
	{
		if (!dragElem) return;
		
		// 将dragElem做适当的效果，使得用户能感知该元素正在被拖动
		var ec = dragElem.parentNode.eCordinate;
		if (!ec) return;
		var child = ec.getChildByCordinate(e.pageX, e.pageY);
		if (child && child !== dragElem) {
			curDragNode = child;
			ec.exchangeChilds(dragElem, child);
			ec.getChildCordinates();
		}
	}
}(jQuery);