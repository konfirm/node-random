/* global source, describe, it, each, expect */

const Random = source('Random');

function range(value) {
	const [from, to] = value.split('-').map(Number);

	return [from].concat(
		to ? [...Array(to - from)].map((_, i) => from + i + 1) : []
	);
}

function repeat(times, call) {
	while (times-- >= 0) {
		call();
	}
}

describe('Random', () => {
	describe('implements parameters', () => {
		each`
            value     | mask    | bytes
            ----------|---------|------
            0         | 0       | 0
            1         | 1       | 1
            2-3       | 3       | 1
            4-7       | 7       | 1
            8-15      | 15      | 1
            16-31     | 31      | 1
            32-63     | 63      | 1
            64-127    | 127     | 1
            128-255   | 255     | 1
            256-511   | 511     | 2
            512-1023  | 1023    | 2
            1024-2047 | 2047    | 2
            2048-4095 | 4095    | 2
            4096-8191 | 8191    | 2
            8192      | 16383   | 2
            16383     | 16383   | 2
            16384     | 32767   | 2
            32767     | 32767   | 2
            32768     | 65535   | 2
            65535     | 65535   | 2
            65536     | 131071  | 3
            131071    | 131071  | 3
            131072    | 262143  | 3
            262143    | 262143  | 3
            262144    | 524287  | 3
            524287    | 524287  | 3
            524288    | 1048575 | 3
        `(
			'values $value return mask $mask and bytes $bytes',
			({ value, mask, bytes }, next) => {
				const param = { mask: Number(mask), bytes: Number(bytes) };

				range(value).forEach((value) => {
					expect(Random.parameters(value)).to.equal(param);
				});

				next();
			}
		);
	});

	describe('implements random', () => {
		const signed = (bytes) => {
			const pow = Math.pow(2, bytes * 8 - 1);

			return [-pow, pow - 1];
		};
		const unsigned = (bytes) => {
			const [min, max] = signed(bytes);

			return [min - min, max - min];
		};

		each`
            bytes | iterations
            ------|------------
            0     | 10
            1     | 1000
            2     | 1000
            3     | 1000
            4     | 1000
            5     | 1000
            6     | 1000
            7     | 1000
            8     | 1000
            9     | 1000
            10    | 1000
            16    | 1000
            32    | 1000
            64    | 1000
            128   | 1000
            256   | 1000
            512   | 1000
        `('$bytes bytes', ({ bytes, iterations }, next) => {
			const size = Number(bytes);
			const [min, max] = (size >= 4 ? signed : unsigned)(size);

			repeat(Number(iterations), () => {
				const rand = Random.random(size);

				expect(rand).to.be.least(min);
				expect(rand).to.be.most(max);
			});

			next();
		});
	});

	describe('implements safeRandom', () => {
		each`
            limit | iterations
            ------|------------
            0     | 10
            1     | 1000
            2     | 1000
            3     | 1000
            4     | 1000
            5     | 1000
            6     | 1000
            7     | 1000
            8     | 1000
            9     | 1000
            10    | 1000
            16    | 1000
            32    | 1000
            64    | 1000
            128   | 1000
            256   | 1000
            512   | 1000
        `('limit $limit is never exceeded', ({ limit, iterations }, next) => {
			const max = Number(limit);

			repeat(Number(iterations), () => {
				const rand = Random.safeRandom(max);

				expect(rand).to.be.least(0);
				expect(rand).to.be.most(max);
			});

			next();
		});
	});

	describe('implements generate', () => {
		each`
            limit
            ------
            0
            1
            2
            10
            50
            100
            500
            1000
            5000
            10000
            50000
        `('limit $limit is between 0 and $limit', ({ limit }, next) => {
			const max = Number(limit);

			const one = [...Random.generate(max, 1)];
			const two = [...Random.generate(max, 2)];
			const ten = [...Random.generate(max, 10)];
			const all = [...Random.generate(max, max)];

			expect(one).to.be.length(1);
			expect(Math.min(...one)).to.be.least(0);
			expect(Math.max(...one)).to.be.most(max);

			expect(two).to.be.length(2);
			expect(Math.min(...two)).to.be.least(0);
			expect(Math.max(...two)).to.be.most(max);

			expect(ten).to.be.length(10);
			expect(Math.min(...ten)).to.be.least(0);
			expect(Math.max(...ten)).to.be.most(max);

			expect(all).to.be.length(max);
			expect(Math.min(...all)).to.be.least(0);
			expect(Math.max(...all)).to.be.most(max);

			next();
		});
	});
});
