
;; Todo - robust tests for (partial?)



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



(def test-unbound
  (obj* argf envf
    (let [expr (second argf)
          partial-expr (peval expr
                              {(quote x) (unbound (quote x))})]
      [(eval expr {(quote x) 1})
       (eval partial-expr {(quote x) 1})
       partial-expr])))


(test-unbound
  (+ x (+ x 1)))

(test-unbound
  [x (quote x)])

(test-unbound
  {(quote x) x})

(test-unbound
  (let [n 100]
    {n x}))


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
