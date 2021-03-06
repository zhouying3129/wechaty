/**
 *
 * wechaty: Wechat for Bot. and for human who talk to bot/robot
 *
 * Class PuppetWeb Events
 *
 * use to control wechat in web browser.
 *
 * Licenst: ISC
 * https://github.com/zixia/wechaty
 *
 *
 * Events for Class PuppetWeb
 *
 * here `this` is a PuppetWeb Instance
 *
 */
// import * as util  from 'util'
// import * as fs    from 'fs'
// const co    = require('co')

import Contact       from '../contact'
import MediaMessage  from '../message-media'
import Message       from '../message'
import log           from '../brolog-env'

// import FriendRequest from './friend-request'
import Firer         from './firer'

/* tslint:disable:variable-name */
const PuppetWebEvent = {
  onBrowserDead

  , onServerLogin
  , onServerLogout

  , onServerConnection
  , onServerDisconnect

  , onServerDing
  , onServerScan
  , onServerUnload
  , onServerLog

  , onServerMessage
}

async function onBrowserDead(e): Promise<void> {
  log.verbose('PuppetWebEvent', 'onBrowserDead(%s)', e && e.message || e)
  // because this function is async, so maybe entry more than one times.
  // guard by variable: isBrowserBirthing to prevent the 2nd time entrance.
  // if (this.isBrowserBirthing) {
  //   log.warn('PuppetWebEvent', 'onBrowserDead() is busy, this call will return now. stack: %s', (new Error()).stack)
  //   return
  // }

  if (this.browser && this.browser.targetState() !== 'open') {
    log.verbose('PuppetWebEvent', 'onBrowserDead() will do nothing because browser.targetState(%s) !== open', this.browser.targetState())
    return
  }

  if (this.browser && this.browser.currentState() === 'opening') {
    log.warn('PuppetWebEvent', 'onBrowserDead() will do nothing because browser.currentState = opening. stack: %s', (new Error()).stack)
    return
  }

  this.scan = null

  // return co.call(this, function* () {
  try {
    // log.verbose('PuppetWebEvent', 'onBrowserDead() co() set isBrowserBirthing true')
    // this.isBrowserBirthing = true

    const TIMEOUT = 180000 // 180s / 3m
    // this.watchDog(`onBrowserDead() set a timeout of ${Math.floor(TIMEOUT / 1000)} seconds to prevent unknown state change`, {timeout: TIMEOUT})
    this.emit('watchdog', {
      data: `onBrowserDead() set a timeout of ${Math.floor(TIMEOUT / 1000)} seconds to prevent unknown state change`
      , timeout: TIMEOUT
    })

    if (!this.browser || !this.bridge) {
      const err = new Error('no browser or no bridge')
      log.error('PuppetWebEvent', 'onBrowserDead() %s', err.message)
      throw err
    }

    log.verbose('PuppetWebEvent', 'onBrowserDead() try to reborn browser')

    await this.browser.quit(true)
                      .catch(error => { // fail safe
                        log.warn('PuppetWebEvent', 'browser.quit() exception: %s, %s', error.message, error.stack)
                      })
    log.verbose('PuppetWebEvent', 'onBrowserDead() old browser quited')

    if (this.browser.targetState() !== 'open') {
      log.warn('PuppetWebEvent', 'onBrowserDead() will not init browser because browser.targetState(%s) !== open', this.browser.targetState())
      return
    }

    this.browser = await this.initBrowser()
    log.verbose('PuppetWebEvent', 'onBrowserDead() new browser inited')

    // this.bridge = await this.bridge.init()
    this.bridge = await this.initBridge()
    log.verbose('PuppetWebEvent', 'onBrowserDead() bridge re-inited')

    const dong = await this.ding()
    if (/dong/i.test(dong)) {
      log.verbose('PuppetWebEvent', 'onBrowserDead() ding() works well after reset')
    } else {
      log.warn('PuppetWebEvent', 'onBrowserDead() ding() get error return after reset: ' + dong)
    }
  // }).catch(err => { // Exception
  } catch (e) {
    log.error('PuppetWebEvent', 'onBrowserDead() exception: %s', e.message)

    log.warn('PuppetWebEvent', 'onBrowserDead() try to re-init PuppetWeb itself')
    return this.quit()
              .catch(error => log.warn('PuppetWebEvent', 'onBrowserDead() fail safe for this.quit(): %s', error.message))
              .then(_ => this.init())
  }

  // .then(() => { // Finally
    log.verbose('PuppetWebEvent', 'onBrowserDead() new browser borned')
    // this.isBrowserBirthing = false

    this.emit('watchdog', {
      data: `onBrowserDead() new browser borned`
      , type: 'POISON'
    })
  // })

  return
}

