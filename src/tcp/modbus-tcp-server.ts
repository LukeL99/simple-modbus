import net from 'net'
import '../util/typed-event'
import { ModbusServer } from '../modbus-server'
import { ModbusTcpCommandFactory } from './modbus-tcp-command-factory'
import { ModbusCommand, ModbusFunctionCode } from '../modbus-commands'

// TODO: Properly handle connection open, close, and packet boundaries

interface ModbusTcpServerOptions {
  autoRespondSuccess?: boolean
}

export class ModbusTcpServer extends ModbusServer {
  private _tcpServer: net.Server
  private _eventFactory = new ModbusTcpCommandFactory()
  private _autoRespondSuccess: boolean = false

  constructor(options?: ModbusTcpServerOptions) {
    super()
    if (options && options.autoRespondSuccess) {
      this._autoRespondSuccess = true
    }

    this._tcpServer = net.createServer(socket => {
      const _this: ModbusTcpServer = this

      socket.on('data', data => {
        // Build object from packet
        let command = this._eventFactory.fromPacket(data)

        // Listen for success or failure events being emitted from command object
        command.onComplete.once((command: ModbusCommand<any>) => {
          socket.write(command.responsePacket)
        })

        // Determine packet type and emit corresponding event type
        switch (command.functionCode) {
          case ModbusFunctionCode.PRESET_SINGLE_REGISTER:
            _this.onPresetSingleRegister.emit(command)
            break
        }

        if (_this._autoRespondSuccess) {
          command.success()
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
    }
    return this
  }
}
