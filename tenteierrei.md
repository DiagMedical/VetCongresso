# Tentei Errei — Scanner QR

## Problema
O scanner de QR Code em `/admin/scanner` não está lendo QR codes de tickets de forma confiável em dispositivos móveis.

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