function onServerDing(data) {
  log.silly('PuppetWebEvent', 'onServerDing(%s)', data)
  // this.watchDog(data)
  this.emit('watchdog', { data })
}

function onServerScan(data) {
  log.verbose('PuppetWebEvent', 'onServerScan(%d)', data && data.code)

  this.scan = data // ScanInfo

  /**
   * When wx.qq.com push a new QRCode to Scan, there will be cookie updates(?)
   */
  this.browser.saveSession()
      .catch(() => {/* fail safe */})

  if (this.userId) {
    log.verbose('PuppetWebEvent', 'onServerScan() there has userId when got a scan event. emit logout and set userId to null')
    this.emit('logout', this.user || this.userId)
    this.userId = this.user = null
  }

  // feed watchDog a `scan` type of food
  // this.watchDog(data, {type: 'scan'})
  this.emit('watchdog', { data, type: 'SCAN' })

  this.emit('scan', data)
}

function onServerConnection(data) {
  log.verbose('PuppetWebEvent', 'onServerConnection: %s', data)
}

function onServerDisconnect(data) {
  log.verbose('PuppetWebEvent', 'onServerDisconnect: %s', data)

  if (this.userId) {
    log.verbose('PuppetWebEvent', 'onServerDisconnect() there has userId set. emit a logout event and set userId to null')
    this.emit('logout', this.user || this.userId) // 'onServerDisconnect(' + data + ')')
    this.userId = null
    this.user = null
  }

  // if (this.readyState() === 'disconnecting') {
  //   log.verbose('PuppetWebEvent', 'onServerDisconnect() be called when readyState is `disconnecting`')
  //   return
  // }
  if (this.currentState() === 'killing') {
    log.verbose('PuppetWebEvent', 'onServerDisconnect() be called when currentState is `killing`')
    return
  }

  if (!this.browser || !this.bridge) {
    const e = new Error('onServerDisconnect() no browser or bridge')
    log.error('PuppetWebEvent', '%s', e.message)
    throw e
  }

  /**
   * conditions:
   * 1. browser crash(i.e.: be killed)
   */
  if (this.browser.dead()) {   // browser is dead
    log.verbose('PuppetWebEvent', 'onServerDisconnect() found dead browser. wait it to restore')
    return
  }

  this.browser.readyLive()
  .then(r => {  // browser is alive, and we have a bridge to it
    log.verbose('PuppetWebEvent', 'onServerDisconnect() re-initing bridge')
    // must use setTimeout to wait a while.
    // because the browser has just refreshed, need some time to re-init to be ready.
    // if the browser is not ready, bridge init will fail,
    // caused browser dead and have to be restarted. 2016/6/12
    setTimeout(_ => {
      if (!this.bridge) {
        // XXX: sometimes this.bridge gone in this timeout. why?
        // what's happend between the last if(!this.bridge) check and the timeout call?
        throw new Error('bridge gone after setTimeout? why???')
      }
      this.bridge.init()
      .then(ret => {
        log.verbose('PuppetWebEvent', 'onServerDisconnect() bridge re-inited: %s', ret)
      })
      .catch(e => log.error('PuppetWebEvent', 'onServerDisconnect() exception: [%s]', e))
    }, 1000) // 1 second instead of 10 seconds? try. (should be enough to wait)
    return
  })
  .catch(e => { // browser is in indeed dead, or almost dead. readyLive() will auto recover itself.
    log.verbose('PuppetWebEvent', 'onServerDisconnect() browser dead, waiting it recover itself: %s', e.message)
    return
  })
}

/**
 *
 * @depreciated 20160825 zixia
 * when `unload` there should always be a `disconnect` event?
 *
 * `unload` event is sent from js@browser to webserver via socketio
 * after received `unload`, we should fix bridge by re-inject the Wechaty js code into browser.
 * possible conditions:
 * 1. browser refresh
 * 2. browser navigated to a new url
 * 3. browser quit(crash?)
 * 4. ...
 */
