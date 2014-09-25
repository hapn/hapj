/** 
 * Copyright (c) 2014, Jiehun.com.cn Inc. All Rights Reserved
 * @author dengxiaolong@jiehun.com.cn
 * @date 2014-09-24
 * @version 2.0 
 * @brief 使元素可验证
 **/
!function($, undefined){
	'use strict';
	
var _vRules = {},
_inited = false,
getValue = function(elem) {
	if (elem.type && /^(select\-multiple|radio|checkbox)$/.test(elem.type)) {
		var values = [];
		if (elem.nodeName == 'SELECT') {
			$.each(elem.options, function(k, v){
				if (v.selected) {
					values.push(v.value);
				}
			});
		} else {
			var eachElemArr = [];
			if(elem.form[elem.name].length === undefined){
				eachElemArr.push(elem.form[elem.name]);
			}else{
				eachElemArr = elem.form[elem.name];
			}
			$.each(eachElemArr, function(k, v){
				if (v.checked) {
					values.push(v.value);
				}
			});
		}
		if (values.length > 1) {
			return values;
		}
		return values.join(',');
	}
	return elem.value;
},
_init = function() {
	if (_inited) {
		return;
	}
	_addRules();
	_inited = true;
},
_dateReg = /^([12][0-9]{3})[\-\/\_\.\s]?(0?[1-9]|1[012])[\-\/\_\.\s]?(0?[1-9]|[12][0-9]|3[01])$/,
_str2date = function(str) {
	var ms = _dateReg.exec(str);
	if (ms) {
		var y = parseInt(ms[1], 10), m = parseInt(ms[2], 10) - 1, d = parseInt(ms[3], 10);
		try {
			return new Date(y, m, d);
		} catch (e) {
			return false;
		}
	}
	return false;
},
_addRules = function(){
	/**
	 * 默认的规则
	 * @class jQuery.verifiable.rules
	 * @private
	 */
	$.verifiable.addRules(
	/**
	 * @lends jQuery.verifiable.rules
	 */
	{
		/**
		 * 验证是否为空
		 * @param {Object} val
		 */
		required: function(val){
			return $.trim(val) !== '';
		},
		/**
		 * 验证是否为数字
		 * @param {Object} val
		 */
		number: function(val) {
			return !isNaN(val);
		},
		/**
		 * 验证是否为正整数
		 * @param {Object} val
		 */
		posint: function(val) {
			return /^[0-9]+[0-9]*]*$/.test(val);
		},
		/**
		 * 验证是否为金钱,保留两位小数
		 * @param {Object} val
		 */
		price: function(val) {
			return /^(\d{1,7})(\.\d{2})?$/.test(val);
		},
		/**
		 * 验证是否为email地址
		 * @param {Object} val
		 */
		email: function(val) {
			return /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|\.|-|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)((com(\.[a-z]{2})?)|net|cn|cc)$/i.test(val);
		},
		/**
		 * 验证是否符合正则表达式
		 */
		regexp: function(val, rule) {
			return new RegExp(rule.exp).test(val);
		},
		/**
		 * 验证是否中文
		 * @param {String} val
		 * @param {Object} rule
		 * {
		 * 		min:最小长度
		 * 		max:最大长度
		 * }
		 */
		chinese:function(val, rule) {
			if (undefined === rule.min) {
				rule.min = 0;
			}
			if (undefined === rule.max) {
				rule.max = Number.MAX_VALUE;
			}
			return new RegExp('^[\u4e00-\u9fa5]{' + rule.min + ',' + rule.max + '}$').test(val);
		},
		/**
		 * 身份证验证
		 * @param {String} val
		 * @param {Object} rule 规则，参数如下
		 * <dl>
		 * 	<dt>minAge</dt>
		 *  <dd>最小年龄</dd>
		 *  <dt>maxAge</dt>
		 *  <dd>最大年龄</dd>
		 * 	<dt>sex<em>[male|female]</em>
		 * 	<dd><em>male</em>男性</dd>
		 * 	<dd><em>female</em>女性</dd>
		 *  <dt>province</dt>
		 *  <dd>省份名称，如北京、天津等</dd>
		 * </dt>
		 */
		ID:function(val, rule){
			if (!val) return false;
			var len = val.length;
			if (len != 15 && len != 18) {
				return false;
			}
			// 检测基本格式是否正确
			if (!/^(\d{15})|(\d{17}([0-9xX]))$/.test(val)) {
				return false;
			}
			
			// 根据校验规则检查身份证合法性
			if (len == 18) {
				var total = 0, v = [1,0,'X',9,8,7,6,5,4,3,2], mod, rightCode;
				$.each([7, 9, 10, 5, 8, 4, 2, 1, 6, 3], function(i, v){
					if (i < 7) {
						total += ((parseInt(val.charAt(i), 10) + parseInt(val.charAt(i+10), 10)) * v);
					} else {
						total += (parseInt(val.charAt(i), 10)) * v;
					}
				});
				mod = total % 11;
				rightCode = v[mod] + '';
				if (val.charAt(17).toLowerCase() != rightCode.toLowerCase()) {
					return false;
				}
			}
			
			// 校验地区的合法性
			if (!this.cities) {
				this.cities = {11:'北京',12:'天津',13:'河北',14:'山西',15:'内蒙古',21:'辽宁',22:'吉林',23:'黑龙江 ',31:'上海',32:'江苏',33:'浙江',34:'安徽',35:'福建',36:'江西',37:'山东',41:'河南',42:'湖北 ',43:'湖南',44:'广东',45:'广西',46:'海南',50:'重庆',51:'四川',52:'贵州',53:'云南',54:'西藏 ',61:'陕西',62:'甘肃',63:'青海',64:'宁夏',65:'新疆',71:'台湾',81:'香港',82:'澳门',91:'国外'};
			}
			if (!(val.substr(0, 2) in this.cities)) {
				return false;
			}
			// 检测限制的地区是否正确
			if (rule.province && this.cities[val.substr(0,2)] != rule.province) {
				return false;
			}
			
			// 检查性别
			if (rule.sex) {
				var tag = val.substr(len == 15 ? len -1 : len - 2, 1);
				if (tag % 2 === 0) {
					if (rule.sex != 'female') {
						return false;
					}
				} else {
					if (rule.sex != 'male') {
						return false;
					}
				}
			}
			
			// 检测生日的合法性
			var yearLen = len == 15 ? 2 : 4,
				year = parseInt(len == 2 ? '19' + val.substr(6, yearLen) : val.substr(6, 4), 10),
				month = parseInt(val.substr(6 + yearLen, 2), 10),
				day = parseInt(val.substr(8 + yearLen, 2), 10),
				d = new Date(year, month - 1, day);
				
			if (d.getFullYear() != year || d.getMonth() != month - 1 || d.getDate() != day) {
				return false;
			}
			
			var offDay = parseInt((new Date().getTime() - d.getTime())/(1000*3600*24), 10);
			// 检查最小年龄
			if (!isNaN(rule.minAge)) {
				if (offDay < 365 * rule.minAge) {
					return false;
				}
			}
			// 检查最大年龄
			if (!isNaN(rule.maxAge)) {
				if (offDay > 365 * rule.maxAge) {
					return false;
				}
			}
			return true;
		},
		/**
		 * 验证是否为url链接
		 * @param {Object} val
		 */
		url: function(val) {
			return /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(val);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 	
		},
		/**
		 * 手机号码规则验证
		 * @param {String} val
		 * @param {Object} rule 具有如下参数
		 * <dl>
		 *  <dt>mobile</dt>
		 *  <dd>手机类型，mobile 移动电话 home 座机 400电话 both 移动、座机、400都行，默认为mobile</dd>
		 * </dl>
		 */
		phone: function(val, rule){
			if (undefined === rule.mobile) {
				rule.mobile = 'mobile';
			}
			switch(rule.mobile) {
				case 'mobile':
					return /^1[3|4|5|8|7]\d{9}$/.test(val);
				case 'home':
					return /^\d{3,5}\-\d{7,8}$/.test(val);
				case '400':
					return /^400\d{7}(\d{4,5})?$/.test(val.replace(/[\s\-转]/g, ''));
				case 'both':
					if( /(^1[3|4|5|8|7]\d{9}$)|(^\d{3,5}\-\d{7,8}$)/.test(val) ) {
						return true;
					}else{
						return /^400\d{7}$/.test(val.replace(/[\s\-]/g, ''));
					}
			}
		},
		/**
		 * 比较两个对象的值
		 * @param {String} val
		 * @param {Object} rule
		 *  <dl>
		 * 	<dt>to</dt>
		 *  <dd>要比较对象的id</dd>
		 * </dt>
		 */
		compare: function(val, rule) {
			var cVal = $('#' + rule.to).val();
			if (!rule.condition) {
				rule.condition = '=';
			}
			switch(rule.condition) {
				case '=':
				case 'equal':
					return val == cVal;
				case '!=':
				case '<>':
				case 'notEqual':
					return val != cVal;
				case '>':
				case 'great':
					return val > cVal;
				case '<':
				case 'less':
					return val < cVal;
				case '>=':
				case 'notGreat':
					return val >= cVal;
				case '<=':
				case 'notLess':
					return val <= cVal;
				default:
					throw new Error('verifiable.conditionNotDefined the condition(' + rule.condition + ') is not defined');
			}
		},
		/**
		 * 范围比较
		 * @param {String} val
		 * @param {Object} rule 
		 * <dl>
		 * 	<dt>type:<em>[length|number]</em></dt>
		 *  <dd>类型</dd>
		 *  <dd><em>min</em>:最小值</dd>
		 *  <dd><em>max</em>:最大值</dd>
		 *  </dd>
		 * </dl>
		 */
		range: function(val, rule){
			if (undefined === rule.min) {
				rule.min = Number.MIN_VALUE;
			}
			if (undefined === rule.max) {
				rule.max = Number.MAX_VALUE;
			}
			switch(rule.type) {
				case 'length':
					return val.length <= rule.max && val.length >= rule.min;
				case 'number':
					if(!isNaN(val)){
						return val <= rule.max && val >= rule.min;
					}else{
						return false;
					}
					break;
			}
		},
		/**
		 * 远程校验
		 * @param {Object} val
		 * @param {Object} rule
		 * <dl>
		 * 	<dt>url</dt>
		 *  <dd>远程校验的网址</dd>
		 * 	<dl>type:<em>[POST|GET]</em></dl>
		 *  <dd>方法，默认为POST</dd>
		 * 	<dt>data</dt>
		 *  <dd>提交给服务器端的数据，可以是key1=value1&key2=value2、{key1:value1}、function(){return {key1:value1}}等形式</dd>
		 * 	<dt>dataType:<em>[text|json|html]</dt>
		 *  <dd>数据返回的格式</dd>
		 *  <dt>verify<em>Function</em></dt>
		 *  <dd>函数，用来校验返回数据，如果返回true，说明校验成功，如果返回false，说明校验失败。如果没有这个函数，则返回的数据为true或者'true'时认为成功，其他都为失败</dd>
		 * </dt>
		 */
		remote: function(val, rule) {
			if (undefined === this.cache) {
				this.cache = {};
			}
			if (undefined === this.cache[rule.name]) {
				this.cache[rule.name] = {};
			}
			
			if (undefined === rule.url) {
				throw new Error('verifiable.urlIsRequired the url of the remote rule is not supplied');
			}
			
			var data = rule.data || {value:val};
			if (typeof data == 'function') {
				data = data.call(this, val);
			}
			// 序列化data数据
			var	dataKey = $.param(data),
				callback = function(data){
					var pass = false;
					if (rule.verify) {
						pass = rule.verify.call(rule, data);
					} else {
						pass = (data === true || data == 'true');
					}
					if (pass) {
						rule.success && rule.success.call();
					}
					else {
						rule.failure && rule.failure.call();
					}
				},
				cache = this.cache[rule.name];
				
			if (cache[dataKey]) {
				callback(cache[dataKey]);
			} else {
				// 如果是表单提交的，默认通过
				if (rule.formSubmit) {
					return true;
				}
				$.ajax({
					url: rule.url,
					type: rule.type ? rule.type : 'POST',
					async: undefined !== rule.async ? rule.async : true,
					data: data,
					dataType: rule.dataType ? rule.dataType : 'json',
					success: function(data){
						cache[dataKey] = data;
						
						callback(data);
					},
					error: function(){
						throw new Error('verifiable.remoteCalledFailed method called failed(' + rule.url + ')');
					}
				});
			}
		},
		/**
		 * 日期验证
		 * @param {Object} val
		 * @param {Object} rule
		 * <dl>
		 * 	<dt>min</dt>
		 *  <dd>最小日期。可以是多少s、或者具体的日期，如 6*3600*24，表示离现在至少6天，或者2012-02-24,表示选择的日期不能在这个日期之前</dd>
		 * 	<dl>max</dl>
		 *  <dd>最大日期。和min的格式一样</dd>
		 * </dl>
		 */
		date: function(val, rule) {
			var date = _str2date(val);
			if (!date) {
				return false;
			}
			// 检查最小数
			if (rule.min || rule.max) {
				var now = new Date();
				if (rule.min) {
					if (!isNaN(rule.min)) {
						if ( (date.getTime() - now.getTime())/1000 < rule.min ) {
							return false;
						}
					} else {
						var min = _str2date(rule.min);
						if (!min) {
							throw new Error('verifiable.dateFormatWrong');
						}
						if (date.getTime() < min.getTime()) {
							return false;
						}
					}
				}
				if (rule.max) {
					if (!isNaN(rule.max)) {
						if ( (date.getTime() - now.getTime())/1000 > rule.max ) {
							return false;
						}
					} else {
						var max = _str2date(rule.max);
						if (!max) {
							throw new Error('verifiable.dateFormatWrong');
						}
						if (date.getTime() > max.getTime()) {
							return false;
						}
					}
				}
			}
			return true;
		},
		successMsg:function(){
			return true;
		},
		textLong:function(val,rule){
			if(val.length > rule.length){
				return false;
			}
			return true;
		}
	});
},
VERIFY_KEY = 'verify-rule',
// 设置提示元素
createHinter = function(elem){
	var last;
	if (elem.nodeName == 'INPUT' && (elem.type == 'radio' || elem.type == 'checkbox') && elem.form[elem.name].length) {
		var elems = elem.form[elem.name];
		last = elems[elems.length - 1].nextSibling;
	} else {
		last = elem.nextSibling;
	}
	var d = document, node = d.createElement('span');
	
	while (last && (last.nodeType == 3 || /^(IMG|A|SPAN|EM|LABEL)$/.test(last.nodeName))) {
		last = last.nextSibling;
	}
	
	// 如果之后是文字节点
	if (last && last.nodeType == 3) {
		if (last.nextSibling) {
			elem.parentNode.insertBefore(node, last.nextSibling);
		} else {
			elem.parentNode.appendChild(node);
		}
	} else {
		if (last && last !== elem) {
			elem.parentNode.insertBefore(node, last);
		} else {
			elem.parentNode.appendChild(node);
		}
	}
	return node;
},
_formArray = [],
_formCount = 0,
/**
 * 得到验证表单
 * @param {Object} form
 */
