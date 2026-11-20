import { describe, it, expect, vi, beforeEach, afterEach, type MockInstance } from 'vitest'
import { main, parseInput } from '../src/main.js'

describe('Martian Robots Simulation', () => {
  let logSpy: MockInstance<typeof console.log>

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    logSpy.mockRestore()
  })

  const getLoggedOutput = (): string[] => logSpy.mock.calls.map((call) => call[0])

  describe('Core Simulation & Movement', () => {
    it('solves the official sample input accurately', () => {
      const input = [
        '5 3',
        '1 1 E',
        'RFRFRFRF',
        '3 2 N',
        'FRRFLLFFRRFLL',
        '0 3 W',
        'LLFFFLFLFL',
      ].join('\n')

      main(input)

      expect(getLoggedOutput()).toEqual([
        '1 1 E',
        '3 3 N LOST',
        '2 3 S',
      ])
    })

    it('returns to the same orientation after 360-degree left and right turns', () => {
      const input = [
        '5 5',
        '2 2 N',
        'LLLL',
        '2 2 E',
        'RRRR',
      ].join('\n')

      main(input)

      expect(getLoggedOutput()).toEqual([
        '2 2 N',
        '2 2 E',
      ])
    })

    it('traverses the outer perimeter of the grid without getting lost', () => {
      const input = [
        '3 2',
        '0 0 N',
        'FFRFFFRFFRFFF',
      ].join('\n')

      main(input)

      expect(getLoggedOutput()).toEqual(['0 0 W'])
    })

    it('handles a minimal 0x0 grid properly', () => {
      const input = [
        '0 0',
        '0 0 N',
        'LRF',
        '0 0 E',
        'F',
      ].join('\n')

      main(input)

      expect(getLoggedOutput()).toEqual([
        '0 0 N LOST',
        '0 0 E',
      ])
    })
  })

  describe('Scent Mechanics & Edge Cases', () => {
    it('protects subsequent rovers from falling off the same edge coordinate', () => {
      const input = [
        '5 3',
        '3 3 N',
        'F',
        '3 3 N',
        'FRF',
      ].join('\n')

      main(input)

      expect(getLoggedOutput()).toEqual([
        '3 3 N LOST',
        '4 3 E',
      ])
    })

    it('protects rovers at corners regardless of which direction they attempt to exit', () => {
      const input = [
        '5 3',
        '5 3 N',
        'F',
        '5 3 E',
        'FRF',
      ].join('\n')

      main(input)

      expect(getLoggedOutput()).toEqual([
        '5 3 N LOST',
        '5 2 S',
      ])
    })

    it('does not apply a scent from one coordinate to an adjacent coordinate', () => {
      const input = [
        '5 3',
        '2 3 N',
        'F',
        '3 3 N',
        'F',
      ].join('\n')

      main(input)

      expect(getLoggedOutput()).toEqual([
        '2 3 N LOST',
        '3 3 N LOST',
      ])
    })

    it('immediately stops processing remaining instructions once a rover is lost', () => {
      const input = [
        '2 2',
        '2 2 E',
        'FRFFLLFF',
      ].join('\n')

      main(input)

      expect(getLoggedOutput()).toEqual(['2 2 E LOST'])
    })

    it('isolates scent state across separate simulation runs', () => {
      const singleLostRover = [
        '2 2',
        '2 2 N',
        'F',
      ].join('\n')

      main(singleLostRover)
      main(singleLostRover)

      expect(getLoggedOutput()).toEqual([
        '2 2 N LOST',
        '2 2 N LOST',
      ])
    })
  })

  describe('Input Parsing & Validation (parseInput)', () => {
    it('tolerates blank lines between rover blocks and trailing newlines', () => {
      const input = '\n5 3\n\n1 1 E\nRFRFRFRF\n\n3 2 N\nFRRFLLFFRRFLL\n\n'

      const parsed = parseInput(input)

      expect(parsed).toEqual({
        bounds: { boundX: 5, boundY: 3 },
        rovers: [
          { x: 1, y: 1, facing: 'E', instructions: ['R', 'F', 'R', 'F', 'R', 'F', 'R', 'F'] },
          { x: 3, y: 2, facing: 'N', instructions: ['F', 'R', 'R', 'F', 'L', 'L', 'F', 'F', 'R', 'R', 'F', 'L', 'L'] },
        ],
      })
    })

    it.each([
      ['empty input', ''],
      ['only whitespace/newlines', '\n   \n'],
      ['grid bounds only with no rovers', '5 3'],
      ['missing instruction line for a rover', '5 3\n1 1 E'],
      ['non-numeric grid bounds', 'five 3\n1 1 E\nF'],
      ['decimal grid bounds', '5.5 3\n1 1 E\nF'],
      ['negative grid bounds', '-1 3\n1 1 E\nF'],
      ['grid bounds exceeding MAX_COORD (50)', '51 3\n1 1 E\nF'],
      ['rover starting outside grid bounds', '5 3\n6 2 N\nF'],
      ['negative rover starting coordinates', '5 3\n-1 2 N\nF'],
      ['invalid facing direction', '5 3\n1 1 X\nF'],
      ['lowercase facing direction', '5 3\n1 1 n\nF'],
      ['unknown instruction character', '5 3\n1 1 N\nLFRX'],
      ['lowercase instruction character', '5 3\n1 1 N\nlfr'],
      ['spaces inside instruction string', '5 3\n1 1 N\nL F R'],
    ])('throws "Malformed input" for %s', (_description, badInput) => {
      expect(() => parseInput(badInput)).toThrow('Malformed input')
    })
  })
})
