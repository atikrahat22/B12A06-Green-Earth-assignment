# JavaScript ES6 Concepts – Q&A

## 1. What is the difference between `var`, `let`, and `const`?

- **`var`**
  - Function-scoped (or globally scoped if declared outside functions).
  - Can be redeclared and updated.
  - Hoisted with `undefined` (you can use it before declaration, but not recommended).
  - Example:
    ```js
    var a = 10;
    var a = 20; // ✅ Allowed
    ```

- **`let`**
  - Block-scoped (only available within `{ }`).
  - Can be updated but **cannot be redeclared** in the same scope.
  - Hoisted but not initialized (Temporal Dead Zone).
  - Example:
    ```js
    let b = 10;
    b = 20; // ✅ Allowed
    let b = 30; // ❌ Error
    ```

- **`const`**
  - Block-scoped.
  - **Cannot be updated or redeclared** (value fixed after initialization).
  - Must be initialized at the time of declaration.
  - Example:
    ```js
    const c = 100;
    c = 200; // ❌ Error
    ```

---

## 2. What is the difference between `map()`, `forEach()`, and `filter()`?

- **`forEach()`**
  - Iterates over array elements.
  - Executes a function for each element.
  - **Does not return a new array**, only performs actions.
  - Example:
    ```js
    [1, 2, 3].forEach(num => console.log(num * 2));
    ```

- **`map()`**
  - Iterates over array elements.
  - Returns a **new array** with transformed values.
  - Example:
    ```js
    const doubled = [1, 2, 3].map(num => num * 2);
    console.log(doubled); // [2, 4, 6]
    ```

- **`filter()`**
  - Iterates over array elements.
  - Returns a **new array** with elements that pass a given condition.
  - Example:
    ```js
    const even = [1, 2, 3, 4].filter(num => num % 2 === 0);
    console.log(even); // [2, 4]
    ```

---

## 3. What are arrow functions in ES6?

- Shorter syntax for writing functions.
- Do **not** have their own `this`, they use `this` from the surrounding scope.
- More concise than traditional functions.
- Examples:
  ```js
  // Normal function
  function add(a, b) {
    return a + b;
  }

  // Arrow function
  const addArrow = (a, b) => a + b;
  ```

---

## 4. How does destructuring assignment work in ES6?

- Allows extracting values from arrays or objects into separate variables easily.
- Example with **array**:
  ```js
  const arr = [10, 20, 30];
  const [x, y] = arr;
  console.log(x, y); // 10 20
  ```
- Example with **object**:
  ```js
  const person = { name: "Rahim", age: 25 };
  const { name, age } = person;
  console.log(name, age); // Rahim 25
  ```

---

## 5. Explain template literals in ES6. How are they different from string concatenation?

- Template literals use backticks (`` ` ``) instead of quotes.
- They allow:
  - **String interpolation** with `${expression}`
  - **Multi-line strings**
- Example:
  ```js
  const name = "Rahim";
  const age = 25;

  // Old way (concatenation)
  console.log("My name is " + name + " and I am " + age + " years old.");

  // ES6 template literals
  console.log(`My name is ${name} and I am ${age} years old.`);
  ```
- **Difference:**  
  - Concatenation (`+`) is harder to read.  
  - Template literals are cleaner, easier, and support multi-line strings directly.

---
