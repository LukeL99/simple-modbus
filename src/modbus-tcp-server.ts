import net from 'net'
import './util/typed-event'
import { ModbusServer } from './simple-modbus'
import { ModbusTcpEventFactory } from './modbus-event-factory'
import { ModbusFunctionCode } from './modbus-commands'

// TODO: Properly handle connection open, close, and packet boundaries

export default class ModbusTcpServer extends ModbusServer {
  private _tcpServer: net.Server
  private _eventFactory = new ModbusTcpEventFactory()

  constructor() {
    super()
    this._tcpServer = net.createServer(socket => {
      socket.on('data', (data) => {
        // Build object from packet
        let command = this._eventFactory.fromPacket(data)

        // Determine packet type and emit corresponding event type
        switch (command.functionCode) {
          case ModbusFunctionCode.PRESET_SINGLE_REGISTER:
            this.onPresetSingleRegister.emit(command)
            break
        }

        // Listen for success or failure events being emitted from command object
        command.onComplete.once((res: Buffer) => {
          socket.write(res)
        })

      })
    })
  }

  public listen(port: number): ModbusTcpServer {
    this._tcpServer.listen(port)
    return this
  }

  public close(): ModbusTcpServer {
    if (this._tcpServer) {
      this._tcpServer.close()
      delete this._tcpServer
    }
    return this
  }

};
