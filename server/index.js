import { join , resolve} from 'path'
import Koa from 'koa'
import R from 'ramda'
import chalk from 'chalk'
import config from '../config'
import fs from 'fs';
import path from 'path'
import { SoftPWM } from 'raspi-soft-pwm';
// const Gpio = require('onoff').Gpio;
const Gpio = require('pigpio').Gpio;

const en1 = new SoftPWM('GPIO20');
// const en2 = new SoftPWM('GPIO21');
const en2 = new Gpio(21, {mode:Gpio.OUTPUT});//SERVO
//list 700 midle 1200 most 1600
let pulseWithmidle = 1200
let increment =100
en2.servoWrite(pulseWithmidle)
// const in1 = new Gpio(17, 'out');//in1
// const in2 = new Gpio(4, 'out');//in2
// const in3 = new Gpio(16, 'out');//led
const in1 = new Gpio(17, {mode:Gpio.OUTPUT});//in1
const in2 = new Gpio(4, {mode:Gpio.OUTPUT});//in2
const in3 = new Gpio(16, {mode:Gpio.OUTPUT});//led
let ledstate = true//熄灭
let xangle=128
let yangle=128
let initspeed=0.5
// const in4 = new Gpio(18, 'out');//in4

//init speed
async function init(){
 await en1.write(0.25); // 50% Duty Cycle, half brightness
//init way
//  await en2.write(0.25); // 50% Duty Cycle, half brightness
}
init()
// en1.write(0.25); // 50% Duty Cycle, half brightness
// //init way
// en2.write(0.25); // 50% Duty Cycle, half brightness

var mqtt=require('mqtt')

const MIDDLEWARES = ['database', 'general', 'router', 'parcel']
const iccidlocal = path.resolve(__dirname, '../', 'config/iccidlocal.txt')
var iccid=fs.readFileSync(iccidlocal)
var iccidstr=iccid.toString()
console.log('iccid--->>>',iccid.toString())

const useMiddlewares = (app) => {
  R.map(
    R.compose(
      R.forEachObjIndexed(
        e => e(app)
      ),
      require,
      name => resolve(__dirname, `./middleware/${name}`)
    )
  )(MIDDLEWARES)
}

async function start () {
  const app = new Koa()
  const { port } = config

  await useMiddlewares(app)

  const server = app.listen(port, () => {
    console.log(
      process.env.NODE_ENV === 'development'
        ? `Open ${chalk.green('http://localhost:' + port)}`
        : `App listening on port ${port}`
    )
  })
}

start()
// const clientId = `mqtt_${Math.random().toString(16).slice(3)}`
var clientId = `g500_${iccidstr}`
var client = mqtt.connect(
//   process.env.NODE_ENV === 'development'
// ? `mqtt://localhost:1883`
// : `mqtt://broker.mnoiot.com:1883`
`mqtt://broker.mnoiot.com:1883`

,{
  clientId,
  clean: true,
  connectTimeout: 4000,
  username: 'mno',
  password: '81525782',
  reconnectPeriod: 1000,
});
// Options的配置选项:
// {
//   keepAlive: // 心跳时间 默认60s, 设置0为禁用
//   username: // 用户名
//   password: // 用户密码
//   protocol: // 指定协议默认为ws(websocket) wss这是加密的websocket, 和http与https的差别差不多, 还有ssl, tcp...
//   clientId: // 客户端id 唯一标识你的客户端的身份
//   clean: // boolean  设置为 false 以在离线时接收 QoS 1 和 2 消息；
//   reconnectionProid: //设置多长时间进行重新连接 单位毫秒
//   connectionTimeout: // 设置超时时间
//   protocolID: ‘ MQIsdp’// 和下面的参数指定mqtt的版本 5的最新的, 3
//   protocolVersion: 3 
//   reconnection: // boolean 断开是否需要再次连接 不传默认为true
//   will: {
//     ... // 这里面配置的连接强制断开
//   }
// }


client.on('connect', function () {

  console.log('mqtt>>> connected')
 
  client.subscribe(`/car_${iccidstr}`)
  client.publish(`/g500_${iccidstr}`,'connect--已连接')

 
  // setInterval(
 
  //  ()=>{client.publish('/temperature', '30');},
 
  //  3000
 
  // );



 
 })

 client.on( `message`, function (topic, message) {

   
  
  console.log(message.toString())
if(message.toString()=='one'){
  initspeed=1
}
if(message.toString()=='half'){
initspeed=0.5
}
if(message.toString()=='halfhalf'){
initspeed=0.25
}
  //开关灯
  if(message.toString()=='start'){
    // in3.writeSync(1)
	if(ledstate){
		in3.digitalWrite(1)
     		ledstate = false
	}
   	else{
		in3.digitalWrite(0)
     		ledstate = true
    	}
	return
  }
if(message.toString()=='one'||message.toString()=='half'||message.toString()=='halfhalf'||message.toString()=='start')return
  if(!!JSON.parse(message.toString())?.x){
    //
    if(xangle-JSON.parse(message.toString()).x>0){
      //turn left
      console.log('turn left-->>',xangle-JSON.parse(message.toString()).x)
      console.log('turn left-->>',xangle-JSON.parse(message.toString()).x)
      en2.servoWrite(parseInt(pulseWithmidle+(xangle-JSON.parse(message.toString()).x)*3.125))
    }
    if(JSON.parse(message.toString()).x-xangle>0){
      //turn left
      console.log('turn right-->>',JSON.parse(message.toString()).x-xangle)
      en2.servoWrite(parseInt(pulseWithmidle-(JSON.parse(message.toString()).x-xangle)*3.125))
    }
    if(JSON.parse(message.toString()).x-xangle==0){
      //turn left
      console.log('midllle-->>',JSON.parse(message.toString()).x-xangle)
      en2.servoWrite(pulseWithmidle)
    }
    if(yangle-JSON.parse(message.toString()).y>0){
      //油门
      en1.write((yangle-JSON.parse(message.toString()).y)*initspeed/128)
      // in1.writeSync(1)
      // in2.writeSync(0)
      in1.digitalWrite(1)
      in2.digitalWrite(0)
      console.log('y left-->>',yangle-JSON.parse(message.toString()).y)
      return
    }
    if(JSON.parse(message.toString()).y-yangle>0){
      //turn left
      en1.write((JSON.parse(message.toString()).y-yangle)*initspeed/128)
      // in1.writeSync(0)
      // in2.writeSync(1)
      in1.digitalWrite(0)
      in2.digitalWrite(1)
      console.log('y right-->>',JSON.parse(message.toString()).y-yangle)
      return
    }
    if(JSON.parse(message.toString()).y-yangle==0){
      //turn left
      // in1.writeSync(1)
      // in2.writeSync(1)
      in1.digitalWrite(1)
      in2.digitalWrite(1)
      console.log('stop-->>',JSON.parse(message.toString()).y-yangle)
      return
    }
  //  console.log(JSON.parse(message.toString()))
  }

 
  // console.log(JSON.stringify(message.toString()))
 
 })

 client.on('reconnect', function () {
  console.log('mqtt---Reconnecting...')
  client.publish(`/g500_${iccidstr}`,'Reconnecting--重新连接')
})

client.on('close', function () {
  console.log('mqtt--Disconnected')
  client.publish(`/g500_${iccidstr}`,'Disconnected--失去连接')
})
