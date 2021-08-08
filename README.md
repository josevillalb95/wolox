Hola! 
El proyecto se levanta con el comando "npm run start" ademas se tiene que agregar el archivo ".env" (enviado en el correo que contiene el link a github) el cual contiene datos sensibles.

El proyecto se enfoca principalmente en el consumo del servicio brindado por CoinGecko. El cual se penso para un entorno productivo con mucha concurrencial en la web. Por ende se tomo la desicion de consumir la api cada 3min y guardar los datos en memoria. Y no consumilar cada vez que un usuario dibuja la web. 
Se tomo como metodo de autenticacion JWT el cual fue propuesto. Y el uso de redirect en el caso de que vensan los mismo para cualquier movilidad dentro de la web.