function onServerUnload(data) {
  log.warn('PuppetWebEvent', 'onServerUnload(%s)', data)
  // onServerLogout.call(this, data) // XXX: should emit event[logout] from browser

  // if (this.readyState() === 'disconnecting') {
  //   log.verbose('PuppetWebEvent', 'onServerUnload() will return because readyState is `disconnecting`')
  //   return
  // }
  if (this.currentState() === 'killing') {
    log.verbose('PuppetWebEvent', 'onServerUnload() will return because currentState is `killing`')
    return
  }

  if (!this.browser || !this.bridge) {
    const e = new Error('no bridge or no browser')
    log.warn('PuppetWebEvent', 'onServerUnload() %s', e.message)
    throw e
  }

  if (this.browser.dead()) {
    log.error('PuppetWebEvent', 'onServerUnload() found browser dead. wait it to restore itself')
    return
  }

  // re-init bridge after 1 second XXX: better method to confirm unload/reload finished?
  return setTimeout(() => {
    if (!this.bridge) {
      log.warn('PuppetWebEvent', 'onServerUnload() bridge gone after setTimeout()')
      return
    }
    this.bridge.init()
              .then(r  => log.verbose('PuppetWebEvent', 'onServerUnload() bridge.init() done: %s', r))
              .catch(e => log.error('PuppetWebEvent', 'onServerUnload() bridge.init() exceptoin: %s', e.message))
  }, 1000)
}

function onServerLog(data) {
  log.silly('PuppetWebEvent', 'onServerLog(%s)', data)
}

async function onServerLogin(data, attempt = 0): Promise<void> {
  log.verbose('PuppetWebEvent', 'onServerLogin(%s, %d)', data, attempt)

  this.scan = null

  if (this.userId) {
    log.verbose('PuppetWebEvent', 'onServerLogin() be called but with userId set?')
  }

  // co.call(this, function* () {
  try {
    // co.call to make `this` context work inside generator.
    // See also: https://github.com/tj/co/issues/274

    /**
     * save login user id to this.userId
     */
    this.userId = await this.bridge.getUserName()

    if (!this.userId) {
      log.verbose('PuppetWebEvent', 'onServerLogin: browser not full loaded(%d), retry later', attempt)
      setTimeout(onServerLogin.bind(this, data, ++attempt), 500)
      return
    }

    log.silly('PuppetWebEvent', 'bridge.getUserName: %s', this.userId)
    this.user = await Contact.load(this.userId).ready()
    log.silly('PuppetWebEvent', `onServerLogin() user ${this.user.name()} logined`)

    await this.browser.saveSession()
              .catch(e => { // fail safe
                log.verbose('PuppetWebEvent', 'onServerLogin() browser.saveSession exception: %s', e.message)
              })

    this.emit('login', this.user)

  // }).catch(e => {
  } catch (e) {
    log.error('PuppetWebEvent', 'onServerLogin() exception: %s', e)
    console.log(e.stack)
    throw e
  }

  return
}

function onServerLogout(data) {
  this.emit('logout', this.user || this.userId)

  if (!this.user && !this.userId) {
    log.warn('PuppetWebEvent', 'onServerLogout() without this.user or userId initialized')
  }

  this.userId = null
  this.user   = null

  // this.browser.cleanSession()
  // .catch(e => { /* fail safe */
  //   log.verbose('PuppetWebEvent', 'onServerLogout() browser.cleanSession() exception: %s', e.message)
  // })
}

async function onServerMessage(data): Promise<void> {
  let m = new Message(data)

  // co.call(this, function* () {
  try {
    await m.ready()

    /**
     * Fire Events if match message type & content
     */
    switch (m.type()) { // data.MsgType

      case Message.TYPE['VERIFYMSG']:
        Firer.fireFriendRequest.call(this, m)
        break

      case Message.TYPE['SYS']:
        if (m.room()) {
          Firer.fireRoomJoin.call(this  , m)
          Firer.fireRoomLeave.call(this , m)
          Firer.fireRoomTopic.call(this , m)
        } else {
          Firer.fireFriendConfirm.call(this, m)
        }
        break
    }

    /**
     * Check Type for special Message
     * reload if needed
     */
    switch (m.type()) {
      case Message.TYPE['IMAGE']:
        // log.verbose('PuppetWebEvent', 'onServerMessage() IMAGE message')
        m = new MediaMessage(data)
        break
    }

    // To Be Deleted: set self...
    if (this.userId) {
      m.set('self', this.userId)
    } else {
      log.warn('PuppetWebEvent', 'onServerMessage() without this.userId')
    }

    await m.ready() // TODO: EventEmitter2 for video/audio/app/sys....
    this.emit('message', m)

    // .catch(e => {
    //   log.error('PuppetWebEvent', 'onServerMessage() message ready exception: %s', e.stack)
    //   // console.log(e)
    //   /**
    //    * FIXME: add retry here...
    //    * setTimeout(onServerMessage.bind(this, data, ++attempt), 1000)
    //    */
    // })
  } catch (e) {
    log.error('PuppetWebEvent', 'onServerMessage() exception: %s', e.stack)
    throw e
  }

  return
}

// module.exports = PuppetWebEvent
export default PuppetWebEvent
