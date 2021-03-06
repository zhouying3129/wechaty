import { test } from 'ava'
import {
  Room
  , Wechaty
  , Config
  , Message
  , Contact
  , Puppet
  , PuppetWeb
  , log
}  from '../'

Config.puppetInstance(new PuppetWeb())
// Room.attach(new PuppetWeb())

// test('Room smoke testing', async t => {

//   const UserName = '@0bb3e4dd746fdbd4a80546aef66f4085'
//   const NickName = 'Nick Name Test'
//   const EncryChatRoomId = '123456abcdef'

//   // Mock
//   const mockContactGetter = function (id) {
//     return new Promise((resolve,reject) => {
//       if (id!=UserName) return resolve({});
//       setTimeout(() => {
//         return resolve({
//           UserName: UserName
//           , NickName: NickName
//           , EncryChatRoomId: EncryChatRoomId
//         })
//       }, 200)
//     })
//   }

//   const r = new Room(UserName)

//   t.is(r.id, UserName, 'id/UserName right')

//   await r.ready(mockContactGetter)

//   // .then(r => {
//     t.is(r.get('id')   , UserName, 'UserName set')
//     t.is(r.get('topic') , NickName, 'NickName set')
//     t.is(r.get('encryId') , EncryChatRoomId, 'EncryChatRoomId set')

//     const s = r.toString()
//     t.is(typeof s, 'string', 'toString()')
//   // })
//   // .catch(e => t.fail('ready() rejected: ' + e))
//   // .then(_ => t.end()) // test end
// })

