
;; Todo - robust tests for (partial?)

;(fn [x] (fn [y] (+ x y)))
;:halt

;; Todo: Optimized closures don't capture parent scope for partially evaluated free variables - how can we fix?



(optimize data {(quote inner-bind-exp*) (unbound (quote inner-bind-exp*))})



:halt
pexpr



(def a (peval (fn* x x)
              {}))

(read (pwrite a))



:halt

(def c (obj*
         argfo11
         envfo11
         (eval
          (quote
           (obj*
            argfo12
            envfo12
            (eval
             (quote
              (+
               (first (eval (rest argfo11) envfo11))
               (first (eval (rest argfo12) envfo12))))
             {(quote argfo12) argfo12, (quote envfo12) envfo12})))
          {(quote argfo11) argfo11, (quote envfo11) envfo11})))

((c 5) 6)

:halt


(def c (obj*
         argfo11
         envfo11
         (eval
          (quote
           (obj*
            argfo12
            envfo12
            (eval
             (quote
              (+
               (first (eval (rest argfo11) envfo11))
               (first (eval (rest argfo12) envfo12))))
             {(quote argfo12) argfo12, (quote envfo12) envfo12})))
          {(quote argfo11) argfo11, (quote envfo11) envfo11})))

((c 5) 6)

:halt

(((fn [x] (fn [y] (+ x y)))
  1)
 2)

(fn [x] (fn [y] (+ x y)))

(let [f (peval (quote (fn [x] x))
              {})]
  (peval f {}))

(let [f (peval (quote (fn [x] (fn [y] (+ x y))))
               {})
      pf (peval f {})]
  ((pf 5) 1))
  ;((f 7) 5))
;(((obj* argf envf (obj* argf envf (+ (first (eval (rest argf) envf)) (first (eval (rest argf) envf)))));
;  1
; 2)

;; Two problems: shadowing variables and code returned by peval can't be executed?

:halt


(def defnl (obj* argf envf
             (let [[a b c d] argf]
               {:defines {b (apply* fn* [c d] envf)}})))

(msg* defnl [:disassemble])
(optimize (msg* defnl [:disassemble]) {})


(def defne* (apply* obj*
              [(quote argfo) (quote envfo)
               (optimize (msg* defnl [:disassemble]) {})]
              {}))

(defne* symtest x (+ (first x) 1))

(symtest 1)


:halt
(def defne* (apply* obj*
              [(quote argfo) (quote envfo)
               (optimize (msg* defnl [:disassemble]) {})]
              {}))

(defne* symtest x (+ x 1))

(symtest 1)


:halt
(quote
  (peval (quote
           (let [a 1]
             {(quote x) {(quote x) (+ x a)}}))

         {(quote x) (unbound (quote x))}))





;; Todo arguments to primitives are evaluated twice when partial? (my-prim x (quote x))

(peval (quote (assoc x x x))
       {(quote x) (unbound (quote x))})

:halt

(quote
  (let [expr (peval (quote
                      (fn [e] (+ x e)))
                    {(quote x) (unbound (quote x))})
        expr-realized (eval expr {(quote x) 5})
        diss (msg* expr-realized [:disassemble])]
    ;; Todo: optimize no workey!
    (optimize diss {})))
    ;     (quote x)))
    ;(optimize diss {}));(optimize diss {}))
    ;(optimize (msg* expr-realized [:disassemble])
    ;          {}])


:halt

(partialq [(unbound (quote x))])
(msg* [(unbound (quote x))] [:partial])
(test-unbound
  (apply* fn* [(quote args) x] {}))

(quote
  (def defnl (obj* argf envf
               (let [[a b c d] argf]
                 {:defines {b (apply* fn* [c d] envf)}})))

  (def defne* (apply* obj*
                [(quote argfo) (quote envfo)
                 (optimize (msg* defnl [:disassemble]) {})]
                {}))

  (defne* symtest x (+ x 1)))


;; IT VERKS
;; What do I do from here, hahaha
;; We are not feeling nearly as clever as we did a short time ago
