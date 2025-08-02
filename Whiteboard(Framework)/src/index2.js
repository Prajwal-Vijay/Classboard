class Calculator {
	constructor(
		previousOperandTextElement,
		currentOperandTextElement,
		hasComputedWithEquals
	) {
		this.previousOperandTextElement = previousOperandTextElement;
		this.currentOperandTextElement = currentOperandTextElement;
		this.hasComputedWithEquals = hasComputedWithEquals;
		this.clear();
	}
	clear() {
		this.previousOperand = "";
		this.currentOperand = "";
		this.operation = undefined;
		this.hasComputedWithEquals = false;
	}
	delete() {
		this.currentOperand = this.currentOperand.toString().slice(0, -1);
	}
	appendNumber(number) {
		if (number === "." && this.currentOperand.includes(".")) return;
		this.currentOperand = this.currentOperand.toString() + number.toString();
	}
	chooseOperation(operation) {
		if (this.currentOperand === "") return;
		if (this.previousOperand !== "") {
			this.compute();
		}
		this.operation = operation;
		this.previousOperand = this.currentOperand.toString();
		this.currentOperand = "";
	}
	compute() {
		let computation;
		const prev = parseFloat(this.previousOperand);
		const curr = parseFloat(this.currentOperand);
		if (isNaN(prev) || isNaN(curr)) return;
		switch (this.operation.toString()) {
			case "+":
				computation = prev + curr;
				break;
			case "-":
				computation = prev - curr;
				break;
			case "*":
				computation = prev * curr;
				break;
			case "÷":
				computation = prev / curr;
				break;
			default:
				return;
		}
		this.currentOperand = computation;
		this.previousOperand = "";
		this.operation = undefined;
	}
	getDisplayNumber(number) {
		const stringNumber = number.toString();
		const integerDigits = parseFloat(stringNumber.split(".")[0]);
		const decimalDigits = stringNumber.split(".")[1];
		let integerDisplay;
		if (isNaN(integerDigits)) integerDisplay = "";
		else {
			integerDisplay = integerDigits.toLocaleString("en", {
				maximumFractionDigits: 0,
			});
		}
		if (decimalDigits != null) {
			return `${integerDisplay}.${decimalDigits}`;
		} else {
			return integerDisplay;
		}
	}
	updateDisplay() {
		this.currentOperandTextElement.innerText = this.getDisplayNumber(
			this.currentOperand
		);
		if (this.operation != null) {
			this.previousOperandTextElement.innerText = `${this.getDisplayNumber(
				this.previousOperand
			)}  ${this.operation}`;
		} else {
			this.previousOperandTextElement.innerText = "";
		}
	}
}
const numberButtons = document.querySelectorAll("[data-number]");
const operationButtons = document.querySelectorAll("[data-operation]");
const equalsButton = document.querySelector("[data-equals]");
const deleteButton = document.querySelector("[data-delete]");
const clearButton = document.querySelector("[data-clear]");
const previousOperandTextElement = document.querySelector("[data-previous]");
const currentOperandTextElement = document.querySelector("[data-current]");
const calculator = new Calculator(
	previousOperandTextElement,
	currentOperandTextElement
);

numberButtons.forEach(function (numberButton) {
	numberButton.addEventListener("click", () => {
		if (calculator.hasComputedWithEquals) {
			calculator.clear();
		}
		calculator.appendNumber(numberButton.innerText);
		calculator.updateDisplay();
	});
});
operationButtons.forEach(function (operationButton) {
	operationButton.addEventListener("click", () => {
		calculator.hasComputedWithEquals = false;
		calculator.chooseOperation(operationButton.innerText);
		calculator.updateDisplay();
	});
});
clearButton.addEventListener("click", () => {
	calculator.clear();
	calculator.updateDisplay();
});
equalsButton.addEventListener("click", () => {
	calculator.compute();
	calculator.updateDisplay();
	calculator.hasComputedWithEquals = true;
});
deleteButton.addEventListener("click", () => {
	calculator.delete();
	calculator.updateDisplay();
});
