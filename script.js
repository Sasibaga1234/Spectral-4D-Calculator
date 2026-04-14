/**
 * Gaba — 4D Algebra Symbolic Engine
 * Built with Algebrite.js for CAS functionality
 */

// --- Configuration & Constants ---
const SPACES = {
    M2: { beta: "-1", gamma: "1", delta: "1", desc: "β<0, γ>0, δ>0" },
    M3: { beta: "1", gamma: "-1", delta: "1", desc: "β>0, γ<0, δ>0" },
    M4: { beta: "1", gamma: "1", delta: "-1", desc: "β>0, γ>0, δ<0" },
    M5: { beta: "-1", gamma: "-1", delta: "1", desc: "β<0, γ<0, δ>0" },
    M6: { beta: "-1", gamma: "1", delta: "-1", desc: "β<0, γ>0, δ<0" },
    M7: { beta: "1", gamma: "-1", delta: "-1", desc: "β>0, γ<0, δ<0" }
};

const Sym = {
    build: (expr) => expr,
    add: (a, b) => `(${a}) + (${b})`,
    sub: (a, b) => `(${a}) - (${b})`,
    mul: (a, b) => `(${a}) * (${b})`,
    div: (a, b) => `(${a}) / (${b})`,
    sqrt: (a) => `sqrt(${a})`,
    abs: (a) => `abs(${a})`,
    pow: (a, b) => `(${a})^(${b})`,
    exp: (a) => `exp(${a})`,
    ln: (a) => `log(${a})`,
    cos: (a) => `cos(${a})`,
    sin: (a) => `sin(${a})`,
    re: (a) => `real(${a})`,
    im: (a) => `imag(${a})`,
    arg: (a) => `arg(${a})`,
    conj: (a) => `conj(${a})`,
    neg: (a) => `-(${a})`,
    i: "i"
};

class QuadNum {
    constructor(c1, c2, c3, c4, params) {
        this.c = [c1, c2, c3, c4].map(v => v.toString());
        this.p = params;
    }

    static multiply(X, Y) {
        const [x1, x2, x3, x4] = X.c.map(c => `(${c})`);
        const [y1, y2, y3, y4] = Y.c.map(c => `(${c})`);
        const { alpha: a, beta: b, gamma: g, delta: d } = X.p;
        
        const A = `(${a})`;
        const B = `(${b})`;
        const G = `(${g})`;
        const D = `(${d})`;

        const z1 = `${A}*${x1}*${y1} + (${G}*${D}/${A})*${x2}*${y2} + (${B}*${D}/${A})*${x3}*${y3} + (${B}*${G}/${A})*${x4}*${y4}`;
        const z2 = `${A}*${x2}*${y1} + ${A}*${x1}*${y2} + ${B}*${x4}*${y3} + ${B}*${x3}*${y4}`;
        const z3 = `${A}*${x3}*${y1} + ${G}*${x4}*${y2} + ${A}*${x1}*${y3} + ${G}*${x2}*${y4}`;
        const z4 = `${A}*${x4}*${y1} + ${D}*${x3}*${y2} + ${D}*${x2}*${y3} + ${A}*${x1}*${y4}`;

        return new QuadNum(z1, z2, z3, z4, X.p);
    }

