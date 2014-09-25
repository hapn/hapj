/** 
 * Copyright (c) 2014, Jiehun.com.cn Inc. All Rights Reserved
 * @author dengxiaolong@jiehun.com.cn
 * @date 2014-09-25
 * @version 2.0 
 * @description 日历控件 
 */

!function($, undefined){
	'use strict';
	
 	var _fd = function(date, format) {
		date.month < 10 ? (date.month = '0' + date.month) : '';
		date.day < 10 ? (date.day = '0' + date.day) : '';
		if (date.hour >= 0) {
			date.hour < 10 ? (date.hour = '0' + date.hour) : '';
		} else {
			date.hour = 0;
		}
		if (date.minute >= 0) {
			date.minute < 10 ? (date.minute = '0' + date.minute) : '';
		} else {
			date.minute = 0;
		}
		if (date.second >= 0) {
			date.second < 10 ? (date.second = '0' + date.second) : '';
		} else {
			date.second = 0;
		}
		
		var dates = {
			Y:date.year,
			m:date.month,
			d:date.day,
			H:date.hour,
			i:date.minute,
			s:date.second
		};
		return format.replace(/(([YmdHis]))/g, function(m, i, k){
			return dates[k];
		});
	}, defaults = {
		input:null,
		className:'cal',
		format:'Y-m-d',
		timeType: 0, // 时间格式，0表示不获取时间；1表示获取时钟；2表示获取时钟+分钟；3表示获取时钟+分钟+秒钟，默认为不获取时间
		startDate:null,
		endDate:null
	};
	/**
	 * @class jQuery.fn.calendar
	 * @param {Object} options 参数，包含如下参数：
	 * <dl>
	 *  <dt>input</dt>
	 *  <dd>日历绑定的input控件，指定此对象后日历对象会和input控件形成交互</dd>
	 *  <dt>className</dt>
	 *  <dd>日历控件的样式名称，默认为cal</dd>
	 *  <dt>format</dt>
	 *  <dd>日期格式，用Y、m、d、H、i、s分别代表年、月、日、时、分、秒。默认为Y-m-d。</dd>
	 *  <dt>startDate</dt>
	 *  <dd>选择时间区间-开始日期[可选]，格式：Y-m-d。</dd>
	 *  <dt>endDate</dt>
	 *  <dd>选择时间区间-结束日期[可选]，格式：Y-m-d。</dd>
	 *  <dt>onSelect:<em>function(y, m, d, h, i, s)</em></dt>
	 *  <dd>当选择日期后调用的事件处理函数</dd>
	 *  <dd><em>y</em> 年份</dd>
	 *  <dd><em>m</em> 月份</dd>
	 *  <dd><em>d</em> 日期</dd>
	 *  <dd><em>h</em> 时钟</dd>
	 *  <dd><em>i</em> 分钟</dd>
	 *  <dd><em>s</em> 秒钟</dd>
	 * </dl>
	 * @description 这个组件主要用来显示日历
	 * @example
	 * var cal = $('#calendar').calendar({
	 * 	'format': 'Y/m/d'
	 * });
	 * 详细例子请查看<a href="../examples/calendar.html" target="_blank">例子</a>
	 */
	$.fn.calendar = function(options) {
		if (!this.length) {
			return;
		}
		options = $.extend({}, defaults, options);
		
		var self = this, cal = null, defDate = null;
		if (options.input) {
			var input = options.input;
			if (input.length != 1 || input[0].nodeName != 'INPUT') {
				throw new Error('calenar.inputMustBeAInputElement');
			}
			
			defDate = input.val();
			input.css({
				position:'absolute'
			}).attr({
				'readonly': 'readonly',
				'autocomplete':'off'
			}).click(function(e){
				e.stopPropagation();
				
				var pos = input.offset();
				self.css({
					left:pos.left,
					top:pos.top + input.outerHeight()
				}).show();
			});
			$(document).click(function(){
				cal.hide();
			});
			this.css({
				'position':'absolute'
			}).hide();
			
			if (!('onSelect' in options)) {
				options.onSelect = function(y, m, d, h, i, s) {
					input.attr('value', _fd({
						year:y,
						month:m,
						day:d,
						hour:h,
						minute:i,
						second:s
					}, format));
					cal.hide();
					self.hide();
					input.trigger('blur');
				};
			}
		}
					
		var format = options.format || 'Y-m-d',
			sdt = options.startDate || undefined,
			edt = options.endDate || undefined;
		this.addClass(options.className);
		cal = new Calendar(this, options);
		
		// 设置默认值
		if (defDate) {
			var reg = new RegExp('^' + format
				.replace(/\-/g, '\\-')
				.replace(/\//g, '\\/')
				.replace('Y', '([12][0-9]{3})')
				.replace('m', '((?:1[012])|(?:0?[1-9]))')
				.replace('d', '((?:[1-2][0-9])|(?:0?[1-9])|(?:3[01]))')
				.replace('H', '((?:2[0-3])|(?:[01]?[1-9]))')
				.replace('i', '([0-5]?[0-9])')
				.replace('s', '([0-5]?[0-9])')
				 + '$'), ms;
			if ( (ms = reg.exec(defDate)) ) {
				var y = ms[1],m = parseInt(ms[2], 10) - 1,d = parseInt(ms[3], 10), H = parseInt(ms[4], 10), i = parseInt(ms[5], 10), s = parseInt(ms[6], 10);
				try {
					cal.init({
						year: y,
						month: m,
						day: d,
						hour: H,
						minute:i,
						second:s
					}, sdt, edt);
				} catch (e) {
					
				}
			} else {
				cal.init(null, sdt, edt);
			}
		} else {
			cal.init(null, sdt, edt);
		}

		return cal;
	};

	var wds = ['日','一','二','三','四','五','六'],
	/**
	 * 获取日期
	 * @param {Object} elem
	 */
	getDate = function(elem) {
		var ds = elem.getAttribute('cinfo').split(',');
		ds[0] = parseInt(ds[0], 10);
		ds[1] = parseInt(ds[1], 10) + 1;
		ds[2] = parseInt(ds[2], 10);
		return ds;
	},
	/**
	 * 得到某个月的所有格子
	 * @param {Object} year
	 * @param {Object} month
	 * @param {Object} day
	 */
	getMonthGrids = function(year, month, day, sdt, edt) {
		// 获取
		var	fd = getMonthFirstDay(year, month),//上个月的天数
			dt = getMonthDayNum(year, month),//一个月的天数
			rows = Math.ceil((fd+dt)/7),
			gt = 7*rows, //格子数
			i = 0,
			r = 0,
			c = 0,
			d = 0,
			nm,
			pm,
			pmd,
			arr = new Array(rows),
			now = new Date(),
			isCmonth = year == now.getFullYear() && month == now.getMonth(),
			cday = now.getDate();

		if (fd > 0) {
			pm = getPrevMonth(year, month);
			pmd = getMonthDayNum(pm[0], pm[1]);
		}
		if (fd + dt < gt) {
			nm = getNextMonth(year, month);
		}

		for(; i < gt; i++) {
			var curY,curM,curD,curCs;
			c = i % 7;
			if (i >= fd) {
				d++;
			}
			if (undefined === arr[r]) {
				arr[r] = new Array(7);
			}
			
			if (d > dt) {//下一月
				curY = nm[0];
				curM = nm[1];
				curD = d - dt;
				curCs = 'cn';
				//arr[r][c] = [nm[0], nm[1], d - dt, 'cn'];
			} else {
				if (d === 0) {//上一月
					curY = pm[0];
					curM = pm[1];
					curD = pmd - (fd - i) + 1;
					curCs = 'cp';
					//arr[r][c] = [pm[0], pm[1], pmd - (fd - i) + 1, 'cp'];
				} else {//当前月
					curY = year;
					curM = month;
					curD = d;
					curCs = 'cc';
					if (isCmonth && cday == d &&  d > 0 && d <= dt) {//今天
						curCs += ' cd';
					}
					//arr[r][c] = [year, month, d, cs];
				}
			}
			var dateStr = curY+'-'+(curM+1)+'-'+curD;
			if( sdt !== undefined && compareDate(sdt,dateStr) > 0 ){
				curCs += ' co';
			}
			
			if( edt !== undefined && compareDate(dateStr,edt) > 0 ){
				curCs += ' co';
			}
			
			arr[r][c] = [curY, curM, curD, curCs];

			if (c == 6) {
				r++;
			}
		}
		
		return arr;
	},
	compareDate = function(a,b) {
	    var sArr=a.split("-");
	    var sTime=new Date(sArr[0],sArr[1],sArr[2]);
	    	sTime=sTime.getTime();
	    var eArr=b.split("-");
	    var eTime=new Date(eArr[0],eArr[1],eArr[2]);
	    	eTime=eTime.getTime();
	    if( sTime > eTime ) {
	        return 1;
	    }else{
	        return -1;
	    }
	},
	/**
	 * 根据格子提供的数据创建日历
	 * @param {Array} grids
	 * @param {Number} year
	 * @param {Number} month
	 * @param {Number} timeType 
	 * @param {Array} 当前日期[year, month, day]
	 */
	renderCalendar = function(grids, year, month, timeType, cdate) {
		var code = [];
		
		code.push('<table class="hd" width="100%"><tr>');
		code.push('<td style="width:12.5%"><a class="cpy" title="上一年">&lt;&lt;</a></td>');
		code.push('<td style="width:12.5%"><a class="cpm" title="上一月">&lt;</a></td>');
		code.push('<td style="width:25%" class="ct">' + renderYearList(year) + '</td>');
		code.push('<td style="width:25%" class="ct">' + renderMonthList(month) + '</td>');
		code.push('<td style="width:12.5%"><a class="cnm" title="下一月">&gt;</a></td>');
		code.push('<td style="width:12.5%"><a class="cny" title="下一年">&gt;&gt;</a></td>');
		code.push('</tr></table>');
		
		
		code.push('<table class="bd" width="100%">');
		
		// 生成星期
		var i, l;
		code.push('<tr>');
		for(i = 0; i < 7; i++) {
			code.push('<td class="cw" style="width:14.2%">' + wds[i] + '</td>');
		}
		code.push('</tr>');
		
		// 是否需要选择日期
		var selectDay = false;
		if (year == cdate[0] && month == cdate[1]) {
			selectDay = true;
		}
		// 生成日历
		for(i = 0, l = grids.length; i < l; i++) {
			code.push('<tr>');
			for(var j = 0, m = grids[i].length; j < m; j++) {
				var day = grids[i][j], d = day[2], cs = day.pop(), cdaycs = '';
				
				if(cs.indexOf("co") < 0){
					cdaycs = 'cday';
				}
				
				if (selectDay && d == cdate[2]) {
					cs += ' on';
				}
				
				code.push('<td width="14.2%" class="' + cs + '" cinfo="' + day.join(',') + '"><a class="'+cdaycs+'">' + d + '</a></t>');
			}
			code.push('</tr>');
		}
		code.push('</table>');
		
		// 生成时间
		if (timeType > 0 && timeType < 4) {
			code.push('<div class="ft" style="text-align:center">');
			code.push(renderHourList());
			if(timeType > 1) {
				code.push(renderMinuteList());
			}
			if(timeType > 2) {
				code.push(renderSecondList());
			}
			code.push('<a href="" class="confirm" ' +  (cdate[2] > 0 ? '' : ' style="cursor:not-allowed;"') + '>确定</a>');
			code.push('</div>');
		}
		
		return code.join('');
	},
	/**
	 * 渲染年份列表
	 */
	renderYearList = function(year) {
		var code = [];
		code.push('<select class="year">');
		var i;
		for(i = 10; i > 0; i--) {
			code.push('<option class="cyl" value="' + (year - i) + '">' + (year - i) + '年</option>');
		}
		code.push('<option class="cy" title="点击选择年份" selected="selected" value="' + year + '">' + year + '年</option>');
		for(i = 1; i <= 10; i++) {
			code.push('<option class="cyl" value="' + (year + i) + '">' + (year + i) + '年</option>');
		}
		code.push('</select>');
		return code.join('');
	},
	/**
	 * 渲染月份列表
	 */
	renderMonthList = function(month) {
		var code = [];
		code.push('<select class="month">');
		for(var i = 0; i < 12; i++) {
			code.push('<option '+ (i == month ? ' selected="selected" ' : '') +'value="' + i + '">' + (i < 9 ? '&#160;' + (i+1)  : (i+1)) + '月</option>');
		}
		code.push('</select>');
		return code.join('');
	},
	/**
	 * 获取时钟列表
	 */
	renderHourList = function(hour) {
		var code = [];
		code.push('<select class="hour">');
		for(var i = 0; i < 24; i++) {
			code.push('<option ' + (i == hour ? ' selected="selected" ' : '') + 'value="' + i + '">' + (i < 10 ? ('&#160;' + i) : i) + '点</option>');
		}
		code.push('</select>');
		return code.join('');
	},
	/**
	 * 获取分钟列表
	 */
	renderMinuteList = function(minute) {
		var code = [];
		code.push('<select class="minute">');
		for(var i = 0; i < 60; i++) {
			code.push('<option ' + (i == minute ? ' selected="selected" ' : '') + 'value="' + i + '">' + (i < 10 ? ('&#160;' + i) : i) + '分</option>');
		}
		code.push('</select>');
		return code.join('');
	},
	/**
	 * 获取秒钟列表
	 */
	renderSecondList = function(second) {
		var code = [];
		code.push('<select class="second">');
		for(var i = 0; i < 60; i++) {
			code.push('<option ' + (i == second ? ' selected="selected" ' : '') + 'value="' + i + '">' + (i < 10 ? ('&#160;' + i) : i) + '秒</option>');
		}
		code.push('</select>');
		return code.join('');
	},
	/**
	 * 获取某个月份的第一天是星期几
	 * @param {Object} year
	 * @param {Object} month
	 */
	getMonthFirstDay = function(year, month) {
		var date = new Date(year, month, 1);
		return date.getDay();
	},
	/**
	 * 获取某个月的天数
	 * @param {Number} year
	 * @param {Number} month
	 */
	getMonthDayNum = function(year, month) {
		switch(month) {
			case 0:
	        case 2:
	        case 4:
	        case 6:
	        case 7:
	        case 9:
	        case 11:
	            return 31;
	        case 1:
	            return year % 100 !== 0 && year % 4 ===0 || year % 400 === 0 ? 29 : 28;
	        case 3:
	        case 5:
	        case 8:
	        case 10:
	            return 30;
		}
	},
	/**
	 * 得到下一个月
	 * @param {Object} year
	 * @param {Object} month
	 */
	getNextMonth = function(year, month) {
		var m = month + 1;
		if (m > 11) {
			m = 0;
			year++;
		}
		return [year, m];
	},
	/**
	 * 得到上一个月
	 * @param {Object} year
	 * @param {Object} month
	 */
	getPrevMonth = function(year, month) {
		var m = month - 1;
		if (m < 0) {
			m = 11;
			year--;
		}
		return [year, m];
	},
	Calendar = function(elem, options) {
		this.elem = elem;
		this.options = options;
		this.elem.on('click', function(e) {
			e.stopPropagation();
		});
	}
	;
	Calendar.prototype = {
		_inited: false,
		year:0,
		month:0,
		day:0,
		hour:0,
		minute:0,
		second:0,
		getYearElem:function(){
			return this.elem.find('select')[0];
		},
		getMonthElem:function(){
			return this.elem.find('select')[1];
		},
		init: function(date, sdt, edt) {
			if (!date) {
				var now = new Date();
				this.year = now.getFullYear();
				this.month = now.getMonth();
				this.day = 0;
				this.hour = 0;
				this.minute = 0;
				this.second = 0;
			} else {
				this.year = date.year;
				this.month = date.month;
				this.day = date.day;
				this.hour = date.hour || 0;
				this.minute = date.minute || 0;
				this.second = date.second || 0;
			}
			this.sdt = sdt;
			this.edt = edt;
			
			var grids = getMonthGrids(this.year, this.month, this.day, sdt, edt),
				code = renderCalendar(grids, this.year, this.month, this.options.timeType, [this.year, this.month, this.day]),
				self = this;
			this.elem.html(code);
			
			this.setTime();
			
			var events = {
				/**
				 * 选择了月份后
				 * @param {Event} e
				 */
				month: function(e) {
					self.showMonth(parseInt(self.getYearElem().value, 10), parseInt(e.target.value, 10));
				},
				/**
				 * 选择了年份后
				 * @param {Event} e
				 */
				year: function(e) {
					self.showMonth(parseInt(e.target.value, 10), parseInt(self.getMonthElem().value, 10));
				},
				/**
				 * 选择了时钟后
				 */
				hour: function(e) {
					self.hour = parseInt(e.target.value, 10);
				},
				/**
				 * 选择了分钟后
				 */
				minute: function(e) {
					self.minute = parseInt(e.target.value, 10);
				},
				/**
				 * 选择了秒钟后
				 */
				second: function(e) {
					self.second = parseInt(e.target.value, 10);
				},
				cday: function(e, t, f, o) {
					t = e.target;
					o = self.options;
					f = o.format || 'Y-m-d';
					
					self.year = parseInt(self.getYearElem().value, 10);
					self.month = parseInt(self.getMonthElem().value, 10);
					self.day = parseInt(t.innerHTML, 10);
					
					var p = $(t.parentNode);
					p.parents('table').find('td').removeClass('on');
					p.addClass('on');
					
					self.elem.find('.confirm').css('cursor', 'pointer');
					
					if (!self.options.timeType && o.onSelect) {
						o.onSelect.apply(t, getDate(t.parentNode));
					} 
				},
				cpm: function() {
					self.showPrevMonth();
				},
				cpy: function() {
					self.showPrevYear();
				},
				cnm: function() {
					self.showNextMonth();
				},
				cny: function() {
					self.showNextYear();
				},
				confirm: function(e) {
					if (self.day === 0) {
						return;
					}
					var ret = [self.year, self.month, self.day, self.hour], tt = self.options.timeType;
					if (tt > 1) {
						ret.push(self.minute);
					}
					if (tt > 2) {
						ret.push(self.second);
					}
					self.options.onSelect && self.options.onSelect.apply(e.target, ret);
				}
			};
			
			// 
			this.elem.on('change', 'select', function(e) {
				var cls = e.target.className;
				if (cls in events) {
					events[cls].call(e.target, e);
				}
			});
			
			this.elem.on('click', 'a', function(e) {
				var cls = e.target.className;
				if (cls in events) {
					events[cls].call(e.target, e);
				}
				return false;
			});
		},
		showPrevMonth: function() {
			var ms = getPrevMonth(parseInt(this.getYearElem().value, 10), parseInt(this.getMonthElem().value, 10));
			this.showMonth(ms[0], ms[1]);
		},
		showNextMonth: function() {
			var ms = getNextMonth(parseInt(this.getYearElem().value, 10), parseInt(this.getMonthElem().value, 10));
			this.showMonth(ms[0], ms[1]);
		},
		showPrevYear: function() {
			this.showMonth(parseInt(this.getYearElem().value, 10) - 1, parseInt(this.getMonthElem().value, 10));
		},
		showNextYear: function() {
			this.showMonth(parseInt(this.getYearElem().value, 10) + 1, parseInt(this.getMonthElem().value, 10));
		},
		showMonth: function(year, month) {
//			this.year = year;
//			this.month = month;
			var grids = getMonthGrids(year, month, this.day, this.sdt, this.edt);
			this.elem.html(renderCalendar(grids, year, month, this.options.timeType, [this.year, this.month, this.day]));
			
			this.setTime();
		},
		setTime: function() {
			// 根据当前月份来调整页面的显示
			var tt = this.options.timeType;
			if (tt > 0) {
				var selects = this.elem.find('select');
				selects[2].value = this.hour;
				if (tt > 1) {
					selects[3].value = this.minute;
				}
				if (tt > 2) {
					selects[4].value = this.second;
				}
			}
		},
		hide: function() {
			this.elem.hide();
		},
		show: function() {
			this.elem.show();
		}
	};
}(jQuery);