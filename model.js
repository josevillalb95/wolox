module.exports = function(settings) {
	const mongoose = require('mongoose');
	const options_db={
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
		useCreateIndex: true
	};
	const con = mongoose.connect(settings.connectURI, options_db);
	mongoose.connection.on("open", function (ref) {
		console.log("********* open connection to mongo server: " + settings.connectURI);
	});
	mongoose.connection.on("connected", function (ref) {
		console.log("Mongoose default connection open to " + settings.connectURI);
	});
	const Schema = mongoose.Schema;
	const ObjectId = Schema.ObjectId;
	const usuarios = new Schema({
		_id:String,
		username : String,
		name : String,
		lastname : String,
		password : String,
		monedaPreferida : String,
		monedaOrden : String,
		interes:  [ String ]
	}); 
	const monedas= new Schema({
		_id:String,
		data:[{
			"id" : String,
			"name" : String, 
			"image" : String,
			"symbol" : String,
			"value_1d":Schema.Types.Mixed,
			"value_7d":Schema.Types.Mixed,
			"value_14d":Schema.Types.Mixed,
			"value_30d":Schema.Types.Mixed,
			"current_price":Schema.Types.Mixed,
			"last_updated":Date
		}]
	})
	const ModelMonedas = mongoose.model('monedas', monedas, 'monedas');
	const ModelUsuarios = mongoose.model('usuarios', usuarios, 'usuarios');
	const moduloModel = {};
	// moduloModel.connection = mongoose.connection;
	moduloModel.generateId = function() {
		return mongoose.Types.ObjectId().toString() 
	}
	moduloModel.searchUser = function(query) {
		return ModelUsuarios.findOne(query)
	}
	moduloModel.modifyUser = function(query,update,callback){
		return ModelUsuarios.update(query, update, { upsert: true }, callback)
	}
	moduloModel.searchMonedas = function(query) {
		return ModelMonedas.findOne(query).lean()
	}
	moduloModel.modifyMonedas = function(query,update,callback){
		return ModelMonedas.update(query, update, { upsert: true }, callback)
	}
  	return moduloModel;
};
