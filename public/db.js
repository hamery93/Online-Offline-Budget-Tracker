let db;
// create a new db request for a "budget" database.
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function(event) {
   // create object store called "pending" and set autoIncrement to true
  const db = event.target.result;
  db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = function(event) {
  db = event.target.result;

  // check if app is online before reading from db
  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function(event) {
  console.log("Woops! " + event.target.errorCode);
};

function saveRecord(record) { 
  const transaction = db.transaction(["pending"], "readwrite");

  // access the pending object store
  const store = transaction.objectStore("pending");

  // add record to objectStore 
  store.add(record);
}

function checkDatabase() {
 
  const transaction = db.transaction(["pending"], "readwrite");
  
  const store = transaction.objectStore("pending");
  
  const getAll = store.getAll();

  getAll.onsuccess = function() {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
      .then(response => response.json())
      .then(() => {
        
        const transaction = db.transaction(["pending"], "readwrite");

        
        const store = transaction.objectStore("pending");

       
        store.clear();
      });
    }
  };
}


window.addEventListener("online", checkDatabase);