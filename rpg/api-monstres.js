var APIUtiles = require('./api-utiles.js')
let monstres = null
let EFFET = {
  ETOURDI: "etourdi",
  ETOUFFE: "etouffe",
  SOINS: "soins",
  TRANSFORMATION: "transformation",
  AFFAIBLI: "affaibli",
  POISON: "poison",
  SAIGNEMENT: "saignement",
  ESQUIVE: "esquive"
}
function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

function reloadMonstreInfosJsonFile(send){
  APIUtiles.getMonstreInfosJsonFile((bool, res) => {
    if(bool){
      monstres = res
      console.log("PENIS", monstres)
      send(true)
    } else {
      console.log("[APIUtiles] Le chargement du fichier JSON des monstres n'a pas réussi à charger")
      send(false)
    }
  })
}

exports.getMontresFromLevel = (ask, send) => {
  reloadMonstreInfosJsonFile((bool) => {
    if(bool){
      try{
        if(monstres.hasOwnProperty(ask)){
          //console.log("Monstres ASK", monstres[ask])
          send(true, monstres[ask])
        } else {
          send("erreur:code", "Monsters-0000");
        }
      } catch (e){
        console.log(e)
        send(false, e)
      }
    } else {
      send(false, null)
    }
  })
}

exports.getEffets = () => {
  return EFFET
}
