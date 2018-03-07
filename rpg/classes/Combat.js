var APISpells = require('../api-spells.js')
var APIPlayers = require('../api-players.js')
var APIUtiles = require('../api-utiles.js')
function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
function getRandomInteger(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}
var ROUND = {
  PLAYER: "player",
  BOT: "bot"
}
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
function Combat(monstre, player) {
    try{
      this.monstre = monstre
      this.author = player.getAuthor()
      this.player = player
      this.round = ROUND.PLAYER
    } catch (e){
      console.log(e)
      this.erreur = true
    }
}

Combat.prototype.getMonstre = function(){
  return this.monstre
}
Combat.prototype.getAuthor = function(){
  return this.author
}
Combat.prototype.getPlayer = function(){
  return this.player
}
Combat.prototype.getErreur = function(){
  return this.erreur
}
Combat.prototype.getRound = function(){
  return this.round
}

Combat.prototype.setMonstre = function(monstre){
  this.monstre = monstre
}
Combat.prototype.setAuthor = function(monstre){
  this.author = author
}
Combat.prototype.setPlayer = function(player){
  this.player = player
}
Combat.prototype.setRound = function(round){
  this.round = round
}

Combat.prototype.switchRound = function(){
  if(this.round == ROUND.PLAYER){
    this.round = ROUND.BOT
  } else {
    this.round = ROUND.PLAYER
  }
  console.log("ROUND", this.round)
}

