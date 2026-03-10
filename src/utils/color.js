// Given a hex primary color, return useful variants
export function colorVars(pc = '#0ea5e9') {
  return {
    pc,
    pcFaint:  pc + '18',
    pcLight:  pc + '30',
    pcMid:    pc + '55',
    pcDark:   pc + 'bb',
    gradient: `linear-gradient(135deg, ${pc}, ${pc}aa)`,
  }
}
