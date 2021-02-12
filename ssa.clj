(ssa* [n]
  [lp (< n 2)
   min1 (- n 1)
   min2 (- n 2)
   fa (recur min1)
   fb (recur min2)
   fc (+ fa fb)]
  (if lp n fc))

(ssa* reduce [arr f]
  [lp (ssa* [arr ind])])


(def cond (obj* args env
            (first args)))

(assert
  :true
  (cond
    (= 1 2)
    :true
    :default 123))



(def wrap-native-array
  (fn [arr]
    (obj* args env)))


(def test-object (obj* args env
                   (if (= (first args) :apply)
                     (second args)
                     "sdf")))

(def debug
  (test-object 1))


(def inner-bind*
  (fn* args
    (let [env (first args)
          sym (second args)
          val (third args)]
      (if (first sym)
        (if (second sym)
          (inner-bind* (assoc env (first sym) (first val))
                       (rest sym) (rest val))
          (assoc env (first sym) (first val)))
        (assoc env sym val)))))


        ;; Extend inner-bind* to allow for



        ;; Final version of (fn [...] ...)
        ;(def fn (obj* args env
        ;          (fn* iargs))))


(def cond (obj* args env
            (let [test (first (rest args))
                  res (second (rest args))]
              (if test
                (if (eval test env)
                  (eval res env)
                  (apply cond (rest (rest (rest args)))))))))

(def cond-test (cond
                 (= 1 2)
                 :onetwo
                 (= 2 2)
                 :twotwo))



;; Implement cond, which is a convenience function to help with destructuring
(def cond (obj* args env
            (let [red (fn* args
                        (let [fargs (rest (first args))
                              test (first fargs)
                              expr (second fargs)
                              resid (rest (rest fargs))]
                          (if (eval test env)
                            (eval expr env)
                            ;; Red not found! Uh..
                            red)))]
              (red args))))

(cond (= 1 2) 2 (= 3 3) 3)



(def cond (obj* args env
            (let [test (first (rest args))
                  res (second (rest args))]
              (if test
                (if (eval test env)
                  (eval res env)
                  (apply* cond (rest (rest (rest args)))
                               env))))))

(cond (= 1 2) 1 (= 2 2) 2)


;; Add redef, which captures the old value of a symbol
(def redef
  (obj* args env
    (let [sym (first (rest args))
          code (first)])))
(assert)


;; Upgrade inner-bind*, which at this moment of execution binds symbol => val
;; Enable [sym sym] => [val val]



(def inner-bind*
  (fn* args
    (let [env (first args)
          sym (second args)
          val (third args)]
      (if (empty? sym)
        (apply* base args)))))





;(provides? a :b)

(def inner-bind-ez*
  (fn* args
    (let [env (first args)
          syms (second args)
          vals (third args)]
      (cond
        (not (provides? syms :sequence))
        {syms vals}

        (empty? syms)
        env

        :default
        [(assoc env (first syms) (first vals))
         (rest syms) (rest vals)]))))

(inner-bind-ez* (unbound (quote map)) (unbound (quote syms)) (unbound (quote vals)))
inner-bind-ez*

(def data
  (quote (clo*
           {args [:apply
                  args
                  (let
                   [env (first args) syms (second args) vals (third args)]
                   (cond
                    (not (provides? syms :sequence))
                    {syms vals}
                    (empty? syms)
                    env
                    :default
                    (inner-bind-ez* (assoc env (first syms) (first vals))
                                    (rest syms)
                                    (rest vals))))]
            env {}}
           argf
           envf
           (eval
            (first (rest (rest args)))
            (assoc env (first (rest args)) (eval (rest argf) envf))))))


(def inner-bind-ez* (unbound (quote inner-bind-ez*)))

(def optimize (fn* args
                (let [d (first args)
                      env (second d)
                      code (fifth d)]
                  (eval code
                        (assoc (assoc env (quote argf) (unbound (quote argf)))
                               (quote envf) (unbound (quote envf)))))))



(quote
  (def ibe (obj* argf envf
            (if
             (not
              (if
               (empty? (msg* (first (rest (eval (rest argf) envf))) [:provides]))
               false
               (if
                (=
                 (first (msg* (first (rest (eval (rest argf) envf))) [:provides]))
                 :sequence)
                true
                nil)))
             {(first (rest (eval (rest argf) envf))) (first
                                                      (rest
                                                       (rest
                                                        (eval (rest argf) envf))))}
             (if
              (empty? (first (rest (eval (rest argf) envf))))
              (first (eval (rest argf) envf))
              (ibe
               (assoc
                (first (eval (rest argf) envf))
                (first (first (rest (eval (rest argf) envf))))
                (first (first (rest (rest (eval (rest argf) envf))))))
               (rest (first (rest (eval (rest argf) envf))))
               (rest (first (rest (rest (eval (rest argf) envf))))))))))


  (ibe {} (quote [a b c]) [1 2 3])

  (def inner-bind* ibe)

  (let [[a b c] [1 4 3]]
    b))

;                  (eval (quote env)
;                        (assoc (assoc env (quote argf) (unbound (quote argf)))
;                               (quote envf) (unbound (quote envf))))))

