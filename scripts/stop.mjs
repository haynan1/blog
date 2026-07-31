/**
 * Encerra qualquer servidor de desenvolvimento preso numa porta do projeto.
 *
 * Por que existe: no Windows, fechar a janela do terminal (em vez de dar
 * `Ctrl + C`) não encerra o processo do Node — ele fica órfão, segurando a
 * porta e centenas de MB de memória. Na próxima vez o `astro dev` sobe numa
 * porta diferente sem avisar, e você acaba com dois servidores rodando.
 *
 * Sem dependência nenhuma: usa `netstat` (Windows) ou `lsof` (macOS/Linux),
 * que já vêm com o sistema.
 *
 * Uso: `npm run stop`
 */

import { execSync } from 'node:child_process';

/** Portas que o Astro pode ocupar: a padrão e as que ele tenta em seguida. */
const PORTS = new Set([4321, 4322, 4323, 4324, 4325]);

const isWindows = process.platform === 'win32';

/**
 * @param {string} command
 * @returns {string} stdout, ou string vazia quando o comando não achou nada
 */
function run(command) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    // `netstat` e `lsof` saem com código de erro quando não há resultado.
    // Isso não é falha: é a resposta "nada rodando aqui".
    return '';
  }
}

/**
 * Mapa porta → PIDs que estão escutando nela.
 *
 * No Windows a saída do `netstat` é interpretada em JavaScript em vez de
 * filtrada com `findstr`. Dois motivos: o Astro escuta em IPv6 (`[::1]:4321`),
 * que o filtro `-p tcp` do netstat esconde; e comparar a porta como número
 * evita que `:4321` case por acidente com um endereço remoto na mesma linha.
 *
 * @returns {Map<number, number[]>}
 */
function findListeners() {
  /** @type {Map<number, number[]>} */
  const found = new Map();

  const add = (/** @type {number} */ port, /** @type {number} */ pid) => {
    if (!PORTS.has(port) || !Number.isInteger(pid) || pid <= 0) return;
    const pids = found.get(port) ?? [];
    if (!pids.includes(pid)) pids.push(pid);
    found.set(port, pids);
  };

  if (isWindows) {
    for (const line of run('netstat -ano').split(/\r?\n/)) {
      const parts = line.trim().split(/\s+/);
      // Proto | Endereço local | Endereço remoto | Estado | PID
      if (parts.length < 5) continue;
      const [proto, local, , state, pid] = parts;
      if (!proto?.toUpperCase().startsWith('TCP')) continue;
      if (state?.toUpperCase() !== 'LISTENING') continue;

      // Cobre `127.0.0.1:4321` e `[::1]:4321`.
      const port = Number(local?.slice(local.lastIndexOf(':') + 1));
      add(port, Number(pid));
    }
    return found;
  }

  for (const port of PORTS) {
    for (const pid of run(`lsof -ti tcp:${port} -sTCP:LISTEN`).split(/\r?\n/)) {
      if (/^\d+$/.test(pid)) add(port, Number(pid));
    }
  }
  return found;
}

/** @param {number} pid */
function kill(pid) {
  // `/T` encerra também os processos filhos: o Astro sobe workers que
  // sobreviveriam ao pai e continuariam segurando a porta.
  run(isWindows ? `taskkill /PID ${pid} /T /F` : `kill -9 ${pid}`);
}

const listeners = findListeners();
let killed = 0;

for (const [port, pids] of listeners) {
  for (const pid of pids) {
    kill(pid);
    console.log(`  encerrado: porta ${port} (PID ${pid})`);
    killed += 1;
  }
}

console.log(
  killed === 0
    ? '  Nenhum servidor rodando. Nada a encerrar.'
    : `\n  ${killed} servidor(es) encerrado(s). As portas estão livres.`,
);
