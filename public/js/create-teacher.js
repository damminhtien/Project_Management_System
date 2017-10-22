$('document').ready(()=>{
	setInterval(check,100);
});

function check(){
	if($('input[name=ten]').val() != "" && $('input[name=namsinh]').val() != "" && $('input[name=diachi]').val() != "" && $('input[name=pass]').val() != "" && $('input[name=mail]').val() != ""){
		$("input[name=btnChange]").prop('disabled', false);
	}
}