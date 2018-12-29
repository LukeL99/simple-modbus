import {
  ModbusCommand,
  ModbusCommandExcepton,
  ModbusFunctionCode,
  PresetSingleRegisterCommand,
  ReadCoilStatusCommand,
  ReadHoldingRegistersCommand,
  ReadInputRegistersCommand,
  ReadInputStatusCommand
} from '../modbus-commands'
import { ModbusCommandError } from '../error/modbus-errors'
import { ModbusTcp } from '../simple-modbus'

describe('ReadCoilStatusCommand test', () => {

  // 0-1   = Transaction ID
  // 2-3   = Protocol ID (0x0000)
  // 4-5   = Message Length
  // 6     = UnitId
  // 7     = Function Code
  // 8-9   = Coil Start Address (0x0110 = 272)
  // 10-11 = Number of coils to read (0x0025 = 37)
  const validCommandBytes = [0x00, 0x01, 0x00, 0x00, 0x00, 0x06, 0x05, 0x01, 0x01, 0x10, 0x00, 0x25]

  const coilValues = [
    true, false, true, true, false, false, true, true,
    true, true, false, true, false, true, true, false,
    false, true, false, false, true, true, false, true,
    false, true, true, true, false, false, false, false,
    true, true, false, true, true
  ]

  const validResponseBytes = [0x00, 0x01, 0x00, 0x00, 0x00, 0x08, 0x05, 0x01, 0x05, 0xCD, 0x6B, 0xB2, 0x0E, 0x1B]

  it('should return an instance of ReadCoilStatusCommand', () => {
    const commandFactory: ModbusTcp.CommandFactory = new ModbusTcp.CommandFactory()
    const command = commandFactory.fromPacket(Buffer.from(validCommandBytes))
    expect(command).toBeInstanceOf(ReadCoilStatusCommand)
  })

  it('should return the right function code', () => {
    const commandFactory: ModbusTcp.CommandFactory = new ModbusTcp.CommandFactory()
    const command = commandFactory.fromPacket(Buffer.from(validCommandBytes))
    expect(command.functionCode).toEqual(ModbusFunctionCode.READ_COIL_STATUS)
  })

  it('should return the right coil address (Blank)', () => {
    const commandFactory: ModbusTcp.CommandFactory = new ModbusTcp.CommandFactory()
    const command = (commandFactory.fromPacket(Buffer.from(validCommandBytes)) as ReadCoilStatusCommand)
    expect(command.coilStartAddress).toEqual(272)
  })

  it('should return the right coil address (Simple)', () => {
    const commandFactory: ModbusTcp.CommandFactory = new ModbusTcp.CommandFactory({ simpleAddressing: true })
    const command = (commandFactory.fromPacket(Buffer.from(validCommandBytes)) as ReadCoilStatusCommand)
    expect(command.coilStartAddress).toEqual(272)
  })

  it('should return the right coil address (Modbus)', () => {
    const commandFactory: ModbusTcp.CommandFactory = new ModbusTcp.CommandFactory({ simpleAddressing: false })
    const command = (commandFactory.fromPacket(Buffer.from(validCommandBytes)) as ReadCoilStatusCommand)
    expect(command.coilStartAddress).toEqual(273)
  })

  it('should return the right coil length', () => {
    const commandFactory: ModbusTcp.CommandFactory = new ModbusTcp.CommandFactory()
    const command = (commandFactory.fromPacket(Buffer.from(validCommandBytes)) as ReadCoilStatusCommand)
    expect(command.numberOfCoils).toEqual(37)
  })

  it('should return the right Unit ID', () => {
    const commandFactory: ModbusTcp.CommandFactory = new ModbusTcp.CommandFactory()
    const command = (commandFactory.fromPacket(Buffer.from(validCommandBytes)) as ReadCoilStatusCommand)
    expect(command.unitId).toEqual(5)
  })

  it('should emit a complete response on success', done => {
    const commandFactory: ModbusTcp.CommandFactory = new ModbusTcp.CommandFactory()
    const command = (commandFactory.fromPacket(Buffer.from(validCommandBytes)) as ReadCoilStatusCommand)
    command.onComplete.on((command: ModbusCommand<any>) => {
      expect(command.responsePacket).toEqual(Buffer.from(validResponseBytes))
      done()
    })
    command.success(coilValues)
  })

  it('should emit a success response on success', done => {
    const commandFactory: ModbusTcp.CommandFactory = new ModbusTcp.CommandFactory()
    const command = (commandFactory.fromPacket(Buffer.from(validCommandBytes)) as ReadCoilStatusCommand)
    command.onSuccess.on((command: ModbusCommand<any>) => {
      expect(command.responsePacket).toEqual(Buffer.from(validResponseBytes))
      done()
    })
    command.success(coilValues)
  })

  it('should emit a complete response on failure', done => {
    const commandFactory: ModbusTcp.CommandFactory = new ModbusTcp.CommandFactory()
    const failureBytes = [0x00, 0x01, 0x00, 0x00, 0x00, 0x03, 0x05, 0x81, 0x04]
    const command = commandFactory.fromPacket(Buffer.from(validCommandBytes))
    command.onComplete.on((command: ModbusCommand<any>) => {
      expect(command.responsePacket).toEqual(Buffer.from(failureBytes))
      done()
    })
    command.fail(ModbusCommandExcepton.SERVER_DEVICE_FAILURE)
  })

  it('should emit a failure response on failure', done => {
    const commandFactory: ModbusTcp.CommandFactory = new ModbusTcp.CommandFactory()
    const failureBytes = [0x00, 0x01, 0x00, 0x00, 0x00, 0x03, 0x05, 0x81, 0x04]
    const command = commandFactory.fromPacket(Buffer.from(validCommandBytes))
    command.onFailure.on((command: ModbusCommand<any>) => {
      expect(command.responsePacket).toEqual(Buffer.from(failureBytes))
      done()
    })
    command.fail(ModbusCommandExcepton.SERVER_DEVICE_FAILURE)
  })

  it('should throw an error when accessing response packet before success or fail has been called', () => {
    const commandFactory: ModbusTcp.CommandFactory = new ModbusTcp.CommandFactory()
    const command = commandFactory.fromPacket(Buffer.from(validCommandBytes))
    expect(() => {
      let response = command.responsePacket
    }).toThrowError(new ModbusCommandError('Tried to read response packet, but success or fail has not been called.'))
  })

})