Combat.prototype.sendCombat = function(){
  this.author.send("[COMBAT] Le combat va démarrer [COMBAT] Pour lancer un sort: +sorts <Numéro du sort>")
  this.author.send("```[Nv." + this.monstre.getNiveau()  + "] " + this.monstre.getNom() + ": " + this.monstre.getVie() + "\n" +
                  "[Nv." + this.player.getNiveau() + "] " + this.author.username + ": " + this.player.getVie() + "\n" +
                  "C'est au tour à: " + (this.round == "player" ? "Vous" : this.monstre.getNom()) + "```").then(
    message => this.messageVie = message
  )
  APISpells.generateListeSorts(this.author.username, (bool, res) => {
    if(bool){
      this.author.send("```" + res + "```").then(
        message => this.messageSorts = message
      )
    } else {
      this.author.send("```UNE ERREUR EST SURVENUE```").then(
        message => this.messageSorts = message
      )
    }
  })
  this.author.send("```Dernière attaque: ```").then(
    message => this.messagePlayerLastAttack = message
  )
  this.author.send("```Dernière attaque de " + this.monstre.getNom() + ": ```").then(
    message => this.messageBotLastAttack = message
  )
  /*sleep(4000).then(() => {
    this.monstre.retirerVie(2)
    this.messageVie.edit("```[Nv. " + this.monstre.getNiveau()  + " ] " + this.monstre.getNom() + ": " + this.monstre.getVie() + "\n" +
                    "Votre vie: 30```")
  })
  sleep(8000).then(() => {
    this.monstre.retirerVie(2)
    this.messageVie.edit("```[Nv. " + this.monstre.getNiveau()  + " ] " + this.monstre.getNom() + ": " + this.monstre.getVie() + "\n" +
                    "Votre vie: 30```")
  })
  sleep(12000).then(() => {
    this.monstre.retirerVie(2)
    this.messageVie.edit("```[Nv. " + this.monstre.getNiveau()  + " ] " + this.monstre.getNom() + ": " + this.monstre.getVie() + "\n" +
                    "Votre vie: 30```")
  })*/
}
Combat.prototype.editCombat = function(send){
  this.messageVie.edit("```[Nv." + this.monstre.getNiveau()  + "] " + this.monstre.getNom() + ": " + this.monstre.getVie() + "\n" +
                  "[Nv." + this.player.getNiveau() + "] " + this.author.username + ": " + this.player.getVie() + "\n" +
                  "C'est au tour à: " + (this.round == "player" ? "Vous" : this.monstre.getNom()) + "```")
  if(this.monstre.getVie() <= 0){
    this.author.send("``[GAGNEE]`` Vous avez tué " + "```[Nv." + this.monstre.getNiveau()  + "] " + this.monstre.getNom() + " !```")
    APIUtiles.removeInstancesCommandes(this.author.username, (bool) => {})
    let pourcentage = Math.exp( -(Math.pow(this.player.getNiveau()-this.monstre.getNiveau(),2) / (2*Math.pow(2,2)) ) )
    let monstre_exp = this.monstre.getExperience()
    let experience = Math.round(monstre_exp * pourcentage)
    console.log("POURCENTAGE", pourcentage)
    console.log("MOBSTRE_EXP", monstre_exp)
    console.log("EXPERIENCE", experience)
    APIPlayers.addExperience(this.author.username, experience, (bool) => {
      if(bool){
        APIPlayers.isLevelUp(this.author.username, (bool) => {})
      }
    })
    this.author.send("Vous avez gagné ``" + experience + "`` experience dans ce combat")
    send(true)
  } else if(this.player.getVie() <= 0){
    this.author.send("``[PERDU]`` Vous avez été tué par " + "```[Nv." + this.monstre.getNiveau()  + "] " + this.monstre.getNom() + " !```")
    send(true)
  } else send(false)
}
Combat.prototype.editLastAttack = function(name, damage){
  this.lastPlayerAttackName = name
  this.lastPlayerAttackDamage = damage
  this.messagePlayerLastAttack.edit("```Votre dernière attaque: " + this.lastPlayerAttackName + " (Dégats: " + this.lastPlayerAttackDamage + ") ```")
  this.updateEffets()
  this.switchRound()
  this.editCombat((bool) => {})
  sleep(1500).then(() => {
    let pourcentageLifeState = 0
    if(this.monstre.getComportement() === "offensif"){
      pourcentageLifeState = 30
    } else if(this.monstre.getComportement() === "deffensif"){
      pourcentageLifeState = 40
    }
    if(((this.monstre.getVie()/this.monstre.getMaxVie())*100) <= pourcentageLifeState){
      let attackDeffensive = this.monstre.getSpells()[Object.keys(this.monstre.getSpells())[Object.keys(this.monstre.getSpells()).length-1]]
      let damage = this.monstre.generateDamage(attackDeffensive.baseDamage)
      this.messageBotLastAttack.edit("```Dernière attaque de " + this.monstre.getNom() + ": " + Object.keys(this.monstre.getSpells())[random] +
       " (Dégats: " + damage + ")```")
      this.player.retirerVie(damage)
      this.switchRound()
      this.editCombat((bool) => {})
    } else {
      let random = getRandomInteger(0,Object.keys(this.monstre.getSpells()).length)
      let attackOffensive = this.monstre.getSpells()[Object.keys(this.monstre.getSpells())[random]]
      let damage = this.monstre.generateDamage(attackOffensive.baseDamage)
      this.messageBotLastAttack.edit("```Dernière attaque de " + this.monstre.getNom() + ": " + Object.keys(this.monstre.getSpells())[random] +
       " (Dégats: " + damage + ")```")
      this.player.retirerVie(damage)
      this.switchRound()
      this.editCombat((bool) => {})
    }
  })
}
Combat.prototype.sendCombatAbandonnee = function(){
  this.author.send("``[PERDU]`` Le combat a été abandonné car vous êtes rester inactif pendant plus de 60 secondes")
}
Combat.prototype.updateEffets = function(){
  for(let i in this.monstre.effet){
    let effet = this.monstre.effet[i]
    console.log("EFFET", effet)
    if(effet.name === EFFET.ETOUFFE){
      this.lastPlayerSpecialDamage = (this.player.getNiveau()*2)+10
      this.monstre.retirerVie(this.lastPlayerSpecialDamage)
      console.log("CONTENT ",this.messagePlayerLastAttack.content)
      this.messagePlayerLastAttack.edit("```Votre dernière attaque: " + this.lastPlayerAttackName + " (Dégats: " + this.lastPlayerAttackDamage + ") (Spécial: Etouffe, Dégats: " + this.lastPlayerSpecialDamage + ") (Total: " + (this.lastPlayerAttackDamage + this.lastPlayerSpecialDamage) + ")```")
    }
    if(effet.name == EFFET.SOINS){
      this.monstre.ajouterVie(this.player.getNiveau())
    }
    if(effet.name == EFFET.POISON){
      this.monstre.retirerVie(this.player.getNiveau()*1.5)
    }
    if(effet.name == EFFET.SAIGNEMENT){
      this.monstre.retirerVie(this.player.getNiveau())
    }
    if(effet.name == EFFET.ETOURDI){
      this.monstre.retirerVie(this.player.getNiveau())
    }
    if(effet.name == EFFET.ETOUFFE){
      this.monstre.retirerVie(this.player.getNiveau())
    }
    effet.time--
    if(effet.time <= 0){
      delete this.monstre.effet[i]
    }
  }
}

module.exports = Combat
