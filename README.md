# perf-bench

Runner simples de microbenchmark com medicao em nanossegundos, warmup e relatorio ops/sec.

## Instalacao

```bash
npm install perf-bench
```

## Uso

```ts
import { Suite, format } from "perf-bench";

const suite = new Suite("arrays", { duration: 500 });
suite.add("map", () => [1,2,3].map(x => x*2));
suite.add("for", () => { const r=[]; for (let i=0;i<3;i++) r.push((i+1)*2); });

const results = await suite.run();
console.log(format(results));
```

## API

- `bench(name, fn, opts?)` benchmark unico
- `new Suite(name, opts?)` agrupa casos
- `.add(name, fn)` adiciona caso
- `.run()` executa e retorna `BenchResult[]`
- `format(results)` relatorio textual ordenado por velocidade
- Opcoes: `duration`, `warmup`, `minIterations`

## Licenca

MIT (c) 2026 Tox
