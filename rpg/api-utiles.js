var fs = require('fs');
let CHEMIN = {
  INFOS: "./rpg/infos.json",
  MONSTRES: "./rpg/monstres.json",
  PLAYERS: "./rpg/players.json"
}
var main = require('../app.js')
var APICombatManager = require('./classes/CombatManager.js')
var CombatManager = new APICombatManager()
var APIPlayerManager = require('./classes/PlayerManager.js')
var PlayerManager = new APIPlayerManager()
var json = {
   infos: {}
};
var instance_commandes = []
function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
function reloadInfosJsonfile(send){
  try{
    fs.readFile(CHEMIN.INFOS, 'utf8', function readFileCallback(err, data){
      if (err){
        console.log(err);
      } else {
        try{
          json = JSON.parse(data); //now it an object
          send(true)
        } catch (e) {
          console.log(e)
          send(false)
        }
      }
    });
  } catch (e) {
    console.log(e)
  }
}
function writeInfosJsonFile(){
  try{
    var sendjson = JSON.stringify(json); //convert it back to json
    fs.writeFile(CHEMIN.INFOS, sendjson, 'utf8', function(err) {
      if(err) console.log(err)
    }); // write it back
  } catch (e) {
    console.log(e)
  }
}

exports.setChannelId = (channelid, send) => {
  try{
    reloadInfosJsonfile()
    let newobj = {
      botchannelid: channelid,
      prefix: json.infos.prefix
    }
    json.infos = newobj
    writeInfosJsonFile()
    send(true, null)
  } catch (e){
    send(false, e)
  }
}

exports.setPrefix = (prefix, send) => {
  try{
    reloadInfosJsonfile((bool) => {
      if(bool){
        let newobj = {
          "botchannelid": json.infos.botchannelid,
          "prefix": prefix
        }
        json.infos = newobj
        writeInfosJsonFile()
        send(true, null)
      } else {
        send(false, null)
      }
    })
  } catch (e){
    send(false, e)
  }
}

exports.getChannelId = (send) => {
  try{
    reloadInfosJsonfile((bool) => {
      if(bool){
        send(true, json.infos.botchannelid)
      } else {
        send(false, null)
      }
    })
  } catch (e){
    send(false, e)
  }
}

exports.getPrefix = (send) => {
  try{
    reloadInfosJsonfile((bool) => {
      if(bool){
        send(true, json.infos.prefix)
      } else {
        send(false, null)
      }
    })
  } catch (e){
    send(false, e)
  }
}

exports.getAdmins = (send) => {
  try{
    reloadInfosJsonfile((bool) => {
      if(bool){
        send(true, json.admins)
      } else {
        send(false, null)
      }
    })
  } catch (e){
    send(false, e)
  }
}

exports.isAdmin = (name, send) => {
  try{
    reloadInfosJsonfile((bool) => {
      if(bool){
        if(json.admins.includes(name)){
          send(true)
        } else {
          send(false)
        }
      } else {
        send(false)
      }
    })
  } catch (e){
    send(false)
  }
}

exports.getInstanceCommandes = (name, send) => {
  console.log(name in instance_commandes)
  /*let find = false
  for(let i in instance_commandes){
    if(instance_commandes[i]["name"] == name){
      find = true
    }
  }
  send(find)*/
  console.log(instance_commandes)
  if(name in instance_commandes){
    send(true, instance_commandes[name]["commande"])
  } else {
    send(false, null)
  }
}

exports.setInstancesCommandes = (name, options, commandes, timeout) => {
  let table = []
  table[options] = commandes
  table["timeout"] = timeout
  table["name"] = name
  instance_commandes[name] = table
  console.log(instance_commandes)
}

exports.removeInstancesCommandes = (name, send) => {
  if(name in instance_commandes){
    delete instance_commandes[name]
    console.log("Intance ", instance_commandes)
    send(true)
  } else {
    send(false)
  }
}

exports.getMonstreInfosJsonFile = (send) => {
  try{
    let monstres_json = null
    fs.readFile(CHEMIN.MONSTRES, 'utf8', function readFileCallback(err, data){
      if (err){
        console.log(err);
      } else {
        try{
          monstres_json = JSON.parse(data); //now it an object
          send(true, monstres_json)
          //console.log("Monstres JSON", monstres_json)
        } catch (e) {
          console.log(e)
          send(false, null)
        }
      }
    });
  } catch (e) {
    console.log(e)
    send(false, e)
  }
}
exports.getPlayersInfosJsonFile = (send) => {
  try{
    let players_json = null
    fs.readFile(CHEMIN.PLAYERS, 'utf8', function readFileCallback(err, data){
      if (err){
        console.log(err);
      } else {
        try{
          players_json = JSON.parse(data); //now it an object
          send(true, players_json)
        } catch (e) {
          console.log(e)
          send(false, e)
        }
      }
    });
  } catch (e) {
    console.log(e)
    send(false, e)
  }
}

exports.getPhraseByID = (id, send) => {
  if(id === "fight"){
    send("Vous êtes déjà en combat, si vous restez inactif pendant 60 secondes, le combat sera annulé et il sera comptabilsé comme perdu.")
  } else if (id === "account_create") {
    send("Vous êtes en train de créer un compte. Sa création sera annulé après 2 minutes d'inactivité")
  } else {
    send("Une erreur est survenue")
  }
}
exports.getCombatManager = () => {
  return CombatManager
}
exports.getPlayerManager = () => {
  return PlayerManager
}
exports.getChemins = () => {
  return CHEMIN
}


/*function refreshTimeoutInstanceCommandes(){
  for(let i in instance_commandes){
    if(instance_commandes[i]["timeout"] <= 0){
      if(instance_commandes[i]["commande"] === "fight"){
        if(CombatManager.existFromName(instance_commandes[i]["name"])){
          CombatManager.sendCombatAbandonnee(instance_commandes[i]["name"])
          CombatManager.removeCombatFromName(instance_commandes[i]["name"])
        }
        delete instance_commandes[i]
      }
    } else
    instance_commandes[i]["timeout"]--
  }
  //console.log(instance_commandes)
  setTimeout(refreshTimeoutInstanceCommandes, 1000)
}
refreshTimeoutInstanceCommandes()*/

/*
  CODE D'ERREUR:
    Monsters-0000: La demande de la liste des monstres par niveau est introuvable
    Player-0000: La demande de la liste des joueurs par nom est introuvable
*/
