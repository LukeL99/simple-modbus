import net from 'net'
import '../util/typed-event'
import { ModbusServer } from '../modbus-server'
import { ModbusTcpCommandFactory } from './modbus-tcp-command-factory'
import { ModbusFunctionCode } from '../modbus-commands'

// TODO: Properly handle connection open, close, and packet boundaries

export class ModbusTcpServer extends ModbusServer {
  private _tcpServer: net.Server
  private _eventFactory = new ModbusTcpCommandFactory()

  constructor() {
    super()
    this._tcpServer = net.createServer(socket => {
      const _this: ModbusTcpServer = this

      socket.on('data', data => {
        // Build object from packet
        let command = this._eventFactory.fromPacket(data)

        // Listen for success or failure events being emitted from command object
        command.onComplete.once((res: Buffer) => {
          socket.write(res)
        })

        // Determine packet type and emit corresponding event type
        switch (command.functionCode) {
          case ModbusFunctionCode.PRESET_SINGLE_REGISTER:
            _this.onPresetSingleRegister.emit(command)
            break
        }

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
}
