
(def test-unbound
  (obj* argf envf
    (let [expr (second argf)
          partial-expr (peval expr
                              {(quote x) (unbound (quote x))})
          partial-expr (realize partial-expr)]

      (assert (eval expr {(quote x) 1})
              (eval partial-expr {(quote x) 1})))))


(test-unbound
  (+ x (+ x 1)))

(test-unbound
  [x (quote x)])

(test-unbound
  {(quote x) x})

(test-unbound
  (let [n 100]
    {n x}))


(def a (peval (fn [x] (fn [y] [x y]))
              {}))

(assert
  [5 3]
  ((a 5) 3))



(def pexpr (peval (quote (+ (unbound (quote x))
                          3))
                 {}))

(assert
  (eval (quote (+ x 3))
        {(quote x) 3})
  (eval (read (pwrite pexpr))
        {(quote x) 3}))



(assert
  (quote {x x})
  (msg* pexpr
        [:partial]))

(assert
  (quote {x x})
  (msg* (unbound (quote x))
        [:partial]))


(assert (quote {x x y y})
        (msg* [(unbound (quote x)) (unbound (quote y))]
              [:partial]))

(assert
  (quote {x x y y})
  (msg* {(quote x) (unbound (quote x))
         (unbound (quote y)) 3}
        [:partial]))
