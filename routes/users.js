module.exports = function(options){
	const {settings,model,router}=options
	const JWT=options.functionJWT
	var crypto = require('crypto');
	var md5 = require ("md5");

	router.get('/login',function(req, res, next){
		JWT.validar(req.cookies.tokenJWT,function(err, decoded){
			if(err||!decoded)
	 			return res.render('login', { title: 'Wolox Cryptocurrencies Monitor','memoria':options.memoria});
	 		res.redirect("/")
		})
	});
	router.post('/login', function(req, res, next){
		let datos=req.body
		if(!datos["username"] || !datos["password"] )
			return res.status(400).send('Datos incompletos');
		datos["password"]=crypto.createHash('md5').update(datos["password"]).digest("hex");
		model.searchUser({"username":datos["username"],"password":datos["password"]}).lean().exec(function(e,user){
			if(e)
				return res.status(400).send('Error del sistema');
			if( !user)
				return res.status(400).send('Credenciales invialidas');
			JWT.firmar(datos,function(err,token){
				if(err)
					return res.status(400).send('Error al generar token');
				res.cookie('tokenJWT',token, { httpOnly: true, secure: true})
				res.status(200).send('Login realizado correctamente');
			})
		})
	})
	router.post('/favoritos', function(req, res, next){
		let datos=req.body
		let limite_favoritos=25;
		JWT.validar(req.cookies.tokenJWT,function(err, decoded){
			if(err||!decoded)
	 			return res.status(400).send('Su sesion caduco');
	 		if(!datos.valor ||  (datos.valor && options.memoria["CoinName"].indexOf(datos.valor)== -1) )
	 			return res.status(400).send('Datos Erroneos');
	 		let update= { "$pull": { "interes": datos.valor } }
	 		let msj='Eliminado de favoritos correctamente'
	 		if(datos.add && datos.add=="true"){
	 			msj='Agregado a favoritos correctamente'
	 			model.searchUser({"username":decoded["username"],"password":decoded["password"]}).exec(function(err,user){
	 				if(!user)
	 					return res.status(400).send('Error al detectar su session')

	 				if(!user.interes)
	 					user.interes=[];

	 				if( user.interes.length >= limite_favoritos)
	 					return res.status(400).send(`Error no puede tener mas de ${limite_favoritos} favoritos`);

	 				if(user.interes.indexOf(datos.valor)!=-1)
	 					return res.status(400).send(`Error el elemento ya fue Agregado`);

	 				user.interes.push(datos.valor)
	 				user.save(function(err,ok){
	 					res.status(200).send(msj);

	 				})
				})
	 		}else{
		 		model.modifyUser({"username":decoded["username"] },update,function(err){
		 			if(err){console.log("error update ",err)}
					return res.status(200).send(msj);
				})
	 		}
 			
		})
	})	

	router.post('/edit', function(req, res, next){
		let datos=req.body
		JWT.validar(req.cookies.tokenJWT,function(err, decoded){
			if(err||!decoded)
	 			return res.status(400).send('Su sesion caduco');
	 		let update={}
			if( datos.monedaPreferida && options.memoria["monedas"].indexOf(datos.monedaPreferida)== -1)
	 			return res.status(400).send('Datos Erroneos');
	 		if(datos.monedaOrden)
	 			update["monedaOrden"]=datos.monedaOrden
	 		if(datos.monedaPreferida)
	 			update["monedaPreferida"]=datos.monedaPreferida
	 		if(!update)
	 			return res.status(400).send('Datos incompletos');
	 		model.modifyUser({"username":decoded["username"] },update,function(){
				return res.status(200).send("Modificacion realizada correctamente");
			})
		})
	})
	router.post('/registrarse', function(req, res, next){
		let datos=req.body
		let camposValidos=["username","name","lastname","password","monedaPreferida"];
		let camposCompletos=true;
		let datosLimpios={};
		camposValidos.forEach(function(campo){
			if(!datos[campo])
				camposCompletos=false;
			else
				datosLimpios[campo]=datos[campo]
		})
		if(!camposCompletos){
			return res.status(400).send('Datos incompletos');
		}

		if( options.memoria["monedas"].indexOf(datos.monedaPreferida)== -1){
 			return res.status(400).send('Datos Erroneos');
 		}


		let regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
		if( !regex.test(datosLimpios["password"]) )
			return res.status(400).send('La contraseña debe ser alfanumerica y mayor a 8 caracteres');
		model.searchUser({"username":datosLimpios["username"]}).lean().exec(function(e,userdb){
			if(e) return res.status(400).send('Error en el sistema');
			if(userdb) return res.status(400).send('Usuario existente');
			datosLimpios["password"] = crypto.createHash('md5').update(datosLimpios.password).digest("hex");
			model.modifyUser({"_id":model.generateId()},datosLimpios,function(){
				return res.status(200).send('Registro exitoso');
			})
		})
	})
	return router;
}