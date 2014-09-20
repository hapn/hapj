/** 
 * Copyright (c) 2014, Jiehun.com.cn Inc. All Rights Reserved
 * @class jQuery.fn.menuable
 * @author ronnie<dengxiaolong@jiehun.com.cn>
 * @date 2011-12-30
 * @version 1.0 
 * @description 使元素能像菜单一样，通过点击或者按键显示出来以后，当鼠标点击在该元素上时，元素不会消失，但当鼠标点击在该元素以外时，元素会消失；
 * 当按esc键时，最上层的元素会消失
 * @example 
var menu = $('#dialog').menuable();
$('#linkDialog').on('click', function(e){
  menu.show(e, function(e){
    // set menu's position
    dlg.floable(window).middle().center();
    // return false if the dialog is not allowed to show
  });
});
 **/
!function($, _d, _w, undefined){
	"use strict";
	
	var elemQueue = [],
	_idKey = 'floableId',
	_idCount = 1000,
	_getId = function(){
		return 'FLOATBLE_' + (_idCount++);
	},
	_inited = false,
	_init = function(){
		if (_inited) {
			return;
		}
		_inited = true;
		$(_d).on('click', function(e){
			if (undefined !== e.button && e.button == 2) {
				return _initClicks();
			}
			
			var t = e.target;
			if (t === _from) {
				return _initClicks();
			}
			for(var elem in elemQueue) {
				if (!(elem in _clicks)) {
					elemQueue[elem].hide();
				}
			}
			return _initClicks();
		}).on('keydown', function(e) {
			var lastId = '';
			for(lastId in _currents) {}
			if (!lastId) {
				return;
			}
			
			if (e.keyCode == 27) {
				var c = elemQueue[lastId];
				c && c.hide();
			}
		});
	},
	_from = null,
	_currents = {},
	_clicks = {},
	_initClicks = function() {
		_clicks = {};
	}
	;

	/**
	 * 构造函数
	 * @returns {object} 返回一个对象，包含两个函数
	 * @example 返回的对象为
	 * {
	 *   // 显示菜单
	 *   show:function(event, onShow),
	 *   // 隐藏菜单
	 *   hide:function(event, onHide)
	 * }
	 */
	$.fn.menuable = function() {
		if (!this.length) {
			return;
		}
		_init();
		var me = new Me(),id = _getId();
		elemQueue[id] = me;
		
		var self = this;
		this.attr(_idKey, id).on('click', function(){
			_clicks[this.getAttribute(_idKey)] = true;
		});
		me.ui = self;
		
		return me;
	};

	var Me = function(){};
	
	Me.prototype = /** @lends jQuery.fn.menuable.prototype*/{
		/**
		 * 显示元素
		 * @param {Event} e
		 * @param {Function} onShow
		 * @return menuable
		 */
		show: function(e, onShow) {
			var id = this.ui.attr(_idKey);
			if (id in _currents) {
				return;
			}
		
			_from = null;
			if (undefined !== e && e.target) {
				_from = e.target;
			}
			if (typeof onShow == 'function') {
				var ret = onShow.call(this, e);
				if (false === ret) {
					return this;
				}
			}
			this.ui.css('display', 'block');
			
			if (id in _currents) {
				delete _currents[id];
			}
			_currents[id] = true;
			return this;
		},
		/**
		 * 隐藏元素
		 * @param {Event} e
		 * @param {Function} onHide
		 * @return menuable
		 */
		hide: function(e, onHide) {
			if (typeof onHide == 'function') {
				var ret = onHide.call(this.ui, e);
				if (false === ret) {
					return this;
				}
			}
			this.ui.css('display', 'none');
			var id = this.ui.attr(_idKey);
			if (id in _currents) {
				delete _currents[id];
			}
			return this;
		}
	};
}(jQuery, document, window);