import * as net from 'net'
jest.mock('net')
const net2 = net as any
import { ModbusTcpServer } from './modbus-tcp-server'
import { PresetSingleRegisterCommand } from '../modbus-commands'

describe('Server tests', () => {

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
      net2.__socket.on('write', (data: any) => {
        expect(data).toEqual(validResponse)
        done()
      })
      command.success()
    })

    net2.__socket.emit('data', validRequest)
  })

})
