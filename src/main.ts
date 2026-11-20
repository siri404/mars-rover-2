type Rover = {
  x: number
  y: number
  dirIndex: number
  lost: boolean
}

type Context = {
  bounds: {
    boundX: number
    boundY: number
  }
  scents: Set<string>
}

type Direction = (typeof DIRS)[number]

type Command = keyof typeof commands

type ParsedInput = {
  bounds: { boundX: number; boundY: number }
  rovers: { x: number; y: number; facing: Direction; instructions: Command[] }[]
}

const DIRS = ['N', 'E', 'S', 'W'] as const

const movements: Record<Direction, readonly [number, number]> = {
  N: [0, 1],
  E: [1, 0],
  S: [0, -1],
  W: [-1, 0]
}

const MAX_COORD = 50

const isDirection = (s: string | undefined): s is Direction =>
  s !== undefined && (DIRS as readonly string[]).includes(s)

const isCommand = (c: string): c is Command => c in commands

const toInt = (s: string | undefined): number => {
  const n = Number(s)
  if (s === undefined || s === '' || !Number.isInteger(n)) throw Error()
  return n
}

const inBounds = (x: number, y: number, maxX = MAX_COORD, maxY = MAX_COORD): boolean =>
  x >= 0 && y >= 0 && x <= maxX && y <= maxY

const commands = {
  L: (rover: Rover) => {
    rover.dirIndex = (rover.dirIndex + 3) % 4
  },
  R: (rover: Rover) => {
    rover.dirIndex = (rover.dirIndex + 1) % 4
  },
  F: (rover: Rover, context: Context) => {
    const { bounds: { boundX, boundY }, scents } = context
    const [dx, dy] = movements[DIRS[rover.dirIndex]]
    const nextX = rover.x + dx
    const nextY = rover.y + dy
  
    if (!inBounds(nextX, nextY, boundX, boundY)) {
      const key = `${rover.x}-${rover.y}`
      if (!scents.has(key)) {
        scents.add(key)
        rover.lost = true
      }
      return
    }
  
    rover.x = nextX
    rover.y = nextY
  }
}

export const parseInput = (input: string): ParsedInput => {
  try {
    const lines = input.split('\n').filter(Boolean)
    const [gridLine, ...roverLines] = lines
    if (gridLine === undefined || roverLines.length === 0 || roverLines.length % 2 !== 0) throw Error()

    const [rawX, rawY] = gridLine.split(' ')
    const bounds = { boundX: toInt(rawX), boundY: toInt(rawY) }
    if (!inBounds(bounds.boundX, bounds.boundY)) throw Error()

    const rovers: ParsedInput['rovers'] = []
    
    for (let i = 0; i < roverLines.length; i += 2) {
      const positionLine = roverLines[i]
      const instructionLine = roverLines[i + 1]
      if (positionLine === undefined || instructionLine === undefined) throw Error()

      const [x, y, facing] = positionLine.split(' ')
      if (!isDirection(facing)) throw Error()

      const instructions = [...instructionLine]
      if (!instructions.every(isCommand)) throw Error()

      const rover = { x: toInt(x), y: toInt(y) }
      if (!inBounds(rover.x, rover.y, bounds.boundX, bounds.boundY)) throw Error()

      rovers.push({ ...rover, facing, instructions })
    }

    return { bounds, rovers }
  } catch {
    throw new Error('Malformed input')
  }
}

export const main = (input: string): void => {
  const { bounds, rovers } = parseInput(input)
  const context: Context = {
    bounds,
    scents: new Set()
  }

  for (const { x, y, facing, instructions } of rovers) {
    const rover: Rover = { x, y, dirIndex: DIRS.indexOf(facing), lost: false }

    for (const char of instructions) {
      if (rover.lost) break
      commands[char](rover, context)
    }
    
    console.log(`${rover.x} ${rover.y} ${DIRS[rover.dirIndex]}${rover.lost ? " LOST" : ""}`)
  }
};
