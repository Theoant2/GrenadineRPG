var APIUtiles = require('./api-utiles.js')
var APIPlayers = require('./api-players.js')
let SPELLS = {
  GUERRIER: {
    CHARGE: {
      baseDamage: "30-60",
      special: "",
      specialChance: 100,
      cost: 20,
      displayname: "Charge",
      unlocklevel: 0
    },
    UPPERCUT: {
      baseDamage: "10-30",
      special: "affaibli",
      specialChance: 70,
      cost: 30,
      displayname: "Uppercut",
      unlocklevel: 3
    },
    FRAPPE_AU_SOL: {
      baseDamage: "50-70",
      special: "etourdi",
      specialChance: 70,
      cost: 30,
      displayname: "Frappe au sol",
      unlocklevel: 6
    },
    TOURNADE_SANGLANTE: {
      baseDamage: "80-110",
      special: "",
      specialChance: 100,
      cost: 100,
      displayname: "Tournade sanglante",
      unlocklevel: 9
    },
    FRAPPE_ASSOMANTE: {
      baseDamage: "80-110",
      special: "",
      specialChance: 100,
      cost: 100,
      displayname: "Frappe assomante",
      unlocklevel: 15
    },
    CHOKESLAM: {
      baseDamage: "80-110",
      special: "",
      specialChance: 100,
      cost: 100,
      displayname: "Chokeslam",
      unlocklevel: 20
    }
  },
  CHASSEUR: {
    FLECHE_IMMOBILISANTE: {
      baseDamage: "60-90",
      special: "etourdi",
      specialChance: 70,
      cost: 20,
      displayname: "Flèche immobilisante",
      unlocklevel: 0
    },
    POIGNARD_EMPOISONNE: {
      baseDamage: "40-60",
      special: "poison",
      specialChance: 90,
      cost: 30,
      displayname: "Poignard empoisonne",
      unlocklevel: 3
    },
    DOUBLE_TIR: {
      baseDamage: "90-120",
      special: "",
      specialChance: 70,
      cost: 30,
      displayname: "Double tir",
      unlocklevel: 6
    },
    ENTAILLE_BARBARE: {
      baseDamage: "130-150",
      special: "saignement",
      specialChance: 95,
      cost: 100,
      displayname: "Entaille barbare",
      unlocklevel: 9
    },
    ESQUIVE_EPINEUSE: {
      baseDamage: "80-110",
      special: "",
      specialChance: 100,
      cost: 100,
      displayname: "Esquive épineuse",
      unlocklevel: 15
    },
    APPEL_A_LAIDE: {
      baseDamage: "80-110",
      special: "",
      specialChance: 100,
      cost: 100,
      displayname: "Appel a l'aide",
      unlocklevel: 20
    }
  },
  ASSASSIN: {
    SAUT_BESTIAL: {
      baseDamage: "20-60",
      special: "",
      specialChance: 100,
      cost: 20,
      displayname: "Saut bestiale",
      unlocklevel: 0
    },
    GRIFFES_TYRANNIQUES: {
      baseDamage: "40-60",
      special: "affaibli",
      specialChance: 70,
      cost: 30,
      displayname: "Griffes tyranniques",
      unlocklevel: 3
    },
    LAME_DECHIRANTE: {
      baseDamage: "80-110",
      special: "saignement",
      specialChance: 70,
      cost: 30,
      displayname: "Lame déchirante",
      unlocklevel: 6
    },
    ROULADE_PERILLEUSE: {
      baseDamage: "120-130",
      special: "esquive",
      specialChance: 60,
      cost: 100,
      displayname: "Roulade périlleuse",
      unlocklevel: 9
    },
    LANCER_DE_SHURIKENS: {
      baseDamage: "80-110",
      special: "",
      specialChance: 100,
      cost: 100,
      displayname: "Lancer de shurikens",
      unlocklevel: 15
    },
    FIOLE_DE_POISON: {
      baseDamage: "80-110",
      special: "",
      specialChance: 100,
      cost: 100,
      displayname: "Fiole de poison",
      unlocklevel: 20
    }
  },
  MAGE: {
    FUMEE_TOXIQUE: {
      baseDamage: "40-70",
      special: "etouffe",
      specialChance: 60,
      cost: 20,
      displayname: "Fumée toxique",
      unlocklevel: 0
    },
    COUP_SPIRITUEL: {
      baseDamage: "70-100",
      special: "",
      specialChance: 70,
      cost: 30,
      displayname: "Coup spirituel",
      unlocklevel: 3
    },
    SOINS_KI_VIENS_DU_CIEL_LOL: {
      baseDamage: "100-150",
      special: "soins",
      specialChance: 100,
      cost: 30,
      displayname: "Soins ki viens du ciel lol",
      unlocklevel: 6
    },
    FIOLE_ENCHANTEE: {
      baseDamage: "20-30",
      special: "soins",
      specialChance: 100,
      cost: 100,
      displayname: "Fiole enchantée",
      unlocklevel: 9
    },
    INVOCATION: {
      baseDamage: "80-110",
      special: "",
      specialChance: 100,
      cost: 100,
      displayname: "Invocation",
      unlocklevel: 15
    },
    TRANSFORMATION: {
      baseDamage: "00-00",
      special: "transformation",
      specialChance: 100,
      cost: 100,
      displayname: "Transformation",
      unlocklevel: 20
    }
  }
}
function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
function getRandomInteger(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

exports.SPELLS = SPELLS

exports.generateBaseDamage = (baseDamage, niveau) => {
  return getRandomInteger((parseInt(baseDamage.split("-")[0])+(niveau*3)),(parseInt(baseDamage.split("-")[1])+(niveau*3)))
}

exports.generateListeSorts = (name, send) => {
  APIPlayers.getPlayerByName(name, (bool, res) => {
    if(bool){
      let player = res
      let classe = res.infos.classe
      let niveau = res.infos.niveau
      let spells_player = res.spells
      let liste = ""
      //console.log(SPELLS[classe.toUpperCase()][Object.keys(SPELLS[classe.toUpperCase()])[0]])
      let nb = 1
      let lengthmax = 0
      for(let i in SPELLS[classe.toUpperCase()]){
        if(SPELLS[classe.toUpperCase()][i].displayname.length > lengthmax) lengthmax = SPELLS[classe.toUpperCase()][i].displayname.length
      }
      lengthmax+3
      let damage_length = 0
      for(let i in SPELLS[classe.toUpperCase()]){
        if(spells_player[i].enable){
          let damage = " (Dégats: " + (parseInt(SPELLS[classe.toUpperCase()][i].baseDamage.split("-")[0])+(niveau*3)) + "-" + (parseInt(SPELLS[classe.toUpperCase()][i].baseDamage.split("-")[1])+(niveau*3)) + ")"
          if(damage.length > damage_length) damage_length = damage.length
          liste += nb + ": " + SPELLS[classe.toUpperCase()][i].displayname + " ".repeat(lengthmax-(SPELLS[classe.toUpperCase()][i].displayname.length)) +
           damage +
          (SPELLS[classe.toUpperCase()][i].special != "" ? (" ".repeat(3+damage_length-damage.length) + "(Spécial: " + SPELLS[classe.toUpperCase()][i].special + ")") : ("")) + "\n"
        } else {
          liste += nb + ": **** INCONNU ****\n"
        }
        nb++
      }
      send(true, liste)
    } else {
      send(false, null)
    }
  })
}
exports.checkUnlockedSpells = (player) => {
  let returned = false
  for(let i in SPELLS[player.getClasse().toUpperCase()]){
    if(SPELLS[player.getClasse().toUpperCase()][i].unlocklevel <= player.getNiveau()){
      APIPlayers.isEnabledSort(player.getNom(), Object.keys(SPELLS[player.getClasse().toUpperCase()]).indexOf(i), (bool, res) => {
        if(bool){
          if(!res){
            APIPlayers.enableSort(player.getNom(), Object.keys(SPELLS[player.getClasse().toUpperCase()]).indexOf(i), (bool) => {
              if(bool){
                player.sendMessage("Vous avez reçu un nouveau sort: ``" + SPELLS[player.getClasse().toUpperCase()][i].displayname + " (Dégats: " +
                  SPELLS[player.getClasse().toUpperCase()][i].baseDamage + ") " + (SPELLS[player.getClasse().toUpperCase()][i].special != "" ? ("(Spécial: " + SPELLS[player.getClasse().toUpperCase()][i].special + ")") : "") + "``")
                  console.log("[APISpells] Le joueur " + player.getNom() + " a gagné le sort " + SPELLS[player.getClasse().toUpperCase()][i].displayname)
                  returned = true
              }
            })
          } else {
            console.log("Bruuh 2")
          }
        } else {
          console.log("Bruuh 1")
        }
      })
    } else {
      console.log("Bruuh 3 : ", SPELLS[player.getClasse().toUpperCase()][i].unlocklevel, " ", player.getNiveau())
    }
    if(returned) break
  }
}
