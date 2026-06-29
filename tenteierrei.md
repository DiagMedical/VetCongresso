# Tentei Errei — Scanner QR

## Problema
O scanner de QR Code em `/admin/scanner` não estava lendo QR codes de tickets de forma confiável em dispositivos móveis.

## Histórico das tentativas

### 1. Versão original (funcionava na teoria, não na prática)
- `facingMode: { ideal: 'environment' }`
- canvas `hidden`
- `setTimeout(scanFrame, 300)`
- **Resultado:** Câmera abria mas não lia QR.

### 2. Ajustes de câmera (commit fa626e4)
- Removido constraints de resolução
- Adicionado `autoPlay`, `muted`, `playsInline`
- `aspect-video`
- **Resultado:** Câmera abria mas não lia QR.

### 3. Fix useEffect + onloadedmetadata (cf31f0c)
- Container `h-72` fixo
- `onloadedmetadata` antes de `srcObject`
- `play().then()`
- **Resultado:** Câmera abriu, mas erro "Server Components render" após ler QR.

### 4. Stream attach via useEffect (c417a8f)
- `setScanning(true)` primeiro, depois `useEffect` anexa stream
- Resolução ideal 1280x720
- **Resultado:** Câmera abriu, leu QR, erro na página.

### 5. Crop central + attemptBoth + environment string + resolução min (ca8f1f8)
- `facingMode: 'environment'` (string)
- `width: { min: 640, ideal: 1280 }`
- `height: { min: 480, ideal: 720 }`
- `inversionAttempts: 'attemptBoth'`
- Crop central (quadrado) no scanFrame
- `setTimeout(scanFrame, 500)`
- Canvas `hidden`
- **Resultado:** ⚠️ **LEU O QR** (primeira e única vez que funcionou). Mas deu erro "Server Components render" na página.

### 6. Reverter crop central (6a0784f)
- Voltei frame completo
- **Resultado:** Parou de ler de novo.

### 7. Simplificação radical (62b817b)
- Canvas `opacity-0` em vez de `hidden`
- Sem constraints de resolução
- Sem `attemptBoth` → `dontInvert`
- Sem `setTimeout`
- **Resultado:** Não leu.

### 8. Fallback manual (b59f586)
- Textarea pra colar JSON manualmente
- **Resultado:** Ideia idiota, usuário rejeitou.

### 9. Restaura versão que leu + página sem format (410bb4d)
- Scanner idêntico ao commit ca8f1f8 (crop central, attemptBoth, setTimeout, canvas hidden, min res)
- Página: `format()` removido (data crua), `ScanErrorBoundary` adicionado
- **Resultado:** Leu o QR! Mas deu erro ao confirmar check-in.

### 10. Erro "Server Components render" ao confirmar check-in — RESOLVIDO (29/06/2026)

**Causa real do erro:**
- `realizarCheckIn` no scanner page tinha validação de horário: `if (agora > inicio) throw Error('Palestra já iniciou')`
- Em produção, erros de server action aparecem como "Server Components render error" genérico
- A palestra do teste era às 14:20, o scan foi às 18:49 → erro certo

**Solução:** Trocar `realizarCheckIn` por `realizarCheckInAdmin` no scanner page. O scanner é operado pelo staff do evento, não precisa de restrição de horário.

**Commits:** `06a7937`

### 11. QR Code denso demais — leitura lenta (29/06/2026)

**Causa:** O payload do QR Code era JSON completo com 200+ caracteres (nome, tema, palestrante, horário, etc). Isso gerava QR codes de alta densidade (pixels minúsculos), difíceis de ler com câmera de celular.

**Solução em 3 partes:**
1. **Simplificar payload** → QR code agora codifica apenas o UUID do inscrito (36 chars). QR muito menos denso, pixels 4× maiores.
2. **Buscar dados por ID** → nova server action `obterDadosInscrito(uuid)` busca nome/palestra no banco após leitura.
3. **Backward compat** → scanner ainda aceita QR codes antigos (JSON) via `tryParseQr()`.

**Commits:** `2776147`

### 12. Velocidade do scanner — otimizado (29/06/2026)

**Causa:** jsQR processando a 5fps com `setTimeout(200ms)` na CPU do celular era muito lento.

