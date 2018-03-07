function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
function CombatManager() {
    this.combats = []
}

CombatManager.prototype.getAllCombats = function(){
  return this.combats
}
CombatManager.prototype.getCombatFromName = function(name){
  for(let i in this.combats){
    if(this.combats[i]["name"] == name){
      return this.combats[i]["combat"]
    }
  }
  return null
}
CombatManager.prototype.getNameFromCombat = function(combat){
  for(let i in this.combats){
    if(this.combats[i]["combat"] == combat){
      return this.combats[i]["name"]
    }
  }
  return null
}
CombatManager.prototype.existFromName = function(name){
  for(let i in this.combats){
    if(this.combats[i]["name"] == name){
      return true
    }
  }
  return false
}
CombatManager.prototype.existFromCombat = function(combat){
  for(let i in this.combats){
    if(this.combats[i]["combat"] == combat){
      return true
    }
  }
  return false
}


CombatManager.prototype.addCombat = function(combat, name){
  let buffer = []
  buffer["name"] = name
  buffer["combat"] = combat
  this.combats.push(buffer)
  //console.log("Combats", this.combats)
}
CombatManager.prototype.removeCombat = function(combat){
  //console.log("Combats", this.combats)
  for(let i in this.combats){
    if(this.combats["combat"] == combat){
      delete this.combats[i]
      //console.log("Combats", this.combats)
    }
  }
}
CombatManager.prototype.removeCombatFromName = function(name){
  //console.log("Combats", this.combats)
  for(let i in this.combats){
    if(this.combats[i]["name"] == name){
      delete this.combats[i]
      //console.log("Combats", this.combats)
    }
  }
}

CombatManager.prototype.sendCombatAbandonnee = function(name){
  for(let i in this.combats){
    if(this.combats[i]["name"] == name){
      this.combats[i]["combat"].sendCombatAbandonnee()
      console.log("Combat abandonnee de " + this.combats[i]["combat"].getAuthor().username)
    }
  }
}

module.exports = CombatManager
