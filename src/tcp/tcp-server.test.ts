const net = require('net')
jest.mock('net')

import { ModbusTcpServer } from './modbus-tcp-server'
import { PresetSingleRegisterCommand } from '../modbus-commands'

describe('Server tests', () => {

  beforeEach(() => {
    jest.clearAllMocks()
    net.__reset()
  })

  it('should return a server', () => {
    const server = new ModbusTcpServer().listen(502)
    expect(server).toBeInstanceOf(ModbusTcpServer)
  })

  it('should emit a command on a packet and write a response', (done) => {
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

  it('should auto respond with success when option is set', (done) => {
    const validRequest = Buffer.from([0x00, 0x01, 0x00, 0x00, 0x00, 0x06, 0x11, 0x06, 0x00, 0x00, 0x00, 0x03])
    const validResponse = Buffer.from([0x00, 0x01, 0x00, 0x00, 0x00, 0x06, 0x11, 0x06, 0x00, 0x00, 0x00, 0x03])
    const server = new ModbusTcpServer({ autoRespondSuccess: true }).listen(502)

    server.onPresetSingleRegister.on((command) => {
      expect(command).toBeInstanceOf(PresetSingleRegisterCommand)
      net.__socket.on('write', (data: any) => {
        expect(data).toEqual(validResponse)
        done()
      })
    })

    net.__socket.emit('data', validRequest)
  })

  it('should not respond on socket if auto response is not set', (done) => {
    const validRequest = Buffer.from([0x00, 0x01, 0x00, 0x00, 0x00, 0x06, 0x11, 0x06, 0x00, 0x00, 0x00, 0x03])
    const validResponse = Buffer.from([0x00, 0x01, 0x00, 0x00, 0x00, 0x06, 0x11, 0x06, 0x00, 0x00, 0x00, 0x03])
    const server = new ModbusTcpServer({ autoRespondSuccess: false }).listen(502)

    server.onPresetSingleRegister.on((command) => {
      expect(command).toBeInstanceOf(PresetSingleRegisterCommand)
    })

    net.__socket.emit('data', validRequest)

    // wait 20 ms to make sure it doesn't fire
    setTimeout(() => {
      expect(net.__socket.write.mock.calls.length).toEqual(0)
      done()
    }, 20)
  })

  it('should auto respond with success when option is set', (done) => {
    const validRequest = Buffer.from([0x00, 0x01, 0x00, 0x00, 0x00, 0x06, 0x11, 0x06, 0x00, 0x00, 0x00, 0x03])
    const validResponse = Buffer.from([0x00, 0x01, 0x00, 0x00, 0x00, 0x06, 0x11, 0x06, 0x00, 0x00, 0x00, 0x03])
    const server = new ModbusTcpServer({ autoRespondSuccess: true }).listen(502)

    server.onPresetSingleRegister.on((command) => {
      expect(command).toBeInstanceOf(PresetSingleRegisterCommand)
      net.__socket.on('write', (data: any) => {
        expect(data).toEqual(validResponse)
        done()
      })
    })

    net.__socket.emit('data', validRequest)
  })

  // TODO: rewrite test names and test close and listen methods

})
