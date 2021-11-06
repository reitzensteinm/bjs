;; Todo: emit!

; Got "cond( make( vec, [ kwApply, seq.empty(), nil( make( vec, [ kwApply,  ] ), make( vec, [] ) ), (rest seq).empty(), (first seq)( make( vec, [ kwApply,  ] ), make( vec, [] ) ), true, concat((first seq)( make( vec, [ kwApply, sep ] ), make( vec, [] ) ), interpose(sep, seq.rest())) ] ), make( vec, [] ) )"
; Executed 6057268434 calls
;
; real    25m26.857s
; user    27m38.172s
; sys     2m9.359s

;(get {(quote a) nil} (quote b) :not-found)

;:halt

(def body
  (quote (if (empty? s)
           i
           (reduce f
                   (f i (first s))
                   (rest s)))))

(def interpose-body
  (quote
    (if (empty? (rest seq))
      seq
      (concat [(first seq) sep] (interpose sep (rest seq))))))

(def map-body
  (quote
    (if (empty? l)
      []
      (concat [(f (first l))]
              (map f (rest l))))))

(def short-body
  (quote (f (first l))))

(def shortcuts
  {(quote empty?) "empty"
   (quote first) "first"
   (quote rest) "rest"})

(def functions
  {(quote reduce) "reduce"
   (quote interpose) "interpose"
   (quote map) "map"
   (quote concat) "concat"})

; (def provides? (fn* args
;                  (let [obj (first args)
;                        interface (second args)
;                        abilities (msg* obj [:provides])]
;                    (not (= nil (get abilities interface))))))

(def provides-body (quote (let [obj (first args)
                                interface (second args)
                                abilities (msg* obj [:provides])]
                            (not (= nil (get abilities interface))))))




(defn emit [expr]
  (trace
    (cond
      (and (provides? expr :sequence)
           (= (first expr) (quote if)))
      (str "truthy( " (emit (second expr)) " ) ? " (emit (third expr)) " : " (emit (fourth expr)))

      (and (provides? expr :sequence)
           (get shortcuts (first expr)))
      (str (emit (second expr)) "." (get shortcuts (first expr)) "()")

      (and (provides? expr :sequence)
           (get functions (first expr)))
      (str (get functions (first expr))
           "("
           (apply* str (interpose2 ", " (map2 emit (rest expr)))
                       {})
           ")")

      (provides? expr :code)
      (str "glob( '" (first expr) "' )"
           "( make( vec, [ kwApply, "
           (apply* str (interpose2  ", " (map2 emit (rest expr)))
                       {})
           " ] ), make( hash_map, [] ) )")

      (provides? expr :sequence)
      (str
        "make( vec, [ "
        (apply* str (interpose2 ", " (map2 emit expr))
                    {})
        " ] )")

      true (str expr))))

(memoize emit)


(emit (realize (peval provides-body {(quote args) (unbound (quote args))})))
(realize (peval provides-body {(quote args) (unbound (quote args))}))

:halt

;(map emit [1 2 3])
;(provides? short-body :sequence)
;(provides? short-body :code)
;(emit map-body)

(emit interpose-body)
;(map2 (partial + 1) [1 2 3])
;(str "a" "b" (apply* str [1 2 3] {}) "c")

:halt
(let [a 4]
  (reduce2 + 0 [a 1 2 3 4 5 6 7 8 9 10]))

:halt
(let [r reduce]
  (realize (dyn* {(quote reduce) (unbound (quote reduce))}
             (peval (quote (r f i s))
                    {(quote r) r
                     (quote f) (unbound (quote f))
                     (quote i) (unbound (quote i))
                     (quote s) (unbound (quote s))}))))


;(if (empty? a) {} (if (empty? b) {} (assoc (zipmap (rest a) (rest b)) (first a) (first b))))

;(zipmap [1 2 3] [4 5 6])


:halt

(let [zm zipmap]
  (realize (dyn* {(quote zipmap) (unbound (quote zipmap))}
             (peval (quote (zm a b)) {(quote zm) zm (quote a) (unbound (quote a)) (quote b) (unbound (quote b))}))))

;(realize (peval (quote (plus x y)) {(quote x) (unbound (quote x)) (quote y) (unbound (quote y))}))

:halt

(mark reduce)
(reduce reduce-f 0 [1 2 3 4 5 6])

:halt

(optimize (msg* zipmap [:disassemble]) {(quote zipmap) (unbound (quote zipmap))})
:halt

(defn emit [expr]
  expr)


(emit (quote (+ (first args) 1)))


:halt

(peval (quote (= x (quote &)))
       {(quote x) (unbound (quote x))})

(realize
  (peval (quote (= x (quote &)))
         {(quote x) (unbound (quote x))}))

;
; (defn simple-func [x]
;   (= x (quote &)))
;
; (optimize (msg* simple-func [:disassemble])
;           {})


:halt

(def c (msg* defn [:disassemble]))

(def opt (optimize c {(quote argf) (unbound (quote argfo))
                      (quote fn)  (unbound (quote fn))
                      (quote envf) (unbound (quote envfo))}))

:halt

opt

(def do (apply* obj*
                [(quote argfo) (quote envfo)
                 opt]
                {}))

(do mx [x] (+ x 1))
(mx 5)
;(read (pwrite pp))

:halt

(def emit
  (fn [expr path]
    (if (provides? expr :sequence)
      :)))



:halt

(msg* defn [:disassemble])
;(optimize
;          {})

(emit (quote (+ x 1))
      [])



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
