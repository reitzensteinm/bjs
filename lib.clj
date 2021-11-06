(defn map [f l]
  (if (empty? l)
    []
    (concat [(f (first l))]
            (map f (rest l)))))


(assert
  [2 3 4 5]
  (map (fn [x] (+ x 1)) [1 2 3 4]))

(defn partial [f & args]
  (fn [& inner-args]
    (apply* f (concat args inner-args))))

(assert ((partial + 1) 2)
        3)


(defn reduce [f i s]
  (if (empty? s)
    i
    (reduce f
            (f i (first s))
            (rest s))))

(def reduce-f (fn [a b] (+ a b)))

; (def reduce (apply* obj*
;                     [(quote argfo) (quote envfo)
;                      (optimize (msg* reduce [:disassemble])
;                                {(quote reduce) (unbound (quote reduce))})]
;                     {}))
;
;
(def reduce-f (apply* obj*
                    [(quote argfo) (quote envfo)
                     (optimize (msg* reduce-f [:disassemble])
                               {})]
                    {}))

(defn plus [a b]
  (+ a b))


(defn str [& args]
  (if (empty? args)
    ""
    (strcat
      (str* (first args))
      (apply* str (rest args) {}))))

(def and (obj* args env
           (if (eval (second args) env)
             (if (eval (third args) env)
               true
               false)
             false)))

(assert true
  (and true true))

(assert false
  (and false true))

(def or (obj* args env
          (if (eval (second args) env)
            true
            (if (eval (third args) env)
              true
              false))))

(assert true
  (or true false))

(assert false
  (or false false))

(defn interpose [sep seq]
  (cond
    (empty? seq)
    []

    (empty? (rest seq))
    [(first seq)]

    true
    (concat [(first seq) sep] (interpose sep (rest seq)))))

(assert [1 0 1]
  (interpose 0 [1 1]))
