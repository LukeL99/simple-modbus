import { ModbusTcp, ModbusCommandException } from '..'

const server = new ModbusTcp.Server()
server.listen(502)

server.onPresetSingleRegister.on(command => {
  console.log(`${command.registerAddress} - ${command.registerValue}`)
  // Respond with Success
  command.success()
  // Or respond with failure
  command.fail(ModbusCommandException.ILLEGAL_DATA_ADDRESS)
})