_getVForm = function(form, options) {
	if (!form || form.tagName != 'FORM') {
		return null;
	}
	
	// 检查form是否被验证过，如果验证过，则直接调出之前的
	var verfiedId = form.getAttribute('verfy-id'), vf;
	if (undefined !== verfiedId && verfiedId >= 0) {
		vf = _formArray[verfiedId];
		vf.cleanVerify();
		return vf;
	}
	if (vf) {
		vf.bindSubmit();
		return vf;
	}
	
	if (undefined === options) {
		throw new Error('verifiable.formNotInited');
	}
	
	// 对表单进行验证
	vf = new VerifiableForm(form, options);
	vf.bindSubmit();
	form.setAttribute('verfy-id', _formCount);
	_formArray[_formCount] = vf;
	_formCount++;
	return vf;
}
;

/**
 * 控件可验证化
 * 具体规则详见 {@link jQuery.verifiable.rules}
 * @example
 * <p>This is tutorial content. See {@link Class.create} for OOP info and {@tutorial class-create} tutorial.</p>
 * @namespace jQuery.verifiable
 * @tutorial class-create 你们好爱上对方爱上对方 
 */
$.verifiable = /**@lends jQuery.verifiable */{
	/**
	 * 添加校验规则
	 * @param type
	 * @param verify
	 */
	addRule:function(type, verify) {
		if (type in _vRules) {
			throw new Error('verifiable.ruleExisted the rule named ' + type + ' is exited');
		}
		_vRules[type] = verify;
	},
	/**
	 * 批量添加校验规则
	 * @param {Object} verifies
	 */
	addRules:function(verifies) {
		var self = this;
		$.each(verifies, function(k, v){
			self.addRule(k, v);
 		});
	},
	/**
	 * 验证规则
	 * @param {Mixed} value
	 * @param {String} type
	 * @param {Object} rule
	 * @return {Boolean}
	 */
	verify:function(value, type, rule) {
		if (type in _vRules) {
			if ($.isArray(value)) {
				var pass = true;
				$.each(value, function(k, v){
					if (!_vRules[type](v, rule)) {
						pass = false;
						return false;
					}
				});
				return pass;
			}
			return _vRules[type](value, rule);
		} else {
			throw new Error('verifiable.typeNotDefined the verify type named ' + type + ' is not supported');
		}
	}
};