    getSpectrum() {
        const [x1, x2, x3, x4] = this.c.map(c => `(${c})`);
        const { alpha: a, beta: b, gamma: g, delta: d, spaceKey } = this.p;
        
        const A = `(${a})`;
        const B = `(${b})`;
        const G = `(${g})`;
        const D = `(${d})`;

        const sGD = `sqrt(abs(${G} * ${D}))`;
        const sBD = `sqrt(abs(${B} * ${D}))`;
        const sBG = `sqrt(abs(${B} * ${G}))`;
        
        const P = `(${sGD})`;
        const Q = `(${sBD})`;
        const S = `(${sBG})`;

        let mu1, mu3;

        switch (spaceKey) {
            case "M2":
                mu1 = `(${A}*${x1} - ${P}*${x2}) + i*(${Q}*${x3} - ${S}*${x4})`;
                mu3 = `(${A}*${x1} + ${P}*${x2}) + i*(${Q}*${x3} + ${S}*${x4})`;
                break;
            case "M3":
                mu1 = `(${A}*${x1} - ${Q}*${x3}) + i*(${P}*${x2} - ${S}*${x4})`;
                mu3 = `(${A}*${x1} + ${Q}*${x3}) + i*(${P}*${x2} + ${S}*${x4})`;
                break;
            case "M4":
                mu1 = `(${A}*${x1} - ${S}*${x4}) + i*(${P}*${x2} - ${Q}*${x3})`;
                mu3 = `(${A}*${x1} + ${S}*${x4}) + i*(${P}*${x2} + ${Q}*${x3})`;
                break;
            case "M5":
                mu1 = `(${A}*${x1} - ${S}*${x4}) + i*(${P}*${x2} + ${Q}*${x3})`;
                mu3 = `(${A}*${x1} + ${S}*${x4}) + i*(${P}*${x2} - ${Q}*${x3})`;
                break;
            case "M6":
                mu1 = `(${A}*${x1} - ${Q}*${x3}) + i*(${P}*${x2} + ${S}*${x4})`;
                mu3 = `(${A}*${x1} + ${Q}*${x3}) + i*(${P}*${x2} - ${S}*${x4})`;
                break;
            case "M7":
                mu1 = `(${A}*${x1} - ${P}*${x2}) + i*(${Q}*${x3} + ${S}*${x4})`;
                mu3 = `(${A}*${x1} + ${P}*${x2}) + i*(${Q}*${x3} - ${S}*${x4})`;
                break;
        }

        return { mu1, mu3 };
    }

    static fromSpectrum(lam1, lam3, p) {
        const A_expr = `(${Sym.re(lam1)}) + (${Sym.re(lam3)})`;
        const B_expr = `(${Sym.re(lam3)}) - (${Sym.re(lam1)})`;
        const C_expr = `(${Sym.im(lam1)}) + (${Sym.im(lam3)})`;
        const D_expr = `(${Sym.im(lam3)}) - (${Sym.im(lam1)})`;

        const p_val = Algebrite.run(`simplify(sqrt(abs((${p.gamma}) * (${p.delta}))))`);
        const q_val = Algebrite.run(`simplify(sqrt(abs((${p.beta}) * (${p.delta}))))`);
        const s_val = Algebrite.run(`simplify(sqrt(abs((${p.beta}) * (${p.gamma}))))`);

        let w1, w2, w3, w4;
        const denA = `(2 * (${p.alpha}))`;
        const denP = `(2 * (${p_val}))`;
        const denQ = `(2 * (${q_val}))`;
        const denS = `(2 * (${s_val}))`;

        switch (p.spaceKey) {
            case "M2":
                w1 = Sym.div(A_expr, denA); w2 = Sym.div(B_expr, denP); w3 = Sym.div(C_expr, denQ); w4 = Sym.div(D_expr, denS);
                break;
            case "M3":
                w1 = Sym.div(A_expr, denA); w2 = Sym.div(C_expr, denP); w3 = Sym.div(B_expr, denQ); w4 = Sym.div(D_expr, denS);
                break;
            case "M4":
                w1 = Sym.div(A_expr, denA); w2 = Sym.div(C_expr, denP); w3 = Sym.div(D_expr, denQ); w4 = Sym.div(B_expr, denS);
                break;
            case "M5":
                w1 = Sym.div(A_expr, denA); w2 = Sym.div(C_expr, denP); w3 = Sym.neg(Sym.div(D_expr, denQ)); w4 = Sym.div(B_expr, denS);
                break;
            case "M6":
                w1 = Sym.div(A_expr, denA); w2 = Sym.div(C_expr, denP); w3 = Sym.div(B_expr, denQ); w4 = Sym.neg(Sym.div(D_expr, denS));
                break;
            case "M7":
                w1 = Sym.div(A_expr, denA); w2 = Sym.div(B_expr, denP); w3 = Sym.div(C_expr, denQ); w4 = Sym.neg(Sym.div(D_expr, denS));
                break;
        }

        return new QuadNum(w1, w2, w3, w4, p);
    }
}

