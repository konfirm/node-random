import * as test from 'tape';
import each from 'template-literal-each';
import * as Random from '../../source/Random';

function range(value: string) {
	const [from, to] = value.split('-').map(Number);

	return [from].concat(
		to ? [...Array(to - from)].map((_, i) => from + i + 1) : []
	);
}

function repeat<T = unknown>(length: number, call: Function) {
	return ([] as Array<T>).concat(Array.from({ length }, () => call()));
}

test('Random - parameters', (t) => {
	each`
		value          | mask    | bytes
		---------------|---------|------
		0              | 0       | 0
		1              | 1       | 1
		2-3            | 3       | 1
		4-7            | 7       | 1
		8-15           | 15      | 1
		16-31          | 31      | 1
		32-63          | 63      | 1
		64-127         | 127     | 1
		128-255        | 255     | 1
		256-511        | 511     | 2
		512-1023       | 1023    | 2
		1024-2047      | 2047    | 2
		2048-4095      | 4095    | 2
		4096-8191      | 8191    | 2
		8192-16383     | 16383   | 2
		16384-32767    | 32767   | 2
		32768-65535    | 65535   | 2
		65536-131071   | 131071  | 3
		131072-262143  | 262143  | 3
		262144-524287  | 524287  | 3
		524288-1048575 | 1048575 | 3
	`((record) => {
		const { value, mask, bytes } = record as { [key: string]: string };
		const param = { mask: Number(mask), bytes: Number(bytes) };
		const parameters = range(value).map((value) => Random.parameters(value));

		t.true(
			parameters.every(({ mask, bytes }) => mask === param.mask && bytes === param.bytes),
			`all ${parameters.length} values ${value} provides mask ${mask}, bytes ${bytes}`
		);
	});

	t.end();
});


test('Random - random', (t) => {
	const signed = (bytes: number) => {
		const pow = Math.pow(2, bytes * 8 - 1);

		return [-pow, pow - 1];
	};
	const unsigned = (bytes: number) => {
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
	`((record) => {
		const { bytes, iterations } = record as { [key: string]: string }
		const size = Number(bytes);
		const [min, max] = (size >= 4 ? signed : unsigned)(size);
		const generated = repeat<number>(Number(iterations), () => Random.random(size));

		t.true(generated.every((rand) => rand >= min && rand <= max), `random from ${bytes} bytes is between ${min} and ${max}`);
	});

	t.end();
});

test('Random - safeRandom', (t) => {
	const signed = (bytes: number) => {
		const pow = Math.pow(2, bytes * 8 - 1);

		return [-pow, pow - 1];
	};
	const unsigned = (bytes: number) => {
		const [min, max] = signed(bytes);

		return [min - min, max - min];
	};

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
	`((record) => {
		const { limit, iterations } = record as { [key: string]: string }
		const max = Number(limit);
		const generated = repeat<number>(Number(iterations), () => Random.safeRandom(Number(limit)));

		t.true(generated.every((rand) => rand >= 0 && rand <= max), `random from ${limit} limit is between 0 and ${max}`);
	});

	t.end();
});

test('Random - generate', (t) => {
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
	`((record) => {
		const { limit } = record as { limit: string };
		const max = Number(limit);

		const one = [...Random.generate(max, 1)];
		const two = [...Random.generate(max, 2)];
		const ten = [...Random.generate(max, 10)];
		const all = [...Random.generate(max, max)];

		t.equal(one.length, 1, `[${one}] has length 2`);
		t.true(Math.min(...one) >= 0, `lowest of [${one}] is at least 0`);
		t.true(Math.max(...one) <= max, `highest of [${one}] is at most ${max}`);

		t.equal(two.length, 2, `[${two}] has length 2`);
		t.true(Math.min(...two) >= 0, `lowest of [${two}] is at least 0`);
		t.true(Math.max(...two) <= max, `highest of [${two}] is at most ${max}`);

		t.equal(ten.length, 10, `[${ten}] has length 10`);
		t.true(Math.min(...ten) >= 0, `lowest of [${ten}] is at least 0`);
		t.true(Math.max(...ten) <= max, `highest of [${ten}] is at most ${max}`);

		t.equal(all.length, max, `[0..${max}] has length ${max}`);
		t.true(Math.min(...all) >= 0, `lowest of [0..${max}] is at least 0`);
		t.true(Math.max(...all) <= max, `highest of [0..${max}] is at most ${max}`);
	});

	t.end();
});