/**
 * 使表单元素可验证。
 * 
原理
	所有的验证规则都是作为元素的属性来配置的，键为verify-rule，值为Object类型。验证遵循如下几条规则：
	1、单个元素可以设置多条验证规则，验证有先后顺序，只有之前的一条规则通过后，才会进行后面规则的验证。
	2、元素的验证规则是通过绑定事件到元素上来实现验证的，默认会使用blur事件。
	3、hint是一条特殊的验证规则，绑定到元素的hint事件，验证一直会返回true。hint可传入id指定用来提示的元素。
	4、remote是一条特殊的验证规则，需要有jQuery的支持。
	5、表单提交时会验证所有非异步的验证规则，对于异步验证，如果之前有缓存验证结果，直接使用，否则返回true。
	6、可以添加自定义验证规则。
使用
	1、	在表单需要验证的元素里边加入属性verify-rule，值为相关的验证规则。
	2、	对表单元素调用verifiable函数，并传入事件处理函数。
	3、	验证规则有不满足需求时，可以通过hapj.ui.verifiable.addRule方法增加验证规则。
	4、	执行后会返回一个对象，该对象包含一个函数，redo，用来当表单添加了动态内容后需要将其加入验证。
 * @class jQuery.fn.verifiable
 * @param {Object} 相关参数，具体如下：
 * <dl>
 * 	<dt>hint<em>function(type, rule, hinter)</em></dt>
 *  <dd>显示提示信息的事件</dd>
 * 	<dt>success<em>function(type, rule, hinter)</em></dt>
 *  <dd>验证成功的事件</dd>
 * 	<dt>hint<em>function(type, rule, hinter)</em></dt>
 *  <dd>显示提示信息的事件</dd>
 * 	<dt>failure<em>function(type, rule, hinter)</em></dt>
 *  <dd>验证失败的事件</dd>
 *  <dd>
 *  以上三个函数的参数都一样，具体含义如下：<br/>
 *  <em>type</em> 验证规则类型<br/>
 *  	<em>rule</em> 验证规则<br/>
 *  	<em>hinter</em> 提示元素，是一个hapj.ui.node节点</br>
 *  </dd>
 * 	<dt>submit<em>function(e)</em></dt>
 *  <dd>表单验证成功后的提交事件，如果返回值为false，表单不会提交</dd>
 * 	<dt>afterSubmit<em>function()</em></dt>
 *  <dd>表单处理完毕之后的事件处理函数</dd>
 * </dl>
 * @return {Object}
 * <dl>
 * 	<dt>redo:<em>function()</em></dt>
 *  <dd>用来将表单动态的动态内容也加入验证。举例如下：</dd>
 * 	<dt>error:<em>function(name, msg)</em></dt>
 *  <dd>用来提示指定的错误信息。<br/>
 *  	<em>name</em> 表单元素的name<br/>
 *      <em>msg</em> 提示的信息<br/>
 *  </dd>
 * </dl>
 * @example 
 * 
 * ## html code
&lt;form id="formAdd" method="post"&gt;
	&lt;input type="text" name="data[username]" verify-rule="{
		required:{
			msg:'username is required.'
		},
		remote: {
			url: '/user/username-is-exist',
			data:'username={$value}',
			msg:'username is existed.',
	}"/&gt;
	&lt;input type="email" name="data[email]" verify-rule="{
		email:{
			msg:'email format is wrong.'
		}
	}"/&gt;
&lt;/form&gt;
 * 
 * ## js code
hapj(function(H){
	$('#formAdd').verifiable();
 });
 */
