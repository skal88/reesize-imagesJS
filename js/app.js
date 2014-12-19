$(function(){

	// Default values
	var fileName = '';
	var Sfile = '';
	var imgWidth = 750;
	var imgHeight = 500;
	var imgCompress = 1;

	// Elements
	var $cut = $("#cut");
	var $canvasPre = $("#canvasPre");
	var $contenedorCanvas = $("#contCanvasPre");
	var $contenedorSelectFile = $("#contSelectFile");
	var $dropZone = $("#drop_zone");
	var $btnCanvas = $(".btn-canvas");

	function dropNormal(){
		$dropZone.removeClass("errorfliker");
		$dropZone.removeClass("fliker"); // Eliminamos la clase 'fliker'
		$dropZone.addClass("nofliker"); // Añadimos la clase nofliker
	}

	function dropError(){
		$dropZone.removeClass("nofliker");
		$dropZone.removeClass("fliker"); // Eliminamos la clase 'fliker'
		$dropZone.addClass("errorfliker"); // Añadimos la clase nofliker
	}

	function dropOver(){
		$dropZone.removeClass("nofliker");
		$dropZone.removeClass("errorfliker"); // Eliminamos la clase 'fliker'
		$dropZone.addClass("fliker"); // Añadimos la clase nofliker
	}

	// Funcion para capturar el archivo
	function handleFileSelect(evt) {
	    evt.stopPropagation();
	    evt.preventDefault();
	    
	    // Comprobamos si existe el evento 'dataTransfer'
	    if( typeof(evt.dataTransfer) !== "undefined" ) // Si existe buscamos el archivo mediante avt.dataTransfer.file (significa que viene del drag'n'drop)
	    	var files = evt.dataTransfer.files; // FileList object
	    else // Si no existe lo buscamos normal desde el campo examinar (form)
	    	var files = evt.target.files;

	    // Comprovamos si son varios archivos
	    if(files.length == 1){ // Solo un archivo
	    	var file = files[0]; // Cogemos el primer elemento del array ( solo se permite un archivo )

	    } else{ // Más de un archivo
	    	alert("No puedes añadir más de un archivo. De momento... ;)")
	    	return; // Por el momento no aceptamos más de un archivo
	    }

	    fileName = escape(file.name); // Guardamos el nombre en la variable global fileName
	    fileName = fileName.substr(0, fileName.lastIndexOf(".")); // Elimina la extensión del nombre del archivo

	    if (file.type.match('image.*')) { // Comprobamos que es un archivo de imagen
			var reader = new FileReader(); // Abrimos el archivo
			// Cogemos la información del archivo cuando carga.
			reader.onload = (function(theFile) {
				return function(e) {
					Sfile = e.target.result; // Guardamos el fichero en la variable global Sfile
					setCanvasPre(Sfile);  // Preparamos el canvasPre y pintamos la imagen
				};
			})(file);

			// Read in the image file as a data URL.
			reader.readAsDataURL(file);
		} else{ // Si el archivo no es una imagen
			alert("formato de archivo no válido. Solo imagenes plis! :)");
			dropNormal();
		}
	}

	// Al salir de la zona drag'n'drop
	function handleDragLeave(evt){
		dropNormal();
	}

	function handleDragOver(evt) {
		evt.stopPropagation(); // 
		evt.preventDefault(); // Evitamos la acción por defecto
		evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.

	    
	    // Comprobamos si existe el evento 'dataTransfer'
	    if( typeof(evt.dataTransfer) !== "undefined" ){ // Si existe buscamos el archivo mediante avt.dataTransfer.file (significa que viene del drag'n'drop)
	    	var files = evt.dataTransfer.files; // FileList object
	    	var file = files[0]; // Cogemos el primer elemento del array ( solo se permite un archivo )

	    	if (!file.type.match('image.*'))
				dropError(); // Error
	    	else
				dropOver(); // parpadear
		}
	}


	function setCanvasPre(file){
		var canvas = document.getElementById("canvasPre");
		var ctx = canvas.getContext('2d');

		var img = new Image();
		img.src = file;

		// Calculamos el aspectRatio
		// original height / original width x new width = new height
		var newHeight = ( img.height / img.width ) * imgWidth ;
		if( newHeight >= imgHeight ){ // Si al reescalar el ancho a 750px la altura es mayor de 500
			canvas.width = imgWidth;
			canvas.height = newHeight;
		} else{ // Si la altura es menor de 500
			canvas.height = imgHeight; // Marcamos como 500px la altura de el canvas
			canvas.width = ( img.width / img.height ) * imgHeight; // y calculamos la anchura reescalando de nuevo a height 500px
		}


		img.onload = function(){
			ctx.save();
			ctx.drawImage(img, 0, 0, canvas.width, canvas.height ); // Pintamos teniendo en cuenta los tamaños finales
			ctx.restore();

			$cut.width(imgWidth);
			$cut.height(imgHeight);
			$contenedorSelectFile.fadeOut(function(){
				$contenedorCanvas.fadeIn();
				$btnCanvas.slideDown();
			});
		}

		// Cambiamos el atributo download por el nombre del archivo (En variable global)
		$("#btn-download").attr("download", imgWidth+"x"+imgHeight+"_"+fileName+".jpg");
	}

	function moveImage(){
		var canvasPre = document.getElementById("canvasPre");
		var canvas = document.getElementById("canvas");
		canvas.width = imgWidth;
		canvas.height = imgHeight;
		var ctx = canvas.getContext('2d');

		var img = new Image();
		img.src = Sfile;

		var posX = $cut.position().left - $canvasPre.position().left;
		var posY = $cut.offset().top - $canvasPre.offset().top ;
		
		img.onload = function(){
			ctx.save();
			ctx.drawImage(img, posX*-1, posY*-1, canvasPre.width, canvasPre.height ); // Pintamos teniendo en cuenta los tamaños finales
			ctx.restore();
		}
	}

	function SaveImage(){
		var canvas = document.getElementById("canvas"); // Seleccionamos el canvas

		var dataURL = canvas.toDataURL('image/jpeg', imgCompress); // Seleccionamos el formato y la compresión
	    document.getElementById('btn-download').href = dataURL; // y modificamos el enlace por la url de la imagen generada
	}




//                    Acciones
/*******************************************************/	
	// Inicializamos el draggable de jQueryUI
	$cut.draggable({ 
		containment: "#contCut", 
		scroll: false, 
		stop: function() {
        	moveImage();
      	} 
    });






//                EVENTS LISTENERS
/********************************************************/


	// DRAG'N'DROP Listeners
	var dropZone = document.getElementById('drop_zone');
	dropZone.addEventListener('dragover', handleDragOver, false); // Al pasar por encima con un archivo
	dropZone.addEventListener('drop', handleFileSelect, false); // Al soltar el archivo en la zona
	dropZone.addEventListener('dragleave', handleDragLeave, false); // Al salir de la zona Drag'n'Drop

	// Al cambiar de archivo en el campo examinar del formulario
	document.getElementById('files').addEventListener('change', handleFileSelect, false);

	// Botón Guardar
	document.getElementById('btn-download').addEventListener('click', function(){
		SaveImage();
	});

	// Botón Volver
    document.getElementById('btn-return').addEventListener('click', function(){
    	$contenedorCanvas.fadeOut(function(){
    		dropNormal();
			$contenedorSelectFile.fadeIn();
			$btnCanvas.slideUp();
		});
    });

    // Formulario de tamaños
    $("#iSize").change(function(){
    	imgWidth = $("#iWidth").val();
    	imgHeight = $("#iHeight").val();
    	$("#tituloImg").html("Imagen a "+imgWidth+"x"+imgHeight);
    })
});