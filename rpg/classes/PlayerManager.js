function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
function PlayerManager() {
    this.players = []
}

PlayerManager.prototype.getAllPlayers = function(){
  return this.players
}
PlayerManager.prototype.getPlayerFromName = function(name){
  for(let i in this.players){
    if(this.players[i].getNom() == name){
      return this.players[i]
    }
  }
  return null
}
PlayerManager.prototype.existFromName = function(name){
  for(let i in this.players){
    if(this.players[i].getNom() == name){
      return true
    }
  }
  return false
}

PlayerManager.prototype.addPlayer = function(player){
  this.players.push(player)
  //console.log("Combats", this.combats)
}
PlayerManager.prototype.updatePlayer = function(ancient, newplayer){
  if(this.existFromName(ancient.getNom())){
    for(let i in this.players){
      if(this.players[i] == ancient){
        this.players[i] = newplayer
      }
    }
  }
}
PlayerManager.prototype.removeCombat = function(player){
  //console.log("Combats", this.combats)
  for(let i in this.combats){
    if(this.players[i] == player){
      delete this.players[i]
      //console.log("Combats", this.combats)
    }
  }
}
PlayerManager.prototype.removeCombatFromName = function(name){
  //console.log("Combats", this.combats)
  for(let i in this.combats){
    if(this.players[i].getNom() == name){
      delete this.players[i]
      //console.log("Combats", this.combats)
    }
  }
}

module.exports = PlayerManager
