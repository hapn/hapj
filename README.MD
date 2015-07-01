HapJ javascript 框架
===================

> HapJ是一个面向UI的javascript框架，提供了前端开发过程中常见的问题的解决方案。诸如表单校验、延迟加载、异步处理、广告轮换、以及一系列UI交互体验优化的功能。
> hapj.js是其中最核心的文件，包括了`UI`、`日志`、`钩子`、`模块`等基本组件。

hapj的基本理念
-----------

* `模块化开发`，保持业务模块的独立性，降低不同业务的耦合。
* 通过`钩子`机制细化业务流程，并避免对核心代码造成入侵。
* 强调`日志`的重要性，允许通过日志的形式来跟踪用户随时产生的浏览器端的错误。
* `UI组件`强调html标签语义化，使html和js可以严格分离。


### 模块化开发

封装一个模块

``` javascript
// store.js

!function(H) {
	var store = {
		get: function(id) {
			return {
				id: id,
				name:'foo'
			};
		}
	};
	H.set('store', store);
}(hapj);
```

调用该模块
``` javascript
var store = hapj.get('store').get(3);
```


### 钩子机制

hapj核心预留了一些钩子(hook)，通过实现这些钩子，可以细化网站的业务流程，同时不对hapj核心代码入侵。

比如：我们下面的代码让表单提交时包含password类型的字段自动md5编码，使得密码不再明文提交。

```javascript
// 表单提交
hapj.hook.set('form.submit', function(e, options){
	// 设置debug参数
	var form = this;
	
	if (!options.pack) {
		options.pack = function(data) {
			// 对type=password的字段进行加密处理
	        hapj.each(data, function(name){
				if (form[name] && 'password' == form[name].type) {
					data[name] = hapj.string.toMd5(data[name]);
				}
			});
		};
	}
});
```


### 日志
hapj的日志有两种模式，DEVELOP和ONLINE，DEVELOP模式遇到错误会直接报错，而ONLINE模式，如果有错误，且设置了hapj.log.url，则会将报错信息提交到该网址。

### UI组件

UI组件包括诸如表单校验、广告轮播、延迟加载等一系列的常用组件，解决了前端开发过程中常遇到的交互问题，且不会对正常的html和css代码构成入侵。

#### verifiable（验证组件）

校验组件只需要用verify-rule给表单元素配置相应的校验和提示规则，即可实现表单的校验、提交等。

```html
<form id="formAdd" action="/foo/_bar" method="post">
<input type="text" name="email" verify-rule="{
		required:'必填',
		email:'必须为email'
	}">

<input type="text" name="cate_ename" verify-rule="{
			'range': {
				type:'length',
				min:2,
				max:20,
				msg:'英文别名为2-20位'
			},
			'regexp':/^[a-z][a-z0-9\-_]{1,19}$/i,
			'hint':'英文别名，比如hunshasheying等'
		}">
</form>
<script>
	$('#formAdd').verifiable();
</script>

```


#### switchable（轮播组件）

switchable是在研究了一系列可切换的共同特点以后，抽象出来的一个UI组件。包括了如下几组概念：
* `触发元素` 是指用户通过光标点击或者光标经过等行为能引起切换的原始元素。
* `目标元素` 是指用户通过触发元素引起切换时的切换动作的主体元素。
* `一组元素` 一个触发元素和对应的目标元素构成一组元素。

通过map方法找到需要触发切换动作的元素关联到的元素；通过trigger方法来进行触发元素的变化；通过target方法来进行目标元素的变化。
其中，目标元素和切换元素可以是同一个元素。

```html

<ul id="tab">
	<li>Item1</li>
	<li>Item2</li>
	<li>Item3</li>
	<li>Item4</li>
</ul>

<div id="div1" class="panel">div1</div>
<div id="div2" class="panel">div2</div>
<div id="div3" class="panel">div3</div>
<div id="div4" class="panel">div4</div>

<script>
$('#tab').switchable({
		tag:'li',
		method:'click',
		map:function(i) {
			return $('#div' + (i+1))[0];
		},
		trigger:function(ts) {
			ts.removeClass('on');
			this.className = 'on';
		},
		target:function(ts) {
			ts.hide();
			this.style.display = 'block';
		},
		cycleTime:2000
	}).rand();
</script>
```
