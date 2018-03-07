var APIUtiles = require('./api-utiles.js')
var APISpells = require('./api-spells.js')
var Player = require('./classes/Player.js')
var PlayerManager = APIUtiles.getPlayerManager()
var fs = require('fs');
let players = null
let CLASSES = {
  CHASSEUR: "Chasseur",
  GUERRIER: "Guerrier",
  ASSASSIN: "Assasin",
  MAGE: "Mage"
}

function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

function reloadPlayersInfosJsonFile(send){
  APIUtiles.getPlayersInfosJsonFile((bool, res) => {
    if(bool){
      players = res
      send(true)
    } else {
      console.log("[APIUtiles] Le chargement du fichier JSON des joueurs n'a pas réussi à charger")
      send(false)
    }
  })
}

function writePlayersInfosJsonFile(send){
  try{
    var sendjson = JSON.stringify(players); //convert it back to json
    fs.writeFile(APIUtiles.getChemins().PLAYERS, sendjson, 'utf8', function(err) {
      if(err){
        console.log(err)
        send(false)
      } else send(true)
    }); // write it back
  } catch (e) {
    console.log(e)
    send(false)
  }
}

function generateObjFromClasse(classe){
  let newObj = {}
    newObj = {
      infos: {
        classe: classe,
        niveau: 0,
        experience: 0,
        zone: "Ville du départ"
      },
      spells: {}
    }
    let first = true
    for(let i in APISpells.SPELLS[classe.toUpperCase()]){
      let newSort = {
        enable: false
      }
      if(first){
        newSort.enable = true
        first = false
      }
      newObj.spells[i] = newSort
    }
    return newObj
}

