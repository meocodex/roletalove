export const ROULETTE_NUMBERS = {
  RED: [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36],
  BLACK: [2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35],
  GREEN: [0]
};

export function getNumberColor(number: number): 'red' | 'black' | 'green' {
  if (number === 0) return 'green';
  return ROULETTE_NUMBERS.RED.includes(number) ? 'red' : 'black';
}

export function getNumberProperties(number: number) {
  return {
    number,
    color: getNumberColor(number),
    dozen: number === 0 ? null : Math.ceil(number / 12),
    column: number === 0 ? null : ((number - 1) % 3) + 1,
    half: number === 0 ? null : number <= 18 ? 'low' : 'high',
    parity: number === 0 ? null : number % 2 === 0 ? 'even' : 'odd'
  };
}

export function getColorClass(color: string): string {
  switch (color) {
    case 'red':
      return 'bg-roulette-red hover:bg-red-600';
    case 'black':
      return 'bg-black hover:bg-gray-800';
    case 'green':
      return 'bg-roulette-green hover:bg-green-600';
    default:
      return 'bg-gray-500';
  }
}

export function formatRouletteNumber(number: number): string {
  return number.toString().padStart(2, '0');
}

// European roulette table layout (3 rows x 12 columns)
export const ROULETTE_LAYOUT = [
  // Row 1 (top): 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36
  [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36],
  // Row 2 (middle): 2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35
  [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35],
  // Row 3 (bottom): 1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34
  [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34]
];

// Neighbor numbers for roulette wheel (Voisins du zéro area)
export const NEIGHBORS_MAP: Record<number, number[]> = {
  0: [32, 15, 19, 4, 21, 2, 25],
  32: [15, 19, 4, 21, 2, 25, 17],
  15: [19, 4, 21, 2, 25, 17, 34],
  19: [4, 21, 2, 25, 17, 34, 6],
  4: [21, 2, 25, 17, 34, 6, 27],
  21: [2, 25, 17, 34, 6, 27, 13],
  2: [25, 17, 34, 6, 27, 13, 36],
  25: [17, 34, 6, 27, 13, 36, 11],
  17: [34, 6, 27, 13, 36, 11, 30],
  34: [6, 27, 13, 36, 11, 30, 8],
  6: [27, 13, 36, 11, 30, 8, 23],
  27: [13, 36, 11, 30, 8, 23, 10],
  13: [36, 11, 30, 8, 23, 10, 5],
  36: [11, 30, 8, 23, 10, 5, 24],
  11: [30, 8, 23, 10, 5, 24, 16],
  30: [8, 23, 10, 5, 24, 16, 33],
  8: [23, 10, 5, 24, 16, 33, 1],
  23: [10, 5, 24, 16, 33, 1, 20],
  10: [5, 24, 16, 33, 1, 20, 14],
  5: [24, 16, 33, 1, 20, 14, 31],
  24: [16, 33, 1, 20, 14, 31, 9],
  16: [33, 1, 20, 14, 31, 9, 22],
  33: [1, 20, 14, 31, 9, 22, 18],
  1: [20, 14, 31, 9, 22, 18, 29],
  20: [14, 31, 9, 22, 18, 29, 7],
  14: [31, 9, 22, 18, 29, 7, 28],
  31: [9, 22, 18, 29, 7, 28, 12],
  9: [22, 18, 29, 7, 28, 12, 35],
  22: [18, 29, 7, 28, 12, 35, 3],
  18: [29, 7, 28, 12, 35, 3, 26],
  29: [7, 28, 12, 35, 3, 26, 0],
  7: [28, 12, 35, 3, 26, 0, 32],
  28: [12, 35, 3, 26, 0, 32, 15],
  12: [35, 3, 26, 0, 32, 15, 19],
  35: [3, 26, 0, 32, 15, 19, 4],
  3: [26, 0, 32, 15, 19, 4, 21],
  26: [0, 32, 15, 19, 4, 21, 2]
};

export function getNeighbors(number: number, radius: number = 3): number[] {
  const neighbors = NEIGHBORS_MAP[number] || [];
  return neighbors.slice(0, radius * 2 + 1); // radius on each side + the number itself
}