test('Room smoking test', async t => {
  const RAW_OBJ = JSON.parse(`
  {"RemarkPYQuanPin":"","RemarkPYInitial":"","PYInitial":"TZZGQNTSHGFJ","PYQuanPin":"tongzhizhongguoqingniantianshihuiguanfangjia","Uin":0,"UserName":"@@e2355db381dc46a77c0b95516d05e7486135cb6370d8a6af66925d89d50ec278","NickName":"（通知）中国青年天使会官方家","HeadImgUrl":"/cgi-bin/mmwebwx-bin/webwxgetheadimg?seq=670397504&username=@@e2355db381dc46a77c0b95516d05e7486135cb6370d8a6af66925d89d50ec278&skey=","ContactFlag":2,"MemberCount":146,"MemberList":[{"Uin":0,"UserName":"@ecff4a7a86f23455dc42317269aa36ab","NickName":"童玮亮","AttrStatus":103423,"PYInitial":"","PYQuanPin":"","RemarkPYInitial":"","RemarkPYQuanPin":"","MemberStatus":0,"DisplayName":"","KeyWord":"dap","HeadImgUrl":"/cgi-bin/mmwebwx-bin/webwxgeticon?seq=0&username=@ecff4a7a86f23455dc42317269aa36ab&skey=@crypt_f9cec94b_f23a307a23231cfb5098faf91ff759ca&chatroomid=@4b8baa99bdfc354443711412126d2aaf"},{"Uin":0,"UserName":"@eac4377ecfd59e4321262f892177169f","NickName":"麦刚","AttrStatus":33674247,"PYInitial":"","PYQuanPin":"","RemarkPYInitial":"","RemarkPYQuanPin":"","MemberStatus":0,"DisplayName":"","KeyWord":"mai","HeadImgUrl":"/cgi-bin/mmwebwx-bin/webwxgeticon?seq=0&username=@eac4377ecfd59e4321262f892177169f&skey=@crypt_f9cec94b_f23a307a23231cfb5098faf91ff759ca&chatroomid=@4b8baa99bdfc354443711412126d2aaf"},{"Uin":0,"UserName":"@ad85207730aa94e006ddce28f74e6878","NickName":"田美坤Maggie","AttrStatus":112679,"PYInitial":"","PYQuanPin":"","RemarkPYInitial":"","RemarkPYQuanPin":"","MemberStatus":0,"DisplayName":"田美坤","KeyWord":"tia","HeadImgUrl":"/cgi-bin/mmwebwx-bin/webwxgeticon?seq=0&username=@ad85207730aa94e006ddce28f74e6878&skey=@crypt_f9cec94b_f23a307a23231cfb5098faf91ff759ca&chatroomid=@4b8baa99bdfc354443711412126d2aaf"},{"Uin":2351423900,"UserName":"@33cc239d22b20d56395bbbd0967b28b9","NickName":"周宏光","AttrStatus":327869,"PYInitial":"","PYQuanPin":"","RemarkPYInitial":"","RemarkPYQuanPin":"","MemberStatus":0,"DisplayName":"周宏光","KeyWord":"acc","HeadImgUrl":"/cgi-bin/mmwebwx-bin/webwxgeticon?seq=0&username=@33cc239d22b20d56395bbbd0967b28b9&skey=@crypt_f9cec94b_f23a307a23231cfb5098faf91ff759ca&chatroomid=@4b8baa99bdfc354443711412126d2aaf"},{"Uin":0,"UserName":"@5e77381e1e3b5641ddcee44670b6e83a","NickName":"牛文文","AttrStatus":100349,"PYInitial":"","PYQuanPin":"","RemarkPYInitial":"","RemarkPYQuanPin":"","MemberStatus":0,"DisplayName":"","KeyWord":"niu","HeadImgUrl":"/cgi-bin/mmwebwx-bin/webwxgeticon?seq=0&username=@5e77381e1e3b5641ddcee44670b6e83a&skey=@crypt_f9cec94b_f23a307a23231cfb5098faf91ff759ca&chatroomid=@4b8baa99bdfc354443711412126d2aaf"},{"Uin":0,"UserName":"@56941ef97f3e9c70af88667fdd613b44","NickName":"羊东 东方红酒窖","AttrStatus":33675367,"PYInitial":"","PYQuanPin":"","RemarkPYInitial":"","RemarkPYQuanPin":"","MemberStatus":0,"DisplayName":"","KeyWord":"Yan","HeadImgUrl":"/cgi-bin/mmwebwx-bin/webwxgeticon?seq=0&username=@56941ef97f3e9c70af88667fdd613b44&skey=@crypt_f9cec94b_f23a307a23231cfb5098faf91ff759ca&chatroomid=@4b8baa99bdfc354443711412126d2aaf"},{"Uin":0,"UserName":"@72c4767ce32db488871fdd1c27173b81","NickName":"李竹～英诺天使（此号已满）","AttrStatus":235261,"PYInitial":"","PYQuanPin":"","RemarkPYInitial":"","RemarkPYQuanPin":"","MemberStatus":0,"DisplayName":"","KeyWord":"liz","HeadImgUrl":"/cgi-bin/mmwebwx-bin/webwxgeticon?seq=0&username=@72c4767ce32db488871fdd1c27173b81&skey=@crypt_f9cec94b_f23a307a23231cfb5098faf91ff759ca&chatroomid=@4b8baa99bdfc354443711412126d2aaf"},{"Uin":0,"UserName":"@0b0e2eb9501ab2d84f9f800f6a0b4216","NickName":"周静彤 杨宁助理","AttrStatus":230885,"PYInitial":"","PYQuanPin":"","RemarkPYInitial":"","RemarkPYQuanPin":"","MemberStatus":0,"DisplayName":"","KeyWord":"zlo","HeadImgUrl":"/cgi-bin/mmwebwx-bin/webwxgeticon?seq=0&username=@0b0e2eb9501ab2d84f9f800f6a0b4216&skey=@crypt_f9cec94b_f23a307a23231cfb5098faf91ff759ca&chatroomid=@4b8baa99bdfc354443711412126d2aaf"},{"Uin":0,"UserName":"@4bfa767be0cd3fb78409b9735d1dcc57","NickName":"周哲 Jeremy","AttrStatus":33791995,"PYInitial":"","PYQuanPin":"","RemarkPYInitial":"","RemarkPYQuanPin":"","MemberStatus":0,"DisplayName":"","KeyWord":"zho","HeadImgUrl":"/cgi-bin/mmwebwx-bin/webwxgeticon?seq=0&username=@4bfa767be0cd3fb78409b9735d1dcc57&skey=@crypt_f9cec94b_f23a307a23231cfb5098faf91ff759ca&chatroomid=@4b8baa99bdfc354443711412126d2aaf"},{"Uin":0,"UserName":"@ad954bf2159a572b7743a5bc134739f4","NickName":"vicky张","AttrStatus":100477,"PYInitial":"","PYQuanPin":"","RemarkPYInitial":"","RemarkPYQuanPin":"","MemberStatus":0,"DisplayName":"","KeyWord":"hua","HeadImgUrl":"/cgi-bin/mmwebwx-bin/webwxgeticon?seq=0&username=@ad954bf2159a572b7743a5bc134739f4&skey=@crypt_f9cec94b_f23a307a23231cfb5098faf91ff759ca&chatroomid=@4b8baa99bdfc354443711412126d2aaf"}],"RemarkName":"","HideInputBarFlag":0,"Sex":0,"Signature":"","VerifyFlag":0,"OwnerUin":2351423900,"StarFriend":0,"AppAccountFlag":0,"Statues":0,"AttrStatus":0,"Province":"","City":"","Alias":"","SnsFlag":0,"UniFriend":0,"DisplayName":"","ChatRoomId":0,"KeyWord":"","EncryChatRoomId":"@4b8baa99bdfc354443711412126d2aaf","MMFromBatchGet":true,"MMOrderSymbol":"TONGZHIZHONGGUOQINGNIANTIANSHIHUIGUANFANGJIA","MMFromBatchget":true,"MMInChatroom":true}
  `)

  const EXPECTED = {
    id:             '@@e2355db381dc46a77c0b95516d05e7486135cb6370d8a6af66925d89d50ec278'
    , topic:        '（通知）中国青年天使会官方家'
    , encryId:      '@4b8baa99bdfc354443711412126d2aaf'
    , memberId1:    '@ad85207730aa94e006ddce28f74e6878'
    , memberNick1:  '田美坤'
    , memberId2:    '@72c4767ce32db488871fdd1c27173b81'
    , memberNick2:  '李竹～英诺天使（此号已满）'
    , ownerId:      '@33cc239d22b20d56395bbbd0967b28b9'
  }

  // Mock
  const mockContactGetter = function (id) {
    return new Promise((resolve,reject) => {
      if (id!=EXPECTED.id) return resolve({});
      setTimeout(() => {
        return resolve(RAW_OBJ)
      }, 10)
    })
  }

  const r = new Room(EXPECTED.id)

  t.is(r.id, EXPECTED.id, 'should set id/UserName right')

  await r.ready(mockContactGetter)

  t.is(r.get('id')      , EXPECTED.id, 'should set id/UserName')
  t.is(r.get('encryId') , EXPECTED.encryId, 'should set EncryChatRoomId')

  t.is(r.topic()        , EXPECTED.topic, 'should set topic/NickName')

  const contact1 = new Contact(EXPECTED.memberId1)
  const nick1 = r.nick(contact1)
  t.is(nick1, EXPECTED.memberNick1, 'should get nick1 from DisplayName')

  const contact2 = new Contact(EXPECTED.memberId2)
  const nick2 = r.nick(contact2)
  t.is(nick2, EXPECTED.memberNick2, 'should get nick2 from NickName because there is no DisplayName, ')

  t.truthy(r.has(contact1), 'should has contact1')
  t.falsy(r.has(new Contact('not exist id'), 'should has no this member'))

  const owner = r.owner()
  t.true(owner === null || owner instanceof Contact, 'should get Contact instance for owner, or null')

  // wxApp hide uin for all contacts.
  // t.is(r.owner().id, EXPECTED.ownerId, 'should get owner right by OwnerUin & Uin')

  const contactA = r.member(EXPECTED.memberNick1)
  const contactB = r.member(EXPECTED.memberNick2)
  t.is(contactA.id, EXPECTED.memberId1, 'should get the right id from nick 1')
  t.is(contactB.id, EXPECTED.memberId2, 'should get the right id from nick 2')

  const s = r.toString()
  t.is(typeof s, 'string', 'toString()')
})

test('Room static method', async t => {
  const room = await Room.find({
    name: 'xxx'
  })

  t.truthy(room === null, 'should return null before login')

  const roomList = await Room.findAll({
    name: 'yyy'
  })

  t.is(roomList.length, 0, 'should return empty array before login')

  // t.end()
})