describe('ReadInputStatusCommand test', () => {

  // 0-1   = Transaction ID
  // 2-3   = Protocol ID (0x0000)
  // 4-5   = Message Length
  // 6     = UnitId
  // 7     = Function Code
  // 8-9   = Input Start Address (0x0110 = 272)
  // 10-11 = Number of inputs to read (0x0016 = 22)
  const validCommandBytes = [0x00, 0x01, 0x00, 0x00, 0x00, 0x06, 0x05, 0x02, 0x01, 0x10, 0x00, 0x16]

  const inputStatuses = [
    false, false, true, true, false, true, false, true,
    true, true, false, true, true, false, true, true,
    true, false, true, false, true, true
  ]

  const validResponseBytes = [0x00, 0x01, 0x00, 0x00, 0x00, 0x06, 0x05, 0x02, 0x03, 0xAC, 0xDB, 0x35]
  const failureBytes = [0x00, 0x01, 0x00, 0x00, 0x00, 0x03, 0x05, 0x82, 0x04]

  it('should return an instance of ReadInputStatusCommand', () => {
    const commandFactory: ModbusTcp.CommandFactory = new ModbusTcp.CommandFactory()
    const command = commandFactory.fromPacket(Buffer.from(validCommandBytes))
    expect(command).toBeInstanceOf(ReadInputStatusCommand)
  })

  it('should return the right function code', () => {
    const commandFactory: ModbusTcp.CommandFactory = new ModbusTcp.CommandFactory()
    const command = commandFactory.fromPacket(Buffer.from(validCommandBytes))
    expect(command.functionCode).toEqual(ModbusFunctionCode.READ_INPUT_STATUS)
  })

  it('should return the right input address (Blank)', () => {
    const commandFactory: ModbusTcp.CommandFactory = new ModbusTcp.CommandFactory()
    const command = (commandFactory.fromPacket(Buffer.from(validCommandBytes)) as ReadInputStatusCommand)
    expect(command.inputStartAddress).toEqual(272)
  })

  it('should return the right input address (Simple)', () => {
    const commandFactory: ModbusTcp.CommandFactory = new ModbusTcp.CommandFactory({ simpleAddressing: true })
    const command = (commandFactory.fromPacket(Buffer.from(validCommandBytes)) as ReadInputStatusCommand)
    expect(command.inputStartAddress).toEqual(272)
  })

  it('should return the right input address (Modbus)', () => {
    const commandFactory: ModbusTcp.CommandFactory = new ModbusTcp.CommandFactory({ simpleAddressing: false })
    const command = (commandFactory.fromPacket(Buffer.from(validCommandBytes)) as ReadInputStatusCommand)
    expect(command.inputStartAddress).toEqual(10273)
  })

  it('should return the right input length', () => {
    const commandFactory: ModbusTcp.CommandFactory = new ModbusTcp.CommandFactory()
    const command = (commandFactory.fromPacket(Buffer.from(validCommandBytes)) as ReadInputStatusCommand)
    expect(command.numberOfInputs).toEqual(22)
  })

  it('should return the right Unit ID', () => {
    const commandFactory: ModbusTcp.CommandFactory = new ModbusTcp.CommandFactory()
    const command = (commandFactory.fromPacket(Buffer.from(validCommandBytes)) as ReadInputStatusCommand)
    expect(command.unitId).toEqual(5)
  })

  it('should emit a complete response on success', done => {
    const commandFactory: ModbusTcp.CommandFactory = new ModbusTcp.CommandFactory()
    const command = (commandFactory.fromPacket(Buffer.from(validCommandBytes)) as ReadInputStatusCommand)
    command.onComplete.on((command: ModbusCommand<any>) => {
      expect(command.responsePacket).toEqual(Buffer.from(validResponseBytes))
      done()
    })
    command.success(inputStatuses)
  })

  it('should emit a success response on success', done => {
    const commandFactory: ModbusTcp.CommandFactory = new ModbusTcp.CommandFactory()
    const command = (commandFactory.fromPacket(Buffer.from(validCommandBytes)) as ReadInputStatusCommand)
    command.onSuccess.on((command: ModbusCommand<any>) => {
      expect(command.responsePacket).toEqual(Buffer.from(validResponseBytes))
      done()
    })
    command.success(inputStatuses)
  })

  it('should emit a complete response on failure', done => {
    const commandFactory: ModbusTcp.CommandFactory = new ModbusTcp.CommandFactory()
    const command = commandFactory.fromPacket(Buffer.from(validCommandBytes))
    command.onComplete.on((command: ModbusCommand<any>) => {
      expect(command.responsePacket).toEqual(Buffer.from(failureBytes))
      done()
    })
    command.fail(ModbusCommandExcepton.SERVER_DEVICE_FAILURE)
  })

  it('should emit a failure response on failure', done => {
    const commandFactory: ModbusTcp.CommandFactory = new ModbusTcp.CommandFactory()
    const command = commandFactory.fromPacket(Buffer.from(validCommandBytes))
    command.onFailure.on((command: ModbusCommand<any>) => {
      expect(command.responsePacket).toEqual(Buffer.from(failureBytes))
      done()
    })
    command.fail(ModbusCommandExcepton.SERVER_DEVICE_FAILURE)
  })

  it('should throw an error when accessing response packet before success or fail has been called', () => {
    const commandFactory: ModbusTcp.CommandFactory = new ModbusTcp.CommandFactory()
    const command = commandFactory.fromPacket(Buffer.from(validCommandBytes))
    expect(() => {
      let response = command.responsePacket
    }).toThrowError(new ModbusCommandError('Tried to read response packet, but success or fail has not been called.'))
  })

})

