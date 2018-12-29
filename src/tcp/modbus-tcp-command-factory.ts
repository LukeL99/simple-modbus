import {
  BoolArraySuccessGetter,
  CoilAddressGetter,
  CoilLengthGetter,
  FailureGetter,
  FunctionCodeGetter, GenericSuccessGetter, InputAddressGetter, InputLengthGetter,
  ModbusFunctionCode,
  PresetSingleRegisterCommand, ReadCoilStatusCommand, ReadHoldingRegistersCommand, ReadInputStatusCommand,
  RegisterAddressGetter, RegisterLengthGetter,
  RegisterValueGetter, Uint16ArraySuccessGetter,
  UnitIdGetter
} from '../modbus-commands'
import { ModbusCommandError } from '../error/modbus-errors'
import { ModbusCommandFactory, ModbusCommandFactoryOptions } from '../modbus-command-factory'

export class ModbusTcpCommandFactory extends ModbusCommandFactory {

  private _options?: ModbusCommandFactoryOptions

  constructor(options?: ModbusCommandFactoryOptions) {
    super(options)
    this._options = options
  }

  private _unitIdGetter: UnitIdGetter = (requestPacket => {
    return requestPacket.readUInt8(6)
  })

  private _functionCodeGetter: FunctionCodeGetter = (requestPacket => {
    return requestPacket.readUInt8(7)
  })

  private _packetCopySuccessGetter: GenericSuccessGetter = (requestPacket => Buffer.from(requestPacket))

  private static _stubTcpHeader(requestPacket: Buffer) {
    let response = []

    // First 2 bytes are the Transaction Identifier
    response[0] = requestPacket.readUInt8(0)
    response[1] = requestPacket.readUInt8(1)

    // Next 2 bytes are protocol ID. These should always be 0x0000. But the protocol says to copy them from the request.
    response[2] = requestPacket.readUInt8(2)
    response[3] = requestPacket.readUInt8(3)

    // Copy UnitId from request
    response[6] = requestPacket.readUInt8(6)

    // Copy Function Code from request
    response[7] = requestPacket.readUInt8(7)
    return response
  }

  private _readCoilSuccessGetter: BoolArraySuccessGetter = (requestPacket, data) => {
    let response = ModbusTcpCommandFactory._stubTcpHeader(requestPacket)

    // Calculate number of bytes with coil data in response
    const coilsRequested = this._coilLengthGetter(requestPacket)
    const byteLength = Math.ceil(coilsRequested / 8.0)
    response[8] = byteLength

    // TCP byte length data
    response[4] = (byteLength + 3) >> 8
    response[5] = (byteLength + 3) & 0xFF

    // Pad array with false at end to end on an 8 bit boundary
    const paddedData = [...data, ...(new Array<boolean>(8 - (coilsRequested % 8)).fill(false))]
    for (let i = 0; i < byteLength; i++) {
      // Take a slice of the array of length 8, reverse it, then fill the accumulator with it (starting from right)
      response[9 + i] = paddedData.slice(i * 8, 8 + (i * 8)).reduce(
        (accumulator, currentValue, currentIndex) => accumulator | ((currentValue ? 1 : 0) << currentIndex),
        0x00)
    }

    return Buffer.from(new Uint8Array(response))
  }

  private _readInputStatusSuccessGetter: BoolArraySuccessGetter = (requestPacket, data) => {
    let response = ModbusTcpCommandFactory._stubTcpHeader(requestPacket)

    // Calculate number of bytes with coil data in response
    const inputsRequested = this._inputLengthGetter(requestPacket)
    const byteLength = Math.ceil(inputsRequested / 8.0)
    response[8] = byteLength

    // TCP byte length data
    response[4] = (byteLength + 3) >> 8
    response[5] = (byteLength + 3) & 0xFF

    // Pad array with false at end to end on an 8 bit boundary
    const paddedData = [...data, ...(new Array<boolean>(8 - (inputsRequested % 8)).fill(false))]
    for (let i = 0; i < byteLength; i++) {
      // Take a slice of the array of length 8, reverse it, then fill the accumulator with it (starting from right)
      response[9 + i] = paddedData.slice(i * 8, 8 + (i * 8)).reduce(
        (accumulator, currentValue, currentIndex) => accumulator | ((currentValue ? 1 : 0) << currentIndex),
        0x00)
    }

    return Buffer.from(new Uint8Array(response))
  }

  private _readHoldingRegisterSuccessGetter: Uint16ArraySuccessGetter = (requestPacket, data) => {
    let response = ModbusTcpCommandFactory._stubTcpHeader(requestPacket)

    // Calculate number of bytes with coil data in response
    const registersRequested = this._registerLengthGetter(requestPacket)
    const byteLength = registersRequested * 2
    response[8] = byteLength

    // TCP byte length data
    response[4] = (byteLength + 3) >> 8
    response[5] = (byteLength + 3) & 0xFF

    for (let i = 0; i < registersRequested; i++) {
      response[9 + (i * 2)] = data[i] >> 8
      response[10 + (i * 2)] = data[i] & 0xFF
    }

    return Buffer.from(new Uint8Array(response))
  }

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

    return Buffer.from(new Uint8Array(response))
  })

  private _holdingRegisterAddressGetter: RegisterAddressGetter = (requestPacket => {
    return this.simpleAddressing ? requestPacket.readUInt16BE(8) : requestPacket.readUInt16BE(8) + 40001
  })

  private _registerValueGetter: RegisterValueGetter = (requestPacket => {
    return requestPacket.readUInt16BE(10)
  })

  private _registerLengthGetter: RegisterLengthGetter = (requestPacket => {
    return requestPacket.readUInt16BE(10)
  })

  private _coilAddressGetter: CoilAddressGetter = (requestPacket => {
    return this.simpleAddressing ? requestPacket.readUInt16BE(8) : requestPacket.readUInt16BE(8) + 1
  })

  private _coilLengthGetter: CoilLengthGetter = (requestPacket => {
    return requestPacket.readUInt16BE(10)
  })

  private _inputAddressGetter: InputAddressGetter = (requestPacket => {
    return this.simpleAddressing ? requestPacket.readUInt16BE(8) : requestPacket.readUInt16BE(8) + 10001
  })

  private _inputLengthGetter: InputLengthGetter = (requestPacket => {
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
      case ModbusFunctionCode.READ_COIL_STATUS:
        return new ReadCoilStatusCommand(packet, this._unitIdGetter,
          this._functionCodeGetter, this._readCoilSuccessGetter,
          this._failureGetter, this._coilAddressGetter,
          this._coilLengthGetter)
      case ModbusFunctionCode.READ_INPUT_STATUS:
        return new ReadInputStatusCommand(packet, this._unitIdGetter,
          this._functionCodeGetter, this._readInputStatusSuccessGetter,
          this._failureGetter, this._inputAddressGetter,
          this._inputLengthGetter)
      case ModbusFunctionCode.READ_HOLDING_REGISTERS:
        return new ReadHoldingRegistersCommand(packet, this._unitIdGetter,
          this._functionCodeGetter, this._readHoldingRegisterSuccessGetter,
          this._failureGetter, this._holdingRegisterAddressGetter,
          this._registerLengthGetter)
      case ModbusFunctionCode.PRESET_SINGLE_REGISTER:
        return new PresetSingleRegisterCommand(packet, this._unitIdGetter,
          this._functionCodeGetter, this._packetCopySuccessGetter,
          this._failureGetter, this._holdingRegisterAddressGetter,
          this._registerValueGetter)
      default:
        throw new ModbusCommandError('Function code not implemented')
    }
  }

}
