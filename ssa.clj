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
