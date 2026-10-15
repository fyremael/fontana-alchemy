# Fontana's Algorithmic Chemistry (AlChemy) // Interactive Simulation

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ffyremael%2Ffontana-alchemy)

An interactive, high-performance web simulation of **Walter Fontana's Algorithmic Chemistry (AlChemy)** (1991–1994). The application models constructive dynamical systems in a continuous-flow stirred-tank reactor (CSTR) executing bounded $\beta$-reductions of combinators and $\lambda$-calculus expressions.

It demonstrates the non-equilibrium phase transition of constructive dynamical systems: transitioning from **Level 0** (random entropic drift of closed terms) to **Level 1** (autopoietic, self-maintaining algebraic closures with emergent functional boundaries) and **Level 2** (boundary enforcement, enzymatic deflection, and algebraic immunity).

---

## Key Features

- **Reactive $\lambda$-Calculus Substrate:** Discrete term rewriting engine supporting standard combinators ($I, K, S, B, C, W, M$), Church numerals, and pure $\lambda$-terms with de Bruijn variables.
- **Strict Bounded Normalization:** Leftmost-outermost normal order reduction bounded at 150 reduction steps and 40 AST nodes, safeguarding execution against Turing-complete divergence ($\Omega$).
- **Continuous-Flow Stirred-Tank Reactor (CSTR):** 2D continuous space physics with momentum exchange, reaction cooldown, and fixed-capacity dilution flux ($N = 150$).
- **Live Reaction Hypergraph:** Directed force-directed network showing live catalytic production flows ($A + B \to C$).
- **Stoichiometric Interaction Matrix:** $N \times N$ closure heatmap showing $\text{eval}(i, j)$ density and algebraic closure verification.
- **Real-Time Telemetry:** Shannon diversity entropy sparkline $H(t)$, algebraic closure gauge $\Phi$, and automated organizational phase classification.
- **Reaction Crucible Workbench:** Step-by-step reduction trace inspector for custom mathematical expressions.
- **Field Guide & Theory Explainer:** Integrated educated lay-speak explainer covering the thought experiment, evolutionary phases, and dashboard interpretation.

---

## Evolutionary Phases

1. **Phase 0: Entropic Drift (The Random Gas):** Unstructured combinators collide and disperse without generating recursive cycles. High Shannon entropy ($H \approx 75\%$) and low algebraic closure ($\Phi < 25\%$).
2. **Phase 1: Autopoietic Closure (The Catalytic Triplet):** Mutually-generating hypercyclic loops ($A(B) \to C, B(C) \to A, C(A) \to B$) amplify exponentially. Dilution washes out non-conforming noise, closure surges to $>80\%$, and an emergent bio-cybernetic membrane outlines the collective.
3. **Phase 2: Functional Boundary & Algebraic Immunity:** Subjected to thermal noise and selfish parasite terms ($P$), the established organization deflects or neutralizes invaders, preserving homeostatic closure.

---

## Quickstart

```bash
# Clone the repository
git clone https://github.com/fyremael/fontana-alchemy.git
cd fontana-alchemy

# Install dependencies
npm install

# Run the development server
npm run dev

# Build for production
npm run build
```

---

## Scientific References

- **Fontana, W. (1991).** *Algorithmic Chemistry.* Artificial Life II, SFI Studies in the Sciences of Complexity, vol. X, Addison-Wesley, pp. 159–209.
- **Fontana, W., & Buss, L. W. (1994).** *What would be conserved if the tape were played twice?* PNAS 91(2), pp. 757–761.
- **Fontana, W., & Buss, L. W. (1994).** *The Arrival of the Fittest: Toward a Theory of Biological Organization.* Bull. Math. Biol., 56(1), pp. 1–64.
