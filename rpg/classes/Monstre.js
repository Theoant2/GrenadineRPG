function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
function getRandomInteger(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function Monstre(obj) {
    try{
      array = Object.keys(obj)
      nb = Math.round(Math.random()*(array.length-1))
      random = array[nb]
      this.nom = random
      this.niveau = getRandomInteger(obj[random].infos.niveau.split("-")[0], obj[random].infos.niveau.split("-")[1])
      this.vie = getRandomInteger(obj[random].infos.vie.split("-")[0], obj[random].infos.vie.split("-")[1])
      this.maxvie = this.vie
      this.spells = obj[random].spells
      this.comportement = obj[random].infos.comportement
      this.experience = obj[random].infos.experience
      this.effet = []
      this.erreur = false
    } catch (e){
      console.log(e)
      this.erreur = true
    }
}

Monstre.prototype.getNom = function(){
  return this.nom
}
Monstre.prototype.getNiveau = function(){
  return this.niveau
}
Monstre.prototype.getVie = function(){
  return this.vie
}
Monstre.prototype.getMaxVie = function(){
  return this.maxvie
}
Monstre.prototype.getSpells = function(){
  return this.spells
}
Monstre.prototype.getComportement = function(){
  return this.comportement
}
Monstre.prototype.getExperience = function(){
  return this.experience
}
Monstre.prototype.getErreur = function(){
  return this.erreur
}

Monstre.prototype.setNom = function(nom){
  this.nom = nom
}
Monstre.prototype.setNiveau = function(niveau){
  this.niveau = niveau
}
Monstre.prototype.setVie = function(vie){
  this.vie = vie
}

Monstre.prototype.generateDamage = function(baseDamage){
  return getRandomInteger((parseInt(baseDamage.split("-")[0])+(this.niveau*2)),(parseInt(baseDamage.split("-")[1])+(this.niveau*2)))
}

Monstre.prototype.retirerVie = function(vie){
  this.vie -= vie
}
Monstre.prototype.ajouterVie = function(vie){
  this.vie += vie
}
Monstre.prototype.ajouterEffet = function(effet, time){
  let buffer = {
    "name": effet,
    "time": time
  }
  this.effet.push(buffer)
}

module.exports = Monstre
