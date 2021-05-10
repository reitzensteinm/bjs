## b.js: Bootstrapped Clojure-like, Attempt B, JavaScript edition

### Features

#### First Class Everything

Absolutely everything is a first class immutable closure. Closures can only be interacted with by sending them messages, and reading what comes back. Messages are also closures, and the closures you send messages to will send a message to that message to determine what is being asked.

Technically, the turtles all the way down nature is accomplished via a safety hatch - comparisons will early out on pointer equality. If you send a list a message [:first], it will send a message to the message to parse the message. If you send it *the* msgFirst singleton [:first], it will recognize it on pointer equality and early out.

Primitive operations that require access to encapsulated primitives (like addition) can send a peek message and receive a primitive in return. This is unsafe and only done in the implementation layer (i.e. JS code in this implementation).

#### Built on Protocols

Messages are conventionally lists, where the first element represents an operation, and a variable number of arguments follow, i.e. [op & args]. Examples are [:apply 1 2], [:eval], [:first], etc.

There is no distinction between message types built in to the language (eg function calls), messages built in to the standard library (eg first/rest), and user message types.

Messages are just closures, and are free to support non standard protocols, for instance allowing access to metadata, context or provenance information.

#### Kernel Style Evaluation

Closures have access to whatever data they've closed over, the message they're being called with, as well as the environment that's sending the message.

Function calls do not pre evaluate arguments passed, but they've got the information required to selectively evaluate them. In this way, closures effectively act as fexprs. Macros and standard functions are both built out of this construct. They're bootstrapped from within the language itself.

Kernel is a dialect of Scheme that also makes macros first class. It provides *wrap* and *unwrap* semantics, allowing you to set whether a function should automatically evaluate its arguments (i.e. fn vs macro calling). Here, you can use messages to get whatever behaviour you're after, i.e. (msg* my-fn [:apply 1 2]).

This evaluation strategy means that macros are first class, and are executed at runtime, not compile time. This enables operations such as (reduce or my-list) and unlocks a significant amount of dynamic flexibility when writing macros. Let in particular is nasty in Clojure, but trivial here. It is however *extremely* slow.

#### Bootstrapped

Where possible, the language is written in itself. Binding (like let), functions and macros are all user space code.

The JS implementation provides:

 * A reader
 * Default implementations of lists, associative arrays, symbols, strings and numbers
 * Primitive functions
 * The default evaluation strategy
 * The ability to create a custom closure - (obj* arg env body)

The current limit for this is a single 1000 line file, although this should be revised down.

The Clojurelike code builds up abstractions as it boots. Binding can initially bind only one symbol to one value. Early functions and macros can have only one parameter. Destructuring is added, eg (let [[x & r] my-list]), as well as multi let, eg (let [x 1 y (+ x 1)]).

Eventually, the Clojurelike code will implement its own persistent data structures, for lists, sets and hash maps, which are then optimized and compiled down to the host language, replacing the defaults.

Having the Clojurelike code modify the execution semantics is a current area of experimentation for this project. It has been accomplished previously, eg Amin-Rompf-2019.

#### Immutability, Determinism and Serialization

