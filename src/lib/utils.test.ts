import { conjoin } from "./utils.js";

describe("conjoin", () => {
	it.each`
		input                              | conjunction  | expected
		${[]}                              | ${undefined} | ${""}
		${["apple"]}                       | ${undefined} | ${"apple"}
		${[42]}                            | ${undefined} | ${"42"}
		${["apple", "banana"]}             | ${undefined} | ${"apple and banana"}
		${[1, 2]}                          | ${undefined} | ${"1 and 2"}
		${["apple", "banana"]}             | ${"or"}      | ${"apple or banana"}
		${[1, 2]}                          | ${"or"}      | ${"1 or 2"}
		${["apple", "banana", "cherry"]}   | ${undefined} | ${"apple, banana and cherry"}
		${[1, 2, 3, 4]}                    | ${undefined} | ${"1, 2, 3 and 4"}
		${["apple", "banana", "cherry"]}   | ${"or"}      | ${"apple, banana or cherry"}
		${[1, 2, 3, 4, 5]}                 | ${"or"}      | ${"1, 2, 3, 4 or 5"}
		${["item1", 2, "item3"]}           | ${undefined} | ${"item1, 2 and item3"}
		${[100, "apples", 200, "oranges"]} | ${"or"}      | ${"100, apples, 200 or oranges"}
	`(
		'should return "$expected" for input $input with conjunction "$conjunction"',
		({ input, conjunction, expected }) => {
			const result = conjunction ? conjoin(input, conjunction) : conjoin(input);

			expect(result).toBe(expected);
		},
	);
});
