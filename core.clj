;; Bootstrap def, which just returns a map containing :defines
;; Strings and quote are not available, so (symbol :def) <=> 'def
{:defines {(symbol :def)
           (obj* args env
             {:defines
              {(first (rest args))
               (eval (first (rest (rest args))) env)}})}}

;; obj* is a fexpr, which does not eval params or result implicitly
(def quote (obj* args env
             (first (rest args))))

;; Assert assert works!
(assert 5 (+ 1 4))

;; Check if, especially if arguments incomplete
(assert 0 (if true 0 1))
(assert 1 (if false 0 1))
(assert nil (if false 1))

;; Bootstrap bare metal fn*, which evalutes its parameters in the calling
;; environment,
(def fn* (obj* args env
           (obj* argf envf
             (eval (first (rest (rest args)))
               (assoc env (first (rest args)) (eval (rest argf) envf))))))

(assert
  5
  ((fn* args (+ (first args) (first (rest args)))) (+ 1 2) 2))

;; Helper functions for list access
(def second (fn* args
              (first (rest (first args)))))

(def third (fn* args
              (first (rest (rest (first args))))))

(def fourth (fn* args
              (first (rest (rest (rest (first args)))))))

(def fifth (fn* args
              (first (rest (rest (rest (rest (first args))))))))

(assert
  5
  (second [1 5 10]))

(assert
  10
  (third [1 5 10]))

;; Equivalent to let, but can only bind one symbol at a time
(def bind* (obj* args env
             (eval (third args)
                   (assoc env
                          (first (second args))
                          (eval (second (second args))
                                env)))))

(assert
  (bind* [x 5]
    (+ x 5))
  10)

(assert
  3
  (if (= 3 2)
    1 3))

;; bind-to-env* is a helper fn that appends a list of bindings to an
;; environment, evaluating the expressions in the caller environment
;; inner-bind* can later be overridden to enable destructuring
(def inner-bind*
  (fn* args
    (assoc (first args) (second args) (third args))))

(def bind-to-env*
  (fn* args
    (bind* [bindings (first args)]
      (bind* [env (second args)]
        (if (first bindings)
          (bind-to-env*
            (rest (rest bindings))
            (inner-bind* env (first bindings) (eval (second bindings) env)))
          env)))))

(assert
  {1 3
   4 5
   (quote +) 1}
  (assoc (bind-to-env* (quote [1 (+ 1 2) 4 (+ 4 1)]) {(quote +) +})
         (quote +) 1))

;; Final version of let using bind-to-env*. Destructuring is not yet
;; available, but bind-to-env* will be upgraded to enable it
(def let (obj* args env
           (eval (third args)
                 (bind-to-env* (second args) env))))

(assert
  10
  (let [x (+ 1 2)
        y (+ 4 3)]
    (+ x y)))

;; Testing the Trace system is working
(assert
  14
  (let [x 12]
    (trace (+ x 2))))

;; Bootstrap cond from if
(def cond (obj* args env
            (let [test (first (rest args))
                  res (second (rest args))]
              (if (empty? (rest args))
                nil
                (if (eval test env)
                  (eval res env)
                  (apply* cond (rest (rest (rest args)))
                               env))))))

(assert
  nil
  (cond (= 1 4) 1
        (= 2 3) 3))

;; Add provides, which messages an object to query its interfaces
;; The interface list is then reduced through (cumbersomely)

(def provides? (fn* args
                 (let [obj (first args)
                       interface (second args)
                       abilities (msg* obj [:provides])]
                   (not (= nil (get abilities interface))))))

(assert true
  (provides? [1 2 3] :sequence))

(assert false
  (provides? 1 :sequence))

;; Upgrade inner-bind*, which at this moment of execution binds symbol => val
;; Enable [sym sym] => [val val]

(def inner-bind-exp*
  (fn* args
    (let [env (first args)
          syms (second args)
          vals (third args)]
      (cond
        (not (provides? syms :sequence))
        (assoc env syms vals)

        (empty? syms)
        env

        :default
        (inner-bind-exp* (assoc env (first syms) (first vals))
                         (rest syms) (rest vals))))))

(assert
  (quote {a 1 b 2 c 3})
  (inner-bind-exp* {} (quote [a b c]) [1 2 3]))

(assert
  (quote {a 1})
  (inner-bind-exp* {} (quote a) 1))

(def realize (fn* args
               (read (write (first args)))))

(def dyn-test (fn* args dyn-bound))

(assert
  :dyn
  (dyn* {(quote dyn-bound) :dyn}
        (dyn-test)))

;; We don't have or yet. Are you kidding me!?
(def zipmap (fn* args
              (let [ks (first args)
                    vs (second args)]
                (cond
                  (empty? ks)
                  {}

                  (empty? vs)
                  {}

                  :default
                  (assoc (zipmap (rest ks) (rest vs))
                         (first ks) (first vs))))))

(assert
  (quote {a 1 b 2})
  (zipmap (quote [a b]) [1 2]))

(def inner-bind-expl*
  (fn* args
    ;; Bind to env is being weird!
    (bind-to-env* (first args))))
;        (inner-bind-exp* (assoc env (first syms) (first vals)
;                           (rest syms) (rest vals)})))))

(def data (msg* inner-bind-expl* [:disassemble]))

;; Optimize partially evalutes code, but stops at specified symbols
;; The code is read + written in order to prevent the unbound symbols
;; impacting the compiled code
(def optimize (fn* args
                (let [d (first args)
                      env (first d)
                      code (fourth d)
                      stop-symbols (second args)
                      eval-env (assoc (assoc env (quote argf) (unbound (quote argfo)))
                                      (quote envf) (unbound (quote envfo)))]

                  (read (write
                          (dyn* stop-symbols
                                (peval code
                                       eval-env)))))))


:halt
(peval (quote (bind-to-env* x)) {(quote x) (unbound (quote x))})



(optimize data {(quote inner-bind-expl*) (unbound (quote inner-bind-expl*))})



(def inner-bind-exp* (apply* obj*
                       [(quote argfo) (quote envfo)
                        (optimize data {(quote inner-bind-exp*) (unbound (quote inner-bind-exp*))})]
                       {}))


(def inner-bind* inner-bind-exp*)

;; By substituting our compiled inner-bind-exp* for inner-bind*, we now
;; have destructuring let!

(assert
  [1 2]
  (let [[a b c] [1 2 3]
        e [a b]]
    e))

(def fn (obj* args env
           (obj* argf envf
             (eval (first (rest (rest args)))
               (inner-bind* env (first (rest args)) (eval (rest argf) envf))))))

(assert
  7
  ((fn [x] x) 7))


(def defn (obj* argf envf
            (let [[a b c d] argf]
              {:defines {b (apply* fn [c d] envf)}})))

(defn add-test [x]
  (+ x 1))

(assert 6
  (add-test 5))
