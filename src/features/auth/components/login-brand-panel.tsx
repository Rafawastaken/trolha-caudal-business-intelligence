import { TrolhaWordmark } from '@/components/brand/trolha-wordmark'

import { FlowWave } from './flow-wave'

/**
 * Painel de marca do login (coluna esquerda, ecrãs largos). Conta a história:
 * o trolha bombeia caudal de água — este painel mede o caudal do negócio.
 */
export function LoginBrandPanel() {
  return (
    <div className="relative isolate hidden flex-col justify-between overflow-hidden bg-[#08131F] p-12 lg:flex">
      {/* brilho ambiente laranja, ténue */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-24 size-96 rounded-full bg-[#F5811E]/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 bottom-24 size-80 rounded-full bg-[#36B7CE]/10 blur-3xl"
      />

      <TrolhaWordmark className="relative text-white" />

      <div className="relative max-w-md">
        <p className="font-mono text-xs tracking-[0.25em] text-[#36B7CE]">
          SISTEMA DE INTELIGÊNCIA
        </p>
        <h1 className="mt-4 font-display text-5xl leading-[1.05] font-bold tracking-tight text-white">
          O caudal do teu negócio.
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-[#8DA2B4]">
          Onde entra, onde escorre, onde rende. Uma leitura clara de cada euro
          do trolha.pt — para decidires com base no que está mesmo a acontecer.
        </p>
      </div>

      <div className="relative">
        {/* full-bleed horizontal: cancela o p-12 do painel para a onda
            encostar às bordas esquerda/direita (deixa de parecer cortada). */}
        <div className="-mx-12">
          <FlowWave className="h-24" />
        </div>
        <div className="mt-4 flex items-center justify-between font-mono text-[11px] tracking-wider text-[#5C7689]">
          <span>LEITURA EM TEMPO REAL</span>
          <span>Nº1 EM BOMBAS</span>
        </div>
      </div>
    </div>
  )
}