$.fn.verifiable = function(options){
	if (this.length < 1) {
		return;
	}
	options = options || {};
	
	options = $.extend({
		success:null,
		failure:null,
		hint:null
	}, options);
	
	this.each(function(k, v){
		var vf = _getVForm(v, options);
		if (vf) {
			vf.initElements();
		}
	});
	_init();
	
	var self = this;
	return {
		/**
		 * 重做验证。当加入了新的验证规则时需要进行此项
		 * @ignore
		 */
		redo: function(){
			$.each(self, function(k, v){
				var vf = _getVForm(v);
				if (vf) {
					vf.initElements();
				}
			});
		},
		/**
		 * 显示错误信息。
		 * @ignore
		 * @param {Object} name 对应的表单元素的name
		 * @param {Object} msg  显示的内容
		 */
		error: function(name, msg) {
			$.each(self, function(k, v) {
				var vf = _getVForm(v);
				if (vf && vf.elemAttrs[name]) {
					var attr = vf.elemAttrs[name];
					attr.hinter.css('display', '').html(msg);
					if (options.failure) {
						options.failure.call(attr.elem, 'custom', null, attr.hinter);
					}
					attr.status = 'custom';
				}
			});
		}
	};
};

/**
 * 表单验证的主要逻辑
 * @param {Object} form
 * @param {Object} options
 */