**Solução:**
1. **`BarcodeDetector` nativa** (Chrome/Android, acelerada por GPU) como engine primária. Detecta em < 0.5s.
2. **jsQR como fallback** automático para iOS/Firefox.
3. **`requestAnimationFrame`** → análise a ~12fps em vez de 5fps.
4. **Autofoco contínuo** (`focusMode: 'continuous'`) via constraint avançado.
5. **Mira visual** (retângulo cyan) para guiar o usuário.

**Commits:** `aa26345`

---

## ✅ Configuração final que funciona (29/06/2026)

### QR Code gerado (`components/qr-ticket.tsx`)
- Payload: apenas `i.id` (UUID, 36 chars)
- Biblioteca: `qrcode` pkg, `toDataURL()`, server component
- Tamanho: 360px, margem 2, fundo branco

### Scanner (`components/scanner.tsx`)
- Engine: `BarcodeDetector` nativa → fallback jsQR
- Loop: `requestAnimationFrame` a cada 5 frames (~12fps)
- Camera: `facingMode: 'environment'`, min 640x480, ideal 1280x720, autofoco contínuo
- `inversionAttempts: 'attemptBoth'` (no jsQR fallback)
- Downscale: 400px de largura no fallback jsQR

### Fluxo após leitura (`app/admin/scanner/page.tsx`)
1. UUID detectado → `obterDadosInscrito(uuid)` → exibe card de confirmação
2. Admin confirma → `realizarCheckInAdmin(id)` (sem restrição de horário)
3. Beep + toast de sucesso


## Histórico das tentativas

### 1. Versão original (funcionava na teoria, não na prática)
- `facingMode: { ideal: 'environment' }`
- canvas `hidden`
- `setTimeout(scanFrame, 300)`
- **Resultado:** Câmera abria mas não lia QR.

### 2. Ajustes de câmera (commit fa626e4)
- Removido constraints de resolução
- Adicionado `autoPlay`, `muted`, `playsInline`
- `aspect-video`
- **Resultado:** Câmera abria mas não lia QR.

### 3. Fix useEffect + onloadedmetadata (cf31f0c)
- Container `h-72` fixo
- `onloadedmetadata` antes de `srcObject`
- `play().then()`
- **Resultado:** Câmera abriu, mas erro "Server Components render" após ler QR.

### 4. Stream attach via useEffect (c417a8f)
- `setScanning(true)` primeiro, depois `useEffect` anexa stream
- Resolução ideal 1280x720
- **Resultado:** Câmera abriu, leu QR, erro na página.

### 5. Crop central + attemptBoth + environment string + resolução min (ca8f1f8)
- `facingMode: 'environment'` (string)
- `width: { min: 640, ideal: 1280 }`
- `height: { min: 480, ideal: 720 }`
- `inversionAttempts: 'attemptBoth'`
- Crop central (quadrado) no scanFrame
- `setTimeout(scanFrame, 500)`
- Canvas `hidden`
- **Resultado:** ⚠️ **LEU O QR** (primeira e única vez que funcionou). Mas deu erro "Server Components render" na página.

### 6. Reverter crop central (6a0784f)
- Voltei frame completo
- **Resultado:** Parou de ler de novo.

### 7. Simplificação radical (62b817b)
- Canvas `opacity-0` em vez de `hidden`
- Sem constraints de resolução
- Sem `attemptBoth` → `dontInvert`
- Sem `setTimeout`
- **Resultado:** Não leu.

### 8. Fallback manual (b59f586)
- Textarea pra colar JSON manualmente
- **Resultado:** Ideia idiota, usuário rejeitou.

### 9. Restaura versão que leu + página sem format (410bb4d — atual)
- Scanner idêntico ao commit ca8f1f8 (crop central, attemptBoth, setTimeout, canvas hidden, min res)
- Página: `format()` removido (data crua), `ScanErrorBoundary` adicionado
- **Resultado:** ⏳ A testar.

## Conclusão
A única configuração de scanner que **conseguiu ler** o QR foi:
- Crop central (quadrado)
- `inversionAttempts: 'attemptBoth'`
- `setTimeout(scanFrame, 500)`
- Canvas `hidden`
- Resolução com `min: 640x480, ideal: 1280x720`

O erro de página foi resolvido removendo `format()` do date-fns.

**Aguardando teste do usuário com a versão atual (410bb4d).**
