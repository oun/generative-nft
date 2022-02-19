import Random from '../src/random';

describe('Random', () => {
  test.each([
    [1, 0.24],
    [2, 0.5],
    [3, 0.94999],
    [4, 0.99]
  ])('should return rarity %d when random return %d', (expected, r) => {
    const rarities = [
      {
        id: 1,
        name: 'common',
        chance: 50
      },
      {
        id: 2,
        name: 'uncommon',
        chance: 30
      },
      {
        id: 3,
        name: 'rare',
        chance: 15
      },
      {
        id: 4,
        name: 'legendary',
        chance: 5
      }
    ];
    jest.spyOn(Math, 'random').mockReturnValue(r);

    const random = new Random(rarities);

    const rarity = random.rand();

    expect(rarity.id).toEqual(expected);
  });

  it('should throw error when sum of rarities chance is not equal 100', () => {
    const rarities = [
      {
        id: 1,
        name: 'common',
        chance: 50
      },
      {
        id: 2,
        name: 'uncommon',
        chance: 30
      },
      {
        id: 3,
        name: 'rare',
        chance: 10
      },
      {
        id: 4,
        name: 'legendary',
        chance: 5
      }
    ];
    expect(() => new Random(rarities)).toThrow(
      'Sum of rarity chance is not equal to 100'
    );
  });
});