const App = {
    init() {
        this.currentOp = 'add';
        this.resultsData = new Map(); // Store raw symbolic data safely in memory
        this.cacheElements();
        this.bindEvents();
        this.updateParamFields();
        this.updateOpUI();
    },

    cacheElements() {
        this.spaceSelect = document.getElementById('space-select');
        this.modeSelect = document.getElementById('mode-select');
        this.anisoParams = document.getElementById('anisotropic-params');
        this.logOutput = document.getElementById('log-output');
        this.yContainer = document.getElementById('y-input-container');
        this.powerContainer = document.getElementById('power-input-container');
        this.fracContainer = document.getElementById('frac-m-container');
        
        // Modal elements
        this.modal = document.getElementById('copy-modal');
        this.modalCheckboxes = document.getElementById('modal-checkboxes');
        this.modalConfirm = document.getElementById('modal-confirm');
        this.modalCancel = document.getElementById('modal-cancel');
    },

    bindEvents() {
        this.spaceSelect.addEventListener('change', () => this.updateParamFields());
        this.modeSelect.addEventListener('change', () => this.updateParamFields());

        document.querySelectorAll('.op-btn[data-op]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentOp = e.target.dataset.op;
                this.updateOpUI();
                this.updateInputsVisibility();
            });
        });

        document.getElementById('btn-calculate').addEventListener('click', () => {
            this.handleOp(this.currentOp);
        });

        document.getElementById('clear-console').addEventListener('click', () => {
            this.logOutput.innerHTML = '';
        });

        // Global delegator for menu and copy actions
        this.logOutput.addEventListener('click', (e) => this.handleLogInteraction(e));
        this.modalConfirm.addEventListener('click', () => this.executeCopy());
        this.modalCancel.addEventListener('click', () => this.modal.classList.remove('active'));
        
        // Close menus when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.menu-trigger')) {
                document.querySelectorAll('.copy-dropdown').forEach(d => d.classList.remove('active'));
            }
        });
    },

    updateOpUI() {
        document.querySelectorAll('.op-btn[data-op]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.op === this.currentOp);
        });
    },

    updateInputsVisibility() {
        const op = this.currentOp;
        this.yContainer.style.display = ['add', 'sub', 'mul', 'div'].includes(op) ? 'block' : 'none';
        this.powerContainer.style.display = ['pow', 'root'].includes(op) ? 'block' : 'none';
        this.fracContainer.style.display = op === 'root' ? 'block' : 'none';
    },

    updateParamFields() {
        const mode = this.modeSelect.value;
        const sk = this.spaceSelect.value;
        this.anisoParams.style.display = mode === 'anisotropic' ? 'flex' : 'none';

        if (mode === 'isotropic') {
            const s = SPACES[sk];
            document.getElementById('param-alpha').value = "1";
            document.getElementById('param-beta').value = s.beta;
            document.getElementById('param-gamma').value = s.gamma;
            document.getElementById('param-delta').value = s.delta;
        }
    },

    getParams() {
        return {
            alpha: document.getElementById('param-alpha').value || "1",
            beta: document.getElementById('param-beta').value || "1",
            gamma: document.getElementById('param-gamma').value || "1",
            delta: document.getElementById('param-delta').value || "1",
            spaceKey: this.spaceSelect.value
        };
    },

    getX() {
        const p = this.getParams();
        return new QuadNum(
            document.getElementById('x1').value || "0",
            document.getElementById('x2').value || "0",
            document.getElementById('x3').value || "0",
            document.getElementById('x4').value || "0",
            p
        );
    },

    getY() {
        const p = this.getParams();
        return new QuadNum(
            document.getElementById('y1').value || "0",
            document.getElementById('y2').value || "0",
            document.getElementById('y3').value || "0",
            document.getElementById('y4').value || "0",
            p
        );
    },

    handleOp(op) {
        const X = this.getX();
        let result;
        let label = op.toUpperCase();

        try {
            const { mu1, mu3 } = X.getSpectrum();

            switch (op) {
                case 'add':
                    const Y = this.getY();
                    result = new QuadNum(...X.c.map((v, i) => Sym.add(v, Y.c[i])), X.p);
                    break;
                case 'sub':
                    const Ys = this.getY();
                    result = new QuadNum(...X.c.map((v, i) => Sym.sub(v, Ys.c[i])), X.p);
                    break;
                case 'mul':
                    result = QuadNum.multiply(X, this.getY());
                    break;
                case 'div':
                    const Yd = this.getY();
                    const sm = Yd.getSpectrum();
                    result = QuadNum.fromSpectrum(Sym.div(mu1, sm.mu1), Sym.div(mu3, sm.mu3), X.p);
                    break;
                case 'inv':
                    result = QuadNum.fromSpectrum(Sym.div(1, mu1), Sym.div(1, mu3), X.p);
                    break;
                case 'exp':
                    result = QuadNum.fromSpectrum(Sym.exp(mu1), Sym.exp(mu3), X.p);
                    break;
                case 'ln':
                    result = QuadNum.fromSpectrum(Sym.ln(mu1), Sym.ln(mu3), X.p);
                    break;
                case 'cos':
                    result = QuadNum.fromSpectrum(Sym.cos(mu1), Sym.cos(mu3), X.p);
                    break;
                case 'sin':
                    result = QuadNum.fromSpectrum(Sym.sin(mu1), Sym.sin(mu3), X.p);
                    break;
                case 'sqrt':
                    result = QuadNum.fromSpectrum(Sym.sqrt(mu1), Sym.sqrt(mu3), X.p);
                    break;
                case 'pow':
                    const n = document.getElementById('p-n').value;
                    result = QuadNum.fromSpectrum(Sym.pow(mu1, n), Sym.pow(mu3, n), X.p);
                    break;
                case 'root':
                    const mVal = document.getElementById('p-m').value;
                    const nVal = document.getElementById('p-n').value;
                    this.handleFractionalPower(X, mu1, mu3, mVal, nVal);
                    return;
                case 'spectrum':
                    // Raw simplified strings for copy
                    const rawL1 = Algebrite.run(`simplify(${mu1})`);
                    const rawL2 = Algebrite.run(`simplify(conj(${mu1}))`);
                    const rawL3 = Algebrite.run(`simplify(${mu3})`);
                    const rawL4 = Algebrite.run(`simplify(conj(${mu3}))`);
                    
                    // LaTeX strings for display
                    const lam1 = Algebrite.run(`printlatex(${rawL1})`);
                    const lam2 = Algebrite.run(`printlatex(${rawL2})`);
                    const lam3 = Algebrite.run(`printlatex(${rawL3})`);
                    const lam4 = Algebrite.run(`printlatex(${rawL4})`);
                    
                    this.logSpectrum([lam1, lam2, lam3, lam4], [rawL1, rawL2, rawL3, rawL4]);
                    return;
                case 'norm':
                    const res = Algebrite.run(`printlatex(simplify(${Sym.abs(mu1)}^2 * ${Sym.abs(mu3)}^2))`);
                    this.logMessage(`|X|² (Symplectic Norm Squared)`, res);
                    default:
                    this.logMessage("Error", "Operation not implemented yet");
                    return;
            }
            
            // Step 1: Aggressively simplify the symbolic coordinates once
            result.c = result.c.map(expr => Algebrite.run(`simplify(${expr})`));
            
            // Step 2: Capture these clean strings for Computer Copy
            const rawResults = [...result.c];

            // Step 3: Convert to LaTeX for visual display
            result.c = result.c.map(expr => Algebrite.run(`printlatex(${expr})`));
            
            this.logResult(label, result, rawResults);
        } catch (e) {
            console.error(e);
            this.logMessage("Error", e.message);
        }
    },

    handleFractionalPower(X, mu1, mu3, m, n) {
        const nInt = parseInt(n);
        if (isNaN(nInt) || nInt < 1) {
            this.logMessage("Error", "n must be a positive integer");
            return;
        }

        this.logMessage("Fractional Power", `Generating ${nInt * nInt} branches for $X^{${m}/${n}}$...`);

        const r1 = `abs(${mu1})`;
        const t1 = `arg(${mu1})`;
        const r3 = `abs(${mu3})`;
        const t3 = `arg(${mu3})`;

        // Reversing loops so k=0, mIdx=0 is logged LAST and appears at the TOP (using prepend)
        for (let k = nInt - 1; k >= 0; k--) {
            for (let mIdx = nInt - 1; mIdx >= 0; mIdx--) {
                try {
                    const lam1 = `((${r1})^(${m}/${n})) * exp(i * (${m}) * ((${t1}) + 2*pi*${k}) / (${n}))`;
                    const lam3 = `((${r3})^(${m}/${n})) * exp(i * (${m}) * ((${t3}) + 2*pi*${mIdx}) / (${n}))`;
                    const res = QuadNum.fromSpectrum(lam1, lam3, X.p);
                    
                    // Step 1: Simplify components
                    res.c = res.c.map(expr => Algebrite.run(`simplify(${expr})`));
                    
                    // Step 2: Capture clean computer strings
                    const rawBranch = [...res.c];
                    
                    // Step 3: Convert to LaTeX
                    res.c = res.c.map(expr => Algebrite.run(`printlatex(${expr})`));
                    
                    this.logResult(`Branch [k=${k}, m=${mIdx}]`, res, rawBranch);
                } catch (e) {
                    console.error("Branch Error:", e);
                }
            }
        }
    },

    logResult(label, quad, rawC) {
        const id = 'res-' + Date.now() + Math.random().toString(36).substr(2, 5);
        
        // Store data in memory to avoid HTML attribute escaping bugs
        this.resultsData.set(id, {
            raw: rawC,
            latex: quad.c,
            prefix: "z"
        });

        const html = `
            <div class="result-item" id="${id}">
                <button class="menu-trigger">⋮</button>
                <div class="copy-dropdown">
                    <button class="dropdown-item" data-action="copy-latex">📄 Copy as LaTeX</button>
                    <button class="dropdown-item" data-action="copy-computer">💻 Copy as Computer</button>
                </div>
                <div class="result-label">${label} — Space: ${quad.p.spaceKey}</div>
                <div class="result-value">
                    Z₁ = $${quad.c[0]}$<br>
                    Z₂ = $${quad.c[1]}$<br>
                    Z₃ = $${quad.c[2]}$<br>
                    Z₄ = $${quad.c[3]}$
                </div>
            </div>
        `;
        this.appendLog(html);
    },

    logSpectrum(latexArr, rawArr) {
        const id = 'spec-' + Date.now();
        
        // Store data in memory
        this.resultsData.set(id, {
            raw: rawArr,
            latex: latexArr,
            prefix: "λ"
        });

        const html = `
            <div class="result-item" id="${id}" 
                 style="border-left-color: var(--accent-purple)">
                <button class="menu-trigger">⋮</button>
                <div class="copy-dropdown">
                    <button class="dropdown-item" data-action="copy-latex">📄 Copy as LaTeX</button>
                    <button class="dropdown-item" data-action="copy-computer">💻 Copy as Computer</button>
                </div>
                <div class="result-label">Spectral Components Λ(X)</div>
                <div class="result-value">
                    λ₁ = $${latexArr[0]}$<br>
                    λ₂ = $${latexArr[1]}$<br>
                    λ₃ = $${latexArr[2]}$<br>
                    λ₄ = $${latexArr[3]}$
                </div>
        `;
        this.appendLog(html);
    },

    handleLogInteraction(e) {
        const trigger = e.target.closest('.menu-trigger');
        const dropdownItem = e.target.closest('.dropdown-item');

        if (trigger) {
            const dropdown = trigger.nextElementSibling;
            document.querySelectorAll('.copy-dropdown').forEach(d => { if(d !== dropdown) d.classList.remove('active'); });
            dropdown.classList.toggle('active');
            return;
        }

        if (dropdownItem) {
            const item = dropdownItem.closest('.result-item');
            const action = dropdownItem.dataset.action;
            const resData = this.resultsData.get(item.id);
            
            if (resData) {
                const data = action === 'copy-latex' ? resData.latex : resData.raw;
                this.openCopyModal(action, data, resData.prefix);
            }
            dropdownItem.parentElement.classList.remove('active');
        }
    },

    openCopyModal(mode, data, prefix) {
        this.currentCopyData = { mode, data, prefix };
        this.modalCheckboxes.innerHTML = data.map((val, i) => `
            <label class="checkbox-item">
                <input type="checkbox" checked data-index="${i}">
                <span class="modal-label-text">${prefix.toUpperCase()}${i+1}</span>
            </label>
        `).join('');

        this.modal.classList.add('active');
    },

    executeCopy() {
        const checkedIndices = Array.from(this.modalCheckboxes.querySelectorAll('input:checked'))
            .map(input => parseInt(input.dataset.index));
        
        if (checkedIndices.length === 0) {
            this.modal.classList.remove('active');
            return;
        }

        const { mode, data, prefix } = this.currentCopyData;
        let text = "";

        if (mode === 'copy-latex') {
            text = "\\begin{cases}\n";
            checkedIndices.forEach(idx => {
                const label = prefix === 'λ' ? `\\lambda_{${idx+1}}` : `${prefix}_{${idx+1}}`;
                text += `${label} = ${data[idx]} \\\\\n`;
            });
            text += "\\end{cases}";
        } else {
            checkedIndices.forEach(idx => {
                text += `${prefix}${idx+1} = ${data[idx]}\n`;
            });
        }

        navigator.clipboard.writeText(text).then(() => {
            const btn = this.modalConfirm;
            const oldText = btn.innerText;
            btn.innerText = "✅ Copied!";
            setTimeout(() => {
                btn.innerText = oldText;
                this.modal.classList.remove('active');
            }, 800);
        });
    },

    logMessage(label, msg) {
        const html = `
            <div class="result-item">
                <div class="result-label">${label}</div>
                <div class="result-value">${msg}</div>
            </div>
        `;
        this.appendLog(html);
    },

    appendLog(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        this.logOutput.prepend(div);
        renderMathInElement(div, {
            delimiters: [
                {left: '$$', right: '$$', display: true},
                {left: '$', right: '$', display: false}
            ],
            throwOnError: false
        });
    }
};

// Initial initialization
window.addEventListener('load', () => {
    App.init();

    // PWA Service Worker Registration
    if ('serviceWorker' in navigator) {
        // Register with explicit scope
        navigator.serviceWorker.register('./sw.js', { scope: './' })
            .then(reg => {
                const pwaStatus = document.getElementById('pwa-status');
                const updateUI = () => {
                    if (reg.active) {
                        pwaStatus.innerText = "Verified";
                        pwaStatus.style.background = "rgba(16, 185, 129, 0.2)";
                        pwaStatus.style.color = "#10b981";
                    }
                };
                updateUI();
                reg.onupdatefound = () => {
                    const worker = reg.installing;
                    worker.onstatechange = () => { if (worker.state === 'activated') updateUI(); };
                };
            })
            .catch(err => {
                document.getElementById('pwa-status').innerText = "Unsupported Context";
            });
    }
});

// PWA Install Prompt Logic
let deferredPrompt;
const installBtn = document.getElementById('install-btn');

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the default browser prompt
    e.preventDefault();
    deferredPrompt = e;
    // Show our custom install button
    installBtn.style.display = 'block';

    installBtn.addEventListener('click', () => {
        installBtn.style.display = 'none';
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
            }
            deferredPrompt = null;
        });
    });
});
