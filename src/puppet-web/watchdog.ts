/**
 *
 * wechaty: Wechat for Bot. and for human who talk to bot/robot
 *
 * Class PuppetWeb Watchdog
 *
 * monitor puppet
 *
 * Licenst: ISC
 * https://github.com/zixia/wechaty
 *
 *
 * Class PuppetWeb
 *
 */
// const co    = require('co')

import log   from '../brolog-env'
import Event from './event'
import { WatchdogFood } from '../config'

/* tslint:disable:variable-name */
const Watchdog = {
  onFeed
}

// feed me in time(after 1st feed), or I'll restart system
function onFeed(food: WatchdogFood) {

  // change to tape instead of tap
  // type = type || 'HEARTBEAT'  // BUG compatible with issue: node-tap strange behaviour cause CircleCI & Travis-CI keep failing #11
  // timeout = timeout || 60000  // BUG compatible with issue: node-tap strange behaviour cause CircleCI & Travis-CI keep failing #11

  if (!food.type) {
    food.type = 'HEARTBEAT'
  }
  if (!food.timeout) {
    food.timeout = 60000 // 60s default. can be override in options but be careful about the number zero(0)
  }

  if (!this) {
    throw new Error('onFeed() must has `this` of instanceof PuppetWeb')
  }

  const feed = `${food.type}:[${food.data}]`
  log.silly('PuppetWebWatchdog', 'onFeed: %d, %s', food.timeout, feed)

  if (this.currentState() === 'killing'
  ) {
    log.warn('PuppetWebWatchdog', 'onFeed() is disabled because currentState is `killing`')
    return
  }
  // if (this.readyState() === 'disconnecting'
  //     // || this.readyState() === 'disconnected'
  // ) {
  //   log.warn('PuppetWebWatchdog', 'onFeed() is disabled because readyState is `disconnecting`')
  //   return
  // }

  setWatchDogTimer.call(this, food.timeout, feed)

  this.emit('heartbeat', feed)

  monitorScan.call(this, food.type)
  autoSaveSession.call(this)

  switch (food.type) {
    case 'POISON':
      clearWatchDogTimer.call(this)
      break

    case 'SCAN':
    case 'HEARTBEAT':
      break

    default:
      throw new Error('Watchdog onFeed: unsupport type ' + food.type)
  }
}

function clearWatchDogTimer() {
  if (this.watchDogTimer) {
    clearTimeout(this.watchDogTimer)
    this.watchDogTimer = null

    const timeLeft = this.watchDogTimerTime - Date.now()
    log.silly('PuppetWebWatchdog', 'clearWatchDogTimer() [%d] seconds left', Math.ceil(timeLeft / 1000))
  } else {
    log.silly('PuppetWebWatchdog', 'clearWatchDogTimer() nothing to clear')
  }
}

function setWatchDogTimer(timeout, feed) {

  clearWatchDogTimer.call(this)

  log.silly('PuppetWebWatchdog', 'setWatchDogTimer(%d, %s)', timeout, feed)

  this.watchDogTimer = setTimeout(watchDogReset.bind(this, timeout, feed), timeout)
  // this.watchDogTimer.unref()
  this.watchDogTimerTime = Date.now() + timeout
  // block quit, force to use quit() // this.watchDogTimer.unref() // dont block quit
}

function watchDogReset(timeout, lastFeed) {
  log.verbose('PuppetWebWatchdog', 'watchDogReset() timeout %d', timeout)
  const e = new Error('watchdog reset after '
                        + Math.floor(timeout / 1000)
                        + ' seconds, last feed:'
                        + '[' + lastFeed + ']'
                    )
  this.emit('error', e)
  return Event.onBrowserDead.call(this, e)
}

/**
 *
 * Deal with Sessions(cookies)
 * save every 5 mins
 *
 */
function autoSaveSession() {
  const SAVE_SESSION_INTERVAL = 5 * 60 * 1000 // 5 mins
  if (Date.now() - this.watchDogLastSaveSession > SAVE_SESSION_INTERVAL) {
    log.verbose('PuppetWebWatchdog', 'watchDog() saveSession(%s) after %d minutes'
                                    , this.profile
                                    , Math.floor(SAVE_SESSION_INTERVAL / 1000 / 60)
              )
    this.browser.saveSession()
    this.watchDogLastSaveSession = Date.now()
  }
}

/**
 *
 * Deal with SCAN events
 *
 * if web browser stay at login qrcode page long time,
 * sometimes the qrcode will not refresh, leave there expired.
 * so we need to refresh the page after a while
 *
 */
function monitorScan(type) {
  log.silly('PuppetWebWatchdog', 'monitorScan(%s)', type)

  const scanTimeout = 10 * 60 * 1000 // 10 mins

  if (type === 'SCAN') { // watchDog was feed a 'scan' data
    this.lastScanEventTime = Date.now()
  }
  if (this.logined()) { // XXX: login status right?
    this.lastScanEventTime = null
  } else if (this.lastScanEventTime
              && Date.now() - this.lastScanEventTime > scanTimeout) {
    log.warn('PuppetWebWatchdog', 'monirotScan() refresh browser for no food of type scan after %s mins'
                                , Math.floor(scanTimeout / 1000 / 60))
    // try to fix the problem
    this.browser.refresh()
    this.lastScanEventTime = Date.now()
  }
}

// module.exports = Watchdog
export default Watchdog
