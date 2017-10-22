$('document').ready(()=>{
	setInterval(check,100);
});

function check(){
	if($('input[name=ten]').val() != "" && $('input[name=namsinh]').val() != "" && $('input[name=id]').val() != "" && $('input[name=pass]').val() != "" && $('input[name=khoa]').val() != "" && $('input[name=lop]').val() != ""){
		$("input[name=btnChange]").prop('disabled', false);
	}
}