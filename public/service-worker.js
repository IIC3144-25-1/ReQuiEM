function registerServiceWorker() {
  if (typeof window !== "undefined") {
    const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    if (isLocalhost) {
      console.log("Service Worker will not run on localhost");
      return;
    }

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("Service Worker registration successful:", registration.scope);
      })
      .catch((error) => {
        console.log("Service Worker registration failed:", error);
      });
    }
  }
}
  
registerServiceWorker();