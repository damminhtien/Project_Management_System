$('document').ready(function(){
	var numDA = $('#numDA').html();
	for(var i=0; i<numDA; i++){
		(async function(i){
				var idGV = $('#idGV' + i).html();
				var getGV = '../giangvien/id='+idGV;
				$.ajax({
        		    url: getGV,
           			type: "GET",
            		success: function(data) {
                		$('#bomon'+ i).html(data[0].bomon);
						$('#giangvienhuongdan' + i).html(data[0].ten);
						$('#thongtingiangvien' + i).html(data[0].sdt + '<br/>' + data[0].mail + '<br/>' + data[0].diachi);
            		}
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