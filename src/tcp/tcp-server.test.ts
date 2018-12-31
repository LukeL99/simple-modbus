const net = require('net')
jest.mock('net')

import { ModbusTcpServer, ModbusTcpServerOptions } from './modbus-tcp-server'
import {
  ForceMultipleCoilsCommand,
  ForceSingleCoilCommand, PresetMultipleRegistersCommand,
  PresetSingleRegisterCommand,
  ReadCoilStatusCommand,
  ReadHoldingRegistersCommand, ReadInputRegistersCommand,
  ReadInputStatusCommand
} from '../modbus-commands'

describe('Server tests', () => {

  beforeEach(() => {
    jest.clearAllMocks()
    net.__reset()
  })

  it('should return a server', () => {
    const server = new ModbusTcpServer().listen(502)
    expect(server).toBeInstanceOf(ModbusTcpServer)
  })

  it('should correctly pass options to command factory', () => {
    let server: any = new ModbusTcpServer();
    expect(server._commandFactory._options).toBeUndefined()

    let options: ModbusTcpServerOptions = {}
    server = new ModbusTcpServer(options);
    expect(server._commandFactory._options).toEqual(options)

    options = { simpleAddressing: false }
    server = new ModbusTcpServer(options);
    expect(server._commandFactory._options).toEqual(options)

    options = { simpleAddressing: true }
    server = new ModbusTcpServer(options);
    expect(server._commandFactory._options).toEqual(options)

  })

  it('should use simple addressing when simpleAddressing is blank', (done) => {
    const validRequest = Buffer.from([0x00, 0x01, 0x00, 0x00, 0x00, 0x06, 0x11, 0x06, 0x00, 0x00, 0x00, 0x03])
    const server = new ModbusTcpServer().listen(502)

    server.onPresetSingleRegister.on((command) => {
      expect(command).toBeInstanceOf(PresetSingleRegisterCommand)
      expect(command.registerAddress).toEqual(0)
      done()
    })

    net.__socket.emit('data', validRequest)
  })

  it('should use simple addressing when simpleAddressing is true', (done) => {
    const validRequest = Buffer.from([0x00, 0x01, 0x00, 0x00, 0x00, 0x06, 0x11, 0x06, 0x00, 0x00, 0x00, 0x03])
    const server = new ModbusTcpServer({ simpleAddressing: true }).listen(502)

    server.onPresetSingleRegister.on((command) => {
      expect(command).toBeInstanceOf(PresetSingleRegisterCommand)
      expect(command.registerAddress).toEqual(0)
      done()
    })

    net.__socket.emit('data', validRequest)
  })

  it('should use Modbus addressing when simpleAddressing is false', (done) => {
    const validRequest = Buffer.from([0x00, 0x01, 0x00, 0x00, 0x00, 0x06, 0x11, 0x06, 0x00, 0x00, 0x00, 0x03])
    const server = new ModbusTcpServer({ simpleAddressing: false }).listen(502)

    server.onPresetSingleRegister.on((command) => {
      expect(command).toBeInstanceOf(PresetSingleRegisterCommand)
      expect(command.registerAddress).toEqual(40001)
      done()
    })

    net.__socket.emit('data', validRequest)
  })

})

