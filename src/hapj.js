/** 
 * Copyright (c) 2014, Jiehun.com.cn Inc. All Rights Reserved
 * @author ronnie<dengxiaolong@jiehun.com.cn>
 * @date 2014-09-12
 * @version 2.0 
 * @class hapj
 * @description hapj 主类
 */
!function(){
	"use strict";
	
	if ('hapj' in window) {
		window.__hapj = window.hapj;
	}
	window.hapj = {};
}();
var hapj = window.hapj;

!function(H){
	"use strict";
	/**
	 * @class hapj.image
	 * @name hapj.image
	 * @memberof hapj
	 * @description 图片
	 */
	H.image = {
		/**
		 * 加载图片
		 * @function
		 * @memberof hapj.image
		 * @param {string} url 图片地址
		 * @param {function} [onsuccess=null] 加载成功后调用
		 * @param {function} [onerror=null] 当加载失败后调用
		 */
		load:function(url, onsuccess, onerror) {
			var img = new Image();
			if (typeof onerror == 'function') {
				img.onerror = onerror;
			}
			img.src = url;
			// 如果图片已经缓存，则直接调用成功的函数
			if (img.complete) {
				if(!!onsuccess) {
					return onsuccess.call(img);
				}
				return;
			}
			// 没有缓存的图片会调用onload事件
			img.onload = function() {
				if (!!onsuccess) {
					onsuccess.call(this);
				}
				img.onload = null;
				if (img.onerror) {
					img.onerror = null;
				}
			};
		}
	};
}(hapj);

//浏览器
!function(H){
	"use strict";
	/**
	 * 浏览器属性
	 * @member hapj.browser
	 * @memberof hapj
	 */
	H.browser = (function(){
		var ua = navigator.userAgent.toLowerCase(),
		rwebkit = /(webkit)[ \/]([\w.]+)/,
		ropera = /(opera)(?:.*version)?[ \/]([\w.]+)/,
		rmsie = /(msie) ([\w.]+)/,
		rmozilla = /(mozilla)(?:.*? rv:([\w.]+))?/,
		match = rwebkit.exec( ua ) ||
			ropera.exec( ua ) ||
			rmsie.exec( ua ) ||
			ua.indexOf('compatible') < 0 && rmozilla.exec( ua ) ||
			[];
		return { type: match[1] || '', version: match[2] || '0', mobile: /(MIDP|WAP|UP\.Browser|Smartphone|Obigo|AU\.Browser|wxd\.Mms|WxdB\.Browser|CLDC|UP\.Link|KM\.Browser|UCWEB|SEMC\-Browser|Mini|Symbian|Palm|Nokia|Panasonic|MOT|SonyEricsson|NEC|Alcatel|Ericsson|BENQ|BenQ|Amoisonic|Amoi|Capitel|PHILIPS|SAMSUNG|Lenovo|Mitsu|Motorola|SHARP|WAPPER|LG|EG900|CECT|Compal|kejian|Bird|BIRD|G900\/V1\.0|Arima|CTL|TDG|Daxian|DAXIAN|DBTEL|Eastcom|EASTCOM|PANTECH|Dopod|Haier|HAIER|KONKA|KEJIAN|LENOVO|Soutec|SOUTEC|SAGEM|SEC|SED|EMOL|INNO55|ZTE|iPhone|Android|Windows CE|BlackBerry)/i.test(navigator.userAgent) };
	})();
}(hapj);