describe('ReadHoldingRegistersCommand test', () => {

  // 0-1   = Transaction ID
  // 2-3   = Protocol ID (0x0000)
  // 4-5   = Message Length
  // 6     = UnitId
  // 7     = Function Code
  // 8-9   = Holding Register Start Address (0x0110 = 272)
  // 10-11 = Number of registers to read (0x003 = 3)
  const validCommandBytes = [0x00, 0x01, 0x00, 0x00, 0x00, 0x06, 0x05, 0x03, 0x01, 0x10, 0x00, 0x03]

  const registerValues = new Uint16Array([0xAE41, 0x5652, 0x4340])

  const validResponseBytes = [0x00, 0x01, 0x00, 0x00, 0x00, 0x09, 0x05, 0x03, 0x06, 0xAE, 0x41, 0x56, 0x52, 0x43, 0x40]
  const failureBytes = [0x00, 0x01, 0x00, 0x00, 0x00, 0x03, 0x05, 0x83, 0x04]

  it('should return an instance of ReadHoldingRegistersCommand', () => {
    const commandFactory: ModbusTcp.CommandFactory = new ModbusTcp.CommandFactory()
    const command = commandFactory.fromPacket(Buffer.from(validCommandBytes))
    expect(command).toBeInstanceOf(ReadHoldingRegistersCommand)
  })

  it('should return the right function code', () => {
    const commandFactory: ModbusTcp.CommandFactory = new ModbusTcp.CommandFactory()
    const command = commandFactory.fromPacket(Buffer.from(validCommandBytes))
    expect(command.functionCode).toEqual(ModbusFunctionCode.READ_HOLDING_REGISTERS)
  })

  it('should return the right register address (Blank)', () => {
    const commandFactory: ModbusTcp.CommandFactory = new ModbusTcp.CommandFactory()
    const command = (commandFactory.fromPacket(Buffer.from(validCommandBytes)) as ReadHoldingRegistersCommand)
    expect(command.registerStartAddress).toEqual(272)
  })

  it('should return the right register address (Simple)', () => {
    const commandFactory: ModbusTcp.CommandFactory = new ModbusTcp.CommandFactory({ simpleAddressing: true })
    const command = (commandFactory.fromPacket(Buffer.from(validCommandBytes)) as ReadHoldingRegistersCommand)
    expect(command.registerStartAddress).toEqual(272)
  })

  it('should return the right register address (Modbus)', () => {
    const commandFactory: ModbusTcp.CommandFactory = new ModbusTcp.CommandFactory({ simpleAddressing: false })
    const command = (commandFactory.fromPacket(Buffer.from(validCommandBytes)) as ReadHoldingRegistersCommand)
    expect(command.registerStartAddress).toEqual(40273)
  })

  it('should return the right register length', () => {
    const commandFactory: ModbusTcp.CommandFactory = new ModbusTcp.CommandFactory()
    const command = (commandFactory.fromPacket(Buffer.from(validCommandBytes)) as ReadHoldingRegistersCommand)
    expect(command.registerLength).toEqual(3)
  })

  it('should return the right Unit ID', () => {
    const commandFactory: ModbusTcp.CommandFactory = new ModbusTcp.CommandFactory()
    const command = (commandFactory.fromPacket(Buffer.from(validCommandBytes)) as ReadHoldingRegistersCommand)
    expect(command.unitId).toEqual(5)
  })

  it('should emit a complete response on success', done => {
    const commandFactory: ModbusTcp.CommandFactory = new ModbusTcp.CommandFactory()
    const command = (commandFactory.fromPacket(Buffer.from(validCommandBytes)) as ReadHoldingRegistersCommand)
    command.onComplete.on((command: ModbusCommand<any>) => {
      expect(command.responsePacket).toEqual(Buffer.from(validResponseBytes))
      done()
    })
    command.success(registerValues)
  })

  it('should emit a success response on success', done => {
    const commandFactory: ModbusTcp.CommandFactory = new ModbusTcp.CommandFactory()
    const command = (commandFactory.fromPacket(Buffer.from(validCommandBytes)) as ReadHoldingRegistersCommand)
    command.onSuccess.on((command: ModbusCommand<any>) => {
      expect(command.responsePacket).toEqual(Buffer.from(validResponseBytes))
      done()
    })
    command.success(registerValues)
  })

  it('should emit a complete response on failure', done => {
    const commandFactory: ModbusTcp.CommandFactory = new ModbusTcp.CommandFactory()
    const command = commandFactory.fromPacket(Buffer.from(validCommandBytes))
    command.onComplete.on((command: ModbusCommand<any>) => {
      expect(command.responsePacket).toEqual(Buffer.from(failureBytes))
      done()
    })
    command.fail(ModbusCommandExcepton.SERVER_DEVICE_FAILURE)
  })

  it('should emit a failure response on failure', done => {
    const commandFactory: ModbusTcp.CommandFactory = new ModbusTcp.CommandFactory()
    const command = commandFactory.fromPacket(Buffer.from(validCommandBytes))
    command.onFailure.on((command: ModbusCommand<any>) => {
      expect(command.responsePacket).toEqual(Buffer.from(failureBytes))
      done()
    })
    command.fail(ModbusCommandExcepton.SERVER_DEVICE_FAILURE)
  })

  it('should throw an error when accessing response packet before success or fail has been called', () => {
    const commandFactory: ModbusTcp.CommandFactory = new ModbusTcp.CommandFactory()
    const command = commandFactory.fromPacket(Buffer.from(validCommandBytes))
    expect(() => {
      let response = command.responsePacket
    }).toThrowError(new ModbusCommandError('Tried to read response packet, but success or fail has not been called.'))
  })

})

