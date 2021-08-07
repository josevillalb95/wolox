module.exports = function(memoria,model){
	const CoinGecko = require('coingecko-api');
	const CoinGeckoClient = new CoinGecko();
	var ciclosScrapper = async() => {
		// let coinsfetch = await CoinGeckoClient.coins.fetch('bitcoin');
		// console.log(JSON.stringify(coinsfetch))
		let coins = null
		try{
			coins = await CoinGeckoClient.coins.all();
		}
		catch(e){
			return console.log("status fail await (CoinGecko) ",e)
		}
		if(!coins || coins.code!=200 || !coins.data || !coins.data.length)
			return console.log("status fail (CoinGecko) ",coins)
		let update=[]
		let name=[]
		let item={}
		coins.data.forEach(function(coin){
	      if( coin.market_data && coin.market_data.current_price){
	      	name.push(coin.id)
	      	item={
	      		"id":coin.id,
	      		"name":coin.name,
	      		"symbol":coin.symbol,
	      		"value_1d":coin.market_data.price_change_percentage_24h_in_currency,
	      		"value_7d":coin.market_data.price_change_percentage_7d_in_currency,
	      		"value_14d":coin.market_data.price_change_percentage_14d_in_currency,
	      		"value_30d":coin.market_data.price_change_percentage_30d_in_currency,
	      		"current_price":coin.market_data.current_price,
	      		"last_updated":new Date(coin.last_updated)
	      	}
	      	if( coin.image && coin.image.thumb ) 
	      		item["image"]=coin.image.thumb;
	      	update.push(item)
	      }
		})
		memoria["CoinGecko"]=update;
		memoria["CoinName"]=name;
		console.log("update money")
		model.modifyMonedas({"_id":"unico"},{"data":update},function(err){
			if(err) console.log("ciclo update db erroneo ",err)
		})
	};
	function initMonedas(){
		model.searchMonedas({"_id":"unico"}).exec(function(err,monedas){
			if( !monedas || (monedas &&  !monedas["data"]) )
				return ciclosScrapper()
			memoria["CoinName"]=[]
			memoria["CoinGecko"]=monedas["data"];
			monedas["data"].forEach(function(coin){
				memoria["CoinName"].push(coin.id)
			})
		})
	}
	initMonedas()
	setInterval(function(){
		ciclosScrapper()
    }, 1000 * 60 * 3);
}