exports.getPlayerByName = (ask, send) => {
  reloadPlayersInfosJsonFile((bool) => {
    if(bool){
      try{
        if(players.hasOwnProperty(ask)){
          players[ask].infos.name = ask
          console.log("TROUVEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE")
          send(true, players[ask])
        } else {
          send("erreur:code", "Player-0000");
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

exports.enableSort = (name, index, send) => {
  reloadPlayersInfosJsonFile((bool) => {
    if(bool){
      try{
        if(players.hasOwnProperty(name)){
          console.log(players[name].spells[Object.keys(players[name].spells)[index]], " ", Object.keys(players[name].spells)[index], " ", index)
          players[name].spells[Object.keys(players[name].spells)[index]].enable = true
          writePlayersInfosJsonFile((bool) => {
            send(bool)
          })
        } else {
          send(false)
        }
      } catch (e){
        console.log(e)
        send(false)
      }
    } else {
      send(false)
    }
  })
}

exports.isEnabledSort = (name, index, send) => {
  reloadPlayersInfosJsonFile((bool) => {
    if(bool){
      try{
        if(players.hasOwnProperty(name)){
          console.log("INDEX ", index)
          send(true, players[name].spells[Object.keys(players[name].spells)[index]].enable)
        } else {
          send(false, null)
        }
      } catch (e){
        console.log(e)
        send(false, null)
      }
    } else {
      send(false, null)
    }
  })
}

exports.addExperience = (name, experience, send) => {
  reloadPlayersInfosJsonFile((bool) => {
    if(bool){
      try{
        if(players.hasOwnProperty(name)){
         players[name].infos.experience += experience
         writePlayersInfosJsonFile((bool) => {
           if(bool){
             this.getPlayerByName(name, (bool, player) => {
                if(bool){
                  let newplayer = new Player(player, PlayerManager.getPlayerFromName(name).getAuthor())
                  PlayerManager.updatePlayer(PlayerManager.getPlayerFromName(name), newplayer)
                  console.log("[APICommandes] L'utilisateur " + PlayerManager.getPlayerFromName(name).getAuthor().username + " a gagné " + experience + " points experience !")
                  send(true)
                } else {
                  send(false)
                }
             })
           } else {
             send(false)
           }
         })
       } else send(false)
      } catch (e){
        console.log(e)
        send(false)
      }
    } else {
      send(false)
    }
  })
}

exports.isLevelUp = (name, send) => {
  reloadPlayersInfosJsonFile((bool) => {
    if(bool){
      try{
        if(players.hasOwnProperty(name)){
         let niveau = players[name].infos.niveau
         let experience = players[name].infos.experience
         if(experience >= 300+(200*niveau)){
           if(PlayerManager.existFromName(name)){
             this.getPlayerByName(PlayerManager.getPlayerFromName(name).getAuthor().username, (bool, res) => {
               if(bool){
                 res.infos.niveau+=1
                 res.infos.experience = (experience - (300+(200*niveau)))
                 writePlayersInfosJsonFile((bool) => {
                   if(bool){
                     let newplayer = new Player(res, PlayerManager.getPlayerFromName(name).getAuthor())
                     PlayerManager.updatePlayer(PlayerManager.getPlayerFromName(name), newplayer)
                     PlayerManager.getPlayerFromName(name).sendLevelUp()
                     console.log("[APICommandes] L'utilisateur " + PlayerManager.getPlayerFromName(name).getAuthor().username + " a été promu au niveau " + res.infos.niveau + " !")
                     APISpells.checkUnlockedSpells(PlayerManager.getPlayerFromName(name))
                     send(true)
                   } else {
                     send(false)
                   }
                 })
               } else send(false)
             })
           } else send(false)
         } send(false)
       } send(false)
      } catch (e){
        console.log(e)
        send(false)
      }
    } else {
      send(false)
    }
  })
}

exports.getClasseFromPlayerName = (name, send) => {
  reloadPlayersInfosJsonFile((bool) => {
    if(bool){
      try{
        if(players.hasOwnProperty(name)){
          send(true, players[name].infos.classe)
        } else {
          send(false, null)
        }
      } catch (e){
        console.log(e)
        send(false, null)
      }
    } else {
      send(false, null)
    }
  })
}

exports.existsPlayerFromName = (name, send) => {
  reloadPlayersInfosJsonFile((bool) => {
    if(bool){
      try{
        if(Object.keys(players).includes(name)){
          send(true)
        } else {
          send(false)
        }
      } catch (e){
        console.log(e)
        send(false)
      }
    } else {
      send(false)
    }
  })
}

exports.getLevelOfPlayer = (name, send) => {
  this.getPlayerByName(name, (bool, res) => {
    if(bool && typeof bool != 'string'){
      if(res.infos.niveau < 9){
        send("0-9")
      } else if (res.infos.niveau <= 19) {
        send("0-9")
      } else if (res.infos.niveau <= 29) {
        send("0-9")
      } else if (res.infos.niveau <= 39) {
        send("0-9")
      } else if (res.infos.niveau <= 49) {
        send("0-9")
      } else if (res.infos.niveau <= 59) {
        send("0-9")
      } else if (res.infos.niveau <= 69) {
        send("0-9")
      } else if (res.infos.niveau <= 79) {
        send("0-9")
      } else if (res.infos.niveau <= 89) {
        send("0-9")
      } else if (res.infos.niveau <= 99) {
        send("0-9")
      } else if (res.infos.niveau <= 109) {
        send("0-9")
      } else if (res.infos.niveau <= 119) {
        send("110-119")
      }
    }
  })
}

exports.createAccount = (name, classe2, send) => {
  reloadPlayersInfosJsonFile((bool) => {
    if(bool){
      try{
        newObj = generateObjFromClasse(classe2)
        buffer = JSON.stringify(players)
        buffer = buffer.slice(0,-1)
        buffer += "," + '"' + name + '"' + ":"
        newObj = JSON.stringify(newObj)
        buffer += newObj
        buffer += "}"
        //console.log(buffer)
        players = JSON.parse(buffer)
        writePlayersInfosJsonFile((bool) => {
          send(bool)
        })
      } catch (e){
        console.log(e)
        send(false)
      }
    } else {
      send(false)
    }
  })
}

exports.getClasseFromNumber = (number, send) => {
  switch(number){
    case 1:
      send(true, "Chasseur")
      break
    case 2:
      send(true, "Guerrier")
      break
    case 3:
      send(true, "Assassin")
      break
    case 4:
      send(true, "Mage")
      break
    default:
      send(false, null)
  }
}
