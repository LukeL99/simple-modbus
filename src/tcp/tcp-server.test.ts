const net = require('net')
jest.mock('net')

import { ModbusTcpServer, ModbusTcpServerOptions } from './modbus-tcp-server'
import { PresetSingleRegisterCommand, ReadCoilStatusCommand } from '../modbus-commands'

describe('Server tests', () => {

  beforeEach(() => {
    jest.clearAllMocks()
    net.__reset()
  })

  it('should return a server', () => {
    const server = new ModbusTcpServer().listen(502)
    expect(server).toBeInstanceOf(ModbusTcpServer)
  })

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

  it('should correctly pass options to command factory', () => {
    let server: any = new ModbusTcpServer();
    expect(server._commandFactory._options).toBeUndefined()

    let options: ModbusTcpServerOptions = {}
    server = new ModbusTcpServer(options);
    expect(server._commandFactory._options).toEqual(options)

    options = {simpleAddressing: false}
    server = new ModbusTcpServer(options);
    expect(server._commandFactory._options).toEqual(options)

    options = {simpleAddressing: true}
    server = new ModbusTcpServer(options);
    expect(server._commandFactory._options).toEqual(options)

  })

  it('should use simple addressing when option is blank', (done) => {
    const validRequest = Buffer.from([0x00, 0x01, 0x00, 0x00, 0x00, 0x06, 0x11, 0x06, 0x00, 0x00, 0x00, 0x03])
    const server = new ModbusTcpServer().listen(502)

    server.onPresetSingleRegister.on((command) => {
      expect(command).toBeInstanceOf(PresetSingleRegisterCommand)
      expect(command.registerAddress).toEqual(0)
      done()
    })

    net.__socket.emit('data', validRequest)
  })

  it('should use simple addressing when option is true', (done) => {
    const validRequest = Buffer.from([0x00, 0x01, 0x00, 0x00, 0x00, 0x06, 0x11, 0x06, 0x00, 0x00, 0x00, 0x03])
    const server = new ModbusTcpServer({simpleAddressing: true}).listen(502)

    server.onPresetSingleRegister.on((command) => {
      expect(command).toBeInstanceOf(PresetSingleRegisterCommand)
      expect(command.registerAddress).toEqual(0)
      done()
    })

    net.__socket.emit('data', validRequest)
  })

  it('should use Modbus addressing when option is false', (done) => {
    const validRequest = Buffer.from([0x00, 0x01, 0x00, 0x00, 0x00, 0x06, 0x11, 0x06, 0x00, 0x00, 0x00, 0x03])
    const server = new ModbusTcpServer({simpleAddressing: false}).listen(502)

    server.onPresetSingleRegister.on((command) => {
      expect(command).toBeInstanceOf(PresetSingleRegisterCommand)
      expect(command.registerAddress).toEqual(40001)
      done()
    })

    net.__socket.emit('data', validRequest)
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

  // TODO: rewrite test names and test close and listen methods

})
