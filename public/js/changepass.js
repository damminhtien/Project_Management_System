$("document").ready(function(){
	$("input[name=txtNewPassword0]").focusout(function(){
		if($(this).val().length >= 1 && $(this).val().length <= 3){
			$("#message").html("Độ dài mật khẩu phải lớn hơn hoặc bằng 4 ký tự")
		}
		else	$("#message").html("");
	});
	$("input[name=txtNewPassword1]").focusout(function(){
		if($(this).val() !== $("input[name=txtNewPassword0]").val()){
			$("#message").html("Mật khẩu nhập lại không khớp")
		}
		else	$("#message").html("");
	});
	setInterval(checkPass, 100);
});

function checkPass(){
	if($("input[name=txtNewPassword0]").val() != "" && $("input[name=txtNewPassword0]").val() == $("input[name=txtNewPassword1]").val())
			$("input[name=btnChange]").prop('disabled', false);
}