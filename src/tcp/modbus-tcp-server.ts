import net from 'net'
import '../util/typed-event'
import { ModbusServer } from '../modbus-server'
import { ModbusTcpCommandFactory } from './modbus-tcp-command-factory'
import {
  ModbusCommand,
  ModbusFunctionCode,
  PresetSingleRegisterCommand,
  ReadCoilStatusCommand, ReadHoldingRegistersCommand, ReadInputStatusCommand
} from '../modbus-commands'
import { ModbusCommandFactoryOptions } from '../modbus-command-factory'

/**
 * Options that only affect the server (timeouts, etc.) should go here,
 * options that affect the commands being emitted should be added to [ModbusCommandFactoryOptions](../classes/modbuscommandfactoryoptions.html)
 */
export interface ModbusTcpServerOptions extends ModbusCommandFactoryOptions {
}

// TODO: Properly handle connection open, close, and packet boundaries
export class ModbusTcpServer extends ModbusServer {
  private _tcpServer: net.Server
  private _commandFactory = new ModbusTcpCommandFactory()
  private _options?: ModbusTcpServerOptions

  constructor(options?: ModbusTcpServerOptions) {
    super()

    this._options = options
    this._commandFactory = new ModbusTcpCommandFactory(options)

    this._tcpServer = net.createServer(socket => {
      const _this: ModbusTcpServer = this

      socket.on('data', data => {
        // Build object from packet
        let command = this._commandFactory.fromPacket(data)

        // Listen for success or failure events being emitted from command object
        command.onComplete.once((command: ModbusCommand<any>) => {
          socket.write(command.responsePacket)
        })

        // Determine packet type and emit corresponding event type
        switch (command.functionCode) {
          case ModbusFunctionCode.READ_COIL_STATUS:
            _this.onReadCoilStatus.emit(command as ReadCoilStatusCommand)
            break
          case ModbusFunctionCode.READ_INPUT_STATUS:
            _this.onReadInputStatus.emit(command as ReadInputStatusCommand)
            break
          case ModbusFunctionCode.READ_HOLDING_REGISTERS:
            _this.onReadHoldingRegisters.emit(command as ReadHoldingRegistersCommand)
            break
          case ModbusFunctionCode.PRESET_SINGLE_REGISTER:
            _this.onPresetSingleRegister.emit(command as PresetSingleRegisterCommand)
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