describe('Server command tests', () =>{

  beforeEach(() => {
    jest.clearAllMocks()
    net.__reset()
  })

  it('should emit a ReadCoilStatusCommand and write a response', (done) => {
    const validCommandBytes = [0x00, 0x01, 0x00, 0x00, 0x00, 0x06, 0x05, 0x01, 0x01, 0x10, 0x00, 0x25]

    const coilValues = [true, false, true, true, false, false, true, true,
      true, true, false, true, false, true, true, false,
      false, true, false, false, true, true, false, true,
      false, true, true, true, false, false, false, false,
      true, true, false, true, true]

    const validResponseBytes = [0x00, 0x01, 0x00, 0x00, 0x00, 0x08, 0x05, 0x01, 0x05, 0xCD, 0x6B, 0xB2, 0x0E, 0x1B]

    const server = new ModbusTcpServer().listen(502)

    server.onReadCoilStatus.on((command) => {
      expect(command).toBeInstanceOf(ReadCoilStatusCommand)
      net.__socket.on('write', (data: any) => {
        expect(data).toEqual(Buffer.from(validResponseBytes))
        done()
      })
      command.success(coilValues)
    })

    net.__socket.emit('data', Buffer.from(validCommandBytes))
  })

  it('should emit a ReadInputStatusCommand and write a response', (done) => {
    const validCommandBytes = [0x00, 0x01, 0x00, 0x00, 0x00, 0x06, 0x05, 0x02, 0x01, 0x10, 0x00, 0x16]

    const inputStatuses = [
      false, false, true, true, false, true, false, true,
      true, true, false, true, true, false, true, true,
      true, false, true, false, true, true
    ]

    const validResponseBytes = [0x00, 0x01, 0x00, 0x00, 0x00, 0x06, 0x05, 0x02, 0x03, 0xAC, 0xDB, 0x35]

    const server = new ModbusTcpServer().listen(502)

    server.onReadInputStatus.on((command) => {
      expect(command).toBeInstanceOf(ReadInputStatusCommand)
      net.__socket.on('write', (data: any) => {
        expect(data).toEqual(Buffer.from(validResponseBytes))
        done()
      })
      command.success(inputStatuses)
    })

    net.__socket.emit('data', Buffer.from(validCommandBytes))
  })

  it('should emit a ReadHoldingRegistersCommand and write a response', (done) => {

    const validCommandBytes = [0x00, 0x01, 0x00, 0x00, 0x00, 0x06, 0x05, 0x03, 0x01, 0x10, 0x00, 0x03]

    const registerValues = new Uint16Array([0xAE41, 0x5652, 0x4340])

    const validResponseBytes = [0x00, 0x01, 0x00, 0x00, 0x00, 0x09, 0x05, 0x03, 0x06, 0xAE, 0x41, 0x56, 0x52, 0x43, 0x40]

    const server = new ModbusTcpServer().listen(502)

    server.onReadHoldingRegisters.on((command) => {
      expect(command).toBeInstanceOf(ReadHoldingRegistersCommand)
      net.__socket.on('write', (data: any) => {
        expect(data).toEqual(Buffer.from(validResponseBytes))
        done()
      })
      command.success(registerValues)
    })

    net.__socket.emit('data', Buffer.from(validCommandBytes))
  })

  it('should emit a ReadInputRegistersCommand and write a response', (done) => {

    const validCommandBytes = [0x00, 0x01, 0x00, 0x00, 0x00, 0x06, 0x05, 0x04, 0x01, 0x10, 0x00, 0x03]

    const registerValues = new Uint16Array([0xAE41, 0x5652, 0x4340])

    const validResponseBytes = [0x00, 0x01, 0x00, 0x00, 0x00, 0x09, 0x05, 0x04, 0x06, 0xAE, 0x41, 0x56, 0x52, 0x43, 0x40]

    const server = new ModbusTcpServer().listen(502)

    server.onReadInputRegisters.on((command) => {
      expect(command).toBeInstanceOf(ReadInputRegistersCommand)
      net.__socket.on('write', (data: any) => {
        expect(data).toEqual(Buffer.from(validResponseBytes))
        done()
      })
      command.success(registerValues)
    })

    net.__socket.emit('data', Buffer.from(validCommandBytes))
  })

  it('should emit a ForceSingleCoilCommand and write a response', (done) => {
    const coilOnBytes = [0x00, 0x01, 0x00, 0x00, 0x00, 0x06, 0x05, 0x05, 0x01, 0x10, 0xFF, 0x00]

    const server = new ModbusTcpServer().listen(502)

    server.onForceSingleCoil.on((command) => {
      expect(command).toBeInstanceOf(ForceSingleCoilCommand)
      net.__socket.on('write', (data: any) => {
        expect(data).toEqual(Buffer.from(coilOnBytes))
        done()
      })
      command.success()
    })

    net.__socket.emit('data', Buffer.from(coilOnBytes))
  })

  // TODO:
  // it('should emit an error when invalid ForceSingleCoilCommand is sent', (done) => {
  //   const coilFailBytes = [0x00, 0x01, 0x00, 0x00, 0x00, 0x06, 0x05, 0x05, 0x01, 0x10, 0x11, 0x11]
  //
  //   const server = new ModbusTcpServer().listen(502)
  //
  //   server.onCommandError.on(() => {
  //     // Test here!
  //   })
  //
  //   net.__socket.emit('data', Buffer.from(coilFailBytes))
  // })

  it('should emit a PresetSingleRegisterCommand and write a response', (done) => {
    const validRequest = Buffer.from([0x00, 0x01, 0x00, 0x00, 0x00, 0x06, 0x11, 0x06, 0x00, 0x00, 0x00, 0x03])
    const validResponse = Buffer.from([0x00, 0x01, 0x00, 0x00, 0x00, 0x06, 0x11, 0x06, 0x00, 0x00, 0x00, 0x03])
    const server = new ModbusTcpServer().listen(502)

    server.onPresetSingleRegister.on((command) => {
      expect(command).toBeInstanceOf(PresetSingleRegisterCommand)
      net.__socket.on('write', (data: any) => {
        expect(data).toEqual(validResponse)
        done()
      })
      command.success()
    })

    net.__socket.emit('data', validRequest)
  })

  it('should emit a ForceMultipleCoilsCommand and write a response', (done) => {
    const validRequestBytes = [0x00, 0x01, 0x00, 0x00, 0x00, 0x08, 0x05, 0x0F, 0x01, 0x10, 0x00, 0x0A, 0x02, 0xCD, 0x01]

    const coilValues = [true, false, true, true, false, false, true, true, true, false]

    const validResponseBytes = [0x00, 0x01, 0x00, 0x00, 0x00, 0x06, 0x05, 0x0F, 0x01, 0x10, 0x00, 0x0A]

    const server = new ModbusTcpServer().listen(502)

    server.onForceMultipleCoils.on((command) => {
      expect(command).toBeInstanceOf(ForceMultipleCoilsCommand)
      expect(command.coilValues).toEqual(coilValues)
      net.__socket.on('write', (data: any) => {
        expect(data).toEqual(Buffer.from(validResponseBytes))
        done()
      })
      command.success()
    })

    net.__socket.emit('data', Buffer.from(validRequestBytes))
  })

  // TODO:
  // it('should emit an error when invalid ForceMultipleCoilsCommand is sent', (done) => {
  //   const coilFailBytes = [0x00, 0x01, 0x00, 0x00, 0x00, 0x08, 0x05, 0x0F, 0x01, 0x10, 0x00, 0x0A, 0x03, 0xCD, 0x01]
  //   const server = new ModbusTcpServer().listen(502)
  //
  //   server.onCommandError.on(() => {
  //     // Test here!
  //   })
  //
  //   net.__socket.emit('data', Buffer.from(coilFailBytes))
  // })

  it('should emit a PresetMultipleRegistersCommand and write a response', (done) => {
    const validRequestBytes = [0x00, 0x01, 0x00, 0x00, 0x00, 0x0B, 0x05, 0x10, 0x01, 0x10, 0x00, 0x02, 0x04, 0x00, 0x0A, 0x01, 0x02]

    const registerValues = [0x000A, 0x0102]

    const validResponseBytes = [0x00, 0x01, 0x00, 0x00, 0x00, 0x06, 0x05, 0x10, 0x01, 0x10, 0x00, 0x02]

    const server = new ModbusTcpServer().listen(502)

    server.onPresetMultipleRegisters.on((command) => {
      expect(command).toBeInstanceOf(PresetMultipleRegistersCommand)
      expect(command.registerValues).toEqual(registerValues)
      net.__socket.on('write', (data: any) => {
        expect(data).toEqual(Buffer.from(validResponseBytes))
        done()
      })
      command.success()
    })

    net.__socket.emit('data', Buffer.from(validRequestBytes))
  })

  // TODO:
  // it('should emit an error when invalid PresetMultipleRegistersCommand is sent', (done) => {
  //   const registerFailBytes = [0x00, 0x01, 0x00, 0x00, 0x00, 0x0B, 0x05, 0x10, 0x01, 0x10, 0x00, 0x02, 0x05, 0x00, 0x0A, 0x01, 0x02]
  //   const server = new ModbusTcpServer().listen(502)
  //
  //   server.onCommandError.on(() => {
  //     // Test here!
  //   })
  //
  //   net.__socket.emit('data', Buffer.from(registerFailBytes))
  // })

  // TODO: rewrite test names and test close and listen methods
  // TODO: Test failures are properly emitted from the server

})
