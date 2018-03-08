const Discord = require('discord.js')
const bot = new Discord.Client({autoReconnect:true})
var APIUtiles = require('./rpg/api-utiles.js')
var APIMonstres = require('./rpg/api-monstres.js')
var APIPlayers = require('./rpg/api-players.js')
var APICommandes = require('./rpg/api-commandes.js')
var APICombatManager = require('./rpg/classes/CombatManager.js')
var Combat = require('./rpg/classes/Combat.js')
var CombatManager = APIUtiles.getCombatManager()
var RPG_PREFIX = ""
var RPG_CHANNELID = null
var BOTADMINS = ["shadawo","AnotherFox"]

console.log("Démarrage du programme ..");

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
String.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return hours+':'+minutes+':'+seconds;
}
function shuffleArray(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
}

bot.on('ready', function () {
    console.log("Je suis connecté !")
    bot.user.setPresence({ game: { name: '+help', type: 0 } })
    APIUtiles.getPrefix((bool, res) => {
      if(bool){
        RPG_PREFIX = res
        console.log("[APIUtiles] Le préfix '" + res + "' a été chargé")
        bot.user.setPresence({ game: { name: (RPG_PREFIX + 'help'), type: 0 } })
      } else console.log(res)
    })
    APIUtiles.getChannelId((bool, res) => {
      if(bool){
        RPG_CHANNELID = res
        console.log("[APIUtiles] Le channel id '" + res + "' a été chargé")
      } else console.log(res)
    })
})

bot.on('message', message => {
  /*

          PARTIE RPG

  */
  if(message.channel.type === "dm"){
    if(message.content.startsWith(RPG_PREFIX)){
      APICommandes.onDMCommandes(message.content.replace(RPG_PREFIX, "").split(" ")[0], {
        msg: message
      })
    }
  }
  if(RPG_CHANNELID == message.channel.name){
    if(message.content.startsWith(RPG_PREFIX)){
      APICommandes.onCommandes(message.content.replace(RPG_PREFIX, "").split(" ")[0], {
        msg: message
      })
    }
  }


  /*

        FIN PARTIE RPG

  */
    if (message.content.startsWith(RPG_PREFIX + 'split')){
      let argsSplit = message.content.split(' ')
      let voiceID = argsSplit[1].split(',')
      let array = Array.from(message.member.voiceChannel.members)
      let number = array.length
      let channel = message.guild.channels.get(argsSplit[1])
      shuffleArray(array)
      for(let i in array){
        if(i >= Math.round(number/2)) break
        let member = array[i][1]
        member.setVoiceChannel(channel)
        console.log(member.user.username + " déplacé !")
      }
      message.channel.send("Le channel a été divisé par deux vers le channel ``" + channel.name + "``")
    }
    if (message == (RPG_PREFIX + "help")){
       let embed = new Discord.RichEmbed().
       setTitle("[°] Informations sur les commandes [°]")
       .setAuthor(bot.user.username, bot.user.avatarURL)
       .setColor(0xf3ee27)
       .setDescription("\n" + "[°] **RolePlay Game** [°]\n" +
       "``+account`` Affiche les infos sur la commande +account\n\n" +
       "``+fight``  Lance un combat contre un monstre aléatoire sur la tranche de votre niveau\n\n" +
       "``+infos joueurs <nom>`` Affiche les informations sur le joueur demandé\n\n" +
       "``+split <voiceID>`` Déplace la moitier des utilisateurs dans un autre channel (**VoiceID** > **[Activer mode développeur de Discord]** > **Clic droit sur un channel vocal** > **Copier l'identifiant**)")
       message.author.send({embed})
       message.reply("Envoyé par message privé !")
    }

})

exports.sendMessage = (serverName, channelId, message, send) => {
  console.log("test")
  let guild_find = false
  let channel_find = false
  let guilds_array = Array.from(bot.guilds.values())
  console.log(guilds_array.length)
  for(let i = 0; i < guilds_array.length; i++){
    let guild = guilds_array[i]
    console.log(guild.name)
    if(guild.name == serverName){
      guild_find = true
      let channel_array = Array.from(guild.channels.values())
      for(let j = 0; j < channel_array.length; j++){
        let channel = channel_array[j]
        if(channel.type == "text"){
          console.log("test2")
          if(channel.id == channelId){
            channel_find = true
            channel.send(message)
            console.log("Message envoyé sans problème !")
            break
          }
        }
      }
      if(!channel_find){
        console.log("[Erreur] Aucun channel '" + channelId + "' n'a été trouvé dans la liste des channel du serveur '" + serverName + "'")
        return
      }
      break
    }
  }
  if(!guild_find){
    console.log("[Erreur] Aucun serveur '" + serverName + "' n'a été trouvé dans la liste des serveurs du robot")
    return
  }
}

exports.moveAllMembers = (serverName, channelId, excpetions, send) => {
  let guild_find = false
  let channel_find = false
  let guilds_array = Array.from(bot.guilds.values())
  let members_move = []
  let member_exception = []
  if(excpetions != null || excpetions != ""){
    member_exception = excpetions.split(',')
  }
  console.log(member_exception)
  for(let i = 0; i < guilds_array.length; i++){
    let guild = guilds_array[i]
    if(guild.name == serverName){
      guild_find = true
      let channel_array = Array.from(guild.channels.values())
      for(let j = 0; j < channel_array.length; j++){
        let channel = channel_array[j]
        if(channel.type == "voice"){
          let marray = Array.from(channel.members.values())
          for(let member in marray){
              if(marray[member].user.username == bot.user.username || member_exception.includes(marray[member].user.username)){
                  console.log(marray[member].user.username)
                  continue
              } else {
                members_move.push(marray[member])
                console.log(marray[member].user.username + " a été ajouté")
            }
          }
        }
      }
      for(let j = 0; j < channel_array.length; j++){
        let channel = channel_array[j]
        if(channel.type == "voice"){
          //console.log(Array.from(channel.members.values()))
          if(channel.id == channelId){
            channel_find = true
            for(let m in members_move){
              let member = members_move[m]
              member.setVoiceChannel(channel)
              console.log("L'utilisateur " + member.user.username + " a été déplacé")
            }
            members_move = [];
            break
            /*channel_find = true
            let members_array = Array.from(guild.members.values())
            //console.log(members_array)
            for(var k = 0; k < members_array.length; k++){
              var user = members_array[k].user
              if(user.username == bot.user.username) return
              //members_array[k].setVoiceChannel(channel)
              console.log("Utilisateur " + user.username + " a été bouger vers le channel " + user.client.status_string)
            }
            break*/
          }
        }
      }
      if(!channel_find){
        console.log("[Erreur] Aucun channel '" + channelId + "' n'a été trouvé dans la liste des channel du serveur '" + serverName + "'")
        return
      }
      break
    }
  }
  if(!guild_find){
    console.log("[Erreur] Aucun serveur '" + serverName + "' n'a été trouvé dans la liste des serveurs du robot")
    return
  }
}

exports.getInfosMusique = (send) => {
  if(youtube_url_current == "") return
  console.log(Array.from(YoutubeStream.getInfo(youtube_url_current).values()))
}



bot.login(process.env.BOT_TOKEN)
