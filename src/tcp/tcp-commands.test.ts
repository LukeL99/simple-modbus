import {
  ModbusCommand,
  ModbusCommandExcepton,
  ModbusFunctionCode,
  PresetSingleRegisterCommand
} from '../modbus-commands'
import { ModbusCommandError } from '../error/modbus-errors'
import { ModbusTcp } from '../simple-modbus'

const commandFactory: ModbusTcp.CommandFactory = new ModbusTcp.CommandFactory()

describe("PresetSingleRegisterCommand test", () => {

  // 0-1   = Transaction ID
  // 2-3   = Protocol ID (0x0000)
  // 4-5   = Message Length
  // 6     = UnitId
  // 7     = Function code
  // 8-9   = Register Address
  // 10-11 = Register Value
  const validCommandBytes = [0x00, 0x01, 0x00, 0x00, 0x00, 0x06, 0x11, 0x06, 0x00, 0x00, 0x00, 0x03]

  const validResponseBytes = [0x00, 0x01, 0x00, 0x00, 0x00, 0x06, 0x11, 0x06, 0x00, 0x00, 0x00, 0x03]

  it("should return an instance of PresetSingleRegisterCommand", () => {
    let command = commandFactory.fromPacket(Buffer.from(validCommandBytes))
    expect(command).toBeInstanceOf(PresetSingleRegisterCommand)
  })

  it("should return the right function code", () => {
    let command = commandFactory.fromPacket(Buffer.from(validCommandBytes))
    expect(command.functionCode).toEqual(ModbusFunctionCode.PRESET_SINGLE_REGISTER)
  })

  it("should return the right register address", () => {
    let command = commandFactory.fromPacket(Buffer.from(validCommandBytes))
    expect(command.registerAddress).toEqual(0)
  })

  it("should return the right register value", () => {
    let command = commandFactory.fromPacket(Buffer.from(validCommandBytes))
    expect(command.registerValue).toEqual(3)
  })

  it("should return the right Unit ID", () => {
    let command = commandFactory.fromPacket(Buffer.from(validCommandBytes))
    expect(command.unitId).toEqual(0x11)
  })

  it("should emit a complete response on success", done => {
    let command = commandFactory.fromPacket(Buffer.from(validCommandBytes))
    command.onComplete.on((command: ModbusCommand<any>) => {
      expect(command.responsePacket).toEqual(Buffer.from(validResponseBytes))
      done()
    })
    command.success()
  })

  it("should emit a success response on success", done => {
    let command = commandFactory.fromPacket(Buffer.from(validCommandBytes))
    command.onSuccess.on((command: ModbusCommand<any>) => {
      expect(command.responsePacket).toEqual(Buffer.from(validResponseBytes))
      done()
    })
    command.success()
  })

  it("should emit a complete response on failure", done => {
    const failureBytes = [0x00, 0x01, 0x00, 0x00, 0x00, 0x03, 0x11, 0x86, 0x04]
    let command = commandFactory.fromPacket(Buffer.from(validCommandBytes))
    command.onComplete.on((command: ModbusCommand<any>) => {
      expect(command.responsePacket).toEqual(Buffer.from(failureBytes))
      done()
    })
    command.fail(ModbusCommandExcepton.SERVER_DEVICE_FAILURE)
  })

  it("should emit a failure response on failure", done => {
    const failureBytes = [0x00, 0x01, 0x00, 0x00, 0x00, 0x03, 0x11, 0x86, 0x04]
    let command = commandFactory.fromPacket(Buffer.from(validCommandBytes))
    command.onFailure.on((command: ModbusCommand<any>) => {
      expect(command.responsePacket).toEqual(Buffer.from(failureBytes))
      done()
    })
    command.fail(ModbusCommandExcepton.SERVER_DEVICE_FAILURE)
  })

  it("should throw an error when accessing response packet before success or fail has been called", () => {
    let command = commandFactory.fromPacket(Buffer.from(validCommandBytes))
    expect(() => {
      let response = command.responsePacket
      // }).toThrowError(ModbusCommandError)
    }).toThrowError(new ModbusCommandError('Tried to read response packet, but success or fail has not been called.'))
  })


})

describe("Malformed packet tests", () => {

  it("should throw a command exception on invalid fc", () => {
    const invalidCommandBytes = [0x00, 0x01, 0x00, 0x00, 0x00, 0x06, 0x11, 0x14, 0x00, 0x00, 0x00, 0x03]
    expect(() => {
      let command = commandFactory.fromPacket(Buffer.from(invalidCommandBytes))
    }).toThrowError(new ModbusCommandError('Function code not implemented'))
  })

  it("should throw a command exception on short packet", () => {
    const invalidCommandBytes = [0x00, 0x01, 0x00, 0x00, 0x00, 0x06, 0x11, 0x14, 0x00, 0x00]
    expect(() => {
      let command = commandFactory.fromPacket(Buffer.from(invalidCommandBytes))
    }).toThrowError(new ModbusCommandError('Packet length too short'))
  })

  // It should error when a packet has the wrong length byte

})
