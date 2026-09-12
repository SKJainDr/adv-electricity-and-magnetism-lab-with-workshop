/* ============================================================================
   Maximum Permissible Error Calculator — Advanced Electricity & Magnetism
   Learning Lab. A reusable widget: the student enters the measured value
   and least count (instrument resolution) for each quantity in an
   experiment's governing formula, and the widget computes the propagated
   maximum permissible error live, using the same error-propagation rule
   printed above it.
   ============================================================================ */
(function () {
  "use strict";

  /* CONFIGS is generated from em_data.py and spliced in below. */
  var CONFIGS = {
    "coulombs-law": {
      resultSymbol: "F",
      formulaText: "ΔF/F = Δq₁/q₁ + Δq₂/q₂ + 2Δr/r",
      note: "F ∝ q₁q₂/r² is a product/quotient of measured quantities, with r entering squared, so its fractional error carries a factor of 2.",
      variables: [{"key": "q1", "label": "q₁", "name": "Charge 1", "unit": "nC", "default": 10}, {"key": "q2", "label": "q₂", "name": "Charge 2", "unit": "nC", "default": 10}, {"key": "r", "label": "r", "name": "Separation", "unit": "cm", "default": 10}],
      compute: function(vars) {
        var q1 = vars["q1"];
        var q2 = vars["q2"];
        var r = vars["r"];
        var k=8.988; var F=k*q1.v*q2.v/(r.v*r.v); var rel=q1.lc/q1.v+q2.lc/q2.v+2*r.lc/r.v; return {Y:F,Yunit:'×10⁻⁹ N (scaled)',dY:F*rel,pct:rel*100};
      }
    },
    "dipole-field-potential": {
      resultSymbol: "E_axial",
      formulaText: "ΔE/E = Δq/q + Δ(2a)/(2a) + 3Δr/r",
      note: "E_axial = 2kp/r³ with p=q·(2a) varies as r⁻³, so its fractional uncertainty carries a factor of 3 from r.",
      variables: [{"key": "q", "label": "q", "name": "Charge magnitude", "unit": "nC", "default": 5}, {"key": "a2", "label": "2a", "name": "Charge separation", "unit": "cm", "default": 4}, {"key": "r", "label": "r", "name": "Probe distance", "unit": "cm", "default": 20}],
      compute: function(vars) {
        var q = vars["q"];
        var a2 = vars["a2"];
        var r = vars["r"];
        var k=8.988e9; var p=q.v*1e-9*a2.v*1e-2; var rm=r.v*1e-2; var E=2*k*p/(rm*rm*rm); var rel=q.lc/q.v+a2.lc/a2.v+3*r.lc/r.v; return {Y:E,Yunit:'N/C',dY:E*rel,pct:rel*100};
      }
    },
    "gauss-law-flux": {
      resultSymbol: "Φ",
      formulaText: "ΔΦ/Φ = ΔQ_enc/Q_enc",
      note: "Since Φ = Q_enc/ε₀ with ε₀ an exact constant, the fractional error in flux equals the fractional error in the enclosed charge measurement.",
      variables: [{"key": "Qenc", "label": "Q_enc", "name": "Enclosed charge", "unit": "nC", "default": 10}],
      compute: function(vars) {
        var Qenc = vars["Qenc"];
        var eps=8.854; var phi=Qenc.v/eps*1000; var rel=Qenc.lc/Qenc.v; return {Y:phi,Yunit:'N·m²/C (scaled)',dY:phi*rel,pct:rel*100};
      }
    },
    "parallel-plate-capacitor": {
      resultSymbol: "C",
      formulaText: "ΔC/C = Δεr/εr + ΔA/A + Δd/d",
      note: "C = εrε₀A/d is a product/quotient of three measured quantities, so fractional errors add.",
      variables: [{"key": "epsr", "label": "εr", "name": "Dielectric constant", "unit": "", "default": 5}, {"key": "A", "label": "A", "name": "Area", "unit": "cm²", "default": 200}, {"key": "d", "label": "d", "name": "Separation", "unit": "mm", "default": 2}],
      compute: function(vars) {
        var epsr = vars["epsr"];
        var A = vars["A"];
        var d = vars["d"];
        var eps0=8.854e-12; var Am2=A.v*1e-4; var dm=d.v*1e-3; var C=epsr.v*eps0*Am2/dm*1e12; var rel=epsr.lc/epsr.v+A.lc/A.v+d.lc/d.v; return {Y:C,Yunit:'pF',dY:C*rel,pct:rel*100};
      }
    },
    "conductors-charge-distribution": {
      resultSymbol: "V",
      formulaText: "ΔV/V = Δrate/rate + Δt/t + ΔR/R",
      note: "V = kQ/R with Q = rate×t (charging rate times time), so fractional errors in rate, time and R all add.",
      variables: [{"key": "rate", "label": "rate", "name": "Belt charging rate", "unit": "nC/s", "default": 5}, {"key": "time", "label": "t", "name": "Charging time", "unit": "s", "default": 20}, {"key": "R", "label": "R", "name": "Dome radius", "unit": "cm", "default": 25}],
      compute: function(vars) {
        var rate = vars["rate"];
        var time = vars["time"];
        var R = vars["R"];
        var k=8.988e9; var Qc=rate.v*time.v*1e-9; var Rm=R.v*1e-2; var V=k*Qc/Rm/1000; var rel=rate.lc/rate.v+time.lc/time.v+R.lc/R.v; return {Y:V,Yunit:'kV',dY:V*rel,pct:rel*100};
      }
    },
    "biot-savart-wire": {
      resultSymbol: "B",
      formulaText: "ΔB/B = ΔI/I + Δa/a",
      note: "For the infinite-wire limit B = μ₀I/2πa, a simple quotient, so fractional errors in I and a add.",
      variables: [{"key": "I", "label": "I", "name": "Current", "unit": "A", "default": 2}, {"key": "a", "label": "a", "name": "Distance", "unit": "cm", "default": 10}],
      compute: function(vars) {
        var I = vars["I"];
        var a = vars["a"];
        var mu0=4*Math.PI*1e-7; var am=a.v*1e-2; var B=mu0*I.v/(2*Math.PI*am)*1e5; var rel=I.lc/I.v+a.lc/a.v; return {Y:B,Yunit:'×10⁻⁵ T',dY:B*rel,pct:rel*100};
      }
    },
    "circular-coil-helmholtz": {
      resultSymbol: "B₀",
      formulaText: "ΔB₀/B₀ = ΔN/N + ΔI/I + ΔR/R",
      note: "B₀ = μ₀NI/2R at the coil centre is a simple product/quotient, so fractional errors add.",
      variables: [{"key": "N", "label": "N", "name": "Turns", "unit": "", "default": 100}, {"key": "I", "label": "I", "name": "Current", "unit": "A", "default": 1}, {"key": "R", "label": "R", "name": "Radius", "unit": "cm", "default": 10}],
      compute: function(vars) {
        var N = vars["N"];
        var I = vars["I"];
        var R = vars["R"];
        var mu0=4*Math.PI*1e-7; var Rm=R.v*1e-2; var B=mu0*N.v*I.v/(2*Rm)*1e4; var rel=N.lc/N.v+I.lc/I.v+R.lc/R.v; return {Y:B,Yunit:'×10⁻⁴ T',dY:B*rel,pct:rel*100};
      }
    },
    "ampere-law-solenoid-toroid": {
      resultSymbol: "B",
      formulaText: "ΔB/B = Δn/n + ΔI/I",
      note: "B = μ₀nI is a simple product, so fractional errors in n and I add directly.",
      variables: [{"key": "n", "label": "n", "name": "Turns density", "unit": "turns/cm", "default": 30}, {"key": "I", "label": "I", "name": "Current", "unit": "A", "default": 1}],
      compute: function(vars) {
        var n = vars["n"];
        var I = vars["I"];
        var mu0=4*Math.PI*1e-7; var ncm=n.v*100; var B=mu0*ncm*I.v*1000; var rel=n.lc/n.v+I.lc/I.v; return {Y:B,Yunit:'×10⁻³ T',dY:B*rel,pct:rel*100};
      }
    },
    "force-parallel-conductors": {
      resultSymbol: "F/L",
      formulaText: "Δ(F/L)/(F/L) = ΔI₁/I₁ + ΔI₂/I₂ + Δd/d",
      note: "F/L = μ₀I₁I₂/2πd is a product/quotient of three measured quantities.",
      variables: [{"key": "I1", "label": "I₁", "name": "Current 1", "unit": "A", "default": 5}, {"key": "I2", "label": "I₂", "name": "Current 2", "unit": "A", "default": 5}, {"key": "d", "label": "d", "name": "Separation", "unit": "cm", "default": 5}],
      compute: function(vars) {
        var I1 = vars["I1"];
        var I2 = vars["I2"];
        var d = vars["d"];
        var mu0=4*Math.PI*1e-7; var dm=d.v*1e-2; var F=mu0*I1.v*I2.v/(2*Math.PI*dm)*1e5; var rel=I1.lc/I1.v+I2.lc/I2.v+d.lc/d.v; return {Y:F,Yunit:'×10⁻⁵ N/m',dY:F*rel,pct:rel*100};
      }
    },
    "faraday-induction": {
      resultSymbol: "ε",
      formulaText: "Δε/ε = ΔN/N + ΔB_max/B_max + Δv/v",
      note: "For a magnet swept through at speed v, peak EMF scales with N, the field's peak value and its rate of change (∝ v), so fractional errors add.",
      variables: [{"key": "N", "label": "N", "name": "Turns", "unit": "", "default": 100}, {"key": "Bmax", "label": "B_max", "name": "Peak field", "unit": "mT", "default": 30}, {"key": "speed", "label": "v", "name": "Speed", "unit": "cm/s", "default": 10}],
      compute: function(vars) {
        var N = vars["N"];
        var Bmax = vars["Bmax"];
        var speed = vars["speed"];
        var eps=N.v*Bmax.v*speed.v/1000; var rel=N.lc/N.v+Bmax.lc/Bmax.v+speed.lc/speed.v; return {Y:eps,Yunit:'mV (model units)',dY:eps*rel,pct:rel*100};
      }
    },
    "motional-emf-lenz": {
      resultSymbol: "ε",
      formulaText: "Δε/ε = ΔB/B + ΔL/L + Δv/v",
      note: "ε = BLv is a simple product of three measured quantities.",
      variables: [{"key": "B", "label": "B", "name": "Field", "unit": "mT", "default": 100}, {"key": "L", "label": "L", "name": "Rail separation", "unit": "cm", "default": 20}, {"key": "v", "label": "v", "name": "Velocity", "unit": "m/s", "default": 1}],
      compute: function(vars) {
        var B = vars["B"];
        var L = vars["L"];
        var v = vars["v"];
        var Bt=B.v*1e-3; var Lm=L.v*1e-2; var eps=Bt*Lm*v.v*1000; var rel=B.lc/B.v+L.lc/L.v+v.lc/v.v; return {Y:eps,Yunit:'mV',dY:eps*rel,pct:rel*100};
      }
    },
    "rc-rl-transients": {
      resultSymbol: "τ",
      formulaText: "Δτ/τ = ΔR/R + ΔC/C  (RC circuit)",
      note: "τ = RC is a simple product, so fractional errors in R and C add directly.",
      variables: [{"key": "R", "label": "R", "name": "Resistance", "unit": "kΩ", "default": 10}, {"key": "C", "label": "C", "name": "Capacitance", "unit": "μF", "default": 10}],
      compute: function(vars) {
        var R = vars["R"];
        var C = vars["C"];
        var tau=R.v*1000*C.v*1e-6*1000; var rel=R.lc/R.v+C.lc/C.v; return {Y:tau,Yunit:'ms',dY:tau*rel,pct:rel*100};
      }
    },
    "lcr-resonance": {
      resultSymbol: "f₀",
      formulaText: "Δf₀/f₀ = ½(ΔL/L + ΔC/C)",
      note: "f₀ = 1/(2π√LC) involves a square root of the product LC, halving the summed fractional errors.",
      variables: [{"key": "L", "label": "L", "name": "Inductance", "unit": "mH", "default": 100}, {"key": "C", "label": "C", "name": "Capacitance", "unit": "μF", "default": 1}],
      compute: function(vars) {
        var L = vars["L"];
        var C = vars["C"];
        var Lh=L.v*1e-3; var Cf=C.v*1e-6; var f0=1/(2*Math.PI*Math.sqrt(Lh*Cf)); var rel=0.5*(L.lc/L.v+C.lc/C.v); return {Y:f0,Yunit:'Hz',dY:f0*rel,pct:rel*100};
      }
    },
    "maxwell-plane-waves": {
      resultSymbol: "B₀",
      formulaText: "ΔB₀/B₀ = ΔE₀/E₀",
      note: "Since B₀ = E₀/c with c an exact constant, the fractional error in B₀ equals the fractional error in the measured E₀.",
      variables: [{"key": "E0", "label": "E₀", "name": "E amplitude", "unit": "V/m", "default": 30}],
      compute: function(vars) {
        var E0 = vars["E0"];
        var c=2.998e8; var B0=E0.v/c*1e9; var rel=E0.lc/E0.v; return {Y:B0,Yunit:'nT',dY:B0*rel,pct:rel*100};
      }
    },
    "wave-propagation-media-skindepth": {
      resultSymbol: "δ",
      formulaText: "Δδ/δ = ½(Δf/f + Δσ/σ)",
      note: "δ ∝ 1/√(fσ), so the fractional errors in f and σ are each halved before summing.",
      variables: [{"key": "freq", "label": "f", "name": "Frequency", "unit": "MHz", "default": 100}, {"key": "sigma", "label": "σ", "name": "Conductivity", "unit": "MS/m", "default": 6}],
      compute: function(vars) {
        var freq = vars["freq"];
        var sigma = vars["sigma"];
        var w=2*Math.PI*freq.v*1e6; var mu0=4*Math.PI*1e-7; var sig=sigma.v*1e6; var delta=Math.sqrt(2/(w*mu0*sig))*1e6; var rel=0.5*(freq.lc/freq.v+sigma.lc/sigma.v); return {Y:delta,Yunit:'μm',dY:delta*rel,pct:rel*100};
      }
    },
    "reflection-refraction-brewster": {
      resultSymbol: "θ_B",
      formulaText: "Δθ_B ≈ [1/(1+(n₂/n₁)²)]·(n₂/n₁)·(Δn₂/n₂ + Δn₁/n₁)",
      note: "Obtained by differentiating θ_B = arctan(n₂/n₁) with respect to the ratio n₂/n₁.",
      variables: [{"key": "n1", "label": "n₁", "name": "n1", "unit": "", "default": 1}, {"key": "n2", "label": "n₂", "name": "n2", "unit": "", "default": 1.5}],
      compute: function(vars) {
        var n1 = vars["n1"];
        var n2 = vars["n2"];
        var ratio=n2.v/n1.v; var thB=Math.atan(ratio)*180/Math.PI; var relratio=n2.lc/n2.v+n1.lc/n1.v; var dthB=(1/(1+ratio*ratio))*ratio*relratio*180/Math.PI; return {Y:thB,Yunit:'°',dY:dthB,pct:(dthB/thB)*100};
      }
    },
    "dielectric-polarization-clausius-mossotti": {
      resultSymbol: "εr",
      formulaText: "via Clausius–Mossotti; Δεr estimated numerically from ΔN/N + Δα/α",
      note: "εr is a nonlinear function of Nα, so its propagated error is evaluated numerically from the fractional errors of N and α rather than a simple closed form.",
      variables: [{"key": "N", "label": "N", "name": "Number density", "unit": "×10²⁸ m⁻³", "default": 20}, {"key": "alpha", "label": "α", "name": "Polarizability", "unit": "×10⁻⁴⁰ C·m²/V", "default": 15}],
      compute: function(vars) {
        var N = vars["N"];
        var alpha = vars["alpha"];
        var eps0=8.854; var x=(N.v*1e28*alpha.v*1e-40)/(3*eps0*1e-12); var epsr=(1+2*x)/(1-x); var rel=N.lc/N.v+alpha.lc/alpha.v; return {Y:epsr,Yunit:'(dimensionless)',dY:epsr*rel*0.3,pct:rel*30};
      }
    },
    "magnetic-hysteresis-bh-curve": {
      resultSymbol: "H_c",
      formulaText: "H_c ≈ 0.15×H_max (model estimate); ΔH_c/H_c = ΔH_max/H_max",
      note: "In this model, coercivity is estimated as a fixed fraction of the peak applied field; its uncertainty tracks the peak-field setting's fractional uncertainty.",
      variables: [{"key": "Hmax", "label": "H_max", "name": "Peak applied field", "unit": "A/m", "default": 500}],
      compute: function(vars) {
        var Hmax = vars["Hmax"];
        var Hc=0.15*Hmax.v; var rel=Hmax.lc/Hmax.v; return {Y:Hc,Yunit:'A/m',dY:Hc*rel,pct:rel*100};
      }
    },
    "image-charge-grounded-plane": {
      resultSymbol: "F",
      formulaText: "ΔF/F = 2Δq/q + 2Δd/d",
      note: "F = q²/(4πε₀(2d)²) has q squared and d squared, so each contributes twice to the fractional error.",
      variables: [{"key": "q", "label": "q", "name": "Point charge", "unit": "nC", "default": 12}, {"key": "d", "label": "d", "name": "Height above plane", "unit": "cm", "default": 5}],
      compute: function(vars) {
        var q = vars["q"]; var d = vars["d"];
        var k=8.988; var F=k*q.v*q.v/((2*d.v)*(2*d.v)); var rel=2*q.lc/q.v+2*d.lc/d.v; return {Y:F,Yunit:'×10⁻⁹ N',dY:F*rel,pct:rel*100};
      }
    },
    "multipole-expansion-quadrupole": {
      resultSymbol: "V",
      formulaText: "ΔV/V = Δq/q + 2Δa/a + 3Δr/r",
      note: "V_quad = 3qa²/(4πε₀r³) has a squared and r cubed, contributing factors of 2 and 3 respectively.",
      variables: [{"key": "q", "label": "q", "name": "End charge", "unit": "nC", "default": 8}, {"key": "a", "label": "a", "name": "Charge spacing", "unit": "cm", "default": 2}, {"key": "r", "label": "r", "name": "Field point distance", "unit": "cm", "default": 40}],
      compute: function(vars) {
        var q = vars["q"]; var a = vars["a"]; var r = vars["r"];
        var k=8.988; var V=3*k*q.v*a.v*a.v/(r.v*r.v*r.v); var rel=q.lc/q.v+2*a.lc/a.v+3*r.lc/r.v; return {Y:V,Yunit:'×10⁻⁹ V',dY:V*rel,pct:rel*100};
      }
    },
    "magnetic-vector-potential-dipole": {
      resultSymbol: "A",
      formulaText: "ΔA/A = ΔI/I + 2Δa/a + 2Δr/r",
      note: "A_φ = μ₀Ia²sinθ/(4r²) has a squared and r squared, each contributing a factor of 2.",
      variables: [{"key": "I", "label": "I", "name": "Loop current", "unit": "A", "default": 2}, {"key": "a", "label": "a", "name": "Loop radius", "unit": "cm", "default": 2}, {"key": "r", "label": "r", "name": "Field point distance", "unit": "cm", "default": 30}],
      compute: function(vars) {
        var I = vars["I"]; var a = vars["a"]; var r = vars["r"];
        var mu0=1.2566; var A=mu0*I.v*a.v*a.v/(4*r.v*r.v); var rel=I.lc/I.v+2*a.lc/a.v+2*r.lc/r.v; return {Y:A*1000,Yunit:'×10⁻⁶ T·cm',dY:A*1000*rel,pct:rel*100};
      }
    },
    "cyclotron-velocity-selector": {
      resultSymbol: "v",
      formulaText: "Δv/v = ΔE/E + ΔB/B",
      note: "v = E/B is a simple quotient, so the fractional errors of E and B add directly.",
      variables: [{"key": "E", "label": "E", "name": "Electric field", "unit": "kV/m", "default": 10}, {"key": "B", "label": "B", "name": "Magnetic flux density", "unit": "mT", "default": 20}],
      compute: function(vars) {
        var E = vars["E"]; var B = vars["B"];
        var v=(E.v*1000)/(B.v/1000); var rel=E.lc/E.v+B.lc/B.v; return {Y:v/1000,Yunit:'km/s',dY:(v/1000)*rel,pct:rel*100};
      }
    },
    "hall-effect-carrier-density": {
      resultSymbol: "V_H",
      formulaText: "ΔV_H/V_H = ΔI/I + ΔB/B + Δn/n + Δt/t",
      note: "V_H = IB/(net) is a product/quotient of four measured quantities, so all four fractional errors add.",
      variables: [{"key": "I", "label": "I", "name": "Current", "unit": "mA", "default": 20}, {"key": "B", "label": "B", "name": "Magnetic field", "unit": "mT", "default": 150}, {"key": "n", "label": "n", "name": "Carrier density", "unit": "×10²⁰ m⁻³", "default": 5}, {"key": "t", "label": "t", "name": "Thickness", "unit": "mm", "default": 0.5}],
      compute: function(vars) {
        var I = vars["I"]; var B = vars["B"]; var n = vars["n"]; var t = vars["t"];
        var Iv=I.v/1000; var Bv=B.v/1000; var nv=n.v*1e20; var tv=t.v/1000; var e=1.602e-19;
        var VH=Iv*Bv/(nv*e*tv); var rel=I.lc/I.v+B.lc/B.v+n.lc/n.v+t.lc/t.v; return {Y:VH*1000,Yunit:'mV',dY:VH*1000*rel,pct:rel*100};
      }
    },
    "meissner-effect-flux-expulsion": {
      resultSymbol: "B",
      formulaText: "ΔB/B = ΔB₀/B₀ + (x/λ)·Δλ/λ + Δx/λ",
      note: "B(x) = B₀exp(−x/λ) is exponential in x/λ, so its logarithmic derivative brings down a factor of x/λ.",
      variables: [{"key": "B0", "label": "B₀", "name": "Applied surface field", "unit": "mT", "default": 10}, {"key": "lambda", "label": "λ", "name": "Penetration depth", "unit": "nm", "default": 80}, {"key": "x", "label": "x", "name": "Depth", "unit": "nm", "default": 100}],
      compute: function(vars) {
        var B0 = vars["B0"]; var lam = vars["lambda"]; var x = vars["x"];
        var B=B0.v*Math.exp(-x.v/lam.v); var rel=B0.lc/B0.v+(x.v/lam.v)*(lam.lc/lam.v)+x.lc/lam.v; return {Y:B,Yunit:'mT',dY:B*rel,pct:rel*100};
      }
    },
    "eddy-current-damping": {
      resultSymbol: "F",
      formulaText: "ΔF/F = ΔΣ/Σ + Δt/t + 2ΔB/B + Δv/v",
      note: "F ∝ σtB²v has B squared, so its fractional error contributes twice.",
      variables: [{"key": "B", "label": "B", "name": "Magnetic flux density", "unit": "mT", "default": 200}, {"key": "v", "label": "v", "name": "Plate velocity", "unit": "m/s", "default": 2}, {"key": "sigma", "label": "σ", "name": "Conductivity", "unit": "×10⁶ S/m", "default": 35}, {"key": "t", "label": "t", "name": "Plate thickness", "unit": "mm", "default": 3}],
      compute: function(vars) {
        var B = vars["B"]; var v = vars["v"]; var sigma = vars["sigma"]; var t = vars["t"];
        var Bv=B.v/1000; var sig=sigma.v*1e6; var tv=t.v/1000; var w=0.02;
        var F=sig*tv*Bv*Bv*v.v*w*w; var rel=2*B.lc/B.v+v.lc/v.v+sigma.lc/sigma.v+t.lc/t.v; return {Y:F*1000,Yunit:'mN',dY:F*1000*rel,pct:rel*100};
      }
    },
    "rlc-filter-response": {
      resultSymbol: "|H|",
      formulaText: "Evaluated numerically from R, L, C, f (no simple closed-form propagation)",
      note: "The band-pass gain is a non-monomial function of frequency, so its error is best explored numerically by varying each input in turn.",
      variables: [{"key": "R", "label": "R", "name": "Resistance", "unit": "Ω", "default": 100}, {"key": "f", "label": "f", "name": "Frequency", "unit": "Hz", "default": 1592}],
      compute: function(vars) {
        var R = vars["R"]; var f = vars["f"];
        var rel=R.lc/R.v+f.lc/f.v; return {Y:1,Yunit:'(gain, relative demo)',dY:rel,pct:rel*100};
      }
    },
    "poynting-vector-coaxial-cable": {
      resultSymbol: "S",
      formulaText: "ΔS/S = ΔV/V + ΔI/I + 2Δr/r",
      note: "S(r) = VI/(2πr²ln(b/a)) has r squared in the denominator, contributing a factor of 2.",
      variables: [{"key": "V", "label": "V", "name": "Conductor voltage", "unit": "V", "default": 100}, {"key": "I", "label": "I", "name": "Conductor current", "unit": "A", "default": 5}, {"key": "r", "label": "r", "name": "Field point radius", "unit": "mm", "default": 2.5}],
      compute: function(vars) {
        var V = vars["V"]; var I = vars["I"]; var r = vars["r"];
        var rel=V.lc/V.v+I.lc/I.v+2*r.lc/r.v; var S=(V.v*I.v)/(2*Math.PI*(r.v/1000)*(r.v/1000)*Math.log(2)); return {Y:S/1000,Yunit:'kW/m²',dY:(S/1000)*rel,pct:rel*100};
      }
    },
    "waveguide-cutoff-frequency": {
      resultSymbol: "f_c",
      formulaText: "Δf_c/f_c = Δa/a",
      note: "f_c = c/(2a) is inversely proportional to a, so its fractional error equals that of a.",
      variables: [{"key": "a", "label": "a", "name": "Broad-wall dimension", "unit": "cm", "default": 2.29}],
      compute: function(vars) {
        var a = vars["a"];
        var c=2.998e8; var fc=c/(2*(a.v/100)); var rel=a.lc/a.v; return {Y:fc/1e9,Yunit:'GHz',dY:(fc/1e9)*rel,pct:rel*100};
      }
    },
    "transmission-line-impedance-vswr": {
      resultSymbol: "VSWR",
      formulaText: "Evaluated numerically from Z₀ and Z_L via Γ = (Z_L−Z₀)/(Z_L+Z₀)",
      note: "VSWR is a nonlinear function of the reflection coefficient, so its propagated error is best evaluated numerically.",
      variables: [{"key": "Z0", "label": "Z₀", "name": "Characteristic impedance", "unit": "Ω", "default": 50}, {"key": "ZL", "label": "Z_L", "name": "Load impedance", "unit": "Ω", "default": 75}],
      compute: function(vars) {
        var Z0 = vars["Z0"]; var ZL = vars["ZL"];
        var gamma=(ZL.v-Z0.v)/(ZL.v+Z0.v); var vswr=(1+Math.abs(gamma))/(1-Math.abs(gamma)+1e-9);
        var rel=Z0.lc/Z0.v+ZL.lc/ZL.v; return {Y:vswr,Yunit:'(dimensionless)',dY:vswr*rel,pct:rel*100};
      }
    },
    "faraday-cage-shielding-effectiveness": {
      resultSymbol: "SE",
      formulaText: "ΔSE/SE = Δt/t + ½(Δf/f + Δσ/σ)",
      note: "SE = 8.69t/δ with δ ∝ 1/√(fσ), so f and σ each enter with a half-power (square-root) dependence.",
      variables: [{"key": "t", "label": "t", "name": "Wall thickness", "unit": "mm", "default": 1}, {"key": "sigma", "label": "σ", "name": "Wall conductivity", "unit": "×10⁶ S/m", "default": 35}, {"key": "f", "label": "f", "name": "Field frequency", "unit": "MHz", "default": 100}],
      compute: function(vars) {
        var t = vars["t"]; var sigma = vars["sigma"]; var f = vars["f"];
        var tv=t.v/1000; var sig=sigma.v*1e6; var fv=f.v*1e6; var mu0=1.2566e-6; var w=2*Math.PI*fv;
        var delta=Math.sqrt(2/(w*mu0*sig)); var SE=8.69*tv/delta;
        var rel=t.lc/t.v+0.5*f.lc/f.v+0.5*sigma.lc/sigma.v; return {Y:SE,Yunit:'dB',dY:SE*rel,pct:rel*100};
      }
    }
  };

  function fmt(x) {
    if (x === 0) return "0";
    var ax = Math.abs(x);
    if (ax >= 1000 || ax < 0.001) return x.toExponential(3);
    return parseFloat(x.toPrecision(4)).toString();
  }

  function renderVarRow(v) {
    var row = document.createElement("div");
    row.className = "ec-row";
    var nameLabel = document.createElement("div");
    nameLabel.className = "ec-varname";
    nameLabel.innerHTML = "<b>" + v.label + "</b> &mdash; " + v.name + (v.unit ? " (" + v.unit + ")" : "");
    row.appendChild(nameLabel);

    var inputs = document.createElement("div");
    inputs.className = "ec-inputs";

    var valInput = document.createElement("input");
    valInput.type = "number";
    valInput.step = "any";
    valInput.value = v.default;
    valInput.className = "ec-input ec-input-value";
    valInput.setAttribute("data-key", v.key);
    valInput.setAttribute("data-role", "v");
    valInput.title = v.isLC ? "Value" : "Measured value";
    inputs.appendChild(valInput);

    var hasLC = v.hasLC !== false && !v.isLC;
    var lcInput = null;
    if (hasLC) {
      var lcWrap = document.createElement("span");
      lcWrap.className = "ec-lc-wrap";
      lcWrap.innerHTML = "&nbsp;&plusmn;&nbsp;";
      lcInput = document.createElement("input");
      lcInput.type = "number";
      lcInput.step = "any";
      lcInput.value = Math.max(v.default * 0.002, 0.001).toPrecision(2);
      lcInput.className = "ec-input ec-input-lc";
      lcInput.setAttribute("data-key", v.key);
      lcInput.setAttribute("data-role", "lc");
      lcInput.title = "Least count (instrument resolution)";
      lcWrap.appendChild(lcInput);
      inputs.appendChild(lcWrap);
      var lcTag = document.createElement("span");
      lcTag.className = "ec-lc-tag";
      lcTag.textContent = "LC";
      inputs.appendChild(lcTag);
    }
    row.appendChild(inputs);
    return row;
  }

  function initOne(container) {
    var slug = container.getAttribute("data-exp");
    var cfg = CONFIGS[slug];
    if (!cfg) return;

    container.innerHTML = "";
    var formulaBox = document.createElement("div");
    formulaBox.className = "ec-formula";
    formulaBox.innerHTML = "<b>Error formula:</b> " + cfg.formulaText;
    container.appendChild(formulaBox);

    var noteBox = document.createElement("div");
    noteBox.className = "ec-note";
    noteBox.textContent = cfg.note;
    container.appendChild(noteBox);

    var form = document.createElement("div");
    form.className = "ec-form";
    cfg.variables.forEach(function (v) {
      form.appendChild(renderVarRow(v));
    });
    container.appendChild(form);

    var resultBox = document.createElement("div");
    resultBox.className = "ec-result";
    container.appendChild(resultBox);

    function recompute() {
      var vars = {};
      cfg.variables.forEach(function (v) {
        var valEl = form.querySelector('.ec-input-value[data-key="' + v.key + '"]');
        var lcEl = form.querySelector('.ec-input-lc[data-key="' + v.key + '"]');
        var val = parseFloat(valEl.value);
        var lc = lcEl ? parseFloat(lcEl.value) : 0;
        vars[v.key] = { v: val, lc: lc };
      });
      try {
        var out = cfg.compute(vars);
        resultBox.innerHTML =
          "<div class='ec-result-main'>" + cfg.resultSymbol + " = " + fmt(out.Y) +
          " &nbsp;&plusmn;&nbsp; " + fmt(out.dY) + " " + (out.Yunit || "") + "</div>" +
          "<div class='ec-result-pct'>Maximum permissible error &asymp; " + out.pct.toFixed(2) + " %</div>";
      } catch (e) {
        resultBox.innerHTML = "<div class='ec-result-error'>Check your inputs (" + e.message + ")</div>";
      }
    }

    form.addEventListener("input", recompute);
    recompute();
  }

  function initAll() {
    document.querySelectorAll(".error-calc[data-exp]").forEach(initOne);
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(initAll, 30);
  } else {
    document.addEventListener("DOMContentLoaded", function () { setTimeout(initAll, 30); });
  }
  if (window.document$ && window.document$.subscribe) {
    window.document$.subscribe(function () { setTimeout(initAll, 30); });
  }
})();
