import {
  ModbusFunctionCode,
  ModbusCommand,
  PresetSingleRegisterCommand,
  UnitIdGetter,
  FunctionCodeGetter,
  SuccessGetter,
  FailureGetter,
  RegisterAddressGetter, RegisterValueGetter
} from './modbus-commands'
import { ModbusCommandError } from './error/modbus-errors'

abstract class ModbusEventFactory {

  public abstract fromPacket(packet: Buffer): ModbusCommand<any>

}

export class ModbusTcpEventFactory implements ModbusEventFactory {

  private _unitIdGetter: UnitIdGetter = (requestPacket => {
    return requestPacket.readUInt8(6)
  })

  private _functionCodeGetter: FunctionCodeGetter = (requestPacket => {
    return requestPacket.readUInt8(7)
  })

  private _packetCopySuccessGetter: SuccessGetter = (requestPacket => Buffer.from(requestPacket))

  private _failureGetter: FailureGetter = ((requestPacket, exception) => {
    let response = []

    // First 2 bytes are the Transaction Identifier
    response[0] = requestPacket.readUInt8(0)
    response[1] = requestPacket.readUInt8(1)

    // Next 2 bytes are protocol ID. These should always be 0x0000. But the protocol says to copy them from the request.
    response[2] = requestPacket.readUInt8(2)
    response[3] = requestPacket.readUInt8(3)

    // Failure length is always constant
    response[4] = 0x00
    response[5] = 0x03

    // Copy UnitId from request
    response[6] = requestPacket.readUInt8(6)

    // Function code is request function code with highest bit set
    response[7] = requestPacket.readUInt8(7) | 0b10000000
    response[8] = exception

    return new Buffer(new Uint8Array(response))
  })

  private _registerAddressGetter: RegisterAddressGetter = (requestPacket => {
    return requestPacket.readUInt16BE(8)
  })

  private _registerValueGetter: RegisterValueGetter = (requestPacket => {
    return requestPacket.readUInt16BE(10)
  })

  public fromPacket(packet: Buffer) {
    // Minimum Modbus TCP request packet size is 12
    if (packet.length < 12) {
      throw new ModbusCommandError('Packet length too short')
    }

    const fc = this._functionCodeGetter(packet)

    // Determine packet type, and call appropriate constructor
    switch (fc) {
      case ModbusFunctionCode.PRESET_SINGLE_REGISTER:
        return new PresetSingleRegisterCommand(packet, this._unitIdGetter,
          this._functionCodeGetter, this._packetCopySuccessGetter,
          this._failureGetter, this._registerAddressGetter,
          this._registerValueGetter)
      default:
        throw new ModbusCommandError('Function code not implemented')
    }
  }

}
