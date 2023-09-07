exemple: https://github.com/CatsMiaow/node-grpc-typescript/

better: https://www.giac.cc/posts/grpc-static-code-typescript/


To compile the .proto:

cd src/backend
mkdir out
npx grpc_tools_node_protoc --plugin=protoc-gen-ts=../../node_modules/.bin/protoc-gen-ts --t
s_out=grpc_js:./out --js_out=import_style=commonjs:./out --grpc_out=grpc_js:./out -I protos ./protos/every
board.proto


TODO:
  - how to do auth? We want to check who is making the request
    Check https://firebase.google.com/docs/auth/admin/verify-id-tokens
    1. get id token on the client
firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then(function(idToken) {
  // Send token to your backend via HTTPS
  // ...
}).catch(function(error) {
  // Handle error
});


    2. verify id token on the server
// idToken comes from the client app
getAuth()
  .verifyIdToken(idToken)
  .then((decodedToken) => {
    const uid = decodedToken.uid;
    // ...
  })
  .catch((error) => {
    // Handle error
  });

  3. this gives us the uid
