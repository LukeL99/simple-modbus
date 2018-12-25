const net = jest.genMockFromModule('net') as any

import { EventEmitter } from 'events'

class MockTcpServer extends EventEmitter {

  listen = jest.fn((port: number) => {
    return this
  })

  close = jest.fn(() => {
    return this
  })

}

class MockTcpSocket extends EventEmitter {

  write = jest.fn((data: Buffer) => {
    this.emit('write', data)
  })

}

let server = new MockTcpServer()
let socket = new MockTcpSocket()

function reset() {
  server = new MockTcpServer()
  socket = new MockTcpSocket()
  net.__server = server
  net.__socket = socket
}

function createServer(cb: any) {
  cb(socket)
  return server
}

net.createServer = createServer
net.__reset = reset
net.Socket = MockTcpSocket
net.Server = MockTcpSocket

net.__server = server
net.__socket = socket

module.exports = net
