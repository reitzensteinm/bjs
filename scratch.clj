
;; Todo - robust tests for (partial?)

;(eval (quote (fn [x] (fn [y] (+ x y)))))
;      {})

(let [f (peval (quote (fn [x] x))
              {})]
  f)

(let [f (peval (quote (fn [x] (fn [y] (+ x y))))
               {})]
  f)
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