;(inner-bind-ez* a b)

(optimize data)


(def a (unbound (quote a)))

[(quote (not a))
 (realize (not a))
 (= (quote (not a)) (quote (not a)))
 (read (write (quote (not a))))]

(first [(+ a 2)])

(assoc {} (quote x) (first a))

(let [x (first a)
      y 3]
  (+ x y))

(let [ab (first a)
      lst (second a)]
  (if (empty? (first lst))
    true false))




(msg* defn [:disassemble])

(eval (quote (apply* fn [(first argf) (second argf)] envf))
      {(quote argf) (unbound (quote argf))
       (quote envf) (unbound (quote envf))})

(eval (quote (let [[a b c d] argf] {b (apply* fn [c d] envf)}))
      {(quote argf) (unbound (quote argf))
       (quote envf) (unbound (quote envf))})


(def optimiz (fn* args
                (let [d (first args)
                      env (first d)
                      code (fourth d)]
                  [env code])))
;                      stop-symbols (second args)
;                      eval-env (assoc (assoc env (quote argf) (unbound (quote argf)))
;;                                      (quote envf) (unbound (quote envf)))]

  ;;                (read (write
    ;                      (dyn* stop-symbols
    ;                            (eval code
    ;                                  eval-env)])))
(optimiz (msg* defn [:disassemble])
         {})


(assert
  5
  ((read (write (fn [x] x)))
   5))


((read (write (fn [x] x))) 5)


(optimize (msg* defn [:disassemble])
          {})

(def defne* (apply* obj*
              [(quote argf) (quote envf)
               (optimize (msg* defn [:disassemble]) {})]
              {}))

(defne* symtest [x] (+ x 1))

(symtest 2)

(clo* {} argf envf (first argf))

(obj* argf envf (eval (quote (first argf))
                      {}))

(def od     (quote (eval
                     (quote
                      (eval
                       (quote
                        (eval
                         (first (rest (rest args)))
                         (inner-bind*
                          env
                          (first (rest args))
                          (eval (rest argf) envf))))
                       {(quote args) (quote
                                      [:apply
                                       (first (rest (rest argfo)))
                                       (first
                                        (rest (rest (rest argfo))))]),
                        (quote env) envfo}))
                     {(quote argfo) (quote
                                     [:apply symtest [x] (+ x 1)]),
                      (quote envfo) (quote {})})))

(optimize)



(def st
 (clo*
   {argfo [:apply symtest x (+ x 1)], envfo {}}
   argf
   envf
   (eval
    (quote
      (eval
       (first (rest (rest args)))
       (assoc
        env
        (first (rest args))
        (eval (rest argf) envf))))
    {(quote args) (quote
                   [:apply
                    (first (rest (rest argfo)))
                    (first
                     (rest (rest (rest argfo))))]),
     (quote env) envfo,
     (quote argf) argf,
     (quote envf) envf})))



;; Todo - strings in reader!

;; Check that reading (obj*) spceial forms works
;(assert
;  1
;  ((read (write (quote (clo* {} argf envf 1))))
;   2))


(optimize (msg* defn [:disassemble])
          {})



(def defnl (obj* argf envf
             (let [[a b c d] argf]
               {:defines {b (apply* fn* [c d] envf)}})))

(def defne* (apply* obj*
              [(quote argfo) (quote envfo)
               (optimize (msg* defnl [:disassemble]) {})]
              {}))

(defne* symtest x (+ x 1))

(symtest 1)



  ;; Todo - doesn't appear to work!
  ;; Reason: (clo* ) spit out with a partial evaluation doens't work
  ;; Solution - (clo* ) written out as object only






;(symtest 2)

;((clo* {} argf envf 1) 2)
;;((eval (read (write))
  ;;     {})
 ;2)

;; todo! serialized closures respect unbound variables
;; Do we spit out unbound variables as is?

;; Todo: caching
;(def x 77)
;(def nf (let [x (unbound (quote x)) y 22 z (+ x 2)] (obj* argf envf [x y (second argf)])))
;(nf 88)
;((obj* argf envf (eval (quote [x y (second argf)]) {(quote x) x (quote y) (quote 22) (quote z) (+ x 2) (quote argf) argf (quote envf) envf}))
; 88)

:uncache
(quote
  (eval
   (first (rest (rest args)))
   (assoc
    env
    (first (rest args))
    (eval (rest argf) envf))))

(def st
 (quote
   (clo*
     {argfo [:apply symtest x (+ (first x) 1)] envfo {}}
     argf
     envf
     (eval
      (quote
        (eval
         (first (rest (rest args)))
         (assoc
          env
          (first (rest args))
          (eval (rest argf) envf))))
      {(quote args)
       [:apply
        (first (rest (rest argfo)))
        (first
         (rest (rest (rest argfo))))]
       (quote env) envfo,
       (quote argf) argf,
       (quote envf) envf}))))


(st 1)

(let [x (unbound (quote x))
      y (+ x 1)]
  (apply* fn* [x] {})))

;; Todo - partial? for lists

;; Todo: why is


;((obj* argf envf (eval (quote x) {x 5})))
