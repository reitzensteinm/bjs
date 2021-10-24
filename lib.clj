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
