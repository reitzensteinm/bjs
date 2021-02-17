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



(quote
  (assert
    (quote (obj* argf envf (obj* argf envf (+ (first (eval (rest argf) envf)) (first (eval (rest argf) envf))))))))
    
