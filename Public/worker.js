console.log('Loaded service worker!');

self.addEventListener('push', ev => {
    const data = ev.data.json();
    console.log('Got push', data);
    self.registration.showNotification(data.title, {
        body: data.msgFromServer,
        icon: 'https://www.clker.com/cliparts/L/S/p/6/v/D/letter-s-in-a-cercle-blue-hi.png'
    });
});
