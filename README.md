# simple-modbus

## A simple library for working with Modbus

[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Greenkeeper badge](https://badges.greenkeeper.io/alexjoverm/typescript-library-starter.svg)](https://greenkeeper.io/)
[![Travis](https://travis-ci.org/LukeL99/simple-modbus.svg)](https://travis-ci.org/LukeL99/simple-modbus)
[![Coveralls](https://coveralls.io/repos/github/LukeL99/simple-modbus/badge.svg)](https://coveralls.io/github/LukeL99/simple-modbus)
[![Dev Dependencies](https://david-dm.org/LukeL99/simple-modbus/dev-status.svg)](https://david-dm.org/LukeL99/simple-modbus?type=dev)
[![Donate](https://img.shields.io/badge/donate-paypal-blue.svg)](https://paypal.me/lukel99)
[![All Contributors](https://img.shields.io/badge/all_contributors-0-orange.svg?style=flat-square)](#contributors)

The aim of this project is to make it extremely easy to work with Modbus with Node.js. It's written in Typescript, so you get easy to use strong typings. The error handling is consistent and easy, and it has a full test suite to ensure repeatable behavior.

### Currently Implemented

- [x] Modbus TCP Server
- [ ] Modbus RTU Server
- [ ] Modbus ASCII Server
- [ ] Modbus RTU/IP Server
- [ ] Modbus TCP Client
- [ ] Modbus RTU Client
- [ ] Modbus ASCII Client
- [ ] Modbus RTU/IP Client

## Examples

Start a ModbusTCP server, and listen for only preset single register commands (function code 0x06).

Typescript:
```typescript
import { ModbusCommandException, ModbusTcp } from '..'

const server = new ModbusTcp.Server()
server.listen(502)

server.onReadCoilStatus.on(command => {
  console.log(`Read Coil Status - Address: ${command.coilStartAddress} Number: ${command.numberOfCoils}`)
  // Respond with Success (response array must be same length as numberOfCoils)
  command.success([true, false, true, false])
})

server.onReadInputStatus.on(command => {
  console.log(`Read Input Status - Address: ${command.inputStartAddress} Number: ${command.numberOfInputs}`)
  // Respond with Success (response array must be same length as numberOfInputs)
  command.success([true, false, true, false])
})

server.onReadHoldingRegisters.on(command => {
  console.log(`Read Holding Registers - Address: ${command.registerStartAddress} Number: ${command.registerLength}`)
  // Respond with Success (response array must be same length as registerLength)
  command.success(new Uint16Array([0xFFFF, 0x0000, 0xDEAD, 0xBEEF]))
})

server.onReadInputRegisters.on(command => {
  console.log(`Read Input Registers - Address: ${command.registerStartAddress} Number: ${command.registerLength}`)
  // Respond with Success (response array must be same length as registerLength)
  command.success(new Uint16Array([0xFFFF, 0x0000, 0xDEAD, 0xBEEF]))
})

server.onPresetSingleRegister.on(command => {
  console.log(`Preset Single Register - Address: ${command.registerAddress} - Value: ${command.registerValue}`)
  // Respond with Success
  command.success()
})

server.onPresetMultipleRegisters.on(command => {
  console.log(`Preset Multiple Registers - Start Address: ${command.registerStartAddress} Length: ${command.registerLength} Values: ${command.registerValues}`)
  // Respond with Success
  command.success()
})

server.onForceSingleCoil.on(command => {
  console.log(`Force Single Coil - Address: ${command.coilAddress} Value: ${command.coilStatusAsCoilStatus}}`)
  // Respond with Success
  command.success()
})

server.onForceMultipleCoils.on(command => {
  console.log(`Force Multiple Coils - Start Address: ${command.coilStartAddress} Length: ${command.coilLength} Values: ${command.coilStatuses}}`)
  // Respond with Failure
  command.fail(ModbusCommandException.ILLEGAL_DATA_ADDRESS)
})

server.onCommandError.on(err => {
  console.error(`Error when trying to decode a packet: ${err.message}`)
})

server.onServerError.on(err => {
  console.error(`Error from underlying TCP server: ${err.message}`)
})
```

Javascript:
```javascript
const ModbusTcp = require('simple-modbus').ModbusTcp
const ModbusCommandException = require('simple-modbus').ModbusCommandException

const server = new ModbusTcp.Server();
server.listen(502);

server.onPresetSingleRegister.on(command => {
  console.log(`${command.registerAddress} - ${command.registerValue}`)
  // Respond with Success
  command.success()
  // Or respond with failure
  command.fail(ModbusCommandException.ILLEGAL_DATA_ADDRESS)
})
```

## Contributors

Thanks goes to these wonderful people ([emoji key](https://github.com/kentcdodds/all-contributors#emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification. Contributions of any kind welcome!
