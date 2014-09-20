jQuery(function(){
	var menu = $('.menuable').menuable();
	$('#link').bind('click', function(e){
		menu.show(e);
		return false;
	});
});