const admin = require("firebase-admin");
const credentials = require("../credentials.json");

function connectDb() {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(credentials),
    });
  }

  return admin.firestore();
}

exports.getCustomers = (request, response) => {
  const db = connectDb(); //nothing goes in this ().
  db.collection("customers").get()

    .then((customerCollection) => {
      const allCustomers = customerCollection.docs.map(doc => {
        let cust = doc.data()
        cust.id = doc.id
        return cust
      })
      response.send(allCustomers);
    })

    .catch((err) => {
      console.log.error(err);
      response.status(500).send(err);
    });
};

exports.getCustomerById = (request, response) => {
  if (!request.params.id) {
    response.status(400).send("No customer specified!");
    return;
  }

  const db = connectDb();
  db.collection("customers")
    .doc(request.params.id)
    .get() //enter paramter id again
    .then((doc) => {
      let customer = doc.data(); //create customer id data
      customer.id = doc.id; //naming it
      response.send(customer);
    })
    .catch((err) => {
      console.error(err);
      response.status(500).send(err);
    });
};
exports.getCustomerByQuery = (request, response) => {
  //get query from req.query
  const { fname } = request.query;
  //connect to firestore
  const db = connectDb();
  //search customers collection based on query
  db.collection("customers")
    .where("firstName", "==", fname)
    .get()
    //respond with results
    .then((customerCollection) => {
      const matches = customerCollection.docs.map((doc) => {
        let customer = doc.data();
        customer.id = doc.id;
        return customer;
      });
      response.send(matches);
    })
    .catch((err) => response.status(500).send(err));
};

//create post to createCustomer
exports.createCustomer = (request, response) => {
  const db = connectDb(); //connect to db
  
  db.collection("customers")
    .add(request.body)
    .then((docRef) => response.send(docRef.id))
    .catch((err) => response.status(500).send("Customer could not be created"));
};

exports.deleteCustomer = (request, response) => {
const db = connectDb()
const { docId } = request.params
db.collection('customers').doc(docId).delete()
.then(() => response.status(203).send('Document successfully deleted'))

.catch(err => response.status(500).send(err))

}
