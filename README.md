# Random Number Generator

As the name implies, this package generates random number. The main goal for this package is to generate unbiased random numbers within given boundaries.

The package is based on the awesome [random-number-csprng][3] package, with a couple of key differences:

-   It does not use Promises _(as a result, this package will be slower)_
-   It provides a generator function allowing easier generation of arrays with random numbers
-   The lower boundary is fixed at 0 for the `safeRandom` method, instead of the more feature complete 'minimum' on [random-number-csprng][3]


## Installation

`@konfirm/random` is a scoped package, which means the scope must be provided for both installation and usage.

### Using [npm][4]

```
$ npm install --save @konfirm/random
```

### Using [yarn][6]

```
$ yarn add @konfirm/random
```


## Usage

The intended use is to leverage the generator method, as that will give you access to an array of random numbers immediately

### CommonJS (`require`)

```js
const { generate } = require('@konfirm/random');

//  using ES6 destructuring to generate an array of 8 random values ranging from 0 to 16
const rand = [...generate(16, 8)];
```

The syntax examples in versions before [Unreleased] also still work (fully backward compatible). With the support of module systems (ES Modules, Typescript) we've chosen to not explicitly have a default export.

```js
const Random = require('@konfirm/random');

const rand = [...Random.generate(16, 8)];
```

### ES Module (`import`)

```js
import { generate } from '@konfirm/random';

//  using ES6 destructuring to generate an array of 8 random values ranging from 0 to 16
const rand = [...generate(16, 8)];
```

### Typescript

```ts
import { generate } from '@konfirm/random';

//  using ES6 destructuring to generate an array of 8 random values ranging from 0 to 16
const rand: Array<number> = [...generate(16, 8)];
```


## API


### `*generate(limit [, total = Infinity])`

The `generate` method returns a [Generator][5], which only generates value if these are being consumed. This is a very nice on-demand way of programming complicated and/or expensive calls, such as generating random values.

| argument | type   | default    | purpose                                                                    |
|----------|--------|------------|----------------------------------------------------------------------------|
| `limit`  | number |            | The upper limit of the generated value(s)                                  |
| `total`  | number | `Infinity` | Stop generating values after `total` (`Infinity` means it will never stop) |

There are a few ways in which [Generators][5] can be used.

If the number of random values that are needed is not known, probably the safest way not to run in to infinite loops is to use a `for` loop. This approach would probably benefit from using the `safeRandom` instead of a [Generator][5], as it will lead into easier to understand code.

#### CommonJS

```js
const { generate } = require('@konfirm/random');
//  an endless supply of random values ranging between 0 and 32
const generator = generate(32);

//  generate 100 random values
for (let i = 0; i < 100; ++i) {
	const { value } = generator.next();
	console.log(value);
}
```

#### ES Modules

```js
import { generate } from '@konfirm/random';
//  an endless supply of random values ranging between 0 and 32
const generator = generate(32);

//  generate 100 random values
for (let i = 0; i < 100; ++i) {
	const { value } = generator.next();
	console.log(value);
}
```

#### Typescript

```ts
import { generate } from '@konfirm/random';
//  an endless supply of random values ranging between 0 and 32
const generator = generate(32);

//  generate 100 random values
for (let i = 0; i < 100; ++i) {
	const { value } = generator.next();
	console.log(value);
}
```

#### Tip

If you know up front how many random values you will be using, you can specify the `total` argument too.
Of course the `generate` method will create as many generators as you want, so knowing up front how many values are needed is limited to the exact context where the generators are used (hopefully making it easier to determine the `total` requirement).

This opens up for a couple of different ways to benefit from the generator.

```js
const { generate } = require('@konfirm/random');

//  for..of
//  loop over 100 random values ranging between 0 and 16
for (const rand of generate(16, 100)) {
	console.log(rand);
}

//  Array.from
//  create an array of 100 random values ranging from 0 to 16
const rand = Array.from(generate(16, 100));

//  Array destructuring
//  create an array of 100 random values ranging from 0 to 16
const rand = [...generate(16, 100)];
```


### `safeRandom(limit)`

The `safeRandom` method creates a single random value ranging from 0 to `limit`.

| argument | type   | purpose                                   |
|----------|--------|-------------------------------------------|
| `limit`  | number | The upper limit of the generated value(s) |

As mentioned with the infinite generator above, this method can be used if individual numbers are needed throughout the lifecycle of an application, without the option to use fixed lengths.

#### CommonJS

```js
const { safeRandom } = require('@konfirm/random');

//  generate 100 random values ranging between 0 and 128
for (let i = 0; i < 100; ++i) {
	const rand = safeRandom(128);
	console.log(rand);
}
```

#### ES Modules

```js
import { safeRandom } from '@konfirm/random';

//  generate 100 random values ranging between 0 and 128
for (let i = 0; i < 100; ++i) {
	const rand = safeRandom(128);
	console.log(rand);
}
```

#### Typescript

```ts
import { safeRandom } from '@konfirm/random';

//  generate 100 random values ranging between 0 and 128
for (let i: number = 0; i < 100; ++i) {
	const rand: number = safeRandom(128);
	console.log(rand);
}
```


### `random(bytes)`

Create a random value using the specified number of random bytes. It will not be capped to a limit, instead the output will be an unsigned integer value for `bytes` values up to 3, and signed after that.

| argument | type   | purpose                                                |
|----------|--------|--------------------------------------------------------|
| `bytes`  | number | Create a random value (uses [`Crypto.randomBytes`][7]) |


#### CommonJS

```js
const { random } = require('@konfirm/random');

//  generate 100 random values
for (let i = 0; i < 100; ++i) {
	const rand = random(128);
	console.log(rand);
}
```

#### ES Modules

```js
import { random } from '@konfirm/random';

//  generate 100 random values
for (let i = 0; i < 100; ++i) {
	const rand = random(128);
	console.log(rand);
}
```

#### Typescript

```ts
import { random } from '@konfirm/random';

//  generate 100 random values
for (let i: number = 0; i < 100; ++i) {
	const rand: number = random(128);
	console.log(rand);
}
```


### `parameters(limit)`

Calculate the umask and bytes needed to safely create an unbiased random value. The number or bytes is used to create a large enough random number (using `random`) and the umask is used to persuade the random value within the unbiased value range.

| argument | type   | purpose                                   |
|----------|--------|-------------------------------------------|
| `limit`  | number | The upper limit of the generated value(s) |

The response is an object (exported typescript type is `MaskBytes`) with the following structure:

```js
{
	mask: number;
	bytes: number;
}
```


## Credits

This module is based on the hard work of [Sven Slootweg][1] for the [random-number-csprng][3] package. If you are considering donating, please [donate to him][2].


## License

MIT License Copyright (c) 2019-2021 Rogier Spieker (Konfirm)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[1]: https://github.com/joepie91
[2]: https://github.com/joepie91/node-random-number-csprng#donate
[3]: https://www.npmjs.com/package/random-number-csprng
[4]: https://www.npmjs.com/get-npm
[5]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator
[6]: https://yarnpkg.com/
[7]: https://nodejs.org/api/crypto.html#crypto_crypto_randombytes_size_callback
