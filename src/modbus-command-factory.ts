import { ModbusCommand } from './modbus-commands'

export abstract class ModbusEventFactory {
  public abstract fromPacket(packet: Buffer): ModbusCommand<any>
}
