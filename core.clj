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

(def cond (obj* args env
            (let [red (fn*)])))
