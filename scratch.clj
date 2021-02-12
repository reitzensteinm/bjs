(peval (quote (bind-to-env* x)) {(quote x) (unbound (quote x))})

:halt



(def test-unbound
  (obj* argf envf
    (let [expr (second argf)
          partial-expr (realize (peval expr
                                      {(quote x) (unbound (quote x))}))]
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
