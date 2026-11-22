# LIFE RP — YOUR CITY. YOUR LIFE. YOUR STORY.

Simulador 3D de Mundo Aberto e Roleplay ambientado em **Brasília, Distrito Federal, Brasil**, otimizado para **Android** (`br.com.liferp.game`).

## Recursos Implementados
- **Mapa Setorizado de Brasília (13 Regiões Administrativas):** Plano Piloto, Asa Sul, Asa Norte, Esplanada dos Ministérios, Eixo Monumental, Taguatinga, Ceilândia, Águas Claras, Samambaia, Gama, Guará, Lago Sul e Lago Norte, com monumentos icônicos (Congresso Nacional, Catedral Metropolitana, Torre de TV, Caixa d'Água de Ceilândia e Lago Paranoá).
- **Modos Independentes:**
  - **Modo Offline:** Acesso sem cadastro e sem internet, com salvamento local isolado.
  - **Modo Online:** Servidores de até 16 jogadores simultâneos, chat RP/Global/Rádio Polícia e sincronização de jogadores.
- **Personagens & Câmera:** Personalização de nome, gênero, pele, cabelo, olhos, roupas e acessórios; alternância instantânea entre **1ª e 3ª pessoa**.
- **Veículos & Física:** Carros populares, sedãs, SUVs, esportivos, caminhonetes, motos, ônibus, caminhões, viaturas PMDF, ambulâncias SAMU e bombeiros CBMDF, com combustível, manutenção, garagem e concessionária.
- **Economia em Real Brasileiro (R$):** Dinheiro em espécie, conta bancária BRB, depósitos, saques, transferências, salários, compra/aluguel de imóveis e empresas com lucro por ciclo.
- **Profissões & Roleplay Espontâneo:** 13 funções jogáveis sem missões obrigatórias.
- **Gráficos & Desempenho Mobile:** Presets `Baixa`, `Média`, `Alta` e `Ultra` (padrão), ciclo dia/noite, clima dinâmico e LOD por setores.

## Como Executar ou Compilar APK Android
1. Instale as dependências: `npm install`
2. Para testar no navegador/celular: `npm run dev`
3. Para gerar o projeto Android Capacitor (`br.com.liferp.game`):
   ```bash
   npm run build
   npx cap add android
   npx cap sync android
   ```
