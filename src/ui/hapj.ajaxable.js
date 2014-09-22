/** 
 * Copyright (c) 2012, Jiehun.com.cn Inc. All Rights Reserved
 * @author dengxiaolong@jiehun.com.cn
 * @date 2012-02-16
 * @version 1.0 
 * @description 用来实现各种元素的异步化请求
 **/
!function($, H){
	"use strict";
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
	data = H.ui(form).param();
	
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

/**
 * @class hapj.ui.ajaxable
 * @description 实现元素的异步化请求
 */
H.ui.ajaxable = /** @lends hapj.ui.ajaxable*/{
		/**
		 * 表单的异步请求也非常多，在我们的体系下，所有的请求都是基于ajax请求发出的。这里我们有一些假设的前提：
		<ol>
		<li>数据都是以json格式返回来。</li>
		<li>数据返回的是一个对象。有err和data两个键。</li>
		<li>如果err为空或者err中包含ok字符串，认为这个表单提交动作是成功的，否则为失败。</li>
		</ol>
		 * @param {HtmlElement} table
		 * @param {Object} options 默认可以不传入任何值。具有如下参数：
		 * <h4>函数</h4>
		 * <dl>
		 *  <dt>pack:<em>function(options)</em></dt>
		 *  <dd>提交数据前对表单的数据进行整理和封装。默认已经对type=password的表单项进行了md5加密，没有特殊要求都可以不适用此函数。</dd>
		 *  <dt>ok:<em>function(data)</em></dt>
		 *  <dd>表单提交成功时调用的函数。</dd>
		 *  <dt>error:<em>function(code, desc)</em></dt>
		 *  <dd>表单提交失败是调用的函数。</dd>
		 *  <dt>confirm:<em>string | function</em></dt>
		 *  <dd>确认字符串。如果是字符串，会弹出提示框让用户确认，用户确认后才会继续后面的操作。如果是函数，返回为false时，就不会继续后面的操作。</dd>
		 * </dl>
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
			var f = H.hook.get('form.submit');
			H.ui.on(form, 'submit', f ? function(e){
				options._submited_ = true; // 已经被提交了
				return f.call(form, e, options);
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
	 * 实现图片的异步化加载
	 * @param {HtmlElement} img
	 * @param {Object} options 选项
	 * <dl>
	 *  <dt>cache</dt>
	 *  <dd>是否缓存，默认为false</dd>
	 *  <dt>timeKey</dt>
	 *  <dd>用来表示时间的key，默认为t</dd>
	 * </dl>
	 * @example 这部分最典型的应用场景就是解决图片验证码的更新问题。
&lt;img id="vCode" src="http://192.168.0.249:8041/util/vcode?_vkey=b514eddd24826b3da30a08a6fa80f3a5"/&gt;&lt;a href="" id="refreshVCode"&gt;Refresh&lt;a&gt;
&lt;script&gt;
var vCode = $('#vCode');
$('#refreshVCode').click(function() {
	vCode.ajaxable();
	// or hapj.ui.ajaxable.ajaxImg(hapj.ui._id('vCode'));
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
				params = pos >= 0 ? H.lib.serial.getPair(src.substr(pos + 1)) : {};
			if (o.timeKey in params) {
				$.each(params, function(i){
					if (i == o.timeKey) {
						params[i] = new Date().getTime();
					}
				});
				src = (pos > 0 ? src.substr(0, pos) + '?' : src) + H.lib.serial.toString(params, 'pair');
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
	 * ajax化一个select控件
	 * @param {HtmlElement} select
	 * @param {Object} options 默认可以不传入任何值。具有如下参数：
	 * <dl>
	 *  <dt>url</dt>
	 *  <dd>切换下拉框选项后，需要访问的url。可以传入一个变量{value}，异步请求时会将其替换为下拉框当前选中的值。另外，也可以直接给下拉框顶一个属性ajax-url来定义异步请求的url。</dd>
	 *  <dt>dataType</dt>
	 *  <dd>返回数据的格式，默认为json</dd>
	 *  <dt>target</dt>
	 *  <dd>返回数据后用来处理数据的对象，默认会使用当前对象的下一个DOM节点。</dd>
	 *  <dt>pack</dt>
	 *  <dd>对返回数据进行处理的函数。</dd>
	 *  <dt>success</dt>
	 *  <dd>将返回数据进行处理的函数。默认已经有一个处理函数，其逻辑如下：<br/>
如果返回数据被处理成[{name:’name1’, value:’value1’]}的形式，并且dataType为json格式，target也是一个下拉框，那么会将数据自动加载到target作为选项；如果dataType为html，会自动将target的innerHTML设置为返回的数据。</dd>
	 *  <dt>ok:<em>function(data)</em></dt>
	 *  <dd>表单提交成功时调用的函数。</dd>
	 *  <dt>error:<em>function(code, desc)</em></dt>
	 *  <dd>表单提交失败是调用的函数。</dd>
	 * </dl>
	 * @example
&lt;select id="selCity" ajax-url="/static/test/cities.html?pid={value}"&gt;
	&lt;option value="110000"&gt;北京市&lt;/option&gt;
	&lt;option value="210000"&gt;上海市&lt;/option&gt;
&lt;/select&gt;&lt;select name="city_id"&gt;&lt;/select&gt;
&lt;script&gt;
	$('#cities').ajaxable({
		pack: function(data) {
			var ret = [];
			hapj.each(data.cities, function(id) {
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
						H.each(data, function(k, v){
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
	 * ajax化一个面板
	 * @param {HtmlElement} pnl
	 * @param {Object} options
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
	 * 表格的异步请求
	 * 因为所有对数据的修改都是需要用到post方法的，有些操作是通过链接去执行，这就要求我们将链接转化为post请求，最终完成这个操作。表格的异步请求处理流程是：如果点击了链接，链接的href最后一个斜杠后面的字符串如果是以_开始的，那么这个请求就会转化为一个POST的ajax请求。
	 * @param {HTMLElement} table
	 * @param {Object} options 默认可以不传入任何值。具有如下参数：
	 * <dl>
	 *  <dt>href:<em>string | function</em></dt>
	 *  <dd>动态获取连接的href，如果不指定，则使用链接自己的href。可以是字符串或函数。如果是函数，当前指针指向对应的元素。</dd>
	 *  <dt>ok:<em>function(data)</em></dt>
	 *  <dd>表单提交成功时调用的函数。</dd>
	 *  <dt>error:<em>function(code, desc)</em></dt>
	 *  <dd>表单提交失败是调用的函数。</dd>
	 *  <dt>confirm:<em>String | Function</em></dt>
	 *  <dd>确认字符串，当要执行之前会调用弹出确认框，用户确认了才继续执行。如果confirm是函数，则会将当前点击的元素作为this指针执行此confirm函数并执行，将返回的结果作为确认字符串。另外，该确认字符串可以通过元素设定confirm属性来设置。</dd>
	 *  <dt>rule:<em>RegExp</em></dt>
	 *  <dd>链接的url规则，必须是正则表达式，当链接符合此表达式，才会执行ajax异步请求。默认规则为：/\/_[^\/]\w+($|\?.*)/ 。</dd>
	 * </dl>
	 * @example 
如果有一块区域的链接需要进行同样的异步请求，但是这个区域不是用table来构造的，那么，可以通过如下的方法直接对其他类型的DOM节点（如div）进行异步请求处理。
hapj.ui.ajaxable.ajaxTable(table, options)

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
 	hapj(function(H) {
		H.ui.id('cateList').ajaxable({
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
	 * ajax化一个链接
	 * 有一些单独出来的链接也是需要异步化成post请求提交的。因此单独链接也提供了ajaxable的方法，不同的是，这里不会对链接的格式进行检查。
	 * @param {HtmlElement} link
	 * @param {Object} options 默认可以不传入任何值。具有如下参数：
	 * <dl>
	 *  <dt>href:<em>string | function</em></dt>
	 *  <dd>动态获取连接的href，如果不指定，则使用链接自己的href。可以是字符串或函数。如果是函数，当前指针指向对应的元素。</dd>
	 *  <dt>ok:<em>function(data)</em></dt>
	 *  <dd>表单提交成功时调用的函数。</dd>
	 *  <dt>error:<em>function(code, desc)</em></dt>
	 *  <dd>表单提交失败是调用的函数。</dd>
	 *  <dt>confirm:<em>String | Function</em></dt>
	 *  <dd>确认字符串，当要执行之前会调用弹出确认框，用户确认了才继续执行。如果confirm是函数，则会将当前点击的元素作为this指针执行此confirm函数并执行，将返回的结果作为确认字符串。另外，该确认字符串可以通过元素设定confirm属性来设置。</dd>
	 * </dl>
	 * @example 
也可以通过如下的方法直接对一个链接进行异步请求处理。
hapj.ui.ajaxable.ajaxLink(link, options)

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
 * @description 让元素支持一些异步请求的操作。由于async这个单词比较生僻，故使用ajax来替代。目前支持四种方式的异步请求方式。分别为：图片、表单、下拉框、表格、面板。
 * <br/>
 * 这部分接口设计得比较灵活，可以通过两种方式调用：
 * <ol>
 * <li>直接使用hapj.ui.fn的函数ajaxable，这个函数会根据元素的nodeName来进行判断该使用哪种接口完成操作。该方法只有一个参数：ajaxable(options)，里边传入相关的配置项</li>
 * <li>直接使用定义到hapj.ui.ajaxable这个对象的具体函数来进行相关操作。该方法有两个参数：ajax[Form|Img|Select|Panel](node, options)，其中node为一个DOM节点，而不是hapj.ui.node对象，options也是配置项，和1完全一样。</li>
 * </ol>
 * 我们需要使表单（id=formAdd）提交支持异步操作，可以分别如下使用：<br/>
 * <ol>
 * <li>H.ui.id('formAdd').ajaxable();</li>
 * <li>H.ui.ajaxable.ajaxForm(H.ui._id('formAdd'));</li>
 * </ol>
 * @constructor jQuery.fn.ajaxable
 * @param {Object} opt 选项
 * <dl>
 * 	<dt>confirm<dt>
 * 	<dd>确认信息，可以是Function、String</dd>
 * 	<dt>ok<dt>
 * 	<dd>异步化请求成功后调用的函数</dd>
 * </dl>
 * @example
 * 详见<a href="http://dxl.hapn.cc/grunt/examples/ajaxable.html" target="_blank">例子</a><br/>
 * 针对各种元素的使用方法参见<a href="./hapj.ui.ajaxable.html">详细</a>
 */
$.fn.ajaxable = function(opt) {
	var options = opt || {};
	this.each(function(k, v) {
		switch(v.tagName) {
			case 'FORM':
				H.ui.ajaxable.ajaxForm(v, options);
				break;
			case 'IMG':
				H.ui.ajaxable.ajaxImg(v, options);
				break;
			case 'SELECT':
				H.ui.ajaxable.ajaxSelect(v, options);
				break;
			case 'TABLE':
				H.ui.ajaxable.ajaxTable(v, options);
				break;
			case 'A':
				H.ui.ajaxable.ajaxLink(v, options);
				break;
			default:
				H.ui.ajaxable.ajaxPanel(v, options);
				break;
		}
	});
	return this;
};

}(jQuery, window.hapj);