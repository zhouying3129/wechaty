import * as http from 'http'

import log from './brolog-env'

/**
 * bug compatible with:
 * https://github.com/wechaty/wechaty/issues/40#issuecomment-252802084
 */
import * as ws from 'ws'
typeof ws

class UtilLib {
  public static stripHtml(html: string): string {
    return String(html).replace(/(<([^>]+)>)/ig, '')
  }

  public static unescapeHtml(str: string): string {
    return String(str)
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&amp;/g, '&')
  }

  public static digestEmoji(html: string): string {
    return String(html)
          .replace(/<img class="(\w*?emoji) (\w*?emoji[^"]+?)" text="(.*?)_web" src=[^>]+>/g
                 , '$3'
                 ) // <img class="emoji emoji1f4a4" text="[流汗]_web" src="/zh_CN/htmledition/v2/images/spacer.gif" />
          .replace(/<span class="(\w*?emoji) (\w*?emoji[^"]+?)"><\/span>/g
                 , '[$2]'
                 ) // '<span class="emoji emoji1f334"></span>'
  }

  public static plainText(html: string): string {
    return UtilLib.stripHtml(
      UtilLib.unescapeHtml(
        UtilLib.stripHtml(
          UtilLib.digestEmoji(
            html
          )
        )
      )
    )
  }

  public static  downloadStream(url: string, cookies): Promise<NodeJS.ReadableStream> {
    // const myurl = 'http://wx.qq.com/cgi-bin/mmwebwx-bin/webwxgetmsgimg?&MsgID=3080011908135131569&skey=%40crypt_c117402d_53a58f8fbb21978167a3fc7d3be7f8c9'
    url = url.replace(/^https/i, 'http') // use http for better performance
    const options = require('url').parse(url)

    options.headers = {
      Accept: 'image/webp,image/*,*/*;q=0.8'
      , 'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36'
      , Referer: 'https://wx.qq.com/'
      , 'Accept-Encoding': 'gzip, deflate, sdch'
      , 'Accept-Language': 'zh-CN,zh;q=0.8'
    }
    options.agent = http.globalAgent

    /**
     * 'pgv_pvi=6639183872; pgv_si=s8359147520;
     * webwxuvid=747895d9dac5a25dd3a78175a5e931d879e026cacaf3ac06de0bd5f0714 ... ;
     * mm_lang=zh_CN; MM_WX_NOTIFY_STATE=1; MM_WX_SOUND_STATE=1; wxloadtime=1465928826_expired;
     * wxpluginkey=1465901102; wxuin=1211516682; wxsid=zMT7Gb24aTQzB1rA;
     * webwx_data_ticket=gSeBbuhX+0kFdkXbgeQwr6Ck'
     */
    options.headers.Cookie = cookies.map(c => `${c.name}=${c.value}`).join('; ')
    // log.verbose('Util', 'Cookie: %s', options.headers.Cookie)

    return new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        // console.log(`STATUS: ${res.statusCode}`);
        // console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
        // res.setEncoding('utf8');
        resolve(res)
      })

      req.on('error', (e) => {
        log.warn('WebUtil', `downloadStream() problem with request: ${e.message}`)
      })
      req.end()
    })
  }

  // credit - http://stackoverflow.com/a/2117523/1123955
  public static guid(): string {
    /* tslint:disable:no-bitwise */
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }

  /**
   *
   * @param port is just a suggestion.
   * there's no grantuee for the number
   *
   * The IANA suggested ephemeral port range.
   * @see http://en.wikipedia.org/wiki/Ephemeral_ports
   *
   * const DEFAULT_IANA_RANGE = {min: 49152, max: 65535}
   *
   */
  public static getPort(port: number): Promise<number> {
    log.verbose('UtilLib', 'getPort(%d)', port)
    let tryPort = nextPort(port || 38788)

    return new Promise((resolve, reject) => {
      // https://gist.github.com/mikeal/1840641
      function _getPort(cb) {
        const server = require('net').createServer()
        server.on('error', function(err) {
          if (err) {/* fail safe */ }
          tryPort = nextPort(port)
          _getPort(cb)
        })
        server.listen(tryPort, function(err) {
          if (err) {/* fail safe */}
          server.once('close', function() {
            cb(tryPort)
          })
          server.close()
        })
      }
      _getPort(okPort => {
        log.verbose('UtilLib', 'getPort(%d) return: %d'
                  , port
                  , okPort
                  )
        resolve(okPort)
      })
    })

    function nextPort(newPort: number): number {
      const RANDOM_RANGE = 1024
      const n = Math.floor(Math.random() * RANDOM_RANGE)
      return newPort + n
    }
  }
}

// module.exports = UtilLib.default = UtilLib.UtilLib = UtilLib

export default UtilLib