describe('ReadInputRegistersCommand test', () => {

  // 0-1   = Transaction ID
  // 2-3   = Protocol ID (0x0000)
  // 4-5   = Message Length
  // 6     = UnitId
  // 7     = Function Code
  // 8-9   = Input Register Start Address (0x0110 = 272)
  // 10-11 = Number of registers to read (0x003 = 3)
  const validCommandBytes = [0x00, 0x01, 0x00, 0x00, 0x00, 0x06, 0x05, 0x04, 0x01, 0x10, 0x00, 0x03]

  const registerValues = new Uint16Array([0xAE41, 0x5652, 0x4340])

  const validResponseBytes = [0x00, 0x01, 0x00, 0x00, 0x00, 0x09, 0x05, 0x04, 0x06, 0xAE, 0x41, 0x56, 0x52, 0x43, 0x40]
  const failureBytes = [0x00, 0x01, 0x00, 0x00, 0x00, 0x03, 0x05, 0x84, 0x04]

  it('should return an instance of ReadInputRegistersCommand', () => {
    const commandFactory: ModbusTcp.CommandFactory = new ModbusTcp.CommandFactory()
    const command = commandFactory.fromPacket(Buffer.from(validCommandBytes))
    expect(command).toBeInstanceOf(ReadInputRegistersCommand)
  })

  it('should return the right function code', () => {
    const commandFactory: ModbusTcp.CommandFactory = new ModbusTcp.CommandFactory()
    const command = commandFactory.fromPacket(Buffer.from(validCommandBytes))
    expect(command.functionCode).toEqual(ModbusFunctionCode.READ_INPUT_REGISTERS)
  })

  it('should return the right register address (Blank)', () => {
    const commandFactory: ModbusTcp.CommandFactory = new ModbusTcp.CommandFactory()
    const command = (commandFactory.fromPacket(Buffer.from(validCommandBytes)) as ReadInputRegistersCommand)
    expect(command.registerStartAddress).toEqual(272)
  })

  it('should return the right register address (Simple)', () => {
    const commandFactory: ModbusTcp.CommandFactory = new ModbusTcp.CommandFactory({ simpleAddressing: true })
    const command = (commandFactory.fromPacket(Buffer.from(validCommandBytes)) as ReadInputRegistersCommand)
    expect(command.registerStartAddress).toEqual(272)
  })

  it('should return the right register address (Modbus)', () => {
    const commandFactory: ModbusTcp.CommandFactory = new ModbusTcp.CommandFactory({ simpleAddressing: false })
    const command = (commandFactory.fromPacket(Buffer.from(validCommandBytes)) as ReadInputRegistersCommand)
    expect(command.registerStartAddress).toEqual(30273)
  })

  it('should return the right register length', () => {
    const commandFactory: ModbusTcp.CommandFactory = new ModbusTcp.CommandFactory()
    const command = (commandFactory.fromPacket(Buffer.from(validCommandBytes)) as ReadInputRegistersCommand)
    expect(command.registerLength).toEqual(3)
  })

  it('should return the right Unit ID', () => {
    const commandFactory: ModbusTcp.CommandFactory = new ModbusTcp.CommandFactory()
    const command = (commandFactory.fromPacket(Buffer.from(validCommandBytes)) as ReadInputRegistersCommand)
    expect(command.unitId).toEqual(5)
  })

  it('should emit a complete response on success', done => {
    const commandFactory: ModbusTcp.CommandFactory = new ModbusTcp.CommandFactory()
    const command = (commandFactory.fromPacket(Buffer.from(validCommandBytes)) as ReadInputRegistersCommand)
    command.onComplete.on((command: ModbusCommand<any>) => {
      expect(command.responsePacket).toEqual(Buffer.from(validResponseBytes))
      done()
    })
    command.success(registerValues)
  })

  it('should emit a success response on success', done => {
    const commandFactory: ModbusTcp.CommandFactory = new ModbusTcp.CommandFactory()
    const command = (commandFactory.fromPacket(Buffer.from(validCommandBytes)) as ReadInputRegistersCommand)
    command.onSuccess.on((command: ModbusCommand<any>) => {
      expect(command.responsePacket).toEqual(Buffer.from(validResponseBytes))
      done()
    })
    command.success(registerValues)
  })

  it('should emit a complete response on failure', done => {
    const commandFactory: ModbusTcp.CommandFactory = new ModbusTcp.CommandFactory()
    const command = commandFactory.fromPacket(Buffer.from(validCommandBytes))
    command.onComplete.on((command: ModbusCommand<any>) => {
      expect(command.responsePacket).toEqual(Buffer.from(failureBytes))
      done()
    })
    command.fail(ModbusCommandExcepton.SERVER_DEVICE_FAILURE)
  })

  it('should emit a failure response on failure', done => {
    const commandFactory: ModbusTcp.CommandFactory = new ModbusTcp.CommandFactory()
    const command = commandFactory.fromPacket(Buffer.from(validCommandBytes))
    command.onFailure.on((command: ModbusCommand<any>) => {
      expect(command.responsePacket).toEqual(Buffer.from(failureBytes))
      done()
    })
    command.fail(ModbusCommandExcepton.SERVER_DEVICE_FAILURE)
  })

  it('should throw an error when accessing response packet before success or fail has been called', () => {
    const commandFactory: ModbusTcp.CommandFactory = new ModbusTcp.CommandFactory()
    const command = commandFactory.fromPacket(Buffer.from(validCommandBytes))
    expect(() => {
      let response = command.responsePacket
    }).toThrowError(new ModbusCommandError('Tried to read response packet, but success or fail has not been called.'))
  })

})

