## b.js: Bootstrapped Clojure-like, Attempt B, JavaScript edition

### Features

#### First Class Everything

Absolutely everything is a first class immutable closure. Closures can only be interacted with by sending them messages, and reading what comes back. Messages are also closures, and the closures you send messages to will send a message to that message to determine what is being asked.

Technically, the turtles all the way down nature is accomplished via a safety hatch - comparisons will early out on pointer equality. If you send a list a message [:first], it will send a message to the message to parse the message. If you send it *the* msgFirst singleton [:first], it will recognize it on pointer equality and early out.

Primitive operations that require access to encapsulated primitives (like addition) can send a peek message and receive a primitive in return. This is unsafe and only done in the implementation layer (i.e. JS code in this implementation).

#### Built on Protocols

Messages are conventionally lists, where the first element represents an operation, and a variable number of arguments follow, i.e. [op & args]. Examples are [:apply 1 2], [:eval], [:first], etc.

There is no distiction between message types built in to the language (eg function calls), messages built in to the standard library (eg first/rest), and user message types.

Messages are just closures, and are free to support non standard protocols, for instance allowing access to metadata, context or provenance information.

#### Kernel Style Evaluation

Closures have access to whatever data they've closed over, the message they're being called with, as well as the environment that's sending the message.

Function calls do not pre evaluate arguments passed, but they've got the information required to selectively evaluate them. In this way, closures effectively act as fexprs. Macros and standard functions are both built out of this construct. They're bootstrapped from within the language itself.

Kernel is a dialect of Scheme that also makes macros first class. It provides *wrap* and *unwrap* semantics, allowing you to set whether a function should automatically evaluate its arguments (i.e. fn vs macro calling). Here, you can use messages to get whatever behaviour you're after, i.e. (msg my-fn [:apply 1 2]).

This evalution strategy means that macros are first class, and are executed at runtime, not compile time. This enables operations such as (reduce or my-list) and unlocks a significant amount of dynamic flexibility when writing macros. It is however *extremely* slow.

#### Bootstrapped

Where possible, the language is written in itself. Binding (like let), functions and macros are all user space code.

The JS implementation provides:

 * A reader
 * Default implementations of lists, associative arrays, symbols, strings and numbers
 * Primitive functions
 * The default evaluation strategy
 * The ability to create a custom closure - (obj* arg env body)

The current limit for this is a single 1000 line file, although this should be revised down.

The Clojurelike1 code builds up abstractions as it boots. Binding can initially bind only one symbol to one value. Early functions and macros can have only one parameter. Destructuring is added, eg (let [[x & r] my-list]), as well as multi let, eg (let [x 1 y (+ x 1)]).

Eventually, the Clojurelike code implements its own persistent data structures, for lists, sets and hash maps, which are then optimized and compiled down to the host language, replacing the defaults.

Having the Clojurelike code modify the execution semantics is a current area of experimentation for this project. It has been accomplished previously, eg Amin-Rompf-2019.

#### Immutability, Determinism and Serialization

The language is fully immutable. There is no escape hatch for mutability, and the optimization semantics depend on deterministic execution. Adding interior mutability (similar to Clojure's transients) is feasible, however it is not a short term goal of the project.

Everything in the language is serializable, even constructs that can't be written, for example (range), which has unbounded length.

During development, every value returned by the interpreter is serialized and deserialized to ensure this invariant.

The combination of these features allows a bootstrapped environment to be cached transparently. Booting core (just 250 lines of code which implements let, functions, macros and a few small pieces) currently requires 10s of execution, making almost 30 million function calls.

#### Partial Evaluation (WIP)

This language will remain a toy if operations are between a thousand and a million times slower than even Clojure. However, built in to the core is a concept of polymorphic partial evaluation.

A protocol exists to represent the value of an unbound symbol. It can be passed around, placed in and retrieved from data structures. The interpreter will happily execute code that does not directly touch this value.

When a program attempts to use the unbound value, instead of a result being returned, code is returned. This code will return the expected result once the unbound variable is bound.

For example:

```
(eval '(+ x (+ 1 2)) {'x 2})
 => 5
(eval '(+ x (+ 1 2)) {'x (unbound 'x)})
 => '(+ x 3)

(eval '(if true (+ x 2) (+ x 3)) {'x 2})
 => 4
(eval '(if true (+ x 2) (+ x 3)) {'x (unbound 'x)})
 => '(+ x 2)

(eval '(count (concat [1 2 3] x)) {'x (unbound 'x)})
 => '(+ 3 (count x))
```

This enables efficient and pervasive partial evaluation. Code that depends on x and y can be partially evaluated with respect to a known x, then that result later partially evaluated with respect to y. Or it can be partially evaluated with respect to x, and y is substituted at runtime.

Partial evaluation effectively strips away the expensive layers of abstraction built up by the language. It enables the dynamic runtime behavior to be kept, which allows the language to be cleanly written in itself, while still achieving code generation on par with a more traditional language.

Partial evaluation in a previous iteration of this project was advanced enough to fully elide an interpreter executing a known program, i.e. achieving the 1st Futamura projection. This was used to compile arbitrary stack machine programs at runtime, generating shader code to run the stack machine programs on the GPU.

#### Specialization by Nondeterministic Optimization (WIP)

A previous project in this series experimented with nondeterministic and unsafe fuzzing in order to specialize code to its inputs. Execution was traced, and inputs were genetically modified in order to attempt to fully exercise each branch encountered.

Branches which were only taken in one direction, where fuzzing the input was unable to change that, were simply assumed to always be taken in that direction.

This is highly dangerous, but effective. An area of research is to determine whether it's possible to mitigate the downsides, for instance to provide tooling where the compiler can be informed of values that the fuzzer has missed.

This technique was sufficient to replicate the GraalVM party trick of partially evaluating away a sort to build clamp, to transform the first high level definition of clamp in to the second low level implementation, completely eliding the quicksort at runtime. The branches seen in the optimized version are a specialized and inlined version of quicksort, eliding branches never taken.

```
(fn clamp [x low high]
  (nth (quicksort [x low high]) 1))
=>
(fn clamp [x low high]
  (if (< x low) low (if (< high x) high x))
```

#### Assembly (WIP)

A high level assembly language, functionally a restricted version of let bindings, will be developed in order to allow for easy JIT code generation. Compiling this form to the machine's representation is likely to be written in the Clojurelike itself, as partial evaluation is sufficient to provide usable, interpreter level performance.

References:

```
https://en.wikipedia.org/wiki/Partial_evaluation
https://www.cs.purdue.edu/homes/rompf/papers/amin-popl18.pdf
https://web.cs.wpi.edu/~jshutt/kernel.html
```
