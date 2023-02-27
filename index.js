const Discord = require('discord.js-selfbot-v13')
const client = new Discord.Client({
    checkUpdate: false,
})
const pix = require('pix-utils')
const sharp = require('sharp');

const fs = require('fs')
const config = require('./config.json')
const Prefix = config.prefix

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

client.on('ready', () => {
    console.log(`Logged in ${client.user.username}`)
})

const randomnumber = Math.floor(Math.random() * 999) 

client.on('messageCreate', async msg => {

    const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(Prefix)})\s*`);
    if (!prefixRegex.test(msg.content)) return;
    const [, matchedPrefix] = msg.content.match(prefixRegex);
    const args = msg.content.slice(matchedPrefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    
    
    if(msg.author.id !== client.user.id){
        return
    }

if (command === "pix") {
    msg.delete()
	
  if(!args[0]){
        return msg.channel.send('❗ Por favor insira um valor para gerar um pagamento!')
    }
	
    let amount = '';
	amount = Number(args.join(" ").replace(',', '.').replace(/[^\d\.]+/g, ''))


	const criarPagamento = pix.createStaticPix({
        merchantName: config.nome_completo,
        merchantCity: 'Sao Paulo',
        pixKey: config.chave_pix,
        infoAdicional: 'Frostbyte-Payments',
        transactionAmount: amount,
      });

      if (!pix.hasError(criarPagamento)) {
        const chave = criarPagamento.toBRCode();
        const data = pix.parsePix(chave)

data.toImage().then(image => {

let base64String = image.split(';base64,').pop();

let buf = new Buffer.from(base64String, 'base64');

sharp(buf)
.resize(1380, 1380)
.toBuffer()
.then(resizedImageBuffer => {

fs.writeFileSync(`./qr_code_${randomnumber}.png`, resizedImageBuffer);


msg.channel.send({ content: `✅ Pix Gerado Com Sucesso!\n\n> 🛒 | **Valor**: R$${amount}`, files: [`qr_code_${randomnumber}.png`] })
.then((result)=>{
    msg.channel.send({ content: `${chave}`}) 
    fs.unlinkSync(`./qr_code_${randomnumber}.png`) 
})

})


})
      }

    }
})


client.login(config.token) 