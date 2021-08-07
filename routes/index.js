module.exports = function(options){
	const {settings,model,router,memoria}=options
	const JWT=options.functionJWT;
	validJWT= function( req, res, next ){
		JWT.validar(req.cookies.tokenJWT,function(err, decoded){
			if(err||!decoded)
	 			return res.redirect("/users/login")
	 		req.decoded=decoded;
	 		next()
		})
	}
	router.get('/',validJWT,function(req, res, next){
 		model.searchUser({"username":req.decoded["username"],"password":req.decoded["password"]}).lean().exec(function(err,user){
 			if(!user || err)
 				return res.redirect("/users/login")
 			let coins=[]
 			let coinsInteres=[]
 			if(!user.interes)
 				user.interes=[]

			let monedaDestacada=[]
			let monedaDestacadaItem={}
			let monedasPreferidas=["usd","ars","eur"]
			let monedasTiempo=["value_1d","value_7d","value_14d","value_30d"]
			if(monedasPreferidas.indexOf(user.monedaPreferida)==-1)
				monedasPreferidas.push(user.monedaPreferida);

			memoria['CoinGecko'].forEach(function(coin,index,object){
				if(coin["current_price"] && coin["current_price"][user.monedaPreferida]){
					if(coin && coin.id && user.interes.indexOf(coin.id)!= -1 ){
						monedaDestacadaItem={}
						monedaDestacadaItem["id"]=coin["id"]
						monedaDestacadaItem["name"]=coin["name"]
						monedaDestacadaItem["symbol"]=coin["symbol"]
						monedaDestacadaItem["last_updated"]=coin["last_updated"]
						monedaDestacadaItem["image"]=coin["image"]
						monedaDestacadaItem["infoMonedas"]=[]
						monedaDestacadaItem["actual"]=0
						monedasPreferidas.forEach((moneda)=>{
							if(coin["current_price"] && coin["current_price"][moneda]){
								objMoneda={"key":moneda}
								objMoneda["actual"]=parseFloat(coin["current_price"][moneda]).toFixed(2)
								if(moneda==user.monedaPreferida)
									monedaDestacadaItem["actual"]=objMoneda["actual"]
								monedasTiempo.forEach( (dia)=>{
									if(coin[dia] && coin[dia][moneda]){
										porcentaje=parseFloat(coin[dia][moneda]).toFixed(2)
										objMoneda[dia]= {
											positivo:parseFloat(coin[dia][moneda]) >0 ? true:false,
											porcentaje:porcentaje
										}
									}
								})
								monedaDestacadaItem["infoMonedas"].push(objMoneda)
							}
						})
						monedaDestacada.push(monedaDestacadaItem)
					}else{
						coin["monedaPreferida"]=coin["current_price"][user.monedaPreferida]
						coins.push(coin)
					}
				}
			})

			if(monedaDestacada.length){
				monedaDestacada.sort(function(a, b) {
				  return b["actual"]- a["actual"];
				});
				if( user.monedaOrden && user.monedaOrden=="asendente")
					monedaDestacada.reverse()
			}





 			res.render('index', { title: 'Wolox Cryptocurrencies Monitor' ,user, coins,monedaDestacada, monedas:memoria.monedas });
 		})
	})
	return router;
}
