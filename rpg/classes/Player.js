function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
function getRandomInteger(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function Player(obj, author) {
    try{
      this.nom = author.username
      this.niveau = obj.infos.niveau
      this.classe = obj.infos.classe
      this.experience = obj.infos.experience
      this.zone = obj.infos.zone
      this.vie = 300 + (this.niveau * 50)
      this.maxvie = this.vie
      this.author = author
    } catch (e){
      console.log(e)
      this.erreur = true
    }
}

Player.prototype.getNom = function(){
  return this.nom
}
Player.prototype.getNiveau = function(){
  return this.niveau
}
Player.prototype.getExperience = function(){
  return this.experience
}
Player.prototype.getNeededExperience = function(){
  return ((300+200*this.niveau) - this.experience)
}
Player.prototype.getZone = function(){
  return this.zone
}
Player.prototype.getVie = function(){
  return this.vie
}
Player.prototype.getMaxVie = function(){
  return this.maxvie
}
Player.prototype.getAuthor = function(){
  return this.author
}
Player.prototype.getClasse = function(){
  return this.classe
}
Player.prototype.getErreur = function(){
  return this.erreur
}

Player.prototype.setNom = function(nom){
  this.nom = nom
}
Player.prototype.setNiveau = function(niveau){
  this.niveau = niveau
}
Player.prototype.setExperience = function(experience){
  this.experience = experience
}
Player.prototype.setVie = function(vie){
  this.vie = vie
}
Player.prototype.setAuthor = function(author){
  this.author = author
}

Player.prototype.retirerExperience = function(experience){
  this.experience -= experience
}
Player.prototype.ajouterExperience = function(experience){
  this.experience += experience
}
Player.prototype.retirerVie = function(vie){
  this.vie -= vie
}
Player.prototype.ajouterVie = function(vie){
  this.vie += vie
}

Player.prototype.sendLevelUp = function(){
  this.author.send("```Bravo ! Vous êtes promu niveau " + this.niveau + " !```")
}
Player.prototype.sendMessage = function(message){
  this.author.send(message)
}

module.exports = Player
