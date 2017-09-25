$('document').ready(function(){
	// $("#thongtinchitiet0").html('aaaa');
	// $("#thongtincoban0").html('aaaa');
	var numDA = $('#numDA').html();
	for(var i=0; i<numDA; i++){
		(function(i){
				var idGV = $('#idGV' + i).html();
				var getGV = '../giangvien/id='+idGV;
				$.get(getGV).then(function(data){
					$('#bomon'+ i).html(data[i].bomon);
					$('#giangvienhuongdan' + i).html(data[i].ten);
					$('#thongtingiangvien' + i).html(data[i].sdt + '<br/>' + data[i].mail + '<br/>' + data[i].diachi);
				});
		})(i);
	}
	for(var i=0; i<numDA; i++){
		$("#thongtinchitiet" + i).hide();
		(function(i){
			$("#thongtincoban" + i).click(function(){
				 $("#thongtinchitiet" + i).toggle(300);
			})
		})(i);
	}
});