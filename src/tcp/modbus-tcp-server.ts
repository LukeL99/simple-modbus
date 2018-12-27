import net from 'net'
import '../util/typed-event'
import { ModbusServer } from '../modbus-server'
import { ModbusTcpCommandFactory } from './modbus-tcp-command-factory'
import {
  ModbusCommand,
  ModbusFunctionCode,
  PresetSingleRegisterCommand,
  ReadCoilStatusCommand
} from '../modbus-commands'

// TODO: Properly handle connection open, close, and packet boundaries

interface ModbusTcpServerOptions {
}

export class ModbusTcpServer extends ModbusServer {
  private _tcpServer: net.Server
  private _eventFactory = new ModbusTcpCommandFactory()

  constructor(options?: ModbusTcpServerOptions) {
    super()

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
            _this.onPresetSingleRegister.emit(command as PresetSingleRegisterCommand)
            break
          case ModbusFunctionCode.READ_COIL_STATUS:
            _this.onReadCoilStatus.emit(command as ReadCoilStatusCommand)
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
    }
    return this
  }
}
