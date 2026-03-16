const functions = require('firebase-functions');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');
admin.initializeApp();

const geminiKey = defineSecret('GEMINI_API_KEY');

exports.onChatMessage = functions.firestore
  .document('hub/state')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    const prevChat = before.chat || [];
    const newChat = after.chat || [];

    if (newChat.length <= prevChat.length) return null;

    const lastMsg = newChat[newChat.length - 1];
    const sender = after.lastEditor || '';
    if (!sender) return null;

    const tokensSnap = await admin.firestore().collection('fcmTokens').get();
    const tokens = [];
    tokensSnap.forEach(doc => {
      if (doc.id !== sender) {
        const t = doc.data().token;
        if (t) tokens.push(t);
      }
    });

    if (!tokens.length) return null;

    const body = lastMsg.text || (lastMsg.media && lastMsg.media.length ? '📎 Enviou media' : 'Nova mensagem');
    const title = 'Musamar Hub — ' + (lastMsg.user || sender);

    const results = await Promise.allSettled(
      tokens.map(token =>
        admin.messaging().send({
          token,
          webpush: {
            notification: {
              title: title,
              body: body,
              icon: 'icons/icon-192.png',
            },
          },
        })
      )
    );

    for (let i = 0; i < results.length; i++) {
      if (results[i].status === 'rejected') {
        const err = results[i].reason;
        if (err.code === 'messaging/invalid-registration-token' ||
            err.code === 'messaging/registration-token-not-registered') {
          const snap = await admin.firestore().collection('fcmTokens')
            .where('token', '==', tokens[i]).get();
          snap.forEach(doc => doc.ref.delete());
        }
      }
    }

    return null;
  });

// ===== SUNDAY OBJECTIVES REMINDER =====
// Runs every Sunday at 10:00, 15:00, and 19:00 (Europe/Lisbon)
exports.sundayReminder10 = functions.pubsub
  .schedule('0 10 * * 0')
  .timeZone('Europe/Lisbon')
  .onRun(() => sendSundayReminders());

exports.sundayReminder15 = functions.pubsub
  .schedule('0 15 * * 0')
  .timeZone('Europe/Lisbon')
  .onRun(() => sendSundayReminders());

exports.sundayReminder19 = functions.pubsub
  .schedule('0 19 * * 0')
  .timeZone('Europe/Lisbon')
  .onRun(() => sendSundayReminders());

async function sendSundayReminders() {
  const db = admin.firestore();
  const stateSnap = await db.collection('hub').doc('state').get();
  if (!stateSnap.exists) return null;
  const state = stateSnap.data();
  const objectives = state.objectives;
  if (!objectives) return null;

  const members = ['member1', 'member2'];

  for (const mk of members) {
    const member = objectives[mk];
    if (!member || !member.name) continue;
    const goals = member.goals || [];
    if (goals.length === 0) continue;

    const done = goals.filter(g => g.done).length;
    const pending = goals.length - done;

    const body = pending > 0
      ? 'Ainda tens ' + pending + ' objetivo(s) por concluir! Faz o balanço da semana.'
      : 'Todos os objetivos concluídos! Não te esqueças de fazer a reflexão semanal.';

    // Get this member's FCM token
    const tokenDoc = await db.collection('fcmTokens').doc(member.name).get();
    if (!tokenDoc.exists) continue;
    const token = tokenDoc.data().token;
    if (!token) continue;

    try {
      await admin.messaging().send({
        token,
        webpush: {
          notification: {
            title: 'Musamar Hub',
            body: body,
            icon: 'icons/icon-192.png',
          },
        },
      });
    } catch (err) {
      if (err.code === 'messaging/invalid-registration-token' ||
          err.code === 'messaging/registration-token-not-registered') {
        await db.collection('fcmTokens').doc(member.name).delete();
      }
    }
  }

  return null;
}

// ===== RECEIPT SCANNER (Gemini Flash) =====
exports.scanReceipt = functions
  .runWith({ secrets: [geminiKey], timeoutSeconds: 60, memory: '256MB' })
  .https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
    if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

    const { image, mimeType } = req.body;
    if (!image) { res.status(400).json({ error: 'Missing image' }); return; }

    const prompt = `Analisa esta imagem de um recibo/fatura de compras de supermercado ou fornecedor.
Extrai todos os itens comprados e retorna APENAS um JSON array (sem markdown, sem texto extra, sem backticks) com objetos no seguinte formato:
[{"name":"nome do item","qtyReceived":numero,"unit":"kg ou un ou L","costPerUnit":numero_em_euros,"totalCost":custo_total_da_linha,"supplier":"nome da loja/fornecedor","category":"uma de: Tâmaras, Recheios, Embalagem, Rótulos, Outro"}]

Regras:
- O supplier é o nome da loja/fornecedor visível no topo do recibo (mesmo para todos os itens)
- costPerUnit é o preço por unidade. Se o recibo mostra preço total e quantidade, calcula o preço unitário
- totalCost é o valor total da linha no recibo
- qtyReceived é a quantidade comprada (padrão 1 se não visível)
- unit: usa "un" para unidades, "kg" para quilos, "L" para litros, "g" para gramas
- category: escolhe a melhor correspondência entre Tâmaras, Recheios, Embalagem, Rótulos, Outro
- Se não conseguires identificar um campo, usa "" para texto e 0 para números
- Retorna APENAS o JSON array, nada mais`;

    try {
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey.value()}`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inline_data: { mime_type: mimeType || 'image/jpeg', data: image } }
            ]
          }]
        })
      });
      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) { res.status(422).json({ error: 'Não foi possível extrair itens do recibo', raw: text }); return; }
      const items = JSON.parse(jsonMatch[0]);
      res.json({ items });
    } catch (err) {
      res.status(500).json({ error: 'Falha ao analisar recibo', message: err.message });
    }
  });
