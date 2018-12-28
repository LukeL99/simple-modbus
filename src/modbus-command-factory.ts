import { ModbusCommand } from './modbus-commands'

export class ModbusCommandFactoryOptions {

  /**
   * If this option is set, the server will use 0 based coil, input status, and register addresses.
   * For instance, register 40001 will be 0, 40002 will be 1, etc.
   *
   * ```
   * |                  | simple | modbus |
   * |------------------|--------|--------|
   * | Coil             |   0    | 1      |
   * | Coil             |   1    | 2      |
   * | Input            |   0    | 10001  |
   * | Input            |   1    | 10002  |
   * | Holding Register |   0    | 30001  |
   * | Holding Register |   1    | 30002  |
   * | Input Register   |   0    | 40001  |
   * | Input Register   |   1    | 40002  |
   * ```
   * @default: true
   */
  simpleAddressing?: boolean

}

export abstract class ModbusCommandFactory {

  protected readonly simpleAddressing: boolean = true

  protected constructor(options?: ModbusCommandFactoryOptions) {
    if(options !== undefined){
      if(options.simpleAddressing === false) {
        this.simpleAddressing = false
      }
    }
  }

  abstract fromPacket(packet: Buffer): ModbusCommand<any>

}
