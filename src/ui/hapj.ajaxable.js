/** 
 * Copyright (c) 2012, Jiehun.com.cn Inc. All Rights Reserved
 * @author dengxiaolong@jiehun.com.cn
 * @date 2012-02-16
 * @version 1.0 
 * @description 用来实现各种元素的异步化请求
 * @namespace jQuery.fn.ajaxable
 **/
!function($){
	"use strict";
	
var _d = decodeURIComponent;
function getKeyValue(from, kvTag, key) {
	var arr = from.split('&'), i, l, ret = {};
	for(i = 0, l = arr.length; i < l; i++ ) {
		var tmp = arr[i].split(kvTag), k = _d($.trim(tmp[0]));
		if (!k) continue;
		if (k in ret) {
			if (!$.isArray(ret[k])) {
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
var submitHandler = function(form, options) {
	if (typeof options.beforeSubmit == 'function') {
		options.beforeSubmit.call(form);
	}
	
	if (options.confirm) {
		switch(typeof options.confirm) {
			case 'string':
				if (window.confirm(options.confirm) === false) {
					return false;
				}
				break;
			case 'function':
				var ret = options.confirm.call(form);
				if (ret === false) {
					return false;
				}else if(typeof ret == 'string'){
					if (window.confirm(ret) === false) {
						return false;
					}
				}
				break;
			default:
				break;
		}
	}
	var action = options.action || form.action || document.URL,
	data = $.param($(form));
	
	if (options.pack) {
		options.pack.call(null, data);
	}
	
    $.ajax({
        type: form.method ? form.method : 'POST',
        url: action,
        dataType: 'json',
        data: data,
        success: function(data){
			if (typeof options.afterSubmit == 'function') {
				options.afterSubmit.call(form);
			}
            successHandler.call(form, data, options);
        }
    });
},
successHandler = function(data, options) {
	if (!data.err || data.err.indexOf('.ok') >= 0) {
        options.ok && options.ok.call(this, data.data);
    } else {
    	options.error && options.error.call(this, data.err);
    }
},
/**
 * 发一个ajax请求
 * @param {Object} elem
 * @param {Object} options
 */
ajaxPost = function(elem, options) {
	var href = options.href || elem.href;
	var func = function(){
		if (typeof href == 'function') {
			href = href.call(elem);
		}
		$.ajax({
			url: href,
			type: 'POST',
			dataType: 'json',
			success: function(data){
				successHandler.call(elem, data, options);
			}
		});
	};
	
	var cfStr = options.confirm ? options.confirm : (elem.getAttribute('confirm') ? elem.getAttribute('confirm') : '');
	if (typeof cfStr == 'function') {
		if(cfStr.call(elem) === false){
			return false;
		}
		cfStr = cfStr.call(elem);
	}
	if (cfStr) {
		if (window.confirm(cfStr)) {
			func(elem, options);
		}
	} else {
		func(elem, options);
	}
};

var ajaxable = /**
	@lends jQuery.fn.ajaxable 
	@private
*/{
	/**
	 * 确认的回调函数
	 * @memberof jQuery.fn.ajaxable
	 * @private
	 * @callback ~okCallback
	 * @param {Object} data JSON数据
	 */
	
	/**
	 * 错误的回调函数
	 * @memberof jQuery.fn.ajaxable
	 * @private
	 * @callback ~errorCallback
	 * @param {String} code 错误状态
	 * @param {String} desc 错误详细描述
	 */
	
	/**
	 * 封装数据的回调函数
	 * @memberof jQuery.fn.ajaxable
	 * @private
	 * @callback ~packCallback
	 * @param {{string:string}} options 表单元素构建的键值对
	 */
	
	/**
	 * 提交前的回调函数
	 * @memberof jQuery.fn.ajaxable
	 * @private
	 * @callback ~submitCallback
	 * @param {Event} e
	 * @param {jQuery.fn.ajaxable.formOptions} options 配置参数
	 */
	
	/**
	 * ajaxable初始化表单的选项
	 * @memberof jQuery.fn.ajaxable
	 * @private
	 * @typedef .formOptions
	 * @property {jQuery.fn.ajaxable~okCallback} ok 表单提交成功时调用的函数。
	 * @property {jQuery.fn.ajaxable~errorCallback} error 表单提交失败是调用的函数。
	 * @property {jQuery.fn.ajaxable~packCallback} pack 提交数据前对表单的数据进行整理和封装。
	 * @property {(string|function)} confirm 确认字符串。
	 * @property {jQuery.fn.ajaxable~submitCallback} beforeSubmit 在提交之前进行的处理
	 */
		
	/**
	 * 表单的异步请求也非常多，在我们的体系下，所有的请求都是基于ajax请求发出的。这里我们有一些假设的前提：
	<ol>
	<li>数据都是以json格式返回来。</li>
	<li>数据返回的是一个对象。有err和data两个键。</li>
	<li>如果err为空或者err中包含ok字符串，认为这个表单提交动作是成功的，否则为失败。</li>
	</ol>
	 * @private
	 * @param {jQuery.fn.ajaxable.formOptions} options 默认可以不传入任何值。具有如下参数：
	 * @example 
&lt;form method="post" action="/static/test/cities.html" id="formAdd"&gt;
	&lt;input type="hidden" name="username" value="hello"/&gt;
	&lt;input type="password" name="pwd" value="pass"/&gt;
	&lt;input type="submit" value="submit"/&gt;
&lt;/form&gt;
&lt;script&gt;
$('#formAdd').ajaxable({
	ok:function() {
		
	}
});
&lt;/script&gt;
	*/
	ajaxForm: function(form, options) {
		options = options || {};
		if (!options._submited_) {
			$(form).submit(('beforeSubmit' in options) ? function(e){
				options._submited_ = true; // 已经被提交了
				return options.beforeSubmit.call(form, e, options);
			} : function() {
				options._submited_ = true;
				submitHandler(form, options); // 已经被提交了
				return false;
			});
		} else {
			submitHandler(form, options);
		}
	},
	
	/**
	 * 图片ajaxable初始化参数
	 * @memberof jQuery.fn.ajaxable
	 * @private
	 * @typedef imageOptions
	 * @property {boolean} [cache=false] 是否缓存
	 * @property {string} [timeKey=t] 用来表示时间的key
	 */
	
	/**
	 * 实现图片的异步化加载
	 * @private
	 * @param {jQuery.fn.ajaxable.imageOptions} options 选项
	 * @example 这部分最典型的应用场景就是解决图片验证码的更新问题。
&lt;img id="vCode" src="/util/vcode.jpg"/&gt;&lt;a href="" id="refreshVCode"&gt;Refresh&lt;a&gt;
&lt;script&gt;
var vCode = $('#vCode');
$('#refreshVCode').click(function() {
	vCode.ajaxable();
});
&lt;/script&gt;
	 */
	ajaxImg: function(img, options) {
		var o = {
			cache:false,
			timeKey:'t'
		};
		$.extend(o, options);
		var src = img.src;
		
		if (!o.cache) {
			var pos = src.indexOf('?'), 
				params = pos >= 0 ? getKeyValue(src.substr(pos + 1)) : {};
			if (o.timeKey in params) {
				$.each(params, function(i){
					if (i == o.timeKey) {
						params[i] = new Date().getTime();
					}
				});
				src = (pos > 0 ? src.substr(0, pos) + '?' : src) + $.params(params);
			} else {
				src = src + (pos > 0 ? '&' : '?') + o.timeKey + '=' + new Date().getTime();
			}
			img.src = src;
		} else {
			img.src = '';
			img.src = src;
		}
	},
	/**
	 * 下拉框ajaxable初始化参数
	 * @memberof jQuery.fn.ajaxable
	 * @typedef selectOptions
	 * @private
	 * @property {string} [url] 切换下拉框选项后，需要访问的url。<br/>
	 * 可以传入一个变量{value}，异步请求时会将其替换为下拉框当前选中的值。另外，也可以直接给下拉框顶一个属性ajax-url来定义异步请求的url。
	 * @property {string} [dataType=json] 返回返回数据的格式，默认为json
	 * @property {HTMLElement} [target] 返回数据后用来处理数据的对象，默认会使用当前对象的下一个DOM节点。
	 * @property {jQuery.fn.ajaxable~packCallback} [pack] 对返回数据进行处理的函数。
	 * @property {jQuery.fn.ajaxable~successCallback} [success] 将返回数据进行处理的函数。默认已经有一个处理函数，其逻辑如下：<br/>
	 * 如果返回数据被处理成[{name:'name1', value:'value1']}的形式，并且dataType为json格式，target也是一个下拉框，那么会将数据自动加载到target作为选项；<br/>
	 * 如果dataType为html，会自动将target的innerHTML设置为返回的数据。
	 * @property {jQuery.fn.ajaxable~okCallback} [ok] 表单提交成功时调用的函数。
	 * @property {jQuery.fn.ajaxable~errorCallback} [error] 表单提交失败是调用的函数。
	 */
	
	/**
	 * ajax化一个select控件
	 * @param {jQuery.fn.ajaxable.selectOptions} options 默认可以不传入任何值。
	 * @private
	 * @example
&lt;select id="selCity" ajax-url="/static/test/cities.html?pid={value}"&gt;
	&lt;option value="110000"&gt;北京市&lt;/option&gt;
	&lt;option value="210000"&gt;上海市&lt;/option&gt;
&lt;/select&gt;&lt;select name="city_id"&gt;&lt;/select&gt;
&lt;script&gt;
	$('#cities').ajaxable({
		pack: function(data) {
			var ret = [];
			$.each(data.cities, function(id) {
				ret.push({name:data.cities[id], value:id});
			};
			return ret;
		}
	});
&lt;/script&gt;

	 */
	ajaxSelect: function(select, options) {
		var o = {
			url:select.getAttribute('ajax-url'), 
			dataType:'json',
			pack: null,
			type: 'get',
			success: function(ret){
				if (o.dataType == 'json' && o.target && o.target.nodeName == 'SELECT') {
					var target = o.target;
					if (ret.data) {
						var data = ret.data;
						if (typeof o.pack == 'function') {
							data = o.pack(data);
						}
						target.options.length = 0;
						$.each(data, function(k, v){
							if(!!this.selected){
								target.options[target.options.length] = new Option(v.name, v.value, v.selected);
							}else{
								target.options[target.options.length] = new Option(v.name, v.value);
							}
						})
					}
				} else {
					if (o.dataType == 'html' && o.target) {
						$(o.target).html(ret);
					}
				}
				successHandler.call(select, ret, options);
			}
		};
		$.extend(o, options);
		if (!o.target) {
			o.target = $(select).next('select')[0];
		}
		var fn = function(){
			$.ajax({
				url: o.url.replace('{value}', select.value),
				type: o.type,
				dataType: o.dataType,
				success: o.success
			});
		};
		$(select).on('change', fn);
		if (select.value && select.value > 0) {
			fn();
		}
	},
	/**
	 * 面板ajaxable初始化参数
	 * @memberof jQuery.fn.ajaxable
	 * @typedef panelOptions
	 * @private
	 * @property {string} [area] 需要使链接ajax化区域的选择器。默认使用div.pager，用来针对分页区域。
	 * @property {string} [dataType=html] 返回返回数据的格式，默认为html
	 * @property {function(html:string)} [success] 返回数据后的处理函数。默认为更新整个面板的内容。
	 */
	
	/**
	 * ajax化一个面板
	 * @param {jQuery.fn.ajaxable.panelOptions} options
	 * @private
	 * @example 
&lt;div id="cityList"&gt;
	&lt;div class="pager"&gt;
		&lt;ul&gt;
			&lt;li&gt;&lt;a href="/static/test/cities.html?page=1"&gt;1&lt;/a&gt;&lt;/li&gt;
			&lt;li&gt;&lt;a href="/static/test/cities.html?page=2"&gt;2&lt;/a&gt;&lt;/li&gt;
		&lt;/ul&gt;
	&lt;/div&gt;
&lt;/div&gt;
&lt;script&gt;
	$('#cityList').ajaxable();
&lt;/script&gt;
	 */
	ajaxPanel: function(pnl, options) {
		var o = {area:'div.pager', dataType:'html', succss: function(html){
			$(pnl).html(html);
		}};
		$.extend(o, options);
		$(pnl).on('click', function(e, t) {
			if ((t = e.target).nodeName != 'A' || (o.area && !$(t).parents(o.area).length)) {
				return;
			}
			$.ajax({
				url:t.href,
				type:'GET',
				dataType: o.dataType,
				success: o.succss
			});
			return false;
		});
	},
	/**
	 * 表格ajaxable初始化参数
	 * @memberof jQuery.fn.ajaxable
	 * @private
	 * @typedef tableOptions
	 * @property {(string|function)} [href] 动态获取连接的href，如果不指定，则使用链接自己的href。可以是字符串或函数。如果是函数，当前指针指向对应的元素。
	 * @property {jQuery.fn.ajaxable~okCallback} 表单提交成功时调用的函数。
	 * @property {jQuery.fn.ajaxable~errorCallback} 表单提交失败是调用的函数。
	 * @property {(string|function)} confirm 确认字符串，当要执行之前会调用弹出确认框，用户确认了才继续执行。<br/>
	 * 如果confirm是函数，则会将当前点击的元素作为this指针执行此confirm函数并执行，将返回的结果作为确认字符串。另外，该确认字符串可以通过元素设定confirm属性来设置。
	 * @property {RegExp} [rule] 链接的url规则，必须是正则表达式，当链接符合此表达式，才会执行ajax异步请求。默认规则为：/\/_[^\/]\w+($|\?.*)/ 
	 */
	
	/**
	 * 表格的异步请求
	 * 因为所有对数据的修改都是需要用到post方法的，有些操作是通过链接去执行，这就要求我们将链接转化为post请求，最终完成这个操作。表格的异步请求处理流程是：如果点击了链接，链接的href最后一个斜杠后面的字符串如果是以_开始的，那么这个请求就会转化为一个POST的ajax请求。
	 * @private
	 * @param {jQuery.fn.ajaxable.tableOptions} options 默认可以不传入任何值。具有如下参数：
	 * @example 
如果有一块区域的链接需要进行同样的异步请求，但是这个区域不是用table来构造的，那么，可以通过如下的方法直接对其他类型的DOM节点（如div）进行异步请求处理。

&lt;table id="cateList"&gt;
	&lt;thead&gt;
		&lt;tr&gt;
			&lt;th&gt;ID&lt;/th&gt;
			&lt;th&gt;名称&lt;/th&gt;
			&lt;th&gt;英文名称&lt;/th&gt;
			&lt;th&gt;是否使用&lt;/th&gt;
			&lt;th&gt;操作&lt;/th&gt;
			&lt;/tr&gt;
		&lt;/thead&gt;
	&lt;tbody&gt;
…
&lt;script&gt;
	$('#cateList').ajaxable({
		ok: function(data) {
			location.reload();
		},
		confirm: function(){
			if (this.className == 'del') {
				return '你确定要删除吗？'；
			} else {
				return '你确定要设为禁用吗？';
			}
		}
	});
 &lt;/script&gt;

	 */
	ajaxTable: function(table, options) {
		var rule = options.rule ? options.rule : '';
		if (rule.constructor !== RegExp) {
			rule = /\/_[^\/]\w+($|\/?\?.*)/;
		}
		$(table).on('click', function(e, t) {
			if ( (t= e.target).nodeName != 'A' || !rule.test(t.href)) {
				return;
			}
			ajaxPost(t, options);
			
			return false;
		});
	},
	/**
	 * 链接ajaxable初始化参数
	 * @memberof jQuery.fn.ajaxable
	 * @private
	 * @typedef linkOptions
	 * @property {(string|function)} [href] 动态获取连接的href，如果不指定，则使用链接自己的href。可以是字符串或函数。如果是函数，当前指针指向对应的元素。
	 * @property {jQuery.fn.ajaxable~okCallback} 表单提交成功时调用的函数。
	 * @property {jQuery.fn.ajaxable~errorCallback} 表单提交失败是调用的函数。
	 * @property {(string|function)} confirm 确认字符串，当要执行之前会调用弹出确认框，用户确认了才继续执行。<br/>
	 * 如果confirm是函数，则会将当前点击的元素作为this指针执行此confirm函数并执行，将返回的结果作为确认字符串。另外，该确认字符串可以通过元素设定confirm属性来设置。
	 */
	
	/**
	 * ajax化一个链接
	 * 有一些单独出来的链接也是需要异步化成post请求提交的。因此单独链接也提供了ajaxable的方法，不同的是，这里不会对链接的格式进行检查。
	 * @private
	 * @param {jQuery.fn.ajaxable.linkOptions} options 默认可以不传入任何值。具有如下参数：
	 * @example 
也可以通过如下的方法直接对一个链接进行异步请求处理。

&lt;a href="/unlock" id="linkPost"&gt;解除绑定&lt;/a&gt;
&lt;script&gt;
	$('#linkPost').ajaxable({
		ok: function(data) {
			location.reload();
		}
	});
 &lt;/script&gt;
	 */
	ajaxLink: function(link, options) {
		$(link).on('click', function(){
			ajaxPost(this, options);
			return false;
		});
	}
};

/**
 * @description 使元素支持异步化操作 {@link jQuery.fn.ajaxable}
 * @memberof jQuery
 * @function #ajaxable
 * @param {Object} options
 */

/**
 * 初始化函数<br/>
 * 让元素支持一些异步请求的操作。由于async这个单词比较生僻，故使用ajax来替代。目前支持四种方式的异步请求方式。分别为：图片、表单、下拉框、表格、面板。
 * @memberof jQuery.fn.ajaxable
 * @function ~new
 * @param {Object} options 选项
 * @example
 * 支持如下几种元素的ajaxable：
 * 1、{@link jQuery.fn.ajaxable.ajaxImg|图片(img)}
 * 2、{@link jQuery.fn.ajaxable.ajaxForm|表单(form)}
 * 3、{@link jQuery.fn.ajaxable.ajaxSelect|下拉框(select)}
 * 4、{@link jQuery.fn.ajaxable.ajaxTable|表格(table)}
 * 5、{@link jQuery.fn.ajaxable.ajaxPanel|面板(div)}
 * 6、{@link jQuery.fn.ajaxable.ajaxLink|链接(a)}
 * 针对各种元素的使用方法参见<a href="./hapj.ui.ajaxable.html">详细</a>
 */
$.fn.ajaxable = function(options) {
	options = options || {};
	this.each(function(k, v) {
		switch(v.tagName) {
			case 'FORM':
				ajaxable.ajaxForm(v, options);
				break;
			case 'IMG':
				ajaxable.ajaxImg(v, options);
				break;
			case 'SELECT':
				ajaxable.ajaxSelect(v, options);
				break;
			case 'TABLE':
				ajaxable.ajaxTable(v, options);
				break;
			case 'A':
				ajaxable.ajaxLink(v, options);
				break;
			default:
				ajaxable.ajaxPanel(v, options);
				break;
		}
	});
	return this;
};

}(jQuery);