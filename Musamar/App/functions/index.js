const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

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
