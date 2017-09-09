$("document").ready(function(){
	$("#inputSearch").focusin(function(){
		$(this).css("background-color", "#f0f5f5");
		$("#div_search_tool form").css({"width":"60%","transition":"2s"});
		$("#btnSearch").css("background-color", "#999");
	})
	$("#inputSearch").focusout(function(){
		$(this).css("background-color", "#fff");
		$("#div_search_tool form").css({"width":"50%","transition":"2s"});
		$("#btnSearch").css("background-color", "#fff");
	})
});