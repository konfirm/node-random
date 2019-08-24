const Crypto = require('crypto');

/**
 * Random Number Generator
 * Based on the awesome `random-number-csprng` module:
 * - https://github.com/joepie91/node-random-number-csprng
 *
 * Key differences:
 * - Not Promise based (this will be a lot slower as a result)
 * - Added generator implementation
 * - Lower boundary of random numbers is fixed at 0 instead of
 *   the more feature complete 'minimum' on random-number-cspring
 *
 * @class Random
 */
class Random {
	/**
	 * calculate the mask and bytes parameters
	 *
	 * @static
	 * @param {number} limit
	 * @returns {object} {mask, bytes}
	 * @memberof Random
	 */
	static parameters(limit) {
		let bits = 0;
		let mask = 0;

		while (limit > 0) {
			mask = (mask << 1) | 1;
			limit >>>= 1;
			++bits;
		}

		return { mask, bytes: Math.ceil(bits / 8) };
	}

	/**
	 * Get a random number
	 *
	 * @static
	 * @param {number} bytes
	 * @returns {number} random
	 * @memberof Random
	 */
	static random(bytes) {
		const buffer = Crypto.randomBytes(bytes);
		let random = 0;

		for (let i = 0; i < bytes; ++i) {
			random |= buffer[i] << (8 * i);
		}

		return random;
	}

	/**
	 * Get a safe random number (needs to fit inside a masked range, otherwise a new one is generated)
	 *
	 * @static
	 * @param {number} limit
	 * @returns {number} random
	 * @memberof Random
	 */
	static safeRandom(limit) {
		const { mask, bytes } = this.parameters(limit);
		const random = this.random(bytes) & mask;

		//  The `& mask` above is what makes this random safe(r)
		//  I suggest reading the full comment block at:
		//  https://github.com/joepie91/node-random-number-csprng/blob/5899a8e06ffa134c307e1153f4f810af2243cff6/src/index.js#L109

		//  If the random number is below our limit, it means it can be considered
		//  to be unbiased and usable, a new one is generated otherwise
		//  However unlikely, this could trigger an endless loop, we may need to consider
		//  to limit the maximum number of iteratons (and then what?)
		return random <= limit ? random : this.safeRandom(limit);
	}

	/**
	 * Generator to create the specified amount of random numbers
	 *
	 * @static
	 * @param {number} limit
	 * @param {number} [total=Infinity]
	 * @memberof Random
	 */
	static *generate(limit, total = Infinity) {
		while (--total >= 0) {
			yield this.safeRandom(limit);
		}
	}
}

module.exports = Random;
