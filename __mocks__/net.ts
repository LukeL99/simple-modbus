const net = jest.genMockFromModule('net') as any

import { EventEmitter } from 'events'

class MockTcpServer extends EventEmitter {

  listen(port: number) {
    return this
  }

  close() {
    return this
  }

}

class MockTcpSocket extends EventEmitter {

  write(data: Buffer) {
    this.emit('write', data)
  }

}

const server = new MockTcpServer()
const socket = new MockTcpSocket()

const createServer = jest.fn((cb: any) => {
  cb(socket)
  return server
})

net.__server = server
net.__socket = socket

net.createServer = createServer

module.exports = net
