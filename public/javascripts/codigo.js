function serializeObj($form){
    var unindexed_array = $form.serializeArray();
    var indexed_array = {};

    $.map(unindexed_array, function(n, i){
        indexed_array[n['name']] = n['value'];
    });

    return indexed_array;
}

function decorateDateTime(date) {
  var fecha = new Date(date);
  date = paddingCeros(fecha.getDate(),2);
  var month = paddingCeros(fecha.getMonth()+1,2);
  var year = fecha.getFullYear();
  var h = paddingCeros(fecha.getHours(),2);
  var m = paddingCeros(fecha.getMinutes(),2);
  return (date + "/" + month + "/" + year + " " + h + ":" + m);
}

function paddingCeros(str, size) {
  str = str + '';
  if (!str || str.length >= size) return str;
  var dif = size - str.length, cadcero = '';

  for(i=0;i < dif;i++){
    cadcero+='0';
  }
  return cadcero + str;
}




$(document).ready(function() {
	toastr.options = {
	  "closeButton": false,
	  "debug": false,
	  "newestOnTop": false,
	  "progressBar": false,
	  "positionClass": "toast-top-right",
	  "preventDuplicates": false,
	  "onclick": null,
	  "showDuration": "35000",
	  "hideDuration": "400",
	  "timeOut": "2500",
	  "extendedTimeOut": "1000",
	  "showEasing": "swing",
	  "hideEasing": "linear",
	  "showMethod": "fadeIn",
	  "hideMethod": "fadeOut"
	}


	$('.img__btn').click(function(e){
		$('.cont').toggleClass('s--signup');
	})

	$(document).on('change', 'select.cambioConfig', function(event){
		console.log("cambio")
		let value=$(this).val()
		let name=$(this).attr("name")
		var data={}
		data[name]=value
        $.ajax({
         	url:"/users/edit",
         	type:"POST",
         	data
	    })
	    .done(function(response) {     
	    	console.log("done",response) 
			toastr.success(response)
	    })
	    .fail(function(response,msj,msj2) {
	    	toastr.error(response.responseText)

	    })
	    .always(function() { 
			setTimeout(function(){
              location.reload();
            }, 1000 * .9);	
	    });
	       
	})

	$(document).on('change', '.coin input[type="checkbox"], .crypto-table input[type="checkbox"]', function(event){
		console.log("cambio")
		let input=$(this)
		let value=$(this).val()
		let result=$(this).is(':checked')
		let text_dialog=result?`Desea agrega ${value} a favoritos? `:`Desea eliminar ${value} de favoritos? `
		$( "#dialog-confirm" ).attr("title",text_dialog)
		let buttons={}
		 $( "#dialog-confirm" ).dialog({
	      resizable: false,
	      height: "auto",
	      width: 400,
	      modal: false,
	      buttons: {
	        "Aceptar": function(){
	            $.ajax({
		         	url:"/users/favoritos",
		         	type:"POST",
		         	data:{
		         		"add":result,
		         		"valor":value
		         	}
			    })
			    .done(function(response) {     
			    	console.log("done",response) 
					toastr.success(response)
			    })
			    .fail(function(response,msj,msj2) {
			    	toastr.error(response.responseText)
					input.prop( "checked", !result );
					$( "#dialog-confirm" ).dialog( "close" );

			    })
			    .always(function() { 
					$( "#dialog-confirm" ).dialog( "close" );
					setTimeout(function(){
		              location.reload();
		            }, 1000 * .9);	
			    });
	        },
	        Cancelar: function() {
	        	input.prop( "checked", !result );
	          	$( this ).dialog( "close" );
	        }
	      }
	    });
	})
	$(document).on('submit', 'form', function(event){
		event.preventDefault();
        event.stopPropagation();
        let url=$(this).attr("action")
        let type=$(this).attr("method")
        let data=serializeObj($(this))
		$("button[type='submit']").attr("disabled", true);
        $.ajax({
         	url,type,data
	    })
	    .done(function(response) {     
	    	console.log("done",response) 
			toastr.success(response)
			setTimeout(function(){
              location.reload();
            }, 1000 * .9);	

	    })
	    .fail(function(response,msj,msj2) {
			toastr.error(response.responseText)
	    })
	    .always(function() { 
			$("button[type='submit']").attr("disabled", false);
	    });
	})

	if( $(".decorateFechaGmt").length ){
		$(".decorateFechaGmt").each(function(){
			if( $(this).data("date") ){
				$(this).html(decorateDateTime( $(this).data("date") ) )
			}
		})
	}


	$('.multiple-items').hide()
	$('.multiple-items').on('init', function(event, slick){
		$('.multiple-items').show()
	});
	$('.multiple-items').slick({
		infinite: true,
		centerMode: true,
		slidesToShow: 1,
		slidesToScroll: 1,
		arrows: false
	});

	
})