The language is fully immutable. There is no escape hatch for mutability, and the optimization semantics depend on deterministic execution. Adding interior mutability (similar to Clojure's transients) is feasible, however it is not a short term goal of the project.

Everything in the language is serializable, even constructs that can't be written, for example (range), which has unbounded length.

During development, every value returned by the interpreter is serialized and deserialized to ensure this invariant.

The combination of these features allows a bootstrapped environment to be cached transparently. Booting core (just 250 lines of code which implements let, functions, macros and a few small pieces) currently requires 10s of execution, making almost 30 million function calls. But once you've done it once, it deserializes from disk in a few milliseconds.

#### Partial Evaluation (WIP)

This language will remain a toy if operations are between a thousand and a million times slower than even Clojure. However, built in to the core is a concept of polymorphic partial evaluation.

A protocol exists to represent the value of an unbound symbol. It can be passed around, placed in and retrieved from data structures. The interpreter will happily execute code that does not directly touch this value.

When a program attempts to use the unbound variable, instead of a result being returned, code is returned which will compute the result once the value is known.

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

Partial evaluation effectively strips away the expensive layers of abstraction built up by the language. It enables the dynamic runtime behaviour to be kept, which allows the language to be cleanly written in itself, while still achieving code generation on par with a more traditional language.

Partial evaluation in a previous iteration of this project was advanced enough to fully elide an interpreter executing a known program, i.e. achieving the 1st Futamura projection. This was used to compile arbitrary stack machine programs at runtime, generating shader code to run the stack machine programs on the GPU.

#### Specialization by Nondeterministic Optimization (Planned)

A previous project in this series experimented with nondeterministic and unsafe fuzzing in order to specialize code to its inputs. Execution was traced, and inputs were genetically modified in order to attempt to fully exercise each branch encountered.

Branches which were only taken in one direction, where fuzzing the input was unable to change that, were simply assumed to always be taken in that direction.

This is highly dangerous, but effective. An area of research is to determine whether it's possible to mitigate the downsides, for instance to provide tooling where the compiler can be informed of values that the fuzzer has missed.

This technique was sufficient to replicate the GraalVM party trick of partially evaluating away quicksort to build clamp, to transform the first high level definition of clamp in to the second low level implementation, completely eliding the quicksort at runtime. The branches seen in the optimized version are a specialized and inlined version of an automatically specialized quicksort.

```
(fn clamp [x low high]
  (nth (quicksort [x low high]) 1))
=>
(fn clamp [x low high]
  (if (< x low) low (if (< high x) high x))
```

While this technique is dangerous, and nondeterministic compilers guessing the intent of a program and taking a chainsaw to it sounds like a prima facie awful idea, there are a few interesting advantages:

 * Real world programs are frequently fuzzed for correctness, finding a multitude of bugs. Designing high level programs that can be fuzzed effectively is likely to yield correctness benefits. Aligning the interests of compilation and fuzz coverage may mean that by the time you're able to compile large programs properly, they're quite robust.
 * A program written with reckless disregard for performance will be more easily written cleanly and correctly, and can function as an oracle to compare any optimized versions against. If any result is suspect, it can trivially be checked.
 * High level definitions are more likely to be capable of being end to end fuzzed in more abstract contexts. For example, an SQL database losing network or disk connectivity, temporal fuzzing of race conditions. Deterministic replay of events would transparently be possible with a custom evaluator, similar to FoundationDB's development structure.
 * While fuzzing programs fully is going to be halting problem hard, it might be possible to build reliable heuristics for how well a program is being fuzzed, and only apply optimizations where the program is really quite sure a path is never taken.
 * Immutability and caching means the work of fuzzing can be shared in a global database. Faults, when discovered, can be fed back in as data to correct gaps in fuzzing and update code.
 * It might turn out that branches you can't possibly figure out how to make a fuzzer take should not exist in software. They could represent a ticking time bomb for exploitation by an attacker, or be a reason the software fails unexpectedly.

The reasons why it won't work are more straight forward, and more likely to be correct:

 * Fuzzing may simply not be sufficient for reasoning about program behaviour to the level required.
 * Deterministic partial evaluation with extensive type information may capture most of the benefits. GraalVM optimizes away the quicksort example this way.
 * Until programs are optimized, they may simply be too slow to write properly.

#### Assembly (Planned)

A high level assembly language, functionally a restricted version of let bindings, will be developed in order to allow for easy JIT code generation. Compiling this form to the machine's representation is likely to be written in the Clojurelike itself, as partial evaluation is sufficient to provide usable, interpreter level performance.

#### Low Level Data Layout (Planned)

Partial evaluation's power to collapse abstractions presents an opportunity to decouple algorithms from data layout in a performant way. A common layout change is Structure of Arrays<->Array of Structures. Traditional OOP (eg Java) is capable of writing wrappers that hide internal data structures behind an interface, but this decoupling comes at an enormous cost in terms of temporary object allocation and indirection.

The previous iteration of this project was capable of compiling a high level description of a hash function down to output the equivalent of Java's inbuilt hash:

```
(reduce (fn [acc n] (+ n (* acc 13)))
        arr 0)

=>

int o = 0;
for ( int c = 0; c < arr.length; c++ )
  o = o * 13 + arr[ c ];
```

When raw Java arrays are passed in to the system, they are converted to a sequence abstraction via an interface wrapper. The reduce call operates on this wrapper, building up a Clojure integer object. This is then unpacked back to return a Java integer.

The partial evaluation optimization then completely removes the Clojure sequence abstraction, and generates a loop that operates directly on the int[] array. It does not exist at runtime and incurs no performance penalty.

```
int[] -> Clojure Sequence -> High Level Reduction -> Clojure Integer -> int
=>
int[] -> low level loop -> int
```

The plan is to investigate a way to describe low level structures via a DSL, which will automatically convert low level data to and from higher level Clojure abstractions. This would enable writing a high level library once, which can then be specialized for different use cases.

Clojure's persistent maps are an example where thousands of lines of code implementing the same logic are duplicated for slightly different representations purely for performance reasons (sets vs maps, sparse vs dense nodes). I have written high level implementations of the same logic and it's trivial in comparison.

References:

```
https://en.wikipedia.org/wiki/Partial_evaluation
https://www.cs.purdue.edu/homes/rompf/papers/amin-popl18.pdf
https://web.cs.wpi.edu/~jshutt/kernel.html
https://www.youtube.com/watch?v=yGko70hIEwk
https://www.youtube.com/watch?v=4fFDFbi3toc
```
