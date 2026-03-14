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
