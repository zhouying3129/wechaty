/**
 *
 * Wechaty - Wechat for Bot
 *
 * Connecting ChatBots
 * https://github.com/wechaty/wechaty
 *
 */
import {
  Wechaty
  , Config
  , log
} from '../'

const welcome = `
| __        __        _           _
| \\ \\      / /__  ___| |__   __ _| |_ _   _
|  \\ \\ /\\ / / _ \\/ __| '_ \\ / _\` | __| | | |
|   \\ V  V /  __/ (__| | | | (_| | |_| |_| |
|    \\_/\\_/ \\___|\\___|_| |_|\\__,_|\\__|\\__, |
|                                     |___/

=============== Powered by Wechaty ===============
-------- https://github.com/zixia/wechaty --------

I'm a bot, my super power is talk in Wechat.

If you send me a 'ding', I will reply you a 'dong'!
__________________________________________________

Hope you like it, and you are very welcome to
upgrade me for more super powers!

Please wait... I'm trying to login in...

`

console.log(welcome)
const bot = Wechaty.instance({ profile: Config.DEFAULT_PROFILE })

bot
.on('login'	  , user => log.info('Bot', `${user.name()} logined`))
.on('logout'	, user => log.info('Bot', `${user.name()} logouted`))
.on('error'   , e => log.info('Bot', 'error: %s', e))
.on('scan', ({url, code}) => {
  if (!/201|200/.test(code)) {
    let loginUrl = url.replace(/\/qrcode\//, '/l/')
    require('qrcode-terminal').generate(loginUrl)
  }
  console.log(`${url}\n[${code}] Scan QR Code in above url to login: `)
})
.on('message', m => {
  m.ready()
  .then(msg => {

    const room = m.room()
    const from = m.from()

    console.log((room ? '['+room.topic()+']' : '')
                + '<'+from.name()+'>'
                + ':' + m.toStringDigest()
    )

    // log.info('Bot', 'recv: %s', msg.toStringEx())
    // logToFile(JSON.stringify(msg.rawObj))

    if (/^(ding|ping|bing)$/i.test(m.get('content')) && !bot.self(m)) {
      bot.reply(m, 'dong')
      .then(() => { log.warn('Bot', 'REPLY: dong') })
    }
  })
  .catch(e => log.error('Bot', 'ready: %s' , e))
})

bot.init()
.catch(e => {
  log.error('Bot', 'init() fail: %s', e)
  bot.quit()
  process.exit(-1)
})

function logToFile(data) {
require('fs').appendFile('message.log', data + '\n\n#############################\n\n', err => {
  if (err) { log.error('LogToFile: %s', err) }
})
}
typeof logToFile;
