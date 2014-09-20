/** 
 * Copyright (c) 2014, Jiehun.com.cn Inc. All Rights Reserved
 * @class jQuery.fn.floatable
 * @author ronnie<dengxiaolong@jiehun.com.cn>
 * @date 2014-09-12
 * @version 1.0 
 * @description 使元素能相对另一个元素浮动起来。此代码可以使元素在整个页面居中、或浮动在页面左上角，右上角等
 * @example
// 设置divMenu元素处于linkMenu元素的左上角
$('#divMenu').floatable($('#linkMenu')).left().top();
 **/
!function($, undefined){
	"use strict";
	/**
	 * 元素浮动
	 * @param {Element} elem 作为当前元素浮动位置的参考元素 没有指定则为自己
	 */
	$.fn.floatable = function(elem){
		if (undefined === elem) {
			elem = document;
		}
		var isWnd = (elem === window);
		elem = $(elem);
		
		this.css('position', 'absolute');
	
		var pos, me = new Me();
		if (isWnd) {
			pos = {left:0, top:0};
		} else {
			pos = elem.offset();
		}
		if (pos === undefined) {
			pos = {left:0, top:0};
		}
		me.position = {
			width: elem.outerWidth(),
			height: elem.outerHeight()
		};
		
		$.extend(me.position, pos);
		me.ui = this;
		return me;
	};
	var Me = function(){};
	Me.prototype = /** @lends jQuery.fn.floatable.prototype */{
		/**
		 * 在指定位置显示
		 * @param {Number} left 左边距
		 * @param {int} [top=0] 顶边距
		 * @return {jQuery.fn.floatable}
		 */
		to: function(left, top) {
			var css = {};
			if (left === 0 || left) {
				css.left = (this.position.left + left) + 'px';
			} 
			if (top === 0 || top) {
				css.top = (this.position.top + top) + 'px';
			}
			this.ui.css(css);
			return this;
		},
		/**
		 * 顶部对齐
		 * @param {Number} [offset=0] 距离顶部的距离
		 * @param {Boolean} [out=false] 是否在参考元素的外部，默认为false
		 * @return {jQuery.fn.floatable}
		 */
		top:function(offset, out){
			offset = offset || 0;
			out = undefined === out ? false : out;
			this.ui.css('top', (this.position.top + offset - (out ? this.ui.height(true) : 0)) + 'px');
			return this;
		},
		/**
		 * 底部对齐
		 * @param {int} [offset=0] 距离底部的距离
		 * @param {bool} [out=false] 是否在参考元素的外部
		 * @return {jQuery.fn.floatable}
		 */
		bottom:function(offset, out){
			var ui = this.ui, pos = this.position, height;
			offset = offset || 0;
			out = undefined === out ? false : out;
			ui.each(function(k, e){
				if (!out) {
					height = $(e).outerHeight();
				} else {
					height = 0;
				}
				ui.css('top', (pos.top + pos.height - height + offset) + 'px');
			});
			return this;
		},
		/**
		 * 垂直居中
		 * @param {Number} offset 距离垂直中心点的距离
		 * @return {jQuery.fn.floatable}
		 */
		middle:function(offset){
			var ui = this.ui, pos = this.position;
			offset = offset || 0;
			ui.each(function(k, e){
				var height = $(e).outerHeight();
				ui.css('top', parseInt(pos.top + (pos.height - height)/2 + offset, 10));
			});
			return this;
		},
		/**
		 * 左边对齐
		 * @param {Number} offset 距离左边的距离
		 * @return {jQuery.fn.floatable} 
		 */
		left: function(offset, out) {
			var ui = this.ui, pos = this.position;
			offset = offset || 0;
			out = undefined === out ? false : out;
			ui.each(function(k, e){
				ui.css('left', pos.left + offset - (out ? $(e).width() : 0));
			});
			return this;
		},
		/**
		 * 右边对齐
		 * @param {Number} offset 距离右边的距离
		 * @return {jQuery.fn.floatable}
		 */
		right: function(offset, out) {
			var ui = this.ui, pos = this.position,width;
			offset = offset || 0;
			out = undefined === out ? false : out;
			ui.each(function(k, e){
				if (!out) {
					width = $(e).width();
				} else {
					width = 0;
				}
				ui.css('left', pos.left + pos.width - width + offset);
			});
			return this;
		},
		/**
		 * 左右居中
		 * @param {Number} offset 距离左右中心点的距离
		 * @return {jQuery.fn.floatable}
		 */
		center: function(offset) {
			var ui = this.ui, pos = this.position;
			offset = offset || 0;
			ui.each(function(k, e){
				var width = $(e).width();
				ui.css('left', parseInt((pos.left + pos.width - width)/2 + offset, 10) + 'px');
			});
			return this;
		}
	};
}(jQuery);
