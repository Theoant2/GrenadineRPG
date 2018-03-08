var main = require('../app.js')
var APIUtiles = require('./api-utiles.js')
var APIMonstres = require('./api-monstres.js')
var APIPlayers = require('./api-players.js')
var APISpells = require('./api-spells.js')
var Monstre = require('./classes/Monstre.js')
var Combat = require('./classes/Combat.js')
var Player = require('./classes/Player.js')
var CombatManager = APIUtiles.getCombatManager()
var PlayerManager = APIUtiles.getPlayerManager()
var commandes = [
  "setprefix",
  "setchannel",
  "fight",
  "infos",
  "account",
  "test"
]
var dm_commandes = [
  "sorts"
]
function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
function getRandomInteger(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}
function replyErrorInChat(message, errorcode){
  message.reply("Une erreur est survenue, code d'erreur: #" + errorcode +
  "\n Faite passer ce code d'erreur à mon créateur (AnotherFox#0147) ou à un administrateur")
}

exports.onCommandes = (commande, optionsObj) => {
  let message = optionsObj.msg
  console.log("Commande lancé par " + message.author.username + ":",commande)

  if(!PlayerManager.existFromName(message.author.username)){
    APIPlayers.getPlayerByName(message.author.username, (bool, res) => {
      if(bool && typeof bool != 'string'){
        let player = new Player(res, message.author)
        PlayerManager.addPlayer(player)
        console.log("[APICommandes] L'utilisateur " + message.author.username + " a été ajouter au tableaux des joueurs")
      }
    })
  } else {
    APIPlayers.getPlayerByName(message.author.username, (bool, res) => {
      if(bool){
        let player = new Player(res, message.author)
        PlayerManager.updatePlayer(PlayerManager.getPlayerFromName(message.author.username), player)
      }
    })
    PlayerManager.getPlayerFromName(message.author.username).setAuthor(message.author)
  }
  /*
    COMMANDE: setprefix
    DESC: Permet de modifier le prefix qui se trouve devant chaque commandes
    que l'utilisateur va écrire
    EXEMPLE: setprefix <nouveau prefix>
  */
  if(commande === "setprefix"){
    APIUtiles.isAdmin(message.author.username, (bool) => {
      if(bool){
        APIUtiles.setPrefix(message.content.split(" ")[1], (bool, res) => {
          if(bool){
            message.reply('Le prefix `' + message.content.split(" ")[1] + "` a été ajouté")
            APIUtiles.getPrefix((bool, res) => {
              if(bool){
                main.RPG_PREFIX = res
                console.log("[APIUtiles] Le préfix '" + res + "' a été chargé")
              } else console.log(res)
            })
          } else {
            message.reply('Une erreur est survenue')
            console.log(res)
          }
        })
      } else {
        message.reply("Vous n'êtes pas un administrateur du robot")
      }
    })
  }
  /*
    COMMANDE: setchannel
    DESC: Permet de modifier le channel textuel ou se passe la partie rpg
    EXEMPLE: setchannel <nom du channel textuel>
  */
  if(commande === "setchannel"){
    APIUtiles.isAdmin(message.author.username, (bool) => {
      if(bool){
        APIUtiles.setChannelId(message.content.split(" ")[1], (bool, res) => {
          if(bool){
            message.reply('Le channel `' + message.content.split(" ")[1] + "` a été ajouté")
            APIUtiles.getChannelId((bool, res) => {
              if(bool){
                main.RPG_CHANNELID = res
                console.log("[APIUtiles] Le channel '" + res + "' a été chargé")
              } else console.log(res)
            })
          } else {
            message.reply('Une erreur est survenue')
            console.log(res)
          }
        })
      } else {
        message.reply("Vous n'êtes pas un administrateur du robot")
      }
    })
  }
  /*
  COMMANDE: test
  DESC: LPermet de tester de nouvelle fonctionnalitées
  EXEMPLE: test
  */
  if(commande === "test"){
    APIPlayers.enableSort(message.author.username, 5, (bool) => {
      if(bool){
        message.reply("OK")
      } else {
        message.reply("Une erreur est survenue")
      }
    })
  }
  /*
    COMMANDE: fight
    DESC: Le robot va se charger de prendre le niveau du joueur
     et de trouver aléatoirement un monstres de son niveau et de la zone ou il se situe
    EXEMPLE: fight
  */
  if(commande === "fight"){
    let returned = false
    APIPlayers.existsPlayerFromName(message.author.username, (bool) => {
      if(!bool){
        message.reply("Vous devez vous créer un compte ```+account create``` pour pouvoir utiliser cette commande")
        APIUtiles.removeInstancesCommandes(message.author.username, (bool) => {})
      }
    })
    APIUtiles.getInstanceCommandes(message.author.username, (bool, res) => {
      if(res === "fight")
        APIUtiles.setInstancesCommandes(message.author.username, "commande", "fight", 60)
      if(bool){
        APIUtiles.getPhraseByID(res, (phrase) => {
          if(phrase != null){
            message.reply(phrase)
          } else message.reply('Une erreur est survenue')
        })
        returned = true
      } else {
        APIUtiles.setInstancesCommandes(message.author.username, "commande", "fight", 60)
      }
    })
    if(returned) return
    APIPlayers.getLevelOfPlayer(message.author.username, (niveau) => {
      APIMonstres.getMontresFromLevel(niveau, (bool, res) => {
        if(typeof bool === 'string'){
          replyErrorInChat(message, res)
        } else
        if(bool){
          try{
            let monstre = new Monstre(res)
            if(monstre.getErreur()){
              message.reply("Une erreur est survenue")
              return
            }
            message.reply("Vous avez lancé un combat contre " + monstre.getNom() + " [Niveau: " + monstre.getNiveau() + ", Vie: " + monstre.getVie() + "]"+
              "\n Pour effectuer le combat, rendez-vous dans vos messages privées avec moi"+
              "\n Si aucune activité au bout de 1 minutes, le combat sera compté comme abandonné")
              let combat = new Combat(monstre, PlayerManager.getPlayerFromName(message.author.username))
              combat.sendCombat()
              CombatManager.addCombat(combat, message.author.username)
          } catch (e){
            message.reply("Une erreur est survenue")
            console.log(e)
          }
        } else {
          console.log("[APIUtiles] Une erreur est survenue à la demande du JSON pour les monstres par niveaux")
          console.log(res)
          APIUtiles.removeInstancesCommandes(message.author.username, (bool) => {})
        }
      })
    })
  }
  /*
    COMMANDE: infos
    DESC: Permet de connaitre des informations sur un joueur
    EXEMPLE: infos <pseudonyme du joueur>
  */
  if(commande === "infos"){
    let args = message.content.split(" ")
    if(args[1] === "joueurs"){
      let name = args[2]
      APIPlayers.getPlayerByName(name, (bool, res) => {
        if(typeof bool === 'string'){
          message.reply("Le joueur demandé n'existe pas ou n'a pas encore créé(e) de personnage." +
          "\n `+account create` pour vous créer un compte")
        } else
        if(bool){
          let niveau = res.infos.niveau
          let classe = res.infos.classe
          let zone = res.infos.zone
          message.reply("Voci les informatons que vous avez demandez sur le joueur " + name +
          "\n Niveau: `" + niveau + "`" +
          "\n Classe: `" + classe + "`" +
          "\n Zone actuelle: `" + zone + "`")
        } else {
          console.log("[APIUtiles] Une erreur est survenue à la demande du JSON pour les joueurs par noms")
          console.log(res)
          APIUtiles.removeInstancesCommandes(message.author.username, (bool) => {})
        }
      })
    }
  }
  /*
    COMMANDE: account
    DESC: Créer / Modifier des informations sur votre compte
    EXEMPLES: account create
  */
  if(commande === "account"){
    let args = message.content.split(" ")
    if(args[1] == null){
      message.reply("```"+
                    ":account create | Créer un compte" +
                    "```")
    }
    if(args[1] === "create"){
      APIPlayers.existsPlayerFromName(message.author.username, (bool) => {
          if(!bool){
            let returned = false
            APIUtiles.getInstanceCommandes(message.author.username, (bool, res) => {
              if(res === "account_create")
                APIUtiles.setInstancesCommandes(message.author.username, "commande", "account_create", 120)
              if(bool){
                APIUtiles.getPhraseByID(res, (phrase) => {
                  if(phrase != null){
                    message.reply(phrase)
                  }
                })
                returned = true
                APIUtiles.removeInstancesCommandes(message.author.username, (bool) => {})
              } else {
                APIUtiles.setInstancesCommandes(message.author.username, "commande", "account_create", 120)
                message.reply("Votre compte est en cours de création .. \n"+
                              "Ecrivez **:account classes <chiffre correspond ci-dessous>** pour choisir votre classe:\n"+
                              "```"+
                              "1: Chasseur\n"+
                              "2: Guerrier\n"+
                              "3: Assasin\n"+
                              "4: Mage\n"+
                              "```")
              }
            })
          } else {
            message.reply("Vous avez déjà un compte associé à votre pseudonyme discord")
            APIUtiles.removeInstancesCommandes(message.author.username, (bool) => {})
          }
      })
    }
    if(args[1] === "classes"){
      APIUtiles.getInstanceCommandes(message.author.username, (bool, res) => {
        if(bool){
          APIUtiles.setInstancesCommandes(message.author.username, "commande", "account_create", 120)
          if(args[2] != null){
            try{
              APIPlayers.getClasseFromNumber(parseInt(args[2]), (bool, res) => {
                if(bool){
                  APIPlayers.createAccount(message.author.username, res, (bool) => {
                    if(bool){
                      message.reply("Votre compte a bien été créée")
                      APIUtiles.removeInstancesCommandes(message.author.username, (bool) => {
                        if(bool){
                          APIPlayers.getPlayerByName(message.author.username, (bool, res) => {
                            if(typeof bool === 'string'){
                              message.reply("Le joueur demandé n'existe pas ou n'a pas encore créé(e) de personnage." +
                              "\n `+account create` pour vous créer un compte")
                            } else
                            if(bool){
                              let niveau = res.infos.niveau
                              let classe = res.infos.classe
                              let zone = res.infos.zone
                              message.reply("Voci les informatons que vous avez demandez sur le joueur " + message.author.username +
                              "\n Niveau: `" + niveau + "`" +
                              "\n Classe: `" + classe + "`" +
                              "\n Zone actuelle: `" + zone + "`")
                            } else {
                              console.log("[APIUtiles] Une erreur est survenue à la demande du JSON pour les joueurs par noms")
                              console.log(res)
                            }
                          })
                        } else {
                          message.reply("Une erreur est survenue")
                          APIUtiles.removeInstancesCommandes(message.author.username, (bool) => {})
                        }
                      })
                    } else {
                      message.reply("Une erreur est survenue")
                      APIUtiles.removeInstancesCommandes(message.author.username, (bool) => {})
                    }
                  })
                } else {
                  message.reply("Une erreur est survenue")
                  APIUtiles.removeInstancesCommandes(message.author.username, (bool) => {})
                }
              })
            } catch (e){
              message.reply("Veuillez rentrez un nombre en second argument")
              APIUtiles.removeInstancesCommandes(message.author.username, (bool) => {})
            }
          } else {
            message.reply("Veuillez rentrez un nombre en second argument")
            APIUtiles.removeInstancesCommandes(message.author.username, (bool) => {})
          }
        } else {
          message.reply("Vous devez être en train de créer votre compte pour pouvoir user de cette commande")
          APIUtiles.removeInstancesCommandes(message.author.username, (bool) => {})
        }
      })
    }
    if(args[1] === "infos"){
      APIPlayers.getPlayerByName(message.author.username, (bool, res) => {
        if(typeof bool === 'string'){
          message.reply("Le joueur demandé n'existe pas ou n'a pas encore créé(e) de personnage." +
          "\n `+account create` pour vous créer un compte")
        } else
        if(bool){
          let niveau = res.infos.niveau
          let classe = res.infos.classe
          let zone = res.infos.zone
          let player = PlayerManager.getPlayerFromName(message.author.username)
          message.reply("Voci les informatons que vous avez demandez sur le joueur " + message.author.username +
          "\n Niveau: ``" + niveau + "``" +
          "\n Classe: ``" + classe + "``" +
          "\n Zone actuelle: ``" + zone + "``" +
          "\n Points d'experiences avant d'être promu: ``" + player.getNeededExperience() + "``")
        } else {
          console.log("[APIUtiles] Une erreur est survenue à la demande du JSON pour les joueurs par noms")
          console.log(res)
          APIUtiles.removeInstancesCommandes(message.author.username, (bool) => {})
        }
      })
    }
  }
  if(commande === "sorts"){
    message.reply("Cette commande est utilisé dans les messages privées avec moi quand vous aurez lancé un combat")
  }
  if(commande === "rpg"){
    let args = message.content.split(" ")
    if(args[1] === "infos"){
      APIUtiles.getAdmins((bool, res) => {
        if(bool){
          let admins = ""
          for(let i in res){
            admins += res[i] + "\n"
          }
          message.reply("Liste des administrateur du robot:\n\n" +
                  "``" + admins + "``")
        } else {
          message.reply("Une erreur est survenue")
        }
      })
    } else
    if(args[1] === "startevent"){
      APIUtiles.isAdmin(message.author.username, (bool) => {
        if(bool){
          if(args[2] != null){

          } else {
            message.reply("Il faut rentrer le nom d'un monstre d'évenement en 3ème argument")
          }
        } else {
          message.reply("Vous n'êtes pas un administrateur")
        }
      })
    } else {
      APIUtiles.isAdmin(message.author.username, (bool) => {
        if(bool){
          message.reply("Liste des sous-commandes:\n\n"+
                    "``:rpg infos``: Connaitre les informations du robot\n"+
                    "``:rpg startevent``: Lancer un évenement")
        } else {
          message.reply("Vous n'êtes pas un administrateur")
        }
      })
    }
  }
}
/*

      COMMANDES PAR: CHAT PRIVEE

*/
exports.onDMCommandes = (commande, optionsObj) => {
  let message = optionsObj.msg
  console.log("Commande lancé par " + message.author.username + ":",commande)
  if(!PlayerManager.existFromName(message.author.username)){
    APIPlayers.getPlayerByName(message.author.username, (bool, res) => {
      if(bool && typeof bool != 'string'){
        let player = new Player(res, message.author)
        PlayerManager.addPlayer(player)
        console.log("[APICommandes] L'utilisateur " + message.author.username + " a été ajouter au tableaux des joueurs")
      }
    })
  } else {
    APIPlayers.getPlayerByName(message.author.username, (bool, res) => {
      if(bool){
        let player = new Player(res, message.author)
        PlayerManager.updatePlayer(PlayerManager.getPlayerFromName(message.author.username), player)
      }
    })
    PlayerManager.getPlayerFromName(message.author.username).setAuthor(message.author)
  }
  /*
    COMMANDE: sorts <numéro du sort>
    DESC: Lancer un sort
    EXEMPLES: sorts 1
  */
  if(commande === "sorts" || commande === "sort"){
    if(CombatManager.existFromName(message.author.username)){
      let args = message.content.split(" ")
      let number = args[1]
      let combat = CombatManager.getCombatFromName(message.author.username)
      if(combat.getRound() == "bot"){
        message.reply("Vous ne pouvez pas attaquer, c'est à mon tour.")
        APIUtiles.setInstancesCommandes(message.author.username, "commande", "fight", 60)
        return
      }
      APIPlayers.getPlayerByName(message.author.username, (bool, res) => {
        if(bool){
          APIPlayers.isEnabledSort(message.author.username, (parseInt(number)-1), (bool, enabled) => {
            if(bool){
              if(enabled){
                let vie = APISpells.generateBaseDamage(APISpells.SPELLS[res.infos.classe.toUpperCase()][Object.keys(APISpells.SPELLS[res.infos.classe.toUpperCase()])[number-1]].baseDamage, res.infos.niveau)
                combat.getMonstre().retirerVie(vie)
                if(APISpells.SPELLS[res.infos.classe.toUpperCase()][Object.keys(APISpells.SPELLS[res.infos.classe.toUpperCase()])[number-1]].special != ""){
                  combat.getMonstre().ajouterEffet(APISpells.SPELLS[res.infos.classe.toUpperCase()][Object.keys(APISpells.SPELLS[res.infos.classe.toUpperCase()])[number-1]].special, 1)
                }
                combat.editCombat((bool) => {
                  if(bool){
                    CombatManager.removeCombatFromName(message.author.username)
                    APIUtiles.removeInstancesCommandes(message.author.username, (bool) => {})
                    console.log("SUPRIMMERRRR")
                    APIPlayers.isLevelUp(message.author.username, (bool) => {})
                  } else {
                    let displayname = APISpells.SPELLS[res.infos.classe.toUpperCase()][Object.keys(APISpells.SPELLS[res.infos.classe.toUpperCase()])[number-1]].displayname
                    combat.editLastAttack(displayname, vie)
                      APIUtiles.setInstancesCommandes(message.author.username, "commande", "fight", 60)
                      console.log("PAS SUPRIMMERRRR")
                  }
                })
              } else {
                message.reply("Vous n'êtes pas en possession de ce sort")
                APIUtiles.setInstancesCommandes(message.author.username, "commande", "fight", 60)
              }
            } else {
              APIUtiles.setInstancesCommandes(message.author.username, "commande", "fight", 60)
            }
          })
        } else {
          message.reply("Une erreur est survenue")
          APIUtiles.removeInstancesCommandes(message.author.username, (bool) => {})
        }
      })
    } else {
      message.reply("Vous n'avez pas lancé de combat")
      APIUtiles.removeInstancesCommandes(message.author.username, (bool) => {})
    }
  }
  if(commande === "fight"){
    let returned = false
    APIPlayers.existsPlayerFromName(message.author.username, (bool) => {
      if(!bool){
        message.reply("Vous devez vous créer un compte ```+account create``` pour pouvoir utiliser cette commande")
      }
    })
    APIUtiles.getInstanceCommandes(message.author.username, (bool, res) => {
      if(res === "fight")
        APIUtiles.setInstancesCommandes(message.author.username, "commande", "fight", 60)
      if(bool){
        APIUtiles.getPhraseByID(res, (phrase) => {
          if(phrase != null){
            message.reply(phrase)
          } else message.reply('Une erreur est survenue')
        })
        returned = true
      } else {
        APIUtiles.setInstancesCommandes(message.author.username, "commande", "fight", 60)
      }
    })
    if(returned) return
    APIPlayers.getLevelOfPlayer(message.author.username, (niveau) => {
      APIMonstres.getMontresFromLevel(niveau, (bool, res) => {
        if(typeof bool === 'string'){
          replyErrorInChat(message, res)
        } else
        if(bool){
          try{
            let monstre = new Monstre(res)
            if(monstre.getErreur()){
              message.reply("Une erreur est survenue")
              return
            }
            let combat = new Combat(monstre, PlayerManager.getPlayerFromName(message.author.username))
            combat.sendCombat()
            CombatManager.addCombat(combat, message.author.username)
          } catch (e){
            message.reply("Une erreur est survenue")
            console.log(e)
          }
        } else {
          console.log("[APIUtiles] Une erreur est survenue à la demande du JSON pour les monstres par niveaux")
          console.log(res)
        }
      })
    })
  }
}
