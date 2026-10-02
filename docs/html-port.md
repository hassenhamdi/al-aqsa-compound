# html-port — open-tree VIEWS + sun/sky/shadow numbers (for system owner)
Source: /home/hassenhamdi/open-tree.html. No lighting.js changes (not mine).
VIEWS (sunElev°, sunAzim°, clouds, exposure): golden {6,250,.3,1};
morning {24,110,.2,1}; midday {55,170,.25,1}; overcast {35,200,.92,1}.
Defaults: fov 38, wind .35, exposure 1, yaw 150, pitch 4.
Sun: dir from (azim,elev); E = transmit×20×clamp((elev+3)/3.5)×cloudcut
(cloudcut = 1-.97×clamp((clouds-.72)/.25)); disc = E×900 inside
r<1 (angle/0.00465°); aureole .05e^(-r.35)+.035e^(-r.06)+.01e^(-r.015).
Exposure (auto-key): c×=E×.62/(key^.72×.4^.28),
key = envavg + sunE·luma×max(sunY,0)×.012+.002; then AGX + vignette .5 + γ2.2.
Shadows: 3 cascades [.2,22,80,360], 12-tap PCF shadow-array, slope-scaled
normal offset (1.5+3.5√) + bias -6e-5; leaf depth pass alpha .5.
Fog: exp(-d×uFog×(.3+.7×hfalloff90m)) + mie in-scatter ×.03; horizon-clamped.
Wind: gust=(.55+.45noise)×uGust; bend=dir×wind×gust×H×.016×h²×sway;
branch osc + flutter .035×S×aC.y; grass gusts ×tall.
Sky: analytic atmo (24+8 steps) + 16-tap cloud layer; envmap 256 + mips.
Note: their sunE~20 vs our ~3 — albedo ports need ×~1.6-2.4 (as done).