describe('PresetSingleRegisterCommand test', () => {

  // 0-1   = Transaction ID
  // 2-3   = Protocol ID (0x0000)
  // 4-5   = Message Length
  // 6     = UnitId
  // 7     = Function Code
  // 8-9   = Register Address (0x0110 = 272)
  // 10-11 = Register Value (0x0110 = 272)
  const validCommandBytes = [0x00, 0x01, 0x00, 0x00, 0x00, 0x06, 0x11, 0x06, 0x01, 0x10, 0x01, 0x10]

  const validResponseBytes = [0x00, 0x01, 0x00, 0x00, 0x00, 0x06, 0x11, 0x06, 0x01, 0x10, 0x01, 0x10]

  it('should return an instance of PresetSingleRegisterCommand', () => {
    const commandFactory: ModbusTcp.CommandFactory = new ModbusTcp.CommandFactory()
    const command = commandFactory.fromPacket(Buffer.from(validCommandBytes))
    expect(command).toBeInstanceOf(PresetSingleRegisterCommand)
  })

  it('should return the right function code', () => {
    const commandFactory: ModbusTcp.CommandFactory = new ModbusTcp.CommandFactory()
    const command = commandFactory.fromPacket(Buffer.from(validCommandBytes))
    expect(command.functionCode).toEqual(ModbusFunctionCode.PRESET_SINGLE_REGISTER)
  })

  it('should return the right register address (Blank)', () => {
    const commandFactory: ModbusTcp.CommandFactory = new ModbusTcp.CommandFactory()
    const command = (commandFactory.fromPacket(Buffer.from(validCommandBytes)) as PresetSingleRegisterCommand)
    expect(command.registerAddress).toEqual(272)
  })

  it('should return the right register address (Simple)', () => {
    const commandFactory: ModbusTcp.CommandFactory = new ModbusTcp.CommandFactory({ simpleAddressing: true })
    const command = (commandFactory.fromPacket(Buffer.from(validCommandBytes)) as PresetSingleRegisterCommand)
    expect(command.registerAddress).toEqual(272)
  })

  it('should return the right register address (Modbus)', () => {
    const commandFactory: ModbusTcp.CommandFactory = new ModbusTcp.CommandFactory({ simpleAddressing: false })
    const command = (commandFactory.fromPacket(Buffer.from(validCommandBytes)) as PresetSingleRegisterCommand)
    expect(command.registerAddress).toEqual(40273)
  })

  it('should return the right register value', () => {
    const commandFactory: ModbusTcp.CommandFactory = new ModbusTcp.CommandFactory()
    const command = (commandFactory.fromPacket(Buffer.from(validCommandBytes)) as PresetSingleRegisterCommand)
    expect(command.registerValue).toEqual(272)
  })

  it('should return the right Unit ID', () => {
    const commandFactory: ModbusTcp.CommandFactory = new ModbusTcp.CommandFactory()
    const command = (commandFactory.fromPacket(Buffer.from(validCommandBytes)) as PresetSingleRegisterCommand)
    expect(command.unitId).toEqual(0x11)
  })

  it('should emit a complete response on success', done => {
    const commandFactory: ModbusTcp.CommandFactory = new ModbusTcp.CommandFactory()
    const command = (commandFactory.fromPacket(Buffer.from(validCommandBytes)) as PresetSingleRegisterCommand)
    command.onComplete.on((command: ModbusCommand<any>) => {
      expect(command.responsePacket).toEqual(Buffer.from(validResponseBytes))
      done()
    })
    command.success()
  })

  it('should emit a success response on success', done => {
    const commandFactory: ModbusTcp.CommandFactory = new ModbusTcp.CommandFactory()
    const command = (commandFactory.fromPacket(Buffer.from(validCommandBytes)) as PresetSingleRegisterCommand)
    command.onSuccess.on((command: ModbusCommand<any>) => {
      expect(command.responsePacket).toEqual(Buffer.from(validResponseBytes))
      done()
    })
    command.success()
  })

  it('should emit a complete response on failure', done => {
    const commandFactory: ModbusTcp.CommandFactory = new ModbusTcp.CommandFactory()
    const failureBytes = [0x00, 0x01, 0x00, 0x00, 0x00, 0x03, 0x11, 0x86, 0x04]
    const command = commandFactory.fromPacket(Buffer.from(validCommandBytes))
    command.onComplete.on((command: ModbusCommand<any>) => {
      expect(command.responsePacket).toEqual(Buffer.from(failureBytes))
      done()
    })
    command.fail(ModbusCommandExcepton.SERVER_DEVICE_FAILURE)
  })

  it('should emit a failure response on failure', done => {
    const commandFactory: ModbusTcp.CommandFactory = new ModbusTcp.CommandFactory()
    const failureBytes = [0x00, 0x01, 0x00, 0x00, 0x00, 0x03, 0x11, 0x86, 0x04]
    const command = commandFactory.fromPacket(Buffer.from(validCommandBytes))
    command.onFailure.on((command: ModbusCommand<any>) => {
      expect(command.responsePacket).toEqual(Buffer.from(failureBytes))
      done()
    })
    command.fail(ModbusCommandExcepton.SERVER_DEVICE_FAILURE)
  })

  it('should throw an error when accessing response packet before success or fail has been called', () => {
    const commandFactory: ModbusTcp.CommandFactory = new ModbusTcp.CommandFactory()
    const command = commandFactory.fromPacket(Buffer.from(validCommandBytes))
    expect(() => {
      let response = command.responsePacket
      // }).toThrowError(ModbusCommandError)
    }).toThrowError(new ModbusCommandError('Tried to read response packet, but success or fail has not been called.'))
  })

})

describe('Malformed packet tests', () => {

  it('should throw a command exception on invalid fc', () => {
    const commandFactory: ModbusTcp.CommandFactory = new ModbusTcp.CommandFactory()
    const invalidCommandBytes = [0x00, 0x01, 0x00, 0x00, 0x00, 0x06, 0x11, 0x14, 0x00, 0x00, 0x00, 0x03]
    expect(() => {
      const command = commandFactory.fromPacket(Buffer.from(invalidCommandBytes))
    }).toThrowError(new ModbusCommandError('Function code not implemented'))
  })

  it('should throw a command exception on short packet', () => {
    const commandFactory: ModbusTcp.CommandFactory = new ModbusTcp.CommandFactory()
    const invalidCommandBytes = [0x00, 0x01, 0x00, 0x00, 0x00, 0x06, 0x11, 0x14, 0x00, 0x00]
    expect(() => {
      const command = commandFactory.fromPacket(Buffer.from(invalidCommandBytes))
    }).toThrowError(new ModbusCommandError('Packet length too short'))
  })

  // It should error when a packet has the wrong length byte

})