function VerifiableForm(form, options) {
	this.form = form;
	this.options = options;
	this.elemAttrs = {};
	this.verifyFuncs = {};
}
VerifiableForm.prototype = {
	options: null,
	errNum:0,//判断是否为表单中第一个报错，
	errElemId :'',
	/**
	 * 进行验证
	 * @param {HtmlElement} elem
	 * @param {String} type
	 * @param {Object} rule
	 * @param {Boolean} required 是否必填
	 */

	doVerify: function(elem, type, rule, required) {
		var self = this,
		name = elem.name,
		inputType = elem.type,
		inputDisplay = elem.style.display,
		attr = this.elemAttrs[name],
		ret = null,
		status = attr.status,
		failure,
		success,
		options = this.options,
		elemValue = getValue(elem);
		
		if (!required && !elemValue) {
			return;
		}
		// 如果已经是错误状态，则不继续验证
		if (status && status != 'hint' && status != type) {
			return;
		}
		
		failure = function(){
			if(!self.errElemId || attr.hinter.attr('id') != self.errElemId){
				if(attr.hinter.attr('id')){
					self.errElemId = attr.hinter.attr('id');
				}
				attr.hinter.css('display', '').html(rule.msg);
			}
			if(self.errNum === 0 && inputType!='hidden' && inputDisplay != 'none'){
				elem.focus();//焦点到第一个报错的elem	
				attr.hinter.css('display', '');
				self.errNum++;
			}
			if(!elem.className || elem.className.indexOf === -1){
				elem.className = elem.className +' err';
			}
			options.failure && options.failure.call(elem, type, rule, attr.hinter);
			attr.status = type;
		};
		
		success = function() {
			// 如果是下拉框，则不显示成功提示
			if (elem.nodeName == 'SELECT' || rule.successMsg) {
				attr.hinter.hide();
			} else {
				attr.hinter.css('display', '').html('');
			}
			if(elem.className.indexOf !== -1){
				elem.className = elem.className.replace('err','');
			}
			options.success && options.success.call(elem, type, rule, attr.hinter);
		};
		if (true === rule.async) {
			rule.success = success;
			rule.failure = function(){
				failure.call();
			};
			$.verifiable.verify(elemValue, type, rule);
		} else {
			ret = $.verifiable.verify(elemValue, type, rule);
			if (true === ret) {
				success();
			} else if (false === ret) {
				failure();	
			}
		}
		
		// 如果不是通过form进行的验证，则会调用trigger触发其他验证
		if (!rule.formSubmit && rule.trigger && rule.trigger in this.verifyFuncs) {
			this.verifyFuncs[rule.trigger].func.call();
		}
		
		return ret;
	},
	/**
	 * 处理提示规则
	 * @param {HtmlElement} el
	 * @param {Object} rules
	 */
	_handlerHintRule:function(el, rules) {
		// 处理hinter
		if (!('hint' in rules)) {
			rules.hint = {msg:''};
		}
		if (typeof rules.hint == 'string') {
			rules.hint = {msg: rules.hint};
		} 
		var self = this,
			name = el.name, attr = {
			hintMsg:rules.hint.msg,
			hinter: rules.hint.id ? $('#' + rules.hint.id) : $(createHinter(el)),
			status:'',
			hint:function(){
				if (this.hintMsg) {
					this.hinter.css('display','').html(this.hintMsg);
				} else {
					this.hinter.hide();
				}
				this.status = 'hint';
				self.options.hint && self.options.hint.call(el, 'hint', rules.hint, this.hinter);
			}
		};
		this.elemAttrs[name] = attr;
		
		delete rules.hint;
		attr.hint();
		$(el).on('focus', function(){
			attr.hint();
		});
	},
	/**
	 * 处理其他规则
	 * @param {Object} el
	 * @param {Object} rules
	 */
	_handlerRules: function(el, rules) {
		var required = 'required' in rules, self = this,
		__func = function(el, type, rule, required){
			return function(e) {
				if (self.formSubmit && e.target.nodeName != 'FORM') {
					return;
				}
				rule.formSubmit = self.formSubmit;
				return self.doVerify.call(self, el, type, rule, required);}
			;
		};
		for(var type in rules) {
			var rule = rules[type], name = (this.verifyCount++);
			if (typeof rule == 'string') {
				rule = {msg: rule};
			}
			
			// 设置异步请求状态
			if (type == 'remote' && undefined === rule.async) {
				rule.async = true;
			}
			
			if (!rule.event) {
				rule.event = 'blur';
			} 
			if(type == 'successMsg' && rules.successMsg == 'hide'){
				rule.successMsg = true;
			}
			var func = __func(el, type, rule, required);
			
			if (rule.name && isNaN(rule.name)) {
				name = rule.name;
			}
			this.verifyFuncs[name] = {
				'elem': el,
				'func': func
			};
			// 修改规则的名称
			rule.name = name;
			
			if ($.isArray(rule.event)) {
				for(var i = 0, l = rule.event.length; i < l; i++) {
					$(el).on(this, func);
				}
			} else {
				$(el).on(rule.event, func);
			}
		}
	},
	/**
	 * 初始化表单元素的验证规则
	 * @update 修改以name作为唯一验证标识，将验证标识加在每一个控件中。这样做的好处是，即便添加一个和已存在name相同的控件，新控件的验证规则也会及时生效
	 */
	initElements: function(){
		// 必须有name才予以验证
		for(var i = 0, l = this.form.elements.length, el, ruleStr; i < l; i++) {
			if ( !(el = this.form.elements[i]).name  // 必须要有name属性
			|| !(ruleStr = el.getAttribute(VERIFY_KEY)) //必须要有验证规则
			|| !$.trim(ruleStr) // 验证规则不为空
//			|| el.name in this.elemAttrs // 如果已经有过，就不再继续验证
			|| el.tmp //判断当前控件验证是否已经存在，如果存在就不再继续验证
			) {
				continue;
			}
			el.tmp = true; //如果当前控件验证不存在则添加
			var name = el.name, rules;
			try {
				/* jshint ignore:start */
				rules = 
					eval('(' + ruleStr + ')');
				/* jshint ignore:end */
			} catch(e) {
				throw new Error(e.message);
			}
			if(/rr/.test(name)){
				rules.textLong = this.options.textLong;
			}	
			this._handlerHintRule(el, rules);
			
			this._handlerRules(el, rules);
		}
	},
	/**
	 * 清理无用的验证
	 */
	cleanVerify: function() {
		var self = this;
		$.each(this.verifyFuncs, function(k, v){
			if (!v.elem.form) {
				delete self.verifyFuncs[k];
				delete self.elemAttrs[k];
			}
		});
	},
	/**
	 * 绑定提交事件
	 */
	bindSubmit: function() {
		var self = this;
		//先将无用验证规则清楚
		// 提交表单时进行验证
		$(this.form).on('submit', function(e){
			this._last_click_time = new Date();
			
			self.cleanVerify();
			self.errNum = 0;
			var pass = true;
			self.formSubmit = true;
			var ret;
			for(var i in self.verifyFuncs) {
				ret = self.verifyFuncs[i].func.call(self, e);
				if (ret === false) {
					pass = false;
				}
			}
			self.formSubmit = false;
			self.options._submited_ = true; // 已经被提交
			if (pass) {
				ret = true;
				if (self.options.submit) {
					ret = self.options.submit.call(this, e, self.options);
				}
				return ret !== false;
			}
			return false;
		});
	},
	verifyCount: 0,
	formSubmit: false
};
//
//(function(){
//	// 支持hapj.com
//	var verifiableCfg, tmpId, tmpOptions;
//	jQuery.verifiable = {
//		init:function(options) {
//			verifiableCfg = options;
//		},
//		/**
//		 * 激活表单验证
//		 * @param {Object} id 元素id
//		 * @param {Object} handlers 处理函数
//		 */
//		active:function(id, handlers) {
//			var configs = {};
//			$.extend(configs, verifiableCfg);
//			$.extend(configs, handlers);
//			tmpId = typeof id == 'string' ? $('#' + id) : $(id);
//			tmpOptions = $.extend({}, verifiableCfg);
//			
//			return tmpId.verifiable(configs);
//		},
//		addRule: verifyRules.addRule,
//		/**
//		 * 动态验证，当有元素通过动态方式加入表单后，需要执行一下该方法，以便将动态内容的验证加入进来
//		 */
//		dynamic: function(){
//			tmpId.verifiable(tmpOptions);
//		},
//		/**
//		 * 直接对内容进行验证
//		 * @param {Object} type 类型
//		 * @param {Object} val 值
//		 * @param {Object} options 规则
//		 */
//		doVerify: function(type, val, options) {
//			_init();
//			if (! (type in _vRules) ) {
//				throw new Error('verifialbe.typeNotSupported type=' + type);
//			}
//			return _vRules[type].call(null, val, options);
//		}
//	};
//})();
}(jQuery);